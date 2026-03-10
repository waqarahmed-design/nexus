#!/usr/bin/env node
/**
 * lint-tokens.js
 *
 * Scans app/ and components/ for design-token violations.
 * Run: npm run lint:tokens
 *
 * Rules:
 *   1. No hardcoded hex colors             — use Colors.*
 *   2. No raw fontFamily strings           — use FontFamily.mono / FontFamily.serif
 *   3. No direct @hugeicons imports        — use Icons.* + <Icon />
 *   4. No manual bottom-fade construction  — use BottomFade.colors / BottomFade.height
 *   5. No rgba() string construction       — use Colors.* tokens
 *   6. No Ionicons / @expo/vector-icons usage
 */

const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────

const ROOT = path.join(__dirname, '..');

const SCAN_DIRS = [
  path.join(ROOT, 'app'),
  path.join(ROOT, 'components'),
];

// Files that ARE the token definitions, or are intentionally exempt — never flag these
const ALLOWLIST = [
  path.join(ROOT, 'constants', 'Colors.ts'),
  path.join(ROOT, 'constants', 'Typography.ts'),
  path.join(ROOT, 'constants', 'Spacing.ts'),
  path.join(ROOT, 'constants', 'Icons.ts'),
  path.join(ROOT, 'constants', 'index.ts'),
  path.join(ROOT, 'scripts',   'lint-tokens.js'),
  // Expo boilerplate files (web HTML template, 404 screen)
  path.join(ROOT, 'app', '+html.tsx'),
  path.join(ROOT, 'app', '+not-found.tsx'),
  // Dev-only storybook / component gallery — not a production screen
  path.join(ROOT, 'app', '(tabs)', 'stories.tsx'),
];

// ── Rules ─────────────────────────────────────────────────────────────────────

const RULES = [
  {
    id:      'no-hardcoded-hex',
    message: 'Hardcoded hex color — use Colors.* token instead',
    // Matches #RGB, #RRGGBB, #RRGGBBAA — but not inside comments
    pattern: /#[0-9a-fA-F]{3,8}\b/g,
    // Skip comments and shadowColor (RN shadow always uses '#000' with opacity separately)
    skipLine: (line) => {
      const t = line.trimStart();
      return t.startsWith('//') || t.startsWith('*') || /shadowColor/.test(line);
    },
  },
  {
    id:      'no-fontfamily-string',
    message: 'Raw fontFamily string — use FontFamily.mono or FontFamily.serif',
    pattern: /fontFamily:\s*['"`](JetBrainsMono[^'"`]*|Georgia)['"` ]/g,
  },
  {
    id:      'no-direct-hugeicons-import',
    message: 'Direct @hugeicons import — use Icons.* from @/constants/Icons instead',
    pattern: /from\s+['"]@hugeicons\/core-free-icons['"]/g,
  },
  {
    id:      'no-ionicons',
    message: '@expo/vector-icons / Ionicons — use <Icon icon={Icons.*} /> instead',
    pattern: /from\s+['"]@expo\/vector-icons['"]/g,
  },
  {
    id:      'no-manual-bottom-fade',
    message: 'Manual bottom-fade array — use BottomFade.colors and BottomFade.height',
    // Catches ['transparent', ... Colors.bg] gradient construction
    pattern: /\[\s*['"]transparent['"]/g,
    // Only flag if it looks like a gradient colors array (has 'rgba' or Colors.bg nearby)
    skipLine: (line) => !/rgba|Colors\.bg/.test(line),
  },
  {
    id:      'no-raw-rgba',
    message: 'Raw rgba() string — use a Colors.* token (e.g. Colors.greenDim, Colors.accentBorder)',
    // Matches rgba( outside of a comment
    pattern: /rgba\s*\(/g,
    // Skip: comments, SVG stroke/fill attrs (chart internals), shadowColor
    skipLine: (line) => {
      const t = line.trimStart();
      return (
        t.startsWith('//') || t.startsWith('*') ||
        /stroke=|fill=|shadowColor/.test(line)
      );
    },
  },
];

// ── Scanner ───────────────────────────────────────────────────────────────────

function collectFiles(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      collectFiles(full, results);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

function lintFile(filePath) {
  if (ALLOWLIST.includes(filePath)) return [];

  const src     = fs.readFileSync(filePath, 'utf8');
  const lines   = src.split('\n');
  const issues  = [];

  for (const rule of RULES) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (rule.skipLine && rule.skipLine(line)) continue;

      let match;
      rule.pattern.lastIndex = 0;           // reset stateful regex
      while ((match = rule.pattern.exec(line)) !== null) {
        issues.push({
          file:    filePath,
          line:    i + 1,
          col:     match.index + 1,
          rule:    rule.id,
          message: rule.message,
          snippet: line.trim(),
        });
      }
    }
  }

  return issues;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files  = SCAN_DIRS.flatMap((dir) => collectFiles(dir));
const issues = files.flatMap(lintFile);

if (issues.length === 0) {
  console.log('\n✅  No token violations found.\n');
  process.exit(0);
}

// Group by file for readability
const byFile = {};
for (const issue of issues) {
  const rel = path.relative(ROOT, issue.file);
  (byFile[rel] = byFile[rel] || []).push(issue);
}

console.log(`\n❌  ${issues.length} token violation${issues.length === 1 ? '' : 's'} found:\n`);

for (const [file, fileIssues] of Object.entries(byFile)) {
  console.log(`  ${file}`);
  for (const issue of fileIssues) {
    console.log(`    ${issue.line}:${issue.col}  [${issue.rule}]  ${issue.message}`);
    console.log(`             ${issue.snippet.slice(0, 100)}`);
  }
  console.log();
}

process.exit(1);
