# UI/UX Audit 05: Admin Panel, Modals, Overlays & Dropdowns

Audit of admin panel layout, modal dialogs, dropdown stacking, and mobile bottom-sheet components in the Modern Theme 2026 module. Covers SCSS files at `themes/ModernTheme2026/scss/humhub/_admin.scss` (359 lines), `_modal.scss` (98 lines), `_dropdown.scss` (359 lines), `_mobile-bottom-nav.scss` sheets section (lines 293–561), PHP config at `controllers/ConfigController.php`, admin layout overrides at `views/admin/views/layouts/` (6 files, ~99 lines), and JavaScript at `resources/js/modalFocusFix.js` and `peopleFocusGuard.js`.

---

## 1. Admin Panel

### ADM-001 Admin SCSS single-file overload
- **Location**: `_admin.scss`:1–359
- **Description**: The file handles layout, sidebar, GridView, color pickers, collapsible groups, CodeMirror, dark mode overrides — 7 distinct concerns in one partial. This makes it hard to maintain and test independently.
- **Severity**: Major
- **Fix approach**: Split into partials: `_admin-layout.scss`, `_admin-gridview.scss`, `_admin-settings.scss` (color pickers + collapsible groups), `_admin-codemirror.scss`, `_admin-dark.scss`. Import from a new `_admin-index.scss` or directly from `build.scss`.

### ADM-002 Admin panel `padding: 0` breaks `.panel` card styling
- **Location**: `_admin.scss`:36–38
- **Description**: `.mt2026-admin-content > .panel` forces `padding: 0` to prevent double-padding from `.panel` (from the `@include card` mixin) plus `.panel-body`. However this also neutralizes the card mixin's shadow and border-radius propagation in some contexts, and forces manual resetting of negative margins on `.panel-heading` (line 42–43).
- **Severity**: Major
- **Fix approach**: Instead of fighting the card mixin, either (a) use `.panel-body` exclusively and remove the extra panel wrapper from admin views, or (b) create a `.panel-admin` modifier class that sets padding correctly from the start, so `padding: 0` isn't needed.

### ADM-003 GridView min-width forces horizontal scroll on mobile
- **Location**: `_admin.scss`:77–91
- **Description**: `.grid-view table` has `min-width: 600px` stepping down to `min-width: 480px` at 575px viewport. On 375px phones, 480px still forces horizontal scroll inside the `.col-lg-9` content area. No responsive table alternative (card-based rows, stacked layout) is provided.
- **Severity**: Major
- **Fix approach**: Add a responsive table alternative for <576px: convert table rows to stacked card-style layout using `display: block` on `tr`, `td`, and label-like `::before` pseudo-elements for column headers. Alternatively, wrap the table treatment in a `@media (min-width: 576px)` guard.

### ADM-004 Admin layout files duplication — consolidation opportunity
- **Location**: `views/admin/views/layouts/main.php`, `setting.php`, `user.php`, `space.php`, `information.php`, `module.php`
- **Description**: Six layout files (~99 lines total) all extend `@admin/views/layouts/main.php` and follow near-identical patterns: wrap content in `.panel.panel-default` with a heading and sub-menu. `setting.php`, `user.php`, `space.php`, `information.php` differ only by widget class and title string. Unnecessary duplication for what could be a single parameterized template.
- **Severity**: Minor
- **Fix approach**: Consolidate into a single `views/admin/views/layouts/_generic.php` that accepts variables for `$menuWidget` (widget class name), `$title` (translation string), `$wrapBody` (whether to use `.panel-body`). Keep `main.php` and `module.php` as-is since they have unique structures.

### ADM-005 `.list-group-vertical-lg` uses `!important` against Bootstrap
- **Location**: `_admin.scss`:129–134
- **Description**: The class overrides Bootstrap's `.list-group-horizontal` at 768px+ with `flex-direction: column !important`. This is necessary because the HumHub template renders both classes on the same element, but `!important` is fragile — any third-party module adding a different direction class will be overridden silently.
- **Severity**: Minor
- **Fix approach**: If possible, patch the template to remove `.list-group-horizontal` at 768px+ rather than fighting it. If not, add a comment documenting the dependency and the expected DOM structure for future maintainers.

