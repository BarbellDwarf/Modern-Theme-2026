# UI Audit 06: Dark Mode, Accessibility & Performance

Dark mode, accessibility, and performance form a cross-cutting quality layer. Dark mode is implemented via `[data-bs-theme="dark"]` token overrides in `_dark-mode.scss` (932 lines, 19 component categories), with additional dark-mode fragments scattered across 10+ component files. Accessibility is centralized in `_accessibility.scss` (380 lines) with WCAG 2.1 AA patterns, but some rules use fragile specificity and the reduced-motion kill-switch duplicates across two files. Performance optimizations in `_performance.scss` (144 lines) are generally sound but several expensive CSS features (`backdrop-filter`, `color-mix`, dual-property animations) lack runtime gating.

---

## 1. Dark Mode Architecture

### DM-AR-01 `_dark-mode.scss` Monolith — 19 Categories in One File
- **Location**: `themes/ModernTheme2026/scss/humhub/_dark-mode.scss`:1–932
- **Description**: Covers base, panels, nav, sidebar, dropdowns, forms, buttons, list-groups, tables, nav-tabs, modals, alerts, wells, badges, tooltips, popovers, code, stream, space-chooser, glass, mobile-nav, select2, typeahead, comments, richtext, misc. This monolithic approach makes it difficult to find/reason about dark mode for any single component.
- **Severity**: Major
- **Fix approach**: Split into per-component partials following the same naming convention as their light-mode counterparts (e.g., `_dark-button.scss`, `_dark-modal.scss`, `_dark-stream.scss`) and import them in `build.scss` after each component's light-mode file.

### DM-AR-02 Duplicate Dark Mode — `.mobile-bottom-nav`
- **Location**: `_mobile-bottom-nav.scss`:174–206 AND `_dark-mode.scss`:684–712
- **Description**: Both files define `[data-bs-theme="dark"] .mobile-bottom-nav` rules. `_mobile-bottom-nav.scss` uses `background-color: rgba(30, 41, 59, 0.95)` with `box-shadow: 0 -2px 10px rgba(0,0,0,0.3)`. `_dark-mode.scss` uses `background: rgba(15, 23, 42, 0.95)` with `backdrop-filter: blur(12px)`. The order in which these are compiled determines which wins — the sheet order is fragile and could conflict.
- **Severity**: Major
- **Fix approach**: Remove dark mode from `_mobile-bottom-nav.scss` and move all mobile-bottom-nav dark mode into a `_dark-mobile.scss` partial (or keep consolidated in `_dark-mode.scss`). Choose one canonical location.

### DM-AR-03 Inconsistent Dark Mode Locations — Account Dropdown
- **Location**: `_topbar.scss`:599–610
- **Description**: `.dropdown.account` dark mode is in `_topbar.scss`, not in `_dark-mode.scss`. This is the only dropdown type whose dark styles live outside the main dark-mode file.
- **Severity**: Minor
- **Fix approach**: Move `[data-bs-theme="dark"] .dropdown.account` block to `_dark-mode.scss` under a "Dropdowns" section, or to a `_dark-topbar.scss` partial.

### DM-AR-04 Inconsistent Dark Mode Locations — Mail
- **Location**: `_mail.scss`:1123–1189
- **Description**: Mail dark mode (67 lines) lives entirely in the mail component file. No mail rules appear in `_dark-mode.scss`. This is inconsistent with the pattern used for select2, typeahead, and other advanced components that ARE duplicated in `_dark-mode.scss`.
- **Severity**: Minor
- **Fix approach**: Either establish a convention that all component-level dark mode lives in `_dark-mode.scss` (and move mail there), or accept per-file dark mode as valid but document the decision. Inconsistent patterns cause future maintainers to guess.

