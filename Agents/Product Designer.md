# Product Designer Agent — Nexus

## What This Is

The Product Designer is a Claude Code subagent that handles all visual, interactive, structural, and strategic design work in the Nexus app.

**Canonical agent definition:** `.claude/agents/product-designer.md`
This is the file Claude reads when the product-designer agent is spawned. It contains the full design system, skill routing matrix, animation quick reference, and working instructions.

**This file (`Agents/Product Designer.md`)** exists as a human-readable overview for reference.

---

## When to Invoke

Invoke the product-designer agent for **any** task touching the visual or interactive layer:

- Any `.tsx` screen or component file edit that changes layout, style, or behavior
- Any color, font, spacing, padding, radius, or opacity change
- Any animation, transition, or press feedback
- Any loading, empty, or error state
- Any new screen, flow, or navigation change
- Any design system component or token work
- Any accessibility improvement
- Any feature scoping, prioritisation, or UX audit

Do NOT invoke for: pure logic bugs, data wiring with no visual change, backend/API work, TypeScript type fixes with no UX impact.

---

## Skill System

The agent automatically activates skills at the start of every response. Skills are in `.claude/skills/`:

| Skill | Type | Used for |
|---|---|---|
| `microinteractions-animation` | Custom (SKILL.md + references) | Every interactive element, animation, loading state |
| `frontend-design` | Custom (SKILL.md) | Creative direction, distinctive aesthetics |
| `business-knowledge` | Custom (SKILL.md + references) | Product strategy, KPIs, business model decisions |
| `aidlc` | Custom (SKILL.md + references) | AI feature design |
| `ui-design` | Built-in | Typography, color, spacing, visual hierarchy |
| `ux-design` | Built-in | User flows, accessibility, interaction patterns |
| `visual-design` | Built-in | Design system, component library, token governance |
| `design-specializations` | Built-in | Mobile-specific patterns (HIG, gestures, tab bars) |
| `planning-strategy` | Built-in | IA, feature scoping, roadmap, prioritisation |
| `research-discovery` | Built-in | UX audits, heuristic evaluation, competitive analysis |

---

## Design System Summary

Full token definitions in `.claude/agents/product-designer.md`. Quick summary:

- **Colors:** `Colors.*` from `@/constants/Colors` — accent is `#C8E847` (neon lime), not blue
- **Typography:** `TypeScale.*` + `FontFamily.mono/serif` from `@/constants/Typography`
- **Spacing:** `Spacing[n]` + `Radii.*` from `@/constants/Spacing` — 4px grid always
- **Icons:** `<Icon icon={Icons.*}>` from `@/components/ui` — HugeIcons only, never Ionicons
- **Components:** Button, Input, Badge, Card, Icon from `@/components/ui`

---

## Documentation

| Doc | Path | Read when |
|---|---|---|
| Prototype Spec | `Documentation/Spec.md` | Before building or modifying any screen |
| Product Requirements | `Documentation/Product Requirements.md` | Adding or scoping any feature |
| Technical Spec | `Documentation/Technical Specification.md` | Backend/API architecture decisions |
| Research | `Documentation/Research.md` | Understanding user needs, competitive context |
