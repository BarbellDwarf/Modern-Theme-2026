# UI/UX Audit 01: Navigation Components

**Module**: Modern Theme 2026  
**Target device**: 375–430px smartphones  
**Primary concern**: Mobile feels "squished, clunky, claustrophobic, not polished"  
**Review date**: 2026-07-28

---

## Summary

Four navigation systems were reviewed: top navigation bar (desktop), mobile bottom nav, context switcher (Ctrl+K), and space chooser. The topbar works well on large screens but degrades abruptly through the 992–1199px gap and vanishes entirely on mobile with no graceful transition. The mobile bottom nav is the area of highest concern: 5–6 items crammed on 375px, 10px labels, unsafe z-index values, and animations unguarded by `prefers-reduced-motion`. The context switcher's mobile full-screen overlay targets the wrong breakpoint (creating a dead zone where topbar is hidden but overlay hasn't kicked in). The space chooser is mostly legacy — visible only to guests — but carries performance and dark-mode correctness issues.

**36 issues found**: 5 Critical, 11 Major, 15 Minor, 5 Cosmetic.

---

## 1. Top Navigation Bar

### [NAV-001] User-title hidden at 992–1199px — harsh cutoff, no graceful transition
- **Location**: `_topbar.scss:392–394`
- **Description**: `.user-title` is set to `display: none !important` inside the `@media (min-width: 992px) and (max-width: 1199px)` block. On a 1024px tablet or small laptop, the user's display name disappears entirely when there is still ample room. The cutoff is binary — no font-size reduction or truncation first.
- **Severity**: Major
- **Fix approach**: Replace `display: none` with a responsive approach: reduce font-size to 11px, increase gap compression, or use `max-width: 60px` with `overflow: hidden` `text-overflow: ellipsis`. Only hide below 900px.

### [NAV-002] `.topbar-brand` max-width limits cause brand logo clipping
- **Location**: `_topbar.scss:22–31`, `_topbar.scss:326–330`
- **Description**: Base rule sets `max-width: 180px`; the 992–1199px override uses `max-width: 30vw`. At 1024px, 30vw = 307px — but a logo with text that is 280px wide clips at 180px on large screens. At 1200px, `max-width: 180px` truncates logos that need ~200px.
- **Severity**: Minor
- **Fix approach**: Change base `max-width` to `clamp(120px, 20vw, 200px)`. Remove the 30vw override in the 992–1199px block — let the clamp handle all widths uniformly.