### DM-AR-05 `.bg-white, .bg-light` Heavy-Handed Override
- **Location**: `_dark-mode.scss`:854–858
- **Description**: `.bg-white, .bg-light { background-color: var(--color-bg-secondary) !important; color: var(--color-text-primary) !important; }` — Bootstrap's `.bg-light` is used for many purposes beyond background styling, including highlighting active items and table striping. These all now get `--color-bg-secondary` (`#1e293b`), losing visual hierarchy.
- **Severity**: Major
- **Fix approach**: Instead of overriding `.bg-light` globally, use component-specific selectors. For areas that genuinely need `.bg-light` to map to dark surface, use a custom class like `.dark-surface` or scope the override with a parent wrapper.

### DM-AR-06 Modal Close Button — Fragile `filter: invert(1)`
- **Location**: `_dark-mode.scss`:500–503
- **Description**: `.close, .btn-close { filter: invert(1) grayscale(1); }` — Inverts the icon based on its original color. If the original close icon is not pure black, the result may be an unexpected tint. Bootstrap's `.btn-close` uses a CSS background-image, not a glyphicon, so the inversion can produce odd results.
- **Severity**: Minor
- **Fix approach**: Use a specific dark-mode close icon URL (`background-image: url("data:...")` with white/light icon) or set `filter: brightness(0) invert(1)` which is more predictable for any icon source.

### DM-AR-07 Dark Mode Link Contrast Passes but Close
- **Location**: `_dark-mode.scss`:29
- **Description**: `--color-link: #7cb4f8` against `--color-bg-primary: #0f172a`. WCAG AA requires 4.5:1 for text. Calculated ratio ≈ 6.3:1 — passes. However, against hover states or `--color-bg-tertiary: #334155`, the ratio drops to ≈ 3.7:1 which fails AA for normal text.
- **Severity**: Minor
- **Fix approach**: Consider lightening link color to `#8cc4ff` or darkening the hover surface to ensure links on tertiary backgrounds stay ≥ 4.5:1.

### DM-AR-08 Dark Mode `--color-text-muted` Fails UI Component Contrast
- **Location**: `_dark-mode.scss`:24
- **Description**: `--color-text-muted: #94a3b8` against `#0f172a` body bg. Ratio is ≈ 4.8:1 — passes text AA. But WCAG AA for non-text UI components requires 3:1. Muted text is used for icons, placeholder text, and disabled states — against `--color-bg-tertiary: #334155`, the ratio is only ≈ 2.6:1, failing the 3:1 threshold for UI components.
- **Severity**: Major
- **Fix approach**: Lighten `--color-text-muted` to `#a8b8cc` (≈3.2:1 against tertiary bg) or ensure muted text is only used on secondary/primary backgrounds where the ratio stays ≥ 3:1.

### DM-AR-09 Space Chooser Fallback Colors Are Light Colors
- **Location**: `_space-chooser.scss`:300, 305
- **Description**: `.space-chooser-menu { background-color: var(--color-bg-secondary, #f8fafc); }` and `.space-item:hover { background-color: var(--color-bg-tertiary, #f1f5f9); }` — The fallback colors `#f8fafc` and `#f1f5f9` are LIGHT colors. In `[data-bs-theme="dark"]`, these fallbacks are wrong — they'll render light gray on dark backgrounds if the CSS variable somehow goes undefined.
- **Severity**: Minor
- **Fix approach**: Change fallbacks to `#1e293b` (secondary) and `#334155` (tertiary) to match dark mode defaults, or remove fallbacks entirely since the variables are defined in `_root.scss`.

### DM-AR-10 `.wall-entry-controls a` — `!important` on Generic Selector
- **Location**: `_dark-mode.scss`:648–655
- **Description**: `.wall-entry-controls a { color: var(--color-text-secondary) !important; }` — The `!important` on a generic `a` selector can prevent interactive state overrides (hover, active, focus) from working, since those typically use the same selector specificity.
- **Severity**: Major
- **Fix approach**: Remove `!important` and increase specificity (e.g., `.wall-entry-controls > a`) or add explicit hover/focus rules within the same block.

