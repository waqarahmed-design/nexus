# CLAUDE.md — Nexus

## What is this?
A mobile app that aggregates crypto portfolios across multiple exchanges into one live view.

---

## How the app works

**The user's core goal:** See the total value of all their crypto holdings across every exchange — in one place, without logging into each exchange separately.

**User flows:**

```
First time
  Welcome (onboarding) → Login → Connect an exchange → Dashboard

Returning user
  Dashboard (lands here directly)
```

**What the user does on each screen:**

- **Dashboard (Portfolio tab)** — The primary screen. Shows total portfolio value, 7-day sparkline, asset list, and exchange breakdown. User taps an asset or exchange to drill in. Pull to refresh syncs latest prices.

- **Asset detail** (`/asset/[id]`) — How much of one coin the user holds, across all exchanges. Shows price, 7-day chart, per-exchange breakdown, and allocation bar. Reached by tapping any asset row on Dashboard.

- **Exchange detail** (`/exchange/[id]`) — All assets held on one specific exchange and their values. Shows connection status, 24h change, and allocation vs. total portfolio. Reached by tapping an exchange on Dashboard or Exchanges tab.

- **Exchanges tab** — Overview of all connected exchanges. User connects a new exchange from here.

- **Add Exchange** (`/add-exchange`) — 3-step screen: choose exchange → enter read-only API key → success. The only place in the app where user inputs credentials. Pushed from the Exchanges tab as a standard screen, not a modal.

- **Settings tab** — Manage connected exchanges, security (biometric, 2FA), preferences (currency, alerts), and sign out.

**Key constraint the user never sees:** Nexus is read-only. It cannot trade, withdraw, or modify anything. API keys are stored encrypted. This must be communicated at every trust-sensitive touchpoint.

---

## Documentation — read before acting

| Document | Path | Read when |
|---|---|---|
| **Prototype Spec** | `Documentation/Spec.md` | Before building or modifying any screen, component, or interaction. Contains acceptance criteria, build status, and the screen-by-screen spec. Always read this first for any implementation task. |
| Product Requirements (PRD) | `Documentation/Product Requirements.md` | Adding, removing, or scoping any feature. Governs what belongs in the product. |
| Product Roadmap | `Documentation/Product Roadmap.md` | Planning work, sequencing features, or evaluating if something is in scope. |
| Research | `Documentation/Research.md` | Making architectural decisions, understanding user needs, or evaluating market context. |
| Technical Specification | `Documentation/Technical Specification.md` | Writing any backend code, designing data models, or connecting real exchange APIs. |
| Product Designer Agent | `Agents/Product Designer.md` | Before invoking the product-designer agent — contains its role, skills, and working method. |

**Rule:** Before writing any code → read `Spec.md` first. If it touches product scope → also read the PRD. If it touches architecture → also read the Tech Spec.

---

## Product Designer agent — when to invoke

**Default rule: if a task touches anything visible, interactive, structural, or strategic in the product, invoke the product-designer agent.** When in doubt, invoke it.

**Always invoke for:**

**Visual / UI changes (any size)**
- Any change to a `.tsx` screen or component file that affects layout, style, or interactivity
- Adding, removing, or changing any UI element (button, icon, card, badge, row, input, chart)
- Changing any color, font, spacing, padding, margin, border radius, or opacity
- Adding or modifying any animation, transition, or press feedback
- Adding or changing a loading state, empty state, or error state
- Any token compliance fix (replacing a raw value with a design token)
- Any accessibility improvement (touch target, contrast, focus)
- Any new icon added to the Icons registry

**UX & interaction design**
- Any new screen, flow, or navigation change
- Designing or auditing user flows, task flows, or navigation structure
- Information architecture decisions (what goes where, how content is organized)
- Interaction design — how a gesture, swipe, tap, or form behaves
- Feedback design — what happens after an action (success, error, loading)
- Empty states, edge cases, error recovery, or zero-data states
- Accessibility audits (WCAG, touch targets, screen reader, contrast)
- Any prompt containing: *flow*, *journey*, *experience*, *interaction*, *gesture*, *navigation*, *onboarding*, *affordance*, *discoverability*, *usability*, *friction*, *clarity*, *feedback*

**Design system**
- Adding or editing a design system component (Button, Card, Input, Badge, Icon)
- Adding, changing, or auditing any design token (color, spacing, radius, typography)
- Component library decisions — new variants, new patterns, deprecating old ones
- Token governance — whether something should be a token vs. hardcoded
- Any prompt containing: *design system*, *component*, *token*, *variant*, *pattern*, *style guide*, *design language*

**Product strategy & planning**
- Scoping a new feature — what's in, what's out, what's MVP
- Prioritising features or deciding what to build next
- Defining success metrics or KPIs for a feature
- Information architecture — navigation structure, content hierarchy, mental models
- Any prompt containing: *roadmap*, *prioritise*, *scope*, *strategy*, *opportunity*, *problem*, *goal*, *metric*, *KPI*, *IA*, *information architecture*, *what should we build*, *what belongs*, *is this in scope*

**Research & discovery**
- Evaluating UX quality, identifying design problems, or auditing a screen
- Competitive analysis — how do other apps handle this?
- User mental models — how do users think about this?
- Heuristic evaluation of any screen or flow
- Any prompt containing: *audit*, *review*, *evaluate*, *compare*, *research*, *heuristic*, *user need*, *mental model*, *pain point*, *how do other apps*, *best practice*, *benchmark*

