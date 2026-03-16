---
name: design-specializations
description: Specialized design skill covering mobile design, web design, and emerging design disciplines. Use when designing for iOS or Android including native patterns, HIG, Material Design, touch gestures, tab bars, bottom sheets, notifications, onboarding flows, or app icons. Also use for web design specializations including above-the-fold strategy, form design, multi-step forms, validation, data table design, dashboard layout, e-commerce product pages and checkout flows, or content-heavy article layouts. Also use for emerging specializations including Design Ops, scaling design processes, inclusive design for marginalized users, ethical design, dark patterns avoidance, sustainable design, service design, end-to-end service experiences, or design thinking facilitation. Triggers on: iOS design, HIG, Human Interface Guidelines, Material Design, Android design, touch gesture, swipe, pinch, long press, tab bar, hamburger menu, bottom sheet, push notification, badge, mobile onboarding, app icon, above the fold, hero section, form design, multi-step form, form validation, autofill, data table, dashboard design, metrics, KPI cards, e-commerce, product page, checkout, cart, reading experience, article layout, Design Ops, design operations, inclusive design, ethical design, dark pattern, sustainable design, green UX, service design, service blueprint, design thinking, innovation workshop, facilitation.
---

## Quick Reference — Mobile Patterns (Nexus)

### Touch & Ergonomics
```
Min touch target:  44×44px (Spacing.touchTarget)
Thumb zone:        bottom 60% of screen is most reachable — primary actions here
One-thumb reach:   avoid critical actions in top corners
Gesture conflicts: vertical scroll + horizontal swipe = define clear axis lock
```

### Tab Bar (Nexus floating pill)
```
Position: absolute, bottom 0 — content extends UNDER the bar
Bottom clearance: paddingBottom: insets.bottom + 88 (tab screens)
                  paddingBottom: insets.bottom + 32 (detail/modal screens)
Tab bar does NOT push content up — never rely on it for clearance
pointerEvents="box-none" on outer wrapper (touches pass through transparent area)
Active: Colors.accent icon + label | Slider pill: bg cardElevated, border accentBorder
Spring config: tension 52, friction 16
```

### Navigation Structure (Nexus)
```
Tab screens (index, exchanges, settings): always in tab bar, no back button
Detail screens (asset/[id], exchange/[id]): back button top-left, 44×44, Colors.card bg
Modal/full-screen (add-exchange): slide up from bottom, close = router.back()
Auth screens (welcome, login): router.replace() to transition (no back to auth)
```

### iOS Native Patterns (relevant for Nexus)
```
Bottom sheet: slides up, swipe-down to dismiss, rubber-band bounce on overscroll
Pull-to-refresh: threshold 60–80px, haptic at threshold, min 600ms spinner display
Swipe back: Expo Router enables this by default on Stack screens
Keyboard avoidance: KeyboardAvoidingView behavior="padding" on forms
```

### Onboarding (first-time flow: welcome → login → add exchange)
```
Max 3 steps before user sees value
Progress indication: step dots or numbered header
Skip option if user has existing account
Trust-building at every step (read-only, AES-256, "we never trade")
```

### Dashboard Design (Nexus-specific)
```
Hero value: largest number on screen (TypeScale.numeric.xl for integer part)
Above fold: total value + sparkline + today's change — everything else scrollable
Scan pattern: value → change → sparkline → detail rows
Asset rows: fixed height (minHeight: 44), last row no divider
```

# Design Specializations

Deep expertise in platform-specific, domain-specific, and emerging design disciplines — going beyond general UX/UI into the specialized knowledge that makes designs truly native, purposeful, and responsible.

## Method Selection Guide

| Question | Reference |
|----------|-----------|
| How do I follow iOS HIG conventions? | `references/mobile-design.md` → Native Patterns |
| How do I follow Material Design 3? | `references/mobile-design.md` → Native Patterns |
| How do I design touch interactions? | `references/mobile-design.md` → Touch Gestures |
| How do I design tab bars and navigation? | `references/mobile-design.md` → Mobile Navigation |
| How do I design push notifications? | `references/mobile-design.md` → Notification Design |
| How do I design a first-time user experience? | `references/mobile-design.md` → Onboarding |
| How do I design an app icon? | `references/mobile-design.md` → App Icon Design |
| What content goes above the fold? | `references/web-design.md` → Above-the-Fold Strategy |
| How do I design complex forms? | `references/web-design.md` → Form Design |
| How do I design data-dense tables? | `references/web-design.md` → Table Design |
| How do I design a dashboard? | `references/web-design.md` → Dashboard Design |
| How do I design a product page or checkout? | `references/web-design.md` → E-commerce |
| How do I design a reading/content experience? | `references/web-design.md` → Content-Heavy Sites |
| How do I scale design processes? | `references/emerging-specializations.md` → Design Ops |
| How do I design for marginalized users? | `references/emerging-specializations.md` → Inclusive Design |
| How do I avoid dark patterns? | `references/emerging-specializations.md` → Ethical Design |
| How do I reduce environmental impact? | `references/emerging-specializations.md` → Sustainable Design |
| How do I map end-to-end service experiences? | `references/emerging-specializations.md` → Service Design |
| How do I facilitate a design thinking workshop? | `references/emerging-specializations.md` → Design Thinking Facilitation |

## Domain Sequencing

```
Mobile Design (platform-native expertise)
  └── Native Patterns (HIG + Material) → Touch Gestures → Mobile Navigation
      → Notification Design → Onboarding → App Icon Design

Web Design (domain-specific patterns)
  └── Above-the-Fold → Form Design → Table Design
      → Dashboard Design → E-commerce → Content-Heavy Sites

Emerging Specializations (expanding the practice)
  └── Design Ops → Inclusive Design → Ethical Design
      → Sustainable Design → Service Design → Design Thinking Facilitation
```

## Reference Files

- **Mobile design** — Read `references/mobile-design.md` for: iOS HIG, Material Design, touch gestures, navigation, notifications, onboarding, app icons
- **Web design** — Read `references/web-design.md` for: above-the-fold, forms, tables, dashboards, e-commerce, content-heavy sites
- **Emerging specializations** — Read `references/emerging-specializations.md` for: Design Ops, inclusive design, ethical design, sustainable design, service design, design thinking facilitation