---

## 2. Accessibility

### ACC-01 `:focus-visible` Not Applied as Default for All Interactive Elements
- **Location**: `_accessibility.scss`:26–30, 38–46
- **Description**: The `*:focus-visible` and `button, a, input, select, textarea:focus-visible` rules exist but many component files use `:focus` instead of `:focus-visible` (found 59 `:focus` references across SCSS files). This shows focus outlines on mouse click for those elements — a cosmetic distraction that users perceive as visual noise.
- **Severity**: Major
- **Fix approach**: Audit all `:focus` usage and convert to `:focus-visible` where the intent is keyboard-only. Use `:focus-visible` as the default; only keep `:focus` for critical accessibility elements (e.g., skip-to-content links, modal close buttons).

### ACC-02 Mobile Touch Targets — Inconsistent Application
- **Location**: `_accessibility.scss`:143–155 AND `_reactions.scss`:114 AND `_mobile-bottom-nav.scss` (implied) AND `_mobile.scss`:830–838
- **Description**: `_accessibility.scss` sets `min-height: 44px; min-width: 44px` on `button, a, .btn, .nav-link` on mobile. However: 
  - `.mt2026-reaction-btn` (reactions line 114) only has `min-width: 44px` with no `min-height`.
  - `.mobile-bottom-nav .nav-item` has no explicit `min-height` — the height is implied by padding + icon size + label.
  - `.btn-sm` on mobile does not get the 44px min-height override, so small buttons may be below touch target.
- **Severity**: Major
- **Fix approach**: Audit every interactive element for touch target compliance. Add explicit `min-height: 44px` to `.mt2026-reaction-btn`, `.btn-sm` on mobile, and `.mobile-bottom-nav .nav-item`. Use CSS custom property `--min-touch-target: 44px` for consistency.

### ACC-03 `.sr-only` Class Defined But Older Technique Used Elsewhere
- **Location**: `_accessibility.scss`:118–129 AND `_reactions.scss`:183–193
- **Description**: The `.sr-only` class uses `clip: rect(0, 0, 0, 0)` — this is the legacy technique. The `.likeLinkContainer > a.likeAnchor` hiding in `_reactions.scss` uses the same clip technique inline. The modern standard is `clip: rect(0 0 0 0)` (space-separated) and the even newer approach uses `clip-path: inset(50%)`.
- **Severity**: Cosmetic
- **Fix approach**: Update `.sr-only` to use the modern pattern: `clip-path: inset(50%)` alongside `clip: rect(0 0 0 0)` for backwards compatibility. Consider using Bootstrap's `.visually-hidden` if available.

### ACC-04 Reduced Motion Duplicated in Two Files
- **Location**: `_accessibility.scss`:262–270 AND `_performance.scss`:109–118
- **Description**: Both files contain an identical `@media (prefers-reduced-motion: reduce)` block that kills all animations with `!important`. The duplication means any change must be made in two places, and they could diverge.
- **Severity**: Minor
- **Fix approach**: Keep the reduced-motion block only in `_accessibility.scss` (the canonical location) and remove it from `_performance.scss`. Add a comment referencing the canonical location.

### ACC-05 Reduced Motion Kill-Switch Uses `!important` Hack
- **Location**: `_accessibility.scss`:266–268
- **Description**: `animation-duration: 0.01ms !important` instead of `animation: none !important`. The 0.01ms hack is used so elements still animate to their final state (rather than freezing at frame 0). However, `!important` on `animation-duration` can be overridden by more specific `animation` shorthand that also uses `!important`.
- **Severity**: Minor
- **Fix approach**: Use `animation: none !important` and ensure all animations use `animation-fill-mode: forwards` so elements retain end state. Alternatively, override with longhand only: `animation-name: none !important`.

