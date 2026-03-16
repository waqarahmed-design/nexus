---
name: microinteractions-animation
description: Micro-interactions design and animation skill — covers both the why/what (Saffer's Trigger-Rules-Feedback-Loops framework, signature moments, case studies, scoring) and the how (motion principles, animation patterns, advanced techniques, performance). Use when designing or auditing any microinteraction, implementing loading animations, hover effects, button feedback, page transitions, scroll-based animation, pull-to-refresh, swipe gestures, toggle transitions, modal animations, or toast notifications. Also use for advanced animation including physics-based motion, spring animations, Lottie, SVG animation, morphing, loading optimism, or attention direction. Also use for motion principles including timing, easing curves, duration, orchestration, sequencing, continuity, and state transitions. Also use for performance including 60fps animation, transform/opacity optimization, prefers-reduced-motion, or progressive enhancement. Triggers on: microinteraction, trigger design, feedback design, state design, loops and modes, signature moment, animation, micro-interaction, motion, easing, spring physics, timing, duration, loading spinner, skeleton screen, hover effect, button press, ripple, page transition, scroll animation, parallax, pull-to-refresh, swipe gesture, toggle switch, modal animation, toast, Lottie, SVG animation, morphing, reduced motion, animation performance, 60fps, orchestration, stagger, state transition, continuity.
---

## Quick Reference — React Native Animation Specs

### Scoring (always report score/10 in your response)
Rate every interaction 0–10: 10 = immediate feedback + purposeful easing + proportional duration + all states covered + accessible

### Core Framework (Saffer)
Every microinteraction: **Trigger → Rules → Feedback → Loops**
- Trigger: must show all states (default, active, loading, success, error, disabled)
- Rules: define what happens, prevent double-submit, preserve input on error
- Feedback: proportional to event (subtle=hover, clear=tap, persistent=error)
- Loops: does it evolve with repeated use? (progressive reduction for power users)

### Timing & Easing (React Native)
```
Enter (arriving):    ease-out   200–300ms
Exit (leaving):      ease-in    150–200ms  (exits FASTER than entrances)
Move on screen:      ease-in-out 200–300ms
Tap response:        ease-out   50–100ms   (instant feel)
Spring/modal/sheet:  spring     300–400ms
Progress bar:        linear     (constant rate is the point)
```

### RN Easing imports
```tsx
import { Easing } from 'react-native';
Easing.out(Easing.cubic)     // enter
Easing.in(Easing.cubic)      // exit
Easing.inOut(Easing.cubic)   // move
```

### Tap Feedback (every interactive element)
```tsx
const scale = useRef(new Animated.Value(1)).current;
const spring = (val: number) => Animated.spring(scale, { toValue: val, useNativeDriver: true, tension: 300, friction: 20 }).start();
<Animated.View style={{ transform: [{ scale }] }}>
  <Pressable onPressIn={() => spring(0.97)} onPressOut={() => spring(1)}>
```

### Loading States (rule: skip if < 400ms)
```tsx
// Spinner — indeterminate, short waits, button-level
<ActivityIndicator size="small" color={Colors.accent} />

// Skeleton — content loading, known layout
// shimmer: Animated.loop(Animated.timing(shimmer, { toValue: 1, duration: 1500, easing: Easing.linear }))

// Minimum display time: 400ms (flickering loading = worse than no loading)
```

### Pull-to-Refresh
```tsx
<ScrollView refreshControl={
  <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh}
    tintColor={Colors.accent} colors={[Colors.accent]} />
}>
// Show spinner min 600ms even if data arrives instantly
```

### Toggle / Switch
```tsx
Animated.spring(thumbX, {
  toValue: isOn ? trackWidth - thumbSize - 4 : 4,
  useNativeDriver: true, tension: 60, friction: 10
}).start();
// CRITICAL: useNativeDriver: true for translateX, false for backgroundColor
```

### Modal Slide-Up (bottom sheet / full-screen)
```tsx
// Enter:
Animated.spring(slideY, { toValue: 0, useNativeDriver: true, tension: 55, friction: 14 }).start();
// Exit (faster):
Animated.timing(slideY, { toValue: sheetHeight, duration: 250, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start();
```

### Stagger List Items
```tsx
Animated.stagger(50, anims.map(a => Animated.timing(a, { toValue: 1, duration: 300, useNativeDriver: true }))).start();
// Max stagger: 40–60ms per item, 6–8 items max (then no delay for remaining)
```

### Key Rules
- `useNativeDriver: false` required for: `left`, `width`, `height`, `backgroundColor`, `borderRadius`
- `useNativeDriver: true` for: `opacity`, `transform` (translate, scale, rotate)
- Tab bar slider uses: `tension: 52, friction: 16`
- Nexus tone: fintech = conservative (ease-out standard, minimal spring, no bouncing)

# Micro-interactions & Animation

From the conceptual framework (why and what to design) to the technical implementation (how to animate it). Covers Saffer's four-part design structure, signature moments, and case studies — plus motion principles, animation patterns, advanced techniques, and performance.

## Method Selection Guide

| Question | Reference |
|----------|-----------|
| What is a microinteraction and how do I design one? | `references/design-framework.md` → Core Principle |
| How do I score/audit a microinteraction? | `references/design-framework.md` → Scoring + Quick Diagnostic |
| How do I design the trigger? | `references/design-framework.md` → Triggers |
| How do I design rules and state? | `references/design-framework.md` → Rules |
| How do I design feedback for an interaction? | `references/design-framework.md` → Feedback |
| How do I handle loops and modes? | `references/design-framework.md` → Loops and Modes |
| How do I create a signature/iconic moment? | `references/signature-moments.md` |
| How do I design a form submission interaction? | `references/case-studies.md` → Case Study 1 |
| How do I design a toggle/switch? | `references/case-studies.md` → Case Study 2 |
| How do I design pull-to-refresh? | `references/case-studies.md` → Case Study 3 |
| How do I design loading states? | `references/case-studies.md` → Case Study 4 |
| How do I design toast notifications? | `references/case-studies.md` → Case Study 5 |
| What easing curve should I use? | `references/motion-principles.md` → Timing & Easing |
| How long should this animation be? | `references/motion-principles.md` → Duration |
| How do I sequence multiple animations? | `references/motion-principles.md` → Orchestration |
| How do I transition between two states? | `references/motion-principles.md` → State Transitions |
| How do I build a loading state? | `references/animation-patterns.md` → Loading Animations |
| How do I add hover effects? | `references/animation-patterns.md` → Hover Effects |
| How do I animate button presses? | `references/animation-patterns.md` → Click/Tap Feedback |
| How do I animate between screens? | `references/animation-patterns.md` → Page Transitions |
| How do I trigger animations on scroll? | `references/animation-patterns.md` → Scroll-Based Animation |
| How do I implement pull-to-refresh? | `references/animation-patterns.md` → Pull-to-Refresh |
| How do I animate swipe actions? | `references/animation-patterns.md` → Swipe Gestures |
| How do I animate toggles and switches? | `references/animation-patterns.md` → Toggle Animations |
| How do I animate modals and dialogs? | `references/animation-patterns.md` → Modal Animations |
| How do I animate toast notifications? | `references/animation-patterns.md` → Toast Notifications |
| How do I morph between shapes? | `references/advanced-animation.md` → Morphing |
| How do I use spring physics? | `references/advanced-animation.md` → Physics-Based Animation |
| How do I use Lottie animations? | `references/advanced-animation.md` → Lottie Animations |
| How do I animate SVGs? | `references/advanced-animation.md` → SVG Animation |
| How do I make loading feel faster? | `references/advanced-animation.md` → Loading Optimism |
| How do I use motion to guide attention? | `references/advanced-animation.md` → Attention Direction |
| How do I express brand through motion? | `references/advanced-animation.md` → Personality Expression |
| How do I keep animations at 60fps? | `references/performance-accessibility.md` → Animation Performance |
| How do I respect reduced motion? | `references/performance-accessibility.md` → Reduced Motion |
| How do I treat animation as enhancement? | `references/performance-accessibility.md` → Progressive Enhancement |

## Domain Sequencing

```
Motion Principles (the rules behind all motion)
  └── Timing & Easing → Duration → Orchestration
      → Continuity → State Transitions

Animation Patterns (apply principles to specific UI elements)
  └── Loading → Hover → Click/Tap → Page Transitions
      → Scroll → Pull-to-Refresh → Swipe → Toggle
      → Modal → Toast

Advanced Animation (specialized techniques)
  └── Morphing → Physics-Based → Lottie → SVG
      → Loading Optimism → Attention Direction → Personality

Performance & Accessibility (make it fast and inclusive)
  └── Animation Performance → Reduced Motion
      → Progressive Enhancement
```

## Reference Files

- **Design framework** — Read `references/design-framework.md` for: Saffer's Trigger-Rules-Feedback-Loops structure, state design, scoring (0–10), diagnostic checklist, common mistakes
- **Signature moments** — Read `references/signature-moments.md` for: what makes a moment signature, iconic examples (Slack, Stripe, Facebook Like), where to invest, creation process
- **Case studies** — Read `references/case-studies.md` for: detailed breakdowns of form submission, toggle, pull-to-refresh, loading states, toast notifications — with edge cases and platform notes
- **Motion principles** — Read `references/motion-principles.md` for: timing & easing, duration, orchestration, continuity, state transitions
- **Animation patterns** — Read `references/animation-patterns.md` for: loading, hover, click/tap, page transitions, scroll, pull-to-refresh, swipe, toggle, modal, toast
- **Advanced animation** — Read `references/advanced-animation.md` for: morphing, physics-based, Lottie, SVG, loading optimism, attention direction, personality expression
- **Performance & accessibility** — Read `references/performance-accessibility.md` for: 60fps performance, reduced motion, progressive enhancement