### ADM-006 Mobile admin sidebar horizontal scroll — item width issue
- **Location**: `_admin.scss`:113–121
- **Description**: On mobile (<992px), the admin sidebar's `.list-group` gets `overflow-x: auto; flex-wrap: nowrap`. Long text labels in nav items may not have enough horizontal room to display fully (the column is `col-lg-3` which is ~100% width on mobile, but items are forced into a single row).
- **Severity**: Minor
- **Fix approach**: Add `white-space: nowrap` to `.list-group-item` for truncation, or reduce font size / padding on mobile items so they fit within the viewport. Consider wrapping on extremely narrow screens (<400px).

### ADM-007 Palette preset button border color uses Bootstrap 5 default
- **Location**: `_admin.scss`:197
- **Description**: `.moderntheme-preset-btn` uses `border: 2px solid var(--color-border, #dee2e6)`. The fallback `#dee2e6` is Bootstrap 5's default border color, not the theme's own `#e5e7eb` used everywhere else (e.g., `_admin.scss`:166, `_admin.scss`:171, `_admin.scss`:175). This creates a visual inconsistency in the off-chance the variable is undefined.
- **Severity**: Cosmetic
- **Fix approach**: Change fallback to `#e5e7eb` to match the theme's default border color.

---

## 2. Modals

### MOD-001 Modal margin-top 8px gutter feels inconsistent
- **Location**: `_modal.scss`:17–19
- **Description**: `.modal-dialog:not(.modal-dialog-centered):not(.modal-fullscreen)` uses `margin-top: calc(var(--mt2026-topbar-height, 60px) + 8px)`. The 8px additional gutter is arbitrary — it doesn't match any spacing variable (the theme's spacing system uses 4px grid: `--space-2` = 8px, `--space-3` = 12px, etc.). On short modals, this creates an uneven gap between topbar and modal.
- **Severity**: Cosmetic
- **Fix approach**: Replace `8px` with `var(--space-2)` to bind to the design grid, or consider whether the extra gutter is needed at all — `var(--mt2026-topbar-height)` alone may be sufficient.

### MOD-002 Modal z-index variable defined but unused by modal CSS
- **Location**: `variables.scss`:199 vs `_modal.scss`:10–12
- **Description**: `$z-mt2026-modal: 1055` is defined but never applied to Bootstrap's `.modal` class (which inherits Bootstrap's default `z-index: 1050`). The variable only gets used on `.mobile-bottom-nav` at `_mobile-bottom-nav.scss:259`. This means the theme's modal layer (1055) doesn't match the actual rendered modal (1050) — a 5px gap that doesn't matter visually but signals drift between the variable system and reality.
- **Severity**: Minor
- **Fix approach**: Either (a) set `z-index: $z-mt2026-modal` on `.modal` in `_modal.scss`, or (b) change the variable to match Bootstrap's `1050` and document that the theme follows the framework default.

### MOD-003 Modal backdrop blur — no performance gate
- **Location**: `_modal.scss`:4–7
- **Description**: `.modal-backdrop` uses `backdrop-filter: blur(4px)`. This is an expensive GPU+CPU operation on lower-end devices and can cause jank during modal open/close animations. No `@media (prefers-reduced-motion)` or device-performance guard is applied.
- **Severity**: Major
- **Fix approach**: Gate `backdrop-filter: blur(4px)` behind `@media (prefers-reduced-motion: no-preference)` to disable it when users request reduced motion. Consider also disabling on mobile (<768px) since the effect is barely visible on small screens and the performance cost is relatively higher.