### ACC-06 Reaction Animations Not Gated by Reduced Motion
- **Location**: `_reactions.scss`:75, 97–100, 138, 141–145
- **Description**: `.mt2026PickerIn` (line 97) and `.mt2026Pop` (line 141) animations are NOT enclosed in a `prefers-reduced-motion` gate. They rely on the global kill-switch in `_accessibility.scss`. Mail animations (`_mail.scss`:1279–1293) DO have their own gate. Inconsistent pattern.
- **Severity**: Minor
- **Fix approach**: Add `@media (prefers-reduced-motion: no-preference)` wrappers around reaction animation definitions, or add a `.mt2026-reaction-picker.visible` and `.mt2026-reaction-btn.mt2026-pop` exclusion to the reduced-motion block.

### ACC-07 No Keyboard Navigation Help
- **Location**: Globally
- **Description**: Only Ctrl+K (context switcher) has keyboard shortcut documentation — shown in the context switcher footer. No general keyboard navigation help is provided for reaction picker, mobile nav, or modals. Users who cannot use a mouse have no discoverable way to learn shortcuts.
- **Severity**: Minor
- **Fix approach**: Add a keyboard shortcut legend (triggered by `?` key or a help button). Document shortcuts: `Ctrl+K` (context switch), `Enter` (react with last used), `Tab` through reaction picker, `Escape` closes picker.

### ACC-08 Mobile Nav Active State Uses Opacity Alone
- **Location**: `_dark-mode.scss`:694–702, and implied by `_mobile-bottom-nav.scss`
- **Description**: `.mobile-bottom-nav .nav-item:active { opacity: 0.7 }` — Opacity change alone is insufficient for accessibility. Users with low vision may not perceive a pure opacity change. WCAG requires that interactive states be distinguishable by more than one sensory characteristic.
- **Severity**: Minor
- **Fix approach**: Pair opacity change with a transform (e.g., `scale(0.95)`), background color change, or both. The `:active` pseudo-class already gets `translateY(0)` from `button-base` mixin — ensure this is visible.

### ACC-09 `.btn:active` Lacks Distinct Visual Feedback
- **Location**: `_mixins.scss`:179–181
- **Description**: `&:active { transform: translateY(0); }` — This returns the button to its resting position, removing the `translateY(-1px)` from hover. This is the OPPOSITE of expected behavior: active should look PRESSED (translateY positive/inset), not released.
- **Severity**: Major
- **Fix approach**: Change active state to `transform: translateY(1px)` or add `box-shadow: inset 0 1px 3px rgba(0,0,0,0.15)` to create a pressed-in effect.

### ACC-10 Reaction Trigger Button Lacks ARIA Attributes
- **Location**: `_reactions.scss`:5–51
- **Description**: `.mt2026-reaction-trigger` is a `<button>` but has no `aria-label`, `aria-expanded`, or `aria-haspopup` attributes. Screen reader users cannot determine that this button opens a reaction picker, nor whether the picker is currently open.
- **Severity**: Major
- **Fix approach**: Add `aria-label="Open reaction picker"`, `aria-haspopup="true"`, and dynamically toggle `aria-expanded`. Ensure the picker has `role="menu"` or `role="listbox"`.

---

## 3. Performance

### PERF-01 Modal Backdrop Blur — Not Gated by Screen Size
- **Location**: `_modal.scss`:4–8
- **Description**: `.modal-backdrop { backdrop-filter: blur(4px); }` applies to ALL screen sizes. `backdrop-filter` is GPU-intensive, especially on mobile where the backdrop covers the full viewport. On low-end devices, this causes visible jank when opening modals.
- **Severity**: Major
- **Fix approach**: Gate the blur to `@media (min-width: 768px)`. On mobile, use a solid dark backdrop only: `background: rgba(0, 0, 0, 0.5)`.