### [NAV-003] Topbar `z-index: 3000` conflicts with modal stacking contexts
- **Location**: `_topbar.scss:133–134`
- **Description**: `#topbar` uses `z-index: 3000`. Bootstrap modals use 1040–1055, the module's own modals use 1050–1055, and drawers use 1090. The topbar at 3000 would paint ABOVE an open modal backdrop (1040) but BELOW the modal content (1050) if the modal is later in DOM — creating a visual split where the topbar overlays the backdrop but the modal dialog appears on top of the topbar. This is inconsistent and fragile.
- **Severity**: Major
- **Fix approach**: Lower topbar `z-index` to 1030 (matching Bootstrap's `$z-fixed`). Its own dropdown menus can increase from there. If placing elements above the topbar is needed (modals, drawers), they need a higher z-index than 3000, which defeats the purpose of the high value.

### [NAV-004] Topbar hidden at ≤991px with `display: none !important` — no transition
- **Location**: `_topbar.scss:500–506`
- **Description**: At 991px and below, `#topbar-first`, `#topbar-second`, and `.topbar` are set to `display: none !important`. The topbar vanishes instantly. Combined with `body { padding-top: 0 !important }`, the layout jumps upward.
- **Severity**: Cosmetic
- **Fix approach**: Add a CSS transition: `opacity 0.2s, transform 0.2s` with `transform: translateY(-100%)` before hiding. This requires a brief JS resize listener, but the visual polish is significant.

### [NAV-005] `#top-menu-sub` hidden at ALL breakpoints — stale dead code
- **Location**: `_topbar.scss:349–351`, `_topbar.scss:422–423`
- **Description**: `#top-menu-sub { display: none !important }` appears in both the 992–1199px AND the ≥992px media query blocks — meaning it is hidden at every screen size. This is a leftover from HumHub core's two-row topbar that this theme eliminates.
- **Severity**: Cosmetic
- **Fix approach**: Remove both `#top-menu-sub` display rules (17 lines). The element's inline style (main.php:73) already hides it with `position:absolute;visibility:hidden;height:9999px`.

### [NAV-006] No `:focus-visible` outline on notification and action icon buttons
- **Location**: `_topbar.scss:63–77`, `_topbar.scss:373–383`
- **Description**: `.notifications .btn-group > a`, `.notifications .dropdown-toggle`, and `.topbar-actions .dropdown-toggle` have hover states but no `:focus-visible` or `:focus` outline. Keyboard users navigating via Tab cannot see which icon is focused.
- **Severity**: Major (accessibility)
- **Fix approach**: Add `&:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }` to each selector group.

### [NAV-007] `.badge-notifications` positioned with `top: 4px; right: 4px` — overlaps small icons
- **Location**: `_topbar.scss:262–282`
- **Description**: The notification badge is absolutely positioned at `top: 4px; right: 4px` relative to `.btn-group`. On a 46×46px trigger, the badge sits at the very top-right corner, overlapping the bell icon's top-right quadrant. On very small screens or when the icon font is smaller, the overlap makes the badge unreadable.
- **Severity**: Minor
- **Fix approach**: Increase offset to `top: 6px; right: 6px`. Ensure the bell icon has `padding: 10px` so icon content stays clear of the badge.

### [NAV-008] Account dropdown reset section (80 lines) — high specificity debt
- **Location**: `_topbar.scss:530–610`
- **Description**: Lines 542–595 use `.dropdown.account .dropdown-menu` with eight `!important` flags to undo HumHub core's `.account .dropdown-menu` styles (which paint the entire dropdown in primary brand color). This is necessary but fragile: any core change to the `.account` selector will silently break this override. 80 lines of `!important` reset is a maintenance burden.
- **Severity**: Minor
- **Fix approach**: Extract to a dedicated partial `_account-dropdown.scss`. Add a comment referencing the core file path that is being neutralised. Consider merging the dark-mode variant (lines 599–609) into the same block to avoid duplication.

### [NAV-009] `.topbar-actions .dropdown.account .user-title` margin-right hardcoded
- **Location**: `_topbar.scss:115–118`
- **Description**: `.user-title { margin-right: 4px }` uses a hardcoded pixel value instead of a spacing variable. Inconsistent with the rest of the theme's `var(--space-*)` system.
- **Severity**: Cosmetic
- **Fix approach**: Replace with `margin-right: var(--space-1)` (which resolves to 4px) for consistency.

### [NAV-010] Light-mode color guard uses `!important` on entire blocks
- **Location**: `_topbar.scss:468–484`
- **Description**: `[data-bs-theme="light"]` selector block sets `color: ... !important` on `#topbar`, `.nav-link`, and their child `i` elements. This is belt-and-suspenders: if the normal cascade works, `!important` is unnecessary; if it doesn't, the root cause is a specificity issue elsewhere.
- **Severity**: Minor
- **Fix approach**: Audit the cascade to remove `!important`. Keep one defensive `!important` on the most stubborn selector (`#topbar .nav-link`) if needed, but remove from the `i` descendants.

---

## 2. Mobile Bottom Navigation

### [NAV-011] Body padding `!important` conflicts with other fixed-position elements
- **Location**: `_mobile-bottom-nav.scss:146–148`
- **Description**: `body { padding-bottom: calc(56px + env(safe-area-inset-bottom, 0)) !important; }` adds bottom padding to avoid content being hidden under the fixed bottom nav. The `!important` breaks any other component that needs to adjust body padding (e.g., mail composer on fullscreen mobile uses `position: fixed` with `bottom: calc(56px + ...)`, and its own padding logic can conflict).
- **Severity**: Critical
- **Fix approach**: Remove `!important`. Use a dedicated class (`.mt2026-mobile-nav-active`) toggled by JS on the body element — this plays nicely with other padding concerns and avoids specificity battles.

### [NAV-012] `body::after` pseudo-element at `z-index: 10000` overlaps modals and drawers
- **Location**: `_mobile-bottom-nav.scss:150–163`
- **Description**: `body::after` is a `position: fixed` element with `z-index: 10000` intended to fill safe-area space behind the OS gesture bar. At z-index 10000, it overlays every modal (1050), drawer (1090), and keyboard overlay (1100). If the safe-area bar is shown while a modal is open, the modal's bottom edge is covered.
- **Severity**: Critical
- **Fix approach**: Reduce to `z-index: 1001` (above bottom nav's 1000 but below composer at 1010). Better: apply `background-color` to the bottom nav itself and remove the pseudo-element entirely — the nav already spans `left: 0; right: 0` and its own background will fill the safe area.

### [NAV-013] Nav label `font-size: 10px` below WCAG readability recommendation
- **Location**: `_mobile-bottom-nav.scss:61–62`
- **Description**: `.nav-label { font-size: 10px; }`. WCAG success criterion 1.4.4 (Resize text) requires that text can scale to 200% without loss of content. At 10px, on a 375px screen, labels are very difficult to read, especially for users with low vision or in bright sunlight.
- **Severity**: Major (accessibility)
- **Fix approach**: Increase to `font-size: 11px` with `line-height: 1.15`. The nav bar has 56px height; 11px with 2px icon gap fits. Consider using `clamp()` for fluid sizing.

### [NAV-014] Calendar nav item hidden at ≤380px with `display: none !important`
- **Location**: `_mobile-bottom-nav.scss:133–136`
- **Description**: `.nav-item-calendar { display: none !important; }` at ≤380px. The Calendar module is still installed — the user loses quick access. No alternative entry point is provided on these narrow screens.
- **Severity**: Major
- **Fix approach**: Move Calendar into the More sheet on narrow screens instead of hiding it entirely. The view already has the logic to conditionally show Calendar; expand it to inject a More-sheet entry for narrow widths.

### [NAV-015] Bottom sheet animations not gated by `prefers-reduced-motion`
- **Location**: `_mobile-bottom-nav.scss:320`, `_mobile-bottom-nav.scss:436–439`, `_mobile-bottom-nav.scss:441–443`
- **Description**: `.mobile-sheet-content` uses `animation: slideUpSheet 0.3s cubic-bezier(0.4, 0, 0.2, 1)` and `.mobile-sheet-backdrop` uses `animation: fadeIn 0.2s ease`. Neither has a `@media (prefers-reduced-motion: reduce)` fallback.
- **Severity**: Major (accessibility)
- **Fix approach**: Add `@media (prefers-reduced-motion: reduce) { .mobile-sheet-content { animation: none; } .mobile-sheet-backdrop { animation: none; opacity: 0.5; } }`.

### [NAV-016] `slideUpNav` animation on `.mobile-bottom-nav` not reduced-motion gated
- **Location**: `_mobile-bottom-nav.scss:209–222`
- **Description**: `.mobile-bottom-nav { animation: slideUpNav 0.2s ease-out; }` plays on every page load. No `prefers-reduced-motion` guard.
- **Severity**: Major (accessibility)
- **Fix approach**: Gate with `@media (prefers-reduced-motion: reduce) { .mobile-bottom-nav { animation: none; } }`.

### [NAV-017] 5–6 nav items on 375px screen — cramped layout
- **Location**: `mobileBottomNav.php:30–109`
- **Description**: The nav bar renders Home, Spaces, People, Notifications, More, plus Calendar (when enabled). On a 375px display, 6 items at `flex: 1` gives each ~62.5px. With 20px icon + 2px margin + 10px label (~50px vertical in flex column), the 56px height forces severe vertical compression.
- **Severity**: Major
- **Fix approach**: Reduce to 5 max. Merge Calendar into More sheet at all mobile widths (remove the calendar conditional from the nav bar entirely).

### [NAV-018] `.nav-badge` positioning via `transform: translateX(14px)` — fragile
- **Location**: `_mobile-bottom-nav.scss:72–93`
- **Description**: `.nav-badge` uses `right: 50%; transform: translateX(14px)`. The 14px offset is an arbitrary value. If icon font-size changes (currently 20px) or border sizes differ, the badge drifts off-center. The `top: 2px` also assumes the icon renders at the top of the flex container.
- **Severity**: Minor
- **Fix approach**: Use `right: -4px; top: -4px` relative to the parent `.nav-icon` (which already has `position: relative`). This anchors the badge to the icon's top-right corner regardless of icon size.

### [NAV-019] Bottom sheet `padding-bottom: calc(70px + env(...))` hardcodes nav height
- **Location**: `_mobile-bottom-nav.scss:321`
- **Description**: `.mobile-sheet-content { padding-bottom: calc(70px + env(safe-area-inset-bottom, 0px)); }`. The 70px assumes 56px nav + 14px gap, but the nav height is not a CSS variable. If any future change adjusts nav height, the sheet padding drifts.
- **Severity**: Minor
- **Fix approach**: Define `--mobile-nav-height: 56px` on `:root` or on the nav itself, then use `padding-bottom: calc(var(--mobile-nav-height) + 14px + env(safe-area-inset-bottom, 0px))`.

### [NAV-020] Mobile nav More sheet dark-mode toggle uses inline fetch with page reload
- **Location**: `mobileBottomNav.php:324–334`
- **Description**: The dark mode toggle in the More sheet sends a POST fetch to `/dark-mode/user/modal` and then reloads the page (`window.location.reload()`). This causes a full page reload on every theme toggle — slow and jarring on mobile.
- **Severity**: Minor
- **Fix approach**: Use a class toggle on `<html>` to switch themes instantly, then persist the preference async in the background. The page reload is a fallback, not the primary mechanism.

### [NAV-021] Mobile nav active state uses path-based string matching — fragile
- **Location**: `mobileBottomNav.php:352–374`
- **Description**: The `updateMobileNavActive()` JS function uses `path.indexOf('/people')` and similar string matches. This can produce false positives: `/people/settings` matches People, `/calendar/settings` matches Calendar.
- **Severity**: Minor
- **Fix approach**: Use path segments: `path.split('/')[1]` for the first segment, then match: `segment === 'people'`, `segment === 'notification'`, etc. This is more precise and avoids false matches.

---

## 3. Context Switcher (Ctrl+K)

### [NAV-022] Mobile full-screen overlay targets `<768px` but topbar is hidden at `≤991px` — dead zone
- **Location**: `_context-switcher.scss:334–345`; `_topbar.scss:500–506`
- **Description**: The context switcher's mobile full-screen override (`position: fixed; inset: 0; border-radius: 0`) uses the `@include mobile-only` mixin, which targets `<768px`. However, the topbar is hidden at `≤991px`. On screens between 768px and 991px: the topbar is hidden (no trigger button available), the context switcher menu renders as a desktop dropdown (not full-screen), and the mobile bottom nav IS visible. The result: the context switcher is effectively unusable on tablets.
- **Severity**: Critical
- **Fix approach**: Align the context switcher's mobile breakpoint with the topbar's hidden breakpoint (`≤991px`). Change `@include mobile-only` to `@media (max-width: 991px)`. On tablets, render as the full-screen overlay with a close button.

### [NAV-023] Context switcher menu `max-height: 480px` not viewport-aware
- **Location**: `_context-switcher.scss:115`, `_context-switcher.scss:292`
- **Description**: Base `max-height: 480px`; tablet override `max-height: min(70vh, 520px)`. The tablet version is viewport-aware via `70vh` but the desktop base uses a fixed 480px. On a 768px-tall screen with 60px topbar + 480px menu + 6px gap, the menu can touch the browser chrome.
- **Severity**: Major
- **Fix approach**: Use the same `min(70vh, 480px)` pattern in the base rule. Better: `min(calc(100vh - 100px), 520px)` to account for topbar + padding.

### [NAV-024] `.context-label` max-width 150px/110px truncation hides context info
- **Location**: `_context-switcher.scss:94–97`, `_context-switcher.scss:282–284`
- **Description**: `.context-label` at base is `max-width: 150px`, at tablet `max-width: 110px`. Long space names (e.g., "Product Design Team Review") are truncated with ellipsis. The truncation hides which space the user is currently in.
- **Severity**: Minor
- **Fix approach**: Use `max-width: min(180px, 20vw)` for base, `max-width: min(130px, 15vw)` for tablet. Add `title` attribute on the context-label element so hover reveals the full name.

### [NAV-025] Tablet width `min(320px, calc(100vw - 24px))` — menu left-aligned far from trigger
- **Location**: `_context-switcher.scss:290`
- **Description**: `.context-switcher-menu { width: min(320px, calc(100vw - 24px)); }`. On a 768px-wide tablet, `min()` picks 320px. But `left: 0` means the menu aligns to the left edge of the context switcher's parent (`position: relative` on `.context-switcher`). On a tablet the switcher button is left of center, so the menu extends rightward — fine. But on a 991px screen it can appear disconnected.
- **Severity**: Minor
- **Fix approach**: On tablet, center the menu: `left: 50%; transform: translateX(-50%)`. Drop the complex `min()` in favor of a fixed width on tablet.

### [NAV-026] Context switcher uses `display: none` to hide menu — screen reader inaccessible
- **Location**: `contextSwitcher.php:79`
- **Description**: The menu has `style="display:none"`. `display: none` removes content from the accessibility tree entirely — screen readers cannot discover the search input or navigation items when the menu is closed.
- **Severity**: Critical (accessibility)
- **Fix approach**: Use `visibility: hidden; opacity: 0; pointer-events: none` with `aria-hidden="true"` when closed. The JS toggle should switch between these states rather than toggling `display`.

### [NAV-027] Context switcher mobile overlay z-index can be overlapped by stream content
- **Location**: `_context-switcher.scss:121`, `_context-switcher.scss:334–345`
- **Description**: Context switcher menu: `z-index: $z-dropdown + 30` (1030). The mobile full-screen overlay inherits this 1030 while being `position: fixed` — losing the stacking containment of the topbar. Stream entries with `transform` create their own stacking context, and any sibling element later in DOM can paint over the 1030 overlay.
- **Severity**: Minor
- **Fix approach**: Add a separate mobile-specific z-index: `z-index: $z-mt2026-modal` (1055) inside the `@media (max-width: 991px)` block, ensuring the full-screen overlay floats above stream content.

---

## 4. Space Chooser

### [NAV-028] Space chooser button uses `rgba(255, 255, 255, 0.05)` on white backgrounds — barely visible in light mode
- **Location**: `_space-chooser.scss:17–19`
- **Description**: `.space-chooser-button` has `background-color: rgba(255, 255, 255, 0.05)` and `border: 1px solid rgba(255, 255, 255, 0.1)`. On a white topbar background, white-on-white at 5% opacity is nearly invisible. The button looks like plain text, not an interactive element.
- **Severity**: Major
- **Fix approach**: Use `var(--color-bg-secondary)` for the light-mode background. The dark mode overrides (lines 281–296) provide proper `rgba(255,255,255,0.03)` backgrounds that ARE visible on dark backgrounds. For light mode, `--color-bg-secondary` (typically `#f3f4f6` / gray-100) is a better base.

### [NAV-029] `.space-name` hidden at ≤767px via `display: none`
- **Location**: `_space-chooser.scss:47–50`
- **Description**: `.space-name { @media (max-width: 767px) { display: none; } }`. The space name tag inside the chooser button is hidden on mobile. The user sees only the space logo/icon, no text label.
- **Severity**: Major
- **Fix approach**: Use `max-width: 60px` with `text-overflow: ellipsis` instead of hiding. The space name provides essential context for multi-space users.

### [NAV-030] Dark mode overrides use `#f8fafc` as CSS custom property fallback — incorrect for dark mode
- **Location**: `_space-chooser.scss:300–301`
- **Description**: `background-color: var(--color-bg-secondary, #f8fafc)` — `#f8fafc` is a light gray (gray-50). If the CSS variable `--color-bg-secondary` is not set, the fallback `#f8fafc` renders as a light background in dark mode. The `--color-border, #e5e7eb` fallback is similarly light.
- **Severity**: Minor
- **Fix approach**: Use dark-appropriate fallbacks: `var(--color-bg-secondary, #1e293b)` and `var(--color-border, #334155)`.

### [NAV-031] Create space button `2px dashed` border — low visual prominence for CTA
- **Location**: `_space-chooser.scss:228–250`
- **Description**: `.create-space-button { border: 2px dashed var(--color-border, #e5e7eb); }`. The dashed border looks like a disabled dropzone, not a call-to-action button. Low contrast against the dropdown background.
- **Severity**: Minor
- **Fix approach**: Use a solid `1px` border with `var(--color-primary)` color. Make the button look like a real button: `background: var(--color-primary-lightest)` with `color: var(--color-primary)` text.

### [NAV-032] Space chooser dropdown `max-height: 400px` not viewport-aware
- **Location**: `_space-chooser.scss:109`
- **Description**: `.space-chooser-menu { max-height: 400px; }`. On a 667px iPhone SE screen, 400px + topbar space + button height leaves only ~200px for the dropdown before it overflows below the fold.
- **Severity**: Major
- **Fix approach**: Use `max-height: min(400px, calc(100vh - 120px))` to respect the viewport. Add a scroll gradient indicator (`mask-image: linear-gradient(...)`) for UX polish.

### [NAV-033] Space chooser dropdown uses `backdrop-filter: blur(12px)` — mobile performance
- **Location**: `_space-chooser.scss:114–115`
- **Description**: `.space-chooser-menu { backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }`. The `backdrop-filter` property is GPU-expensive and can cause jank on mid-range phones when the dropdown contains many items.
- **Severity**: Minor
- **Fix approach**: Gate `backdrop-filter` behind `@media (min-width: 992px)` (desktop only). On mobile, use a solid background color.

---

## 5. Cross-Cutting Issues

### [NAV-034] `useContextSwitcher` condition provides no guest preview — logged-out users see the old Chooser
- **Location**: `main.php:31, 56–61`
- **Description**: `$useContextSwitcher = !Yii::$app->user->isGuest;` — guests see the legacy `Chooser::widget()` instead of the context switcher. The legacy space chooser dialogs are not styled for this theme and may render with broken CSS on guest-accessible pages (login, registration, public content).
- **Severity**: Critical (guest experience)
- **Fix approach**: Show the context switcher to guests as well, with restricted items (Dashboard only, no spaces). At minimum, ensure `Chooser::widget()` is styled for this theme when it does render.

### [NAV-035] Topbar `position: fixed` without `isolation: isolate` — stacking context leaks
- **Location**: `_topbar.scss:130–135`
- **Description**: `#topbar { position: fixed; top: 0; z-index: 3000; }`. Fixed positioning creates a new stacking context, but descendant elements with `z-index` can still create confusion. There is no `isolation: isolate` to contain the side effects.
- **Severity**: Minor
- **Fix approach**: Add `isolation: isolate` to `#topbar`. This guarantees that no child element's z-index can escape the topbar's stacking context.

### [NAV-036] Mobile nav `body::after` safe-area z-index used twice with same high value
- **Location**: `_mobile-bottom-nav.scss:153–163`, `_mobile-bottom-nav.scss:202–204`
- **Description**: Light mode: `z-index: 10000` (line 161). Dark mode override (line 203) does NOT redefine `z-index` but catches the light mode value — so both use `z-index: 10000`. Unnecessarily extreme for a safe-area fill element.
- **Severity**: Cosmetic
- **Fix approach**: Set `z-index: 1001` once, outside the media query. Only the `background-color` differs per theme.

---

## Prioritized Fix Summary

| Prio | ID | Component | Issue | Effort |
|------|----|-----------|-------|--------|
| P0 | NAV-011 | Mobile Bottom Nav | Body padding `!important` conflicts with other fixed elements | 30m |
| P0 | NAV-012 | Mobile Bottom Nav | `body::after` z-index 10000 overlaps all modals/drawers | 30m |
| P0 | NAV-022 | Context Switcher | Mobile dead zone 768–991px: overlay targets wrong breakpoint | 1h |
| P0 | NAV-026 | Context Switcher | `display:none` hides menu from screen readers | 30m |
| P0 | NAV-034 | Cross-Cutting | Guest users see unstyled legacy Chooser | 2h |
| P1 | NAV-001 | Topbar | User-title hidden at 992–1199px with no graceful fallback | 30m |
| P1 | NAV-003 | Topbar | z-index 3000 conflicts with modal stacking | 30m |
| P1 | NAV-006 | Topbar | No `:focus-visible` on notification/action icons | 15m |
| P1 | NAV-013 | Mobile Bottom Nav | Nav label 10px below WCAG readability | 15m |
| P1 | NAV-014 | Mobile Bottom Nav | Calendar hidden at ≤380px, no alternative access | 1h |
| P1 | NAV-015 | Mobile Bottom Nav | Bottom sheet animations not reduced-motion gated | 30m |
| P1 | NAV-016 | Mobile Bottom Nav | slideUpNav animation not reduced-motion gated | 15m |
| P1 | NAV-017 | Mobile Bottom Nav | 6 nav items on 375px cramped | 1h |
| P1 | NAV-023 | Context Switcher | `max-height: 480px` overflows on short viewports | 15m |
| P1 | NAV-028 | Space Chooser | Button barely visible on light backgrounds | 15m |
| P1 | NAV-029 | Space Chooser | Space name hidden on mobile | 15m |
| P1 | NAV-032 | Space Chooser | Dropdown max-height 400px not viewport-aware | 15m |
| P2 | NAV-002 | Topbar | Brand logo clips at 180px on medium screens | 15m |
| P2 | NAV-007 | Topbar | Notification badge overlaps bell icon | 15m |
| P2 | NAV-008 | Topbar | 80 lines of `!important` account dropdown reset | 2h |
| P2 | NAV-018 | Mobile Bottom Nav | `.nav-badge` translateX fragile | 15m |
| P2 | NAV-019 | Mobile Bottom Nav | Sheet padding hardcodes 70px nav height | 10m |
| P2 | NAV-021 | Mobile Bottom Nav | Active state path matching fragile | 30m |
| P2 | NAV-024 | Context Switcher | `.context-label` truncation hides space name | 15m |
| P2 | NAV-030 | Space Chooser | Dark mode fallback color `#f8fafc` incorrect | 10m |
| P2 | NAV-031 | Space Chooser | Create space button `2px dashed` low prominence | 15m |
| P2 | NAV-035 | Cross-Cutting | Topbar missing `isolation: isolate` | 10m |
| P3 | NAV-004 | Topbar | No transition when topbar hides on mobile | 30m |
| P3 | NAV-005 | Topbar | `#top-menu-sub` hidden everywhere — 17 lines dead code | 10m |
| P3 | NAV-009 | Topbar | Hardcoded 4px instead of `var(--space-1)` | 5m |
| P3 | NAV-010 | Topbar | Unnecessary `!important` in light mode guard | 15m |
| P3 | NAV-020 | Mobile Bottom Nav | Dark mode toggle reloads page | 2h |
| P3 | NAV-025 | Context Switcher | Tablet menu left-aligned far from trigger | 15m |
| P3 | NAV-027 | Context Switcher | Mobile overlay z-index 1030 can be overlapped | 10m |
| P3 | NAV-033 | Space Chooser | backdrop-filter on dropdown — mobile perf | 15m |
| P3 | NAV-036 | Cross-Cutting | Safe-area z-index 10000 duplicated | 10m |

**Priorities**: **P0** = ships-clogging bugs / a11y violations — fix immediately. **P1** = UX friction / moderate a11y — fix this sprint. **P2** = polish / maintenance debt — fix next sprint. **P3** = cosmetic / low impact — backlog.