### MOD-004 `.modal-content overflow: hidden` clips dropdowns inside modals
- **Location**: `_modal.scss`:25
- **Description**: `.modal-content` has `overflow: hidden` which clips any child element that visually overflows the modal boundaries — notably `.dropdown-menu` elements that have negative margin or absolute positioning outside the `.modal-body`. If a dropdown opens inside a modal (e.g., a settings form with a select-like dropdown), the menu may be clipped.
- **Severity**: Major
- **Fix approach**: Remove `overflow: hidden` from `.modal-content` and rely on border-radius containment via a wrapper element (e.g., `.modal-content-wrapper` with `overflow: hidden` and border-radius that doesn't contain dropdowns). Or, if overflow is needed for the card effect, move it to a `::before` pseudo-element that doesn't affect layout containment.

### MOD-005 Mobile modal safe-area padding and sheet consistency
- **Location**: `_modal.scss`:90–94
- **Description**: On mobile (<992px), `.modal-content` gets `padding-bottom: max(16px, env(safe-area-inset-bottom, 0px))`. However `.modal-content` already has `border-radius: var(--radius-xl)` which visually rounds the bottom corners — the padding-bottom adds space inside the content box rather than below it, which can look inconsistent when `.modal-header` and `.modal-footer` have their own padding.
- **Severity**: Cosmetic
- **Fix approach**: Move safe-area handling to `.modal-dialog` or a dedicated safe-area spacer after `.modal-content`, so border-radius rendering isn't affected. Use `var(--space-4)` instead of a hardcoded `16px`.

### MOD-006 `.modal-lg` lacks responsive handling at 992px
- **Location**: `_modal.scss`:74–76, 82–87
- **Description**: `.modal-lg` sets `max-width: 900px`, but on viewports at 992px (Bootstrap's `lg` breakpoint), the modal with 16px margins on each side would be ~960px available — 900px + scrollbar is essentially full-width with almost no gutters. The responsive rule at lines 82–87 only covers 768–991px, leaving the 992+ transition gap unhandled.
- **Severity**: Minor
- **Fix approach**: Extend the responsive block to cover up to `max-width: 1024px` or use `max(90vw, 900px)` in the base rule so it scales down naturally below 1000px.

### MOD-007 `.modal-sm` unattainable on small phones
- **Location**: `_modal.scss`:78–80
- **Description**: `.modal-sm` has `max-width: 400px`. On a 375px-wide phone (iPhone SE/12/13 mini), the modal with 16px gutters on each side can only be 343px wide, so 400px is unattainable and the modal blows out horizontally with no fallback. No `max-width: calc(100vw - 32px)` constraint.
- **Severity**: Major
- **Fix approach**: Add `max-width: calc(100vw - var(--bs-modal-margin, 16px) * 2)` to `.modal-sm` for viewports <400px, or use a responsive variable that caps at viewport minus margins.

---

## 3. Dropdowns

### DRP-001 Stacking context system is fragile and over-engineered
- **Location**: `_dropdown.scss`:1–359
- **Description**: The dropdown stacking system manages 18+ z-index layers (from `$z-dropdown: 1000` to `$z-dropdown + 60`). Z-index is set on `.dropdown-menu` (line 171), `.comment-controls .dropdown-menu` (+20, line 188), `.wall-entry.mt2026-dropdown-open` (+30, line 196), `.wall-entry-controls` (+35, line 213), `.comment_create` (+40, line 201), composer dropdowns (+45, line 241), composer open state (+50, line 257), composer panel (C55, line 350), layout container (C55, line 293), and composer layout open (+56, line 313). This uses CSS `:has()` at lines 344–352 (browser support ~93% globally as of 2026) and `overflow: visible !important` on 10+ selectors. Any missing class or mismatched ancestor chain breaks the visual stacking silently.
- **Severity**: Critical
- **Fix approach**: Reduce to 3–4 layers: document-level (1000), menu-level (1040), modal-level (1055), and overlay-level (1100). Eliminate the `+30`, `+35`, `+40`, `+55`, `+56` increments by using `isolation: isolate` on `.space-content` and `.layout-content-container` to contain child stacking contexts. Remove CSS `:has()` usage in favor of a single JavaScript-driven z-index boost on the active dropdown's closest `position: relative` ancestor.

### DRP-002 `.space-layout-container > .row:first-child` depends on exact DOM structure
- **Location**: `_dropdown.scss`:148–153
- **Description**: The fix that gives `z-index: 100` to the first `.row` child of `.space-layout-container` works only when the DOM matches exactly: two sibling `.row` elements, the first containing the profile header, the second containing `.space-content` with stream entries. Any layout module that wraps or reorders these rows breaks the fix.
- **Severity**: Major
- **Fix approach**: Instead of relying on child order, use `isolation: isolate` on `.space-content` to contain its stacking context, and use a wrapping container with explicit `position: relative; z-index: 1` for the header area. This decouples the fix from DOM order.

### DRP-003 JS class `.mt2026-dropdown-open` may fail in overflow:visible stream containers
- **Location**: `_dropdown.scss`:193–197 and `notifications.js`:88–95
- **Description**: `.wall-entry.mt2026-dropdown-open` sets `z-index: $z-dropdown + 30` and `position: relative`. But the stream container (`.s2_streamContent` or `.layout-content-container`) has `overflow: visible` which may not propagate the elevated z-index correctly if the parent stacking context has a lower z-index. The `position: relative` on the entry also shifts layout when toggled.
- **Severity**: Major
- **Fix approach**: Use `transform: translateZ(0)` (creates a new stacking context without affecting layout) instead of `position: relative`, and apply the z-index boost to the nearest positioned ancestor via a fallback chain in JS.

### DRP-004 Glassmorphism on dropdown menus causes performance issues
- **Location**: `_dropdown.scss`:5
- **Description**: `.dropdown-menu` uses `@include glass-effect(0.98)` which applies `backdrop-filter: blur()` for a glassmorphism effect. Dropdown menus are opened, hovered over, and scrolled through frequently — each repaint triggers the blur filter, which is expensive on integrated GPUs. Multiple open dropdowns compound the issue.
- **Severity**: Major
- **Fix approach**: Gate glassmorphism behind `@media (prefers-reduced-motion: no-preference)` and disable on mobile (<768px). Consider using a semi-transparent background without blur for frequently-opened menus (notifications, user menu) while reserving blur for rarely-opened ones.

### DRP-005 Mail composer dropdown z-index (1035) below modal backdrop (1040)
- **Location**: `_dropdown.scss`:277 and `variables.scss`:188,197
- **Description**: `.mt2026-mail-composer-dock .dropdown-menu` uses `z-index: $z-mt2026-dropdown` (1035), while Bootstrap's modal backdrop is at 1040. If a dropdown is open inside the mail composer when a modal is active (e.g., file upload modal), the dropdown appears behind the semi-transparent backdrop.
- **Severity**: Critical
- **Fix approach**: Raise the mail composer dropdown z-index to at least `$z-mt2026-modal-backdrop + 1` (1051) so it always renders above modal backdrops. Better yet, close dropdowns programmatically when a modal opens via a global event handler in `modalFocusFix.js`.

### DRP-006 Desktop notification dropdown width overflows on smaller desktops
- **Location**: `_dropdown.scss`:9 (inherited from Bootstrap, possibly overridden elsewhere)
- **Description**: `.dropdown-menu` has `min-width: 200px` (line 9). But the notification dropdown on desktop can reach 420px+ width for content (from Bootstrap's `.notifications-dropdown-menu`). On a 992px viewport with sidebar (~200px) + content padding, the available space for a right-aligned dropdown may be under 420px, causing horizontal overflow.
- **Severity**: Minor
- **Fix approach**: Add `max-width: min(420px, calc(100vw - 40px))` and `right: 0` on `.notifications-dropdown-menu` to prevent overflow past the viewport edge. Ensure long text wraps or truncates.

### DRP-007 Composer dropdown `overflow: visible` chain is brittle
- **Location**: `_dropdown.scss`:218–234
- **Description**: The chain of 12+ selectors forcing `overflow: visible !important` for `.wall-entry-form`, `.post-form`, `.content-form-body`, etc. depends on exact class composition. Any theme or module change to the composer HTML structure (e.g., a new wrapper div) silently breaks the overflow chain, and the `!important` flags make it hard to override.
- **Severity**: Major
- **Fix approach**: Replace the hardcoded selector chain with a single `overflow: visible !important` on the closest stable ancestor of the dropdown toggle, applied via JS when the dropdown opens (and removed on close). This uses the same `.mt2026-composer-dropdown-open` mechanism already in place for z-index.

---

## 4. Bottom Sheets & Drawers

### SHT-001 Mobile sheet z-index (1100) may obscure other UI
- **Location**: `_mobile-bottom-nav.scss`:297
- **Description**: `.mobile-sheet` uses `z-index: $z-mt2026-keyboard-overlay` (1100), which is higher than modals (1055), drawers (1090), and the topbar (3000 block? — actually the topbar is 3000 per `_modal.scss` line 14 comment). The sheet has a semi-transparent backdrop (`.mobile-sheet-backdrop`) but because the backdrop is a child of `.mobile-sheet`, it shares the 1100 z-index. Another UI element at z-index 1090–1100 could be sandwiched between the backdrop and content.
- **Severity**: Minor
- **Fix approach**: Give `.mobile-sheet-backdrop` its own z-index (1100) and `.mobile-sheet-content` a separate one (1101), so content always renders above backdrop. Reduce the overall sheet z-index to `$z-mt2026-drawer + 1` (1091) since there's no keyboard interaction when a sheet is open.

### SHT-002 Mobile sheet max-height 75vh is tight on small screens
- **Location**: `_mobile-bottom-nav.scss`:317
- **Description**: `.mobile-sheet-content` has `max-height: 75vh`. On a 375px iPhone SE, that's ~281px for the content area after accounting for the 60px bottom nav + handle (4px + 12px margin) + header (48px) + potential footer (44px) + padding-bottom (70px + safe-area). That leaves roughly 281 - 174 = ~107px for actual body content — barely enough for more than 4 list items.
- **Severity**: Major
- **Fix approach**: Increase to `max-height: 85vh` on screens <400px, or use a `min()` calculation: `max-height: min(75vh, calc(100vh - 200px))`. Consider removing the fixed `padding-bottom: calc(70px + safe-area)` and instead using `margin-bottom: 70px` on the last item inside `.mobile-sheet-body` so the padding doesn't eat into the available height.

### SHT-003 Sheet backdrop animation not gated by reduced motion
- **Location**: `_mobile-bottom-nav.scss`:307
- **Description**: `.mobile-sheet-backdrop` uses `animation: fadeIn 0.2s ease`. No `@media (prefers-reduced-motion: reduce)` guard exists. Users who have requested reduced motion still get the fade animation.
- **Severity**: Major
- **Fix approach**: Add `@media (prefers-reduced-motion: reduce) { .mobile-sheet-backdrop { animation: none; opacity: 0.5; } }` and a similar guard for the `@keyframes fadeIn` definition.

### SHT-004 Sheet slide-up animation not gated by reduced motion
- **Location**: `_mobile-bottom-nav.scss`:320, 436–439
- **Description**: `.mobile-sheet-content` uses `animation: slideUpSheet 0.3s cubic-bezier(0.4, 0, 0.2, 1)`. The `cubic-bezier` easing and 0.3s duration are not disabled via `prefers-reduced-motion`, causing motion for users who have requested reduced animation.
- **Severity**: Major
- **Fix approach**: Add `@media (prefers-reduced-motion: reduce) { .mobile-sheet-content { animation: none; } }`. Also consider reducing the `slideUpSheet` duration to 0.2s on mobile to match the backdrop's fade timing — currently 0.3s vs 0.2s, creating a slight lag between backdrop and content.

### SHT-005 Mobile sheet content uses `gap: space(3)` — undefined function
- **Location**: `_mobile-bottom-nav.scss`:456
- **Description**: `.mobile-more-item` uses `gap: space(3)`. This looks like a Sass function call (`space(3)`), but no such function is defined in the theme. The intended value is likely `var(--space-3)` (12px) or `12px`. As-is, this will likely fail to compile or produce an incorrect value depending on the SCSS compiler.
- **Severity**: Critical
- **Fix approach**: Replace `gap: space(3)` with `gap: var(--space-3)` or `gap: 12px`.

### SHT-006 Mobile more item padding uses `space(4) space(2)` — same issue
- **Location**: `_mobile-bottom-nav.scss`:457
- **Description**: `.mobile-more-item` uses `padding: space(4) space(2)` — same undefined `space()` function. Likely meant to be `var(--space-4) var(--space-2)` (16px 8px).
- **Severity**: Critical
- **Fix approach**: Replace with valid CSS variable or explicit pixel value.

---

## 5. Admin Config Forms

### CFG-001 Config view uses inline styles extensively
- **Location**: `views/config/index.php`:24, 34, 43, 53, 61, 64, 71, 79, 81, 85, 95, 100, 109, 119, 182, 183, 204, 220, 228, 237, 243, 251
- **Description**: The config view has ~20+ `style="..."` attributes across 282 lines. These include one-off values like `border-radius:50%`, `font-size:13px`, `margin-top:4px`, `max-width:320px` that don't use the theme's CSS variable system. This makes future restyling difficult.
- **Severity**: Major
- **Fix approach**: Move inline styles to a dedicated `.mt2026-config` SCSS partial. Use CSS variables for sizing and spacing. At minimum, replace utility styles (font sizes, margins) with theme variables (`var(--space-*)`, `var(--font-size-*)`).

### CFG-002 Multiple form submissions in one controller action
- **Location**: `controllers/ConfigController.php`:36–113
- **Description**: A single `actionIndex()` handles palette switching, mobile nav settings, mail settings, and People nav label — all via POST detection. The action checks `mobileNavSettingsSubmit`, then `peopleNavLabel`, then `mailSettingsSubmit`, then `palette` sequentially. This makes the action method long (~78 lines for POST handling) and harder to test.
- **Severity**: Minor
- **Fix approach**: Split into separate actions: `actionPalette()`, `actionMobileNav()`, `actionMailSettings()`, `actionPeopleLabel()`. Each redirects back to `actionIndex()` on success. This also makes form action URLs more explicit.

### CFG-003 Palette grid uses hardcoded active indicator color
- **Location**: `views/config/index.php`:61
- **Description**: `$isActive ? 'border:2px solid #1e6ad6;' : ''` hardcodes `#1e6ad6` (the Ocean Blue primary) as the active border. When a different palette is active (e.g., Royal Purple with primary `#7c3aed`), the active indicator still shows blue instead of the palette's primary color.
- **Severity**: Minor
- **Fix approach**: Use `var(--color-primary)` instead of the hardcoded hex, or pass the active palette's primary color as a template variable and use it inline.

---

## 6. Modal/Dropdown JavaScript

### JS-001 `modalFocusFix.js` is minimal — no focus trap, no Escape handling
- **Location**: `resources/js/modalFocusFix.js`:14–26
- **Description**: The module only blurs the active element on `hide.bs.modal`. It does not implement focus trapping (keeping Tab within the modal while open), return focus to the trigger element, or handle the Escape key beyond Bootstrap's built-in handler. A proper focus trap is needed for WCAG 2.1 AA compliance.
- **Severity**: Critical
- **Fix approach**: Add focus trapping: on `shown.bs.modal`, find all focusable elements within the modal, on Tab cycle between first and last. Store the trigger element on `show.bs.modal` and return focus to it on `hidden.bs.modal`. Integrate with `peopleFocusGuard.js` patterns already in the codebase.

### JS-002 `peopleFocusGuard.js` autofocus suppression uses time-based approach
- **Location**: `resources/js/peopleFocusGuard.js`:17–42
- **Description**: The capture guard suppresses autofocus by installing a `focus` event capture listener that checks `Date.now() > suppressUntil`. The timing window (1200ms) is a heuristic — on slow devices or network conditions, the autofocus may fire after the guard expires, or the guard may fire too early before the page stabilizes.
- **Severity**: Minor
- **Fix approach**: Instead of time-based suppression, use a `MutationObserver` to detect when the search form is fully rendered, then explicitly call `.blur()` on the search input once. Remove the capture event listener entirely after the mutation is handled.

### JS-003 `dropdown.scss` JS class toggling (`.mt2026-dropdown-open`) services notifications only
- **Location**: `notifications.js`:88, 95 and `_dropdown.scss`:193–197
- **Description**: The `.mt2026-dropdown-open` class is toggled only in `notifications.js` for notification dropdowns. But the SCSS at `_dropdown.scss:193` applies the `z-index: $z-dropdown + 30` boost to `.wall-entry.mt2026-dropdown-open` generically — implying it should be used for any wall-entry dropdown. No other JS module sets this class, so the stacking boost is effectively unused for comment, composer, and three-dot menus.
- **Severity**: Major
- **Fix approach**: Add a universal dropdown event listener (in a new `resources/js/dropdownManager.js`) that toggles `.mt2026-dropdown-open` on the nearest `.wall-entry` / `.stream-entry` ancestor whenever any dropdown opens or closes within it. This makes the SCSS effective.

---

## Priority Fix Summary

| ID | Issue | Severity | Effort |
|----|-------|----------|--------|
| DRP-005 | Mail composer dropdown behind modal backdrop | **Critical** | Small |
| DRP-001 | Stacking context system over-engineered (18 layers) | **Critical** | Large |
| SHT-005 | Undefined `space()` function in `gap` | **Critical** | Trivial |
| SHT-006 | Undefined `space()` function in `padding` | **Critical** | Trivial |
| JS-001 | No focus trap in modal (WCAG fail) | **Critical** | Medium |
| ADM-001 | Admin SCSS single-file overload | Major | Medium |
| ADM-002 | Admin panel `padding: 0` breaks card styling | Major | Medium |
| ADM-003 | GridView min-width no mobile alternative | Major | Medium |
| MOD-003 | Modal backdrop blur no performance gate | Major | Small |
| MOD-004 | `.modal-content overflow: hidden` clips dropdowns | Major | Small |
| MOD-007 | `.modal-sm` unattainable on 375px phones | Major | Small |
| DRP-002 | `.space-layout-container` row selector fragile | Major | Medium |
| DRP-003 | JS `.mt2026-dropdown-open` may fail in stream | Major | Medium |
| DRP-004 | Glassmorphism on dropdowns expensive | Major | Medium |
| DRP-007 | Composer overflow chain brittle | Major | Medium |
| SHT-002 | Mobile sheet 75vh too tight on small screens | Major | Small |
| SHT-003 | Sheet backdrop animation not reduced-motion gated | Major | Small |
| SHT-004 | Sheet slide-up animation not reduced-motion gated | Major | Small |
| CFG-001 | Config view uses 20+ inline styles | Major | Medium |
| JS-003 | `.mt2026-dropdown-open` class toggle services 1 module only | Major | Medium |
| MOD-002 | Modal z-index variable unused by modal CSS | Minor | Trivial |
| MOD-006 | `.modal-lg` no responsive handling near 992px | Minor | Small |
| DRP-006 | Notification dropdown width overflow on small desktop | Minor | Small |
| ADM-004 | Admin layout files duplication | Minor | Medium |
| ADM-005 | `.list-group-vertical-lg` `!important` fragile | Minor | Trivial |
| ADM-006 | Mobile sidebar horizontal scroll item width | Minor | Small |
| CFG-002 | Single controller action for 4 form types | Minor | Medium |
| CFG-003 | Hardcoded active palette border color | Minor | Trivial |
| JS-002 | Time-based autofocus suppression heuristic | Minor | Small |
| MOD-001 | Modal margin-top 8px gutter inconsistent | Cosmetic | Trivial |
| MOD-005 | Mobile modal safe-area padding consistency | Cosmetic | Small |
| ADM-007 | Palette button border fallback color mismatch | Cosmetic | Trivial |