### PERF-02 Mobile Topbar Blur — Expensive Scroll-Time Filter
- **Location**: `_mobile.scss`:223–226
- **Description**: `.navbar-header { backdrop-filter: blur(12px); }` on mobile (inside `@media (max-width: 991px)`). `_performance.scss` correctly gates topbar blur to desktop-only (line 42–52), but this mobile rule overrides that with blur ON mobile — exactly the opposite of what the performance guide intends.
- **Severity**: Critical
- **Fix approach**: Remove `backdrop-filter: blur(12px)` from `_mobile.scss` `.navbar-header` block. Mobile topbar should use a solid `background-color` for performance. The `_performance.scss` rules should take precedence.

### PERF-03 Duplicate Wall-Entry Mobile Override — 8 `!important` Declarations
- **Location**: `_mobile.scss`:166–190
- **Description**: `.s2_streamContent > .wall-entry` uses 8 `!important` declarations to strip box styling. This level of specificity inflation indicates the outer `.wall-entry` should not be rendered on mobile in the first place, or a cleaner override approach exists.
- **Severity**: Minor
- **Fix approach**: Consider hiding the outer `.wall-entry` wrapper on mobile and letting the inner `.panel` be the sole card. If that is not possible, consolidate to 2–3 `!important` rules and add a comment explaining which Clean Theme rules are being overridden.

### PERF-04 `color-mix()` Used Extensively — Browser Support Risk
- **Location**: 25 occurrences across `_calendar.scss`, `_context-switcher.scss`, `_dark-mode.scss`, `_mail.scss`, `_space-chooser.scss`, `_topbar.scss`, `_form.scss`
- **Description**: `color-mix(in srgb, ...)` is a CSS Color 5 function supported only since 2023 in Chrome/Safari and 2024 in Firefox. In older browsers, the property falls through entirely. Heavy use means dark mode hover effects and accent highlights may silently disappear for users on slightly older browsers.
- **Severity**: Minor (will resolve as browser support expands)
- **Fix approach**: Provide a `@supports (color: color-mix(in srgb, red, blue))` fallback strategy. For critical hover effects, duplicate with a solid-color fallback. Document the minimum browser version requirement.

### PERF-05 Dropdown Menu — Dual Animation Causes Jank
- **Location**: `_mixins.scss`:313–319 (referenced from dropdown SCSS)
- **Description**: `fade-in` (opacity) + `scale-in` (transform) applied together on `.dropdown-menu` open. Animating both properties simultaneously can cause jank on low-end devices, especially when `backdrop-filter` is also enabled on the topbar (which increases compositing cost).
- **Severity**: Minor
- **Fix approach**: Use only `fade-in` (opacity) on mobile. Keep both on desktop where GPU compositing is more reliable. Or apply `will-change: opacity, transform` to `.dropdown-menu.show` to pre-allocate compositor layers.

### PERF-06 Reaction Picker Button Hover — Scale + Translate Triggers Repaint
- **Location**: `_reactions.scss`:116–119
- **Description**: `.mt2026-reaction-btn:hover { transform: scale(1.25) translateY(-3px); }` — If 5–6 reaction buttons are visible simultaneously, hovering over the picker causes all buttons to potentially repaint if the picker's hover zone triggers `:hover` on sibling elements via CSS. This is especially problematic on mobile where hover emulation fires on tap.
- **Severity**: Minor
- **Fix approach**: Use `will-change: transform` on `.mt2026-reaction-btn` to promote each button to its own compositor layer. Gate hover effects to `@media (hover: hover)` for desktop only — mobile devices should rely on active/focus states instead.

### PERF-07 Shadow Changes on Hover Trigger Layout
- **Location**: `_mixins.scss`:26–33 (`shadow-hover`) + callers
- **Description**: `box-shadow` changes on `:hover` (via `@include shadow-hover`) trigger repaint and potentially layout. The `shadow-hover` mixin is applied to cards, buttons, and panels. Changing `box-shadow` is cheaper than changing dimensions but still triggers compositing on every hovered element.
- **Severity**: Minor
- **Fix approach**: Use `will-change: box-shadow` on elements that use `shadow-hover`. Alternatively, use `transition: filter` with `filter: drop-shadow(...)` which is GPU-composited, though this has its own caveats.