**Keyword triggers (any of these words in the prompt)**
- Actions: *build*, *add*, *create*, *make*, *put*, *show*, *display*, *render*, *update*, *change*, *fix*, *adjust*, *tweak*, *polish*, *improve*, *rethink*, *redesign*, *move*, *align*, *center*, *refine*, *audit*, *review*, *evaluate*, *plan*, *scope*, *prioritise*, *design*, *prototype*, *wireframe*, *sketch*
- Nouns: *UI*, *UX*, *screen*, *component*, *layout*, *style*, *look*, *feel*, *visual*, *animation*, *transition*, *icon*, *color*, *spacing*, *font*, *button*, *card*, *badge*, *input*, *row*, *tab*, *modal*, *sheet*, *header*, *footer*, *list*, *chart*, *sparkline*, *flow*, *journey*, *experience*, *pattern*, *token*, *design system*, *navigation*, *onboarding*, *feature*, *interaction*, *gesture*, *affordance*, *hierarchy*, *typography*, *palette*

**Do not invoke for:**
- Pure logic bugs with no visual output (wrong calculation, off-by-one in data)
- Data wiring with no visual change
- Backend / API / database / infrastructure work
- TypeScript type fixes with no visual or UX impact

---

## Patterns to follow

**Stack**
- React Native + Expo SDK 55, Expo Router (file-based), TypeScript
- `StyleSheet.create()` only — no Tailwind, no styled-components
- `useSafeAreaInsets()` for all safe area handling
- `expo-linear-gradient`, `react-native-svg`
- Icons: `@hugeicons/react-native` + `@hugeicons/core-free-icons` — accessed **only** through `Icons` registry and `Icon` component (never import HugeIcons directly)

**Design tokens — always use, never hardcode**

| Token type | Import from | Example |
|---|---|---|
| Colors | `@/constants/Colors` | `Colors.card`, `Colors.accent`, `Colors.gray` |
| Typography | `@/constants/Typography` | `TypeScale.title.md`, `FontFamily.mono`, `FontFamily.serif` |
| Spacing / Radii | `@/constants/Spacing` | `Spacing[4]`, `Radii.card`, `Spacing.touchTarget` |
| Icons | `@/constants/Icons` | `Icons.back`, `Icons.trendUp` |
| Bottom fade | `@/constants/Spacing` | `BottomFade.colors`, `BottomFade.height` |

**Typography rules**
- Financial integers / prices → `TypeScale.numeric.*` + `fontFamily: FontFamily.mono`
- Small inline accents (%, allocation) → `TypeScale.serifNumeric.*` + `fontFamily: FontFamily.serif`
- Section labels (ALL CAPS in JSX) → `TypeScale.label.*`
- Body copy → `TypeScale.body.*`
- Never write `fontFamily: 'JetBrainsMono_400Regular'` or `fontFamily: 'Georgia'` directly — use `FontFamily.mono` / `FontFamily.serif`

**Spacing / radii rules**
- All values must be multiples of 4 (4px grid)
- Use `Spacing[n]` for gaps/padding, `Radii.*` for border radii — never raw numbers
- Pill buttons → `borderRadius: Radii.pill` (100); Cards → `Radii.card` (20) / `Radii.cardSM` (16)
- Touch targets → `minHeight: Spacing.touchTarget` (44) on all interactive rows

**Color rules**
- `Colors.accent` (#C8E847) — primary CTAs and hero sparkline **only**; text/icons on accent → `Colors.onAccent`
- `Colors.red` — destructive actions (sign out, delete) and loss indicators
- `Colors.muted` (#1C1C1C) — fills only, **never** text or icon color
- `Colors.gray` — secondary text and icons
- Never hardcode hex values or construct rgba strings manually

**UI components — always use, never rebuild**
- `<Button variant="primary|ghost|outline|icon" />` — all tappable buttons
- `<Input variant="default|search" />` — all text inputs
- `<Badge variant="tag|status|change|section" />` — all badges and pills
- `<Card variant="default|sm|elevated|info" />` — all card containers; `<CardDivider />`, `<CardRow />`
- `<Icon icon={Icons.*} size={n} color={Colors.*} />` — all icons

**Navigation**
- Tab bar is a floating pill (position absolute), not edge-to-edge
- Every scroll view needs `paddingBottom: insets.bottom + 88` so content clears the bar
- Bottom fade on all tab screens: `colors={BottomFade.colors as any}` / `height={BottomFade.height}` — never construct manually

**Data**
- All data is mock — lives in `mobile/data/mockData.ts`
- No real API calls yet

---

## Gotchas

**`Colors.muted` (`#1C1C1C`) is nearly invisible on `#080808`.**
Use it only as a background fill. Never as text or icon color — use `Colors.gray` instead.

**SparklineChart always needs an explicit `width` prop.**
Without it the SVG renders at window width and overflows its container. Pass `width={width - 40}` for full-width charts, `width={52}` for inline row sparklines.

**The tab bar is absolutely positioned.**
Screen content extends full height underneath it. The tab bar does not push content up. Every scroll view needs explicit bottom padding or content hides behind the bar.

**`useNativeDriver: false` is required for `left` and `width` animations.**
The sliding tab pill uses two `Animated.Value`s (`slideX`, `slideWidth`) — both must use `useNativeDriver: false` or they crash silently.

**Bottom fade must use the `BottomFade` token, not manual construction.**
`BottomFade.colors` = `['transparent', 'rgba(8,8,8,0.75)', Colors.bg]`, `BottomFade.height` = 200. Always import from `@/constants/Spacing`. Never construct the gradient array inline.

**`FontFamily.mono` and `FontFamily.serif` must be used — never raw strings.**
`FontFamily.mono` = `'JetBrainsMono_400Regular'`. `FontFamily.serif` = `'Georgia'`. Writing the string directly breaks the token contract and won't catch typos.

**Mock data is the source of truth for all UI.**
Changing a value in `mockData.ts` changes it everywhere. There is no backend state.