---

## 4. Responsive / Consistency

### RSP-01 Four Different Mobile Breakpoints in Use
- **Location**: Various files (see grep results)
- **Description**: The codebase uses four different max-width breakpoints: `991px` (most common, correct for "below lg"), `767px` (used in `_mobile.scss`:477, `_gridview.scss`:215, `_list-group.scss`:200, `_admin.scss`:64, `_space-chooser.scss`:254 — correct for "below md"), `768px` (always paired with `min-width` in range expressions), and `480px` (used in `_mobile.scss`:294, `_richtext.scss`:150 — no defined variable). `480px` is not a defined breakpoint. No file uses the `$breakpoint-sm` variable (576px).
- **Severity**: Major
- **Fix approach**: Replace all `480px` literals with `$breakpoint-sm` (576px) or a new `$breakpoint-xs` variable. Use `$breakpoint-sm`, `$breakpoint-md`, and `$breakpoint-lg` variables consistently. Define a `$breakpoint-xs: 480px` if truly needed for extra-small devices.

### RSP-02 `480px` Font-Size Duplicate — Same Value as Base
- **Location**: `_mobile.scss`:302–303 AND `_base.scss`:59–60
- **Description**: At `max-width: 480px`, body font-size is set to `$font-size-sm` (14px). But `_base.scss` at `max-width: 991px` already sets body font-size to 14px. The 480px rule is redundant — same value, no override.
- **Severity**: Cosmetic
- **Fix approach**: Remove the duplicate rule from `_mobile.scss`:302–303, or if the intent was to set a smaller size at 480px, use a different size (e.g., `$font-size-xs: 12px`).

### RSP-03 Content Truncation With No "Show More" Button
- **Location**: `_mobile.scss`:797–827
- **Description**: `.wall-entry-content.content` at `max-width: 991px` gets `max-height: 50vh` with a gradient fade. The only way to expand is via JS (adding `.expanded` class). There is no visible "Show more" button — the gradient fade is the only visual indicator. This is a UX issue and fails WCAG SC 2.4.7 (Focus Visible) since the expanded state cannot be triggered by keyboard if no button exists.
- **Severity**: Major
- **Fix approach**: Inject a "Show more" button at the end of truncated content. The button should be reachable via Tab and must toggle the `.expanded` class. Ensure the button has `aria-expanded` and uses `aria-controls` to reference the content element.

### RSP-04 Container Padding Jump at Breakpoint
- **Location**: `_theme.scss`:79–80 AND `_base.scss`:54–57
- **Description**: At `lg+`, `.container` gets `padding-left: var(--space-8)` (32px). On mobile (`max-width: 991px`), padding is `12px` (hardcoded in `_base.scss`). The jump from 12px to 32px at exactly `992px` is a 20px step — visually abrupt.
- **Severity**: Minor
- **Fix approach**: Make the desktop padding a CSS variable: `--container-padding-desktop: var(--space-8)`. Consider a middle value at md breakpoint: `padding-left: var(--space-4)` (16px) at `min-width: 768px`.

### RSP-05 Universal `margin-top: 8px` Applies to All Page Types
- **Location**: `_base.scss`:18–27
- **Description**: `body > .container, body > .container-fluid, etc. { margin-top: 8px; }` — Applies to dashboard, space, profile, admin pages, even those that already have adequate spacing from other rules.
- **Severity**: Cosmetic
- **Fix approach**: Target specific page types where the margin is needed, or use a small negative margin on the first child element instead of pushing all containers down.

---

## 5. Prioritized Fix Summary

| Priority | ID | Component | Impact | Effort |
|----------|----|-----------|--------|--------|
| P0 | PERF-02 | Mobile topbar blur | Critical perf regression on mobile | 1 file, 3 lines |
| P0 | DM-AR-02 | Duplicate `.mobile-bottom-nav` dark mode | CSS conflicts, unpredictable rendering | 2 files, merge blocks |
| P1 | ACC-01 | `:focus` vs `:focus-visible` inconsistency | Visual noise on click, poor KB experience | Audit 59+ references |
| P1 | ACC-02 | Inconsistent touch targets | Fails WCAG 2.5.8, frustrating on mobile | 3–4 files |
| P1 | ACC-09 | Button active state wrong direction | Fails user expectation, poor feedback | 1 file, 1 mixin |
| P1 | ACC-10 | Reaction trigger missing ARIA | Screen reader inaccessible | 1 file, 1 JS change |
| P1 | PERF-01 | Modal backdrop blur not gated | Jank on mobile modal open | 1 file, 1 media query |
| P1 | DM-AR-05 | `.bg-light` heavy-handed override | Loses visual hierarchy in dark mode | 1 file, scope selector |
| P2 | DM-AR-08 | `--color-text-muted` fails UI contrast | WCAG AA fail for icon/placeholder | 1 file, 1 variable |
| P2 | DM-AR-10 | `!important` on generic `a` selector | Blocks hover/active state styling | 1 file, 1 selector |
| P2 | DM-AR-01 | `_dark-mode.scss` monolith | Maintainability debt | Split into 5+ partials |
| P2 | RSP-03 | Content truncation no "Show more" | WCAG 2.4.7 fail, keyboard trap | JS + SCSS + view |
| P2 | RSP-01 | 4 different breakpoints | Inconsistent responsive behavior | Audit all `max-width` |
| P3 | DM-AR-03 | Account dropdown dark mode in wrong file | Pattern inconsistency | 1 move |
| P3 | DM-AR-04 | Mail dark mode not in central file | Pattern inconsistency | 1 move or document |
| P3 | DM-AR-06 | Modal close `filter: invert(1)` | Fragile icon inversion | 1 file, 1 rule |
| P3 | DM-AR-07 | Link contrast on tertiary bg | WCAG edge case | 1 file, 1 variable |
| P3 | DM-AR-09 | Space chooser light fallbacks | Wrong colors if variable undefined | 1 file, 2 fallbacks |
| P3 | ACC-04 | Reduced motion duplicated | Maintenance risk | Remove from `_performance.scss` |
| P3 | ACC-05 | Reduced motion `!important` hack | Fragile override | 1 file, 1 rule |
| P3 | ACC-06 | Reaction animations not gated | Pattern inconsistency | 1 file, 2 animation blocks |
| P3 | ACC-07 | No KB navigation help | Discoverability | 1 file, JS + view |
| P3 | ACC-08 | Opacity-only active state | WCAG 2.4.11 low visibility | 1 file, 1 rule |
| P3 | PERF-04 | `color-mix()` browser support risk | Falls through on older browsers | 5+ files, @supports |
| P3 | PERF-05 | Dual animation on dropdown | Potential jank | 1 mixin, 1 media query |
| P3 | PERF-06 | Reaction button hover repaint | Paint cost on picker open | 1 file, will-change |
| P3 | PERF-07 | Shadow hover triggers layout | Compositing cost | 1 mixin, will-change |
| P4 | ACC-03 | `.sr-only` older technique | Cosmetic modernization | 1 file |
| P4 | PERF-03 | Wall-entry 8 `!important` | Code smell | 1 file, 1 section |
| P4 | RSP-02 | Duplicate font-size at 480px | Dead code | 1 file, 3 lines |
| P4 | RSP-04 | Container padding jump | Minor visual abruptness | 2 files, CSS variable |
| P4 | RSP-05 | Universal `margin-top: 8px` | Applies where not needed | 1 file, scope selector |
