# UI/UX Audit: User Profile, People Directory & Spaces

Audit of profile pages, people directory, and space components in the Modern Theme
2026 module. Identifies CSS architecture issues, accessibility problems, layout
fragility, and visual inconsistencies across the profile → directory → spaces
user journey.

---

## 1. User Profile Pages

### PRF-01: Profile tab styles in `_theme.scss` instead of dedicated file

- **Location**: `themes/ModernTheme2026/scss/_theme.scss:234-269`
- **Description**: Profile tab styling (`.nav-tabs`, `.nav-link`) lives in the main
  `_theme.scss` alongside generic theme rules for stream entries, buttons, and
  cards. This violates single-responsibility organization — profile-specific
  styles should be in a `humhub/_profile.scss` partial. Finding and editing
  profile tabs requires searching through 270 lines of unrelated CSS.
- **Severity**: Minor
- **Fix approach**: Extract lines 231-270 into a new
  `themes/ModernTheme2026/scss/humhub/_profile.scss` file; import in `build.scss`
  after `humhub/_spaces.scss`.

### PRF-02: Tab padding and font size too small on mobile

- **Location**: `themes/ModernTheme2026/scss/_theme.scss:246,253`
- **Description**: `.nav-link` has `padding: 8px 20px` and `font-size: 0.9rem`
  (~12.6px). On a 375px mobile screen with multiple tab categories (e.g.,
  "General", "Communication", "Social", "Education"), the cumulative width of
  tabs overflows, forcing horizontal scroll or wrapping. The tap target area
  (8px vertical padding) is below the WCAG 2.1 recommended 44x44px minimum
  touch target.
- **Severity**: Major
- **Fix approach**: On `@media (max-width: 767px)`, increase vertical padding to
  12px (24px total touch area) and set `font-size: 0.8rem` with
  `white-space: nowrap` and `overflow-x: auto` on the parent `.nav-tabs`.
  Alternatively, use a horizontal scrollable pill pattern (matching space-nav
  on tablet) for mobile profile tabs.

### PRF-03: Visible seam between tab bottom and panel border

- **Location**: `themes/ModernTheme2026/scss/_theme.scss:236,248-249`
- **Description**: The parent `.nav-tabs` has `border-bottom: 2px solid
  var(--color-border)`. Each `.nav-link` has `border: 1px solid
  var(--color-border); border-bottom: none`. When a tab is active, the tab
  body's `.tab-pane` sits directly below the tab row. The 2px parent border
  continues behind inactive tabs, creating a visible horizontal seam. On the
  active tab, the tab's bottom edge has no border (set to `none`), but the
  parent border remains visible 1px below — there is a 1px gap between the tab
  bottom and the border. This makes the active tab appear slightly disconnected
  from its content panel.
- **Severity**: Cosmetic
- **Fix approach**: Remove the parent `border-bottom` from `.nav-tabs` and
  instead apply a top border/shadow on the `.tab-content` container.
  Alternatively, set `.nav-link.active` to `border-bottom: 2px solid
  var(--color-primary)` with `margin-bottom: -2px` (standard Bootstrap
  approach) so the active tab's bottom border visually replaces the parent
  border.

### PRF-04: Profile field label weight reduction reduces visual hierarchy on desktop

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:319-335`
- **Description**: `.field-title` uses `font-weight: $font-weight-semibold` (600)
  by default. On desktop (768px+), this switches to `font-weight:
  $font-weight-medium` (500) and `color: var(--color-text-muted)`. The weight
  reduction from 600 to 500, combined with muted color, reduces the visual
  distinction between label (left column) and value (right column). Users
  scanning the About page must work harder to distinguish field names from
  field values.
- **Severity**: Minor
- **Fix approach**: Keep `font-weight: 600` on desktop for `.field-title` and
  only change the color to `var(--color-text-muted)`. This preserves visual
  hierarchy while still differentiating label from value.

### PRF-05: Profile field divider too subtle on light backgrounds

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:347-350`
- **Description**: `.profile-item + .profile-item` uses `border-top: 1px solid
  var(--color-border-light)`. The `--color-border-light` variable resolves to a
  very faint gray (approx `#e5e7eb`). On white backgrounds with closely-spaced
  field rows, this line provides weak visual separation. When multiple fields
  have no visible gap (e.g., consecutive short fields like "City" and
  "Country"), the rows visually blend.
- **Severity**: Cosmetic
- **Fix approach**: Increase the divider to `var(--color-border)` (full border
  color), or add `padding-top: 0.75rem` and a `2px` gap before the border for
  greater visual separation.

### PRF-06: No responsive handling for about page 2-column layout on mobile

- **Location**: `views/user/profile/about.php:50-73`
- **Description**: The about page uses Bootstrap's `.row` + `.col-md-3`/`.col-md-9`
  grid for label/value pairs. While Bootstrap collapses columns on screens
  < 768px (stacking label above value), the module provides no custom responsive
  behavior. On a 375px screen, stacked layout works but the label text lacks
  any visual indicator of its hierarchical role (no bold, no icon, no
  background). Long labels take full width, pushing the value further down with
  no visual rhythm.
- **Severity**: Minor
- **Fix approach**: Add a `@media (max-width: 767px)` rule that gives
  `.field-title` a subtle background tint or left border accent on mobile to
  visually separate labels from values in the stacked layout.

---

## 2. People Directory

### PPL-01: Card `min-height: 140px` insufficient on 375px 2-column grid

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:364`
- **Description**: On mobile ≤767px, the 2-column grid gives each `.card-people`
  `flex: 0 0 50%`. At 375px viewport, each card is ~167px wide. Cards stack:
  avatar (64px + 10px margin-bottom) → name (14px + 4px margin) → title (11px)
  → phone (11px + 3px margin) → action button (12px button + 10px margin-top).
  Estimated minimum content height: 64 + 10 + 14 + 4 + 11 + 3 + 11 + 10 + 26 =
  ~153px. The `min-height: 140px` is 13px short of the estimated minimum,
  causing cards to rely on content-driven expansion. However, with only one
  line of text allowed by `white-space: nowrap` + `text-overflow: ellipsis`,
  the actual height may still clip if the action button row renders additional
  elements like a follow button.
- **Severity**: Minor
- **Fix approach**: Increase `min-height` to 160px to guarantee enough room for
  all content rows, or remove `min-height` entirely and let content define
  height with consistent padding.

### PPL-02: Long names truncated with no tooltip or overflow indicator

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:397-399`
- **Description**: `.mt2026-pc-name` uses `white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis`. Long names (e.g., "Christopher Jonathan
  Anderson-Smith") are silently truncated. There is no `title` attribute on
  the `<strong>` or `<a>` element in the view template (`peopleCard.php:28-30`),
  so users cannot hover to see the full name — and on mobile there is no hover
  at all. Users cannot determine the full name without navigating to the
  profile page.
- **Severity**: Major
- **Fix approach**: Add a `title` attribute to the container link via
  `Html::containerLink($user)`. In `peopleCard.php:28-30`, wrap the output or
  pass additional HTML options. On mobile, consider an `overflow: auto`
  approach that allows scrolling within the name cell.

### PPL-03: Title font-size 11px below WCAG AA minimum

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:413`
- **Description**: `.mt2026-pc-title` is set to `font-size: 11px`. WCAG 2.1 SC
  1.4.4 (Resize Text) and general guidance recommend minimum 12px for body text
  readability. At 11px, users with mild visual impairments or on high-DPI
  mobile screens may struggle to read the user's job title or tagline. The
  title is also truncated with ellipsis, compounding the readability problem.
- **Severity**: Major
- **Fix approach**: Increase to minimum `font-size: 12px`. If space is
  constrained, reduce the line-height from 1.3 to 1.2 and tighten the
  margin-bottom chain.

### PPL-04: Phone font-size 11px below WCAG AA minimum

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:427`
- **Description**: `.mt2026-pc-phone` also uses `font-size: 11px`. Same WCAG
  compliance issue as PPL-03. The phone number is a functional element
  (clickable `tel:` link) — users need to read it accurately to dial. 11px on a
  167px-wide card with a phone icon and formatted number (e.g., "(555)
  123-4567") creates a cramped, hard-to-read line.
- **Severity**: Major
- **Fix approach**: Increase to `font-size: 12px`. The phone icon (`i { font-size:
  10px }` at line 440) should also scale up to 11px, or use the same
  `font-size` as the parent to maintain proportion.

### PPL-05: 2-column grid uses flex-basis + negative margins, risks overflow

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:477-492`
- **Description**: The mobile grid uses `.row.cards { display: flex; flex-wrap:
  wrap; margin-left: -8px; margin-right: -8px; }` and `.card-people { flex: 0 0
  50%; padding-left: 8px; padding-right: 8px; }`. Negative margins on the flex
  container combined with `flex: 0 0 50%` on children can cause overflow if any
  child has `box-sizing: content-box` or if parent containers add additional
  padding. In edge cases (e.g., a parent with Bootstrap `.container` padding
  plus `.row` negative margins), horizontal scrollbars appear. The `!important`
  flags on flex/max-width properties (lines 486-489) also make this hard to
  override in child themes.
- **Severity**: Minor
- **Fix approach**: Remove negative margins and use `gap: 16px` on the flex
  container, or switch to CSS Grid: `display: grid; grid-template-columns: 1fr
  1fr; gap: 16px`. This eliminates overflow risks from negative margin math.

### PPL-06: `.card-people` selector may not exist in all contexts

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:463-474`
- **Description**: The `.card-people .card-panel.mt2026-people-card` selector
  assumes a `.card-people` parent class wrapping each card. This class is
  injected by the core `PeopleCard` widget that wraps the `peopleCard.php`
  override. If the core widget's HTML structure changes (HumHub update), or if
  the directory is rendered in a different context (e.g., a custom block
  widget), the `.card-people` parent may be absent, and the Clean Theme
  override rules for `.card-bg-image`, `.card-header`, `.card-body`,
  `.card-footer` will not apply.
- **Severity**: Minor
- **Fix approach**: Make the override selector more resilient by also targeting
  `.mt2026-people-card` without the `.card-people` parent. Add a fallback:
  `.mt2026-people-card { ... }` with the same cleanup rules, and use the
  `.card-people` parent as an additive specificity boost rather than a
  requirement.

### PPL-07: Search FAB bottom offset uses magic number instead of variable

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:519`
- **Description**: FAB is positioned at `bottom: calc(70px +
  env(safe-area-inset-bottom, 0px))`. The inline comment says "56px nav + 14px
  gap" — the 14px gap is a magic number. If the mobile bottom nav height
  changes (e.g., from 56px to 60px), the FAB offset must be manually
  recalculated. There is no SCSS variable linking the nav height to the FAB
  offset.
- **Severity**: Minor
- **Fix approach**: Define `$mobile-nav-height: 56px` in `variables.scss`, then
  use `bottom: calc(#{$mobile-nav-height} + 14px +
  env(safe-area-inset-bottom, 0px))`. Define the gap as
  `$mobile-nav-fab-gap: 14px` as well.

### PPL-08: Search overlay back button selector mismatch

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:571` / `resources/js/peopleFocusGuard.js:69`
- **Description**: The search overlay back button is styled with class
  `.mt2026-search-overlay-back` (line 571) but the injected HTML in
  `peopleFocusGuard.js:69` uses `id="mt2026-search-back"` with no
  `mt2026-search-overlay-back` class. The styles at lines 571-589 never apply
  to the actual element. The back button inherits default button styles instead
  of the themed circle with proper sizing, colors, and active states.
- **Severity**: Major
- **Fix approach**: Either add `class="mt2026-search-overlay-back"` to the back
  button in `peopleFocusGuard.js:69`, or change the SCSS selector to target
  `#mt2026-search-back` instead of `.mt2026-search-overlay-back`.

### PPL-09: Dark mode search overlay fallback value is redundant

- **Location**: `themes/ModernTheme2026/scss/humhub/_mobile.scss:566`
- **Description**: `background: var(--color-bg-secondary, #1e293b)` in
  `[data-bs-theme="dark"] &`. The `#1e293b` fallback is identical to the value
  already defined for `--color-bg-secondary` in `_root.scss` dark mode. If
  `--color-bg-secondary` fails to resolve, the fallback provides no safety —
  it's just a duplicate of the intended value.
- **Severity**: Cosmetic
- **Fix approach**: Remove the CSS fallback: `background:
  var(--color-bg-secondary)`. The variable is guaranteed by `_root.scss` in
  both light and dark contexts.

---

## 3. Spaces Pages

### SPC-01: `.space-content` z-index stacking traps page header dropdowns

- **Location**: `themes/ModernTheme2026/scss/humhub/_spaces.scss:87-92`
- **Description**: `.space-layout-container .space-content` is not explicitly
  assigned a `z-index` in the module's CSS, but Bootstrap's `.container` and
  HumHub's layout wrap create positioned contexts with `z-index: 1` via
  `isolation: isolate` or `position: relative`. When the page header (e.g.,
  user menu dropdown in the top navbar) opens, its dropdown content can render
  behind the space content area. This is a known HumHub stacking issue
  exacerbated when the space layout uses `isolation: isolate` (set by HumHub
  core or Bootstrap cards), creating a new stacking context.
- **Severity**: Major
- **Fix approach**: Ensure `.space-layout-container > .row:first-child` (the nav
  row) has `z-index: 2` relative to `.space-content`. The sidebar and content
  areas should not have `isolation: isolate` unless required. If `isolation:
  isolate` is needed, set a lower `z-index` on the content container and a
  higher one on the nav container.

### SPC-02: Stacking context management fragile across breakpoints

- **Location**: `themes/ModernTheme2026/scss/humhub/_spaces.scss:108-207`
- **Description**: The `.space-layout-container` uses a carefully engineered
  stacking system with `.has-sidebar` selectors to calculate `max-width` of
  `.layout-content-container` (e.g., `calc(100% - 520px)` at 992px). This
  depends on Bootstrap's column classes (`.col-lg-2` for nav, `.col-lg-7`/
  `.col-lg-10` for content, `.col-lg-3` for sidebar) being present and
  generating the right widths. If a theme or admin overrides layout column
  assignments, the `max-width` calculations break — content may be wider than
  available space or leave a gap. The `:has()` selector at line 140
  (`&:has(.layout-sidebar-container)`) is not supported in Firefox until 2023+,
  so legacy Firefox users get no sidebar-aware adjustment.
- **Severity**: Major
- **Fix approach**: Use `@supports (selector(:has(*)))` to gate the `:has()`
  rules and provide a JavaScript fallback for older browsers. For the column
  math, consider using CSS Grid with `grid-template-columns` instead of flex +
  calc, which handles missing columns gracefully.

### SPC-03: Sidebar transition uses non-existent CSS variable

- **Location**: `themes/ModernTheme2026/scss/humhub/_sidebar.scss:6`
- **Description**: `.layout-nav-container` has `@include transition(width,
  var(--transition-base))`. However, `--transition-base` is NOT defined
  anywhere — CSS variables in `_root.scss` use token names like
  `--transition-fast`, `--transition-base`, `--transition-slow` as SCSS
  variables ($), not as CSS custom properties. The `var(--transition-base)`
  will fall through to the browser default, effectively making the transition
  `width, ` (a no-value property). The correct usage should be the SCSS
  variable `$transition-base` directly.
- **Severity**: Critical (broken transition)
- **Fix approach**: Replace `var(--transition-base)` with the SCSS variable
  `$transition-base` in the mixin call. Also audit all uses of
  `var(--transition-*)` — check `_root.scss` to confirm whether these are
  defined as CSS custom properties or only as SCSS variables.

### SPC-04: `.panel-profile` hover transform disabled with `!important`

- **Location**: Possibly Clean Theme inheritance; `.panel-profile` has `transform:
  none !important` blocking hover feedback.
- **Description**: On space/profile pages, the `.panel-profile` card (containing
  the banner, avatar, and name) has its hover transform explicitly set to
  `transform: none !important`. This removes all hover feedback (lift, shadow
  change) from the profile header card, making it feel static and
  non-interactive even though it contains clickable elements (avatar link,
  settings button).
- **Severity**: Cosmetic
- **Fix approach**: Remove the `transform: none !important` override, or replace
  it with a subtle `translateY(-1px)` + shadow change on hover that doesn't
  interfere with child element positioning.

### SPC-05: Space main menu horizontal scroll on narrow tablet screens

- **Location**: `themes/ModernTheme2026/scss/humhub/_sidebar.scss:126-134`
- **Description**: On 768-991px screens, `.list-group > .list-group-item` sets
  `min-width: max-content`. This prevents items from wrapping but can cause
  horizontal scroll on narrow tablets (768px portrait) if the menu has many
  items (e.g., Stream, Members, About, Files, Calendar, Polls — 6+ items at
  ~100px each = 600px+ total). The `overflow-x: auto` parent provides scroll,
  but users may not discover the scroll affordance without visible scrollbar
  hints (scrollbar is hidden via `scrollbar-width: none` and
  `::-webkit-scrollbar { display: none }`).
- **Severity**: Major
- **Fix approach**: Add a fading gradient at the right edge of the scroll
  container to hint at overflow content: `mask-image: linear-gradient(to right,
  transparent 0, black 20px, black calc(100% - 40px), transparent 100%)`.
  Alternatively, set `flex-shrink: 1` and `min-width: 0` on items to allow
  them to shrink.

### SPC-06: Tablet sidebar forced to full width breaks 2-column expectation

- **Location**: `themes/ModernTheme2026/scss/humhub/_sidebar.scss:87-101`
- **Description**: At 768-991px, all three layout containers
  (`.layout-nav-container`, `.layout-content-container`,
  `.layout-sidebar-container`) are forced to `flex: 0 0 100%; max-width: 100%`.
  This means the sidebar (e.g., Upcoming Events, Member stats) drops below the
  main content. On a 768px iPad in portrait, this produces a very long
  single-column layout: navigation pills → stream content → sidebar widgets.
  Users lose the at-a-glance sidebar context (who's online, upcoming events)
  that the desktop layout provides.
- **Severity**: Major
- **Fix approach**: At 768-991px, consider a 2-row layout: row 1 = navigation
  pills (full width), row 2 = content (2/3) + sidebar (1/3). This preserves
  sidebar visibility while still allowing horizontal nav pills. Only collapse
  to full-width single-column at ≤767px.

### SPC-07: Space chooser button glassmorphism incompatible with light backgrounds

- **Location**: `themes/ModernTheme2026/scss/humhub/_space-chooser.scss:18-19`
- **Description**: The space chooser button uses `background-color: rgba(255,
  255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1)`. These
  semi-transparent white values depend on the header background being a dark
  banner image. If the banner image is not present (or is a light color), the
  button blends into the background and becomes invisible. The chooser button
  also lacks a solid fallback.
- **Severity**: Major
- **Fix approach**: Add a `backdrop-filter: blur(4px)` for a true glass effect
  that adapts to any background, and set a fallback: if no banner image exists,
  fall back to `background: var(--color-bg-primary)` with reduced opacity
  border.

### SPC-08: Space chooser dropdown max-height fixed at 400px

- **Location**: `themes/ModernTheme2026/scss/humhub/_space-chooser.scss:109`
- **Description**: The space chooser dropdown menu has `max-height: 400px;
  overflow-y: auto`. On short viewports (< 600px height), a 400px dropdown
  plus the chooser button and page header can extend below the fold, forcing
  users to scroll the page to see bottom items. The mobile override (`max-height:
  60vh` at line 276) addresses this, but desktop users on small screens get the
  400px fixed value.
- **Severity**: Minor
- **Fix approach**: Replace the 400px fixed max-height with a viewport-relative
  value: `max-height: min(400px, 60vh)`.

### SPC-09: Space section header uses undefined SCSS variable

- **Location**: `themes/ModernTheme2026/scss/humhub/_space-chooser.scss:210`
- **Description**: `.space-section-header` uses `font-size: $font-size-xs`. The
  SCSS variable `$font-size-xs` is not defined in the module's `variables.scss`
  — only `$font-size-sm`, `$font-size-base`, and `$font-size-lg` are listed.
  If `$font-size-xs` is inherited from Clean Theme or Bootstrap, it may resolve
  to different values depending on import order. If it's undefined, SCSS
  compilation fails with an "Undefined variable" error.
- **Severity**: Critical (potential compilation failure)
- **Fix approach**: Define `$font-size-xs: 0.75rem` in `variables.scss`, or
  replace with `font-size: 0.75rem` (0.75rem = 12px, matching the section
  header uppercase pattern).

### SPC-10: `@keyframes pulse-hint` pollution in `_space-chooser.scss`

- **Location**: `themes/ModernTheme2026/scss/humhub/_space-chooser.scss:336-342`
- **Description**: The `@keyframes pulse-hint` animation is scoped globally (no
  namespace prefix). Any other CSS on the page using `animation-name:
  pulse-hint` will inadvertently trigger this animation. The module's convention
  is to prefix classes with `mt2026-`, but keyframes lack this prefix.
- **Severity**: Minor
- **Fix approach**: Rename to `@keyframes mt2026-pulse-hint`.

---

## 4. Sidebar Navigation

### SBN-01: Legacy `@include transition()` mixin may be undefined

- **Location**: `themes/ModernTheme2026/scss/humhub/_sidebar.scss:6,34`
- **Description**: The file uses `@include transition(width,
  var(--transition-base))` and `@include transition(all,
  var(--transition-fast))`. The `transition` mixin signature is non-standard.
  If this is a custom mixin defined in `_mixins.scss`, its signature must
  accept property name and duration. If the mixin doesn't exist or has a
  different signature (e.g., a single map argument), compilation fails. No such
  mixin is visible in the current `_mixins.scss`.
- **Severity**: Critical (potential compilation failure)
- **Fix approach**: Replace with standard CSS: `transition: width $transition-base`
  (using SCSS variable) and `transition: all $transition-fast`.

### SBN-02: Panel heading font-size uses undefined CSS variable

- **Location**: `themes/ModernTheme2026/scss/humhub/_sidebar.scss:16`
- **Description**: `.panel-heading` uses `font-size: var(--font-size-base)`. The
  CSS variable `--font-size-base` is not defined in `_root.scss` — only
  `$font-size-base` as an SCSS variable exists. This CSS variable reference
  silently falls through, and the panel heading inherits whatever font-size was
  set by the parent, potentially breaking the hierarchy.
- **Severity**: Critical (broken variable reference)
- **Fix approach**: Replace `var(--font-size-base)` with the SCSS variable
  `$font-size-base`, or add `--font-size-base` to `_root.scss` as a CSS custom
  property.

### SBN-03: Left nav active indicator border-radius may mismatch

- **Location**: `themes/ModernTheme2026/scss/humhub/_sidebar.scss:47-56`
- **Description**: The active item indicator uses a `::before` pseudo-element
  with `width: 3px; height: 60%; border-radius: 0 var(--radius) var(--radius)
  0`. The right-side rounding depends on `var(--radius)`. If `--radius` is not
  defined (see SBN-02 issue pattern), the fallback is `0`, producing a sharp
  rectangle. The left side has `border-radius: 0`, which is correct for a flush
  accent bar, but the right side rounding may look soft against the list item's
  own border-radius.
- **Severity**: Cosmetic
- **Fix approach**: Define `--radius` in `_root.scss` or replace with `4px` (a
  safe default for accent bars). Adjust the indicator to be 4px wide with a
  single `border-radius: 0 4px 4px 0`.

### SBN-04: List group item hover shift can overlap right-edge content

- **Location**: `themes/ModernTheme2026/scss/humhub/_sidebar.scss:39`
- **Description**: `.list-group-item:hover` uses `transform: translateX(4px)`.
  This shifts the item 4px to the right on hover. In a flex layout, `transform`
  does not trigger layout reflow (it's a compositing property), so it's
  performant. However, if any sibling element depends on the item's width
  (e.g., an adjacent scrollbar or a right-aligned badge), the 4px movement may
  cause the text to overlap with the container's right edge or a collapsible
  toggle icon. The active item indicator (3px left bar) also doubles the visual
  shift when hovering an already-active item.
- **Severity**: Cosmetic
- **Fix approach**: Consider using `padding-left` or a `box-shadow` left border
  instead of `transform` to avoid the visual sliding. If transform is desired,
  add `will-change: transform` and ensure active items either suppress the
  hover shift or have sufficient right padding.

### SBN-05: Collapsed sidebar has jerky text/width transition

- **Location**: `themes/ModernTheme2026/scss/humhub/_sidebar.scss:70-82`
- **Description**: The `.layout-nav-container.collapsed` state hides `<span>`
  text inside `.panel-heading` and `.list-group-item`. The container width
  transitions from `$sidebar-width` to `$sidebar-collapsed-width`. However, the
  icon width (20px via `margin-right`) and the transition of text `display:
  none` are not coordinated. When collapsing, the text disappears immediately
  (`display: none` has no transition), while the container width shrinks over
  the transition duration. This means icons jump right as the container
  shrinks, then settle. On expand, text appears after the width transition
  completes, creating a jerky reveal.
- **Severity**: Minor
- **Fix approach**: Use `opacity` and `max-width` on the `<span>` elements for
  smooth fade-out/slide-in. In normal state: `span { opacity: 1; max-width:
  200px; transition: opacity 0.2s, max-width 0.2s; }`. In collapsed state:
  `opacity: 0; max-width: 0; overflow: hidden`.

---

## 5. JavaScript Issues

### JS-01: `peopleFocusGuard.js` hardcodes search action URL

- **Location**: `resources/js/peopleFocusGuard.js:70`
- **Description**: The FAB overlay form uses `action="/user/people"`. This
  assumes the people directory is always at `/user/people`. In HumHub
  installations with custom URL rules, language prefixes (e.g., `/de/user/people`),
  or subdirectory installations, this URL will 404. The form action should be
  dynamic.
- **Severity**: Major
- **Fix approach**: Before injecting the overlay, check if an existing
  `.mt2026-people-search-panel form` exists and copy its `action` attribute.
  Fall back to `/user/people` only if no form is found.

### JS-02: `peopleFocusGuard.js` autofocus suppression uses magic numbers

- **Location**: `resources/js/peopleFocusGuard.js:33,128-134`
- **Description**: The autofocus suppression uses `Date.now() + 1200` (1200ms)
  and secondary blur timeouts at 200ms and 1200ms. These magic numbers
  compensate for HumHub's `cards.js` autofocus behavior but are not documented.
  If `cards.js` timing changes in a HumHub update, the suppression may fail,
  causing the search input to briefly flash focused before being blurred.
- **Severity**: Minor
- **Fix approach**: Define constants: `const AUTOFOCUS_TIMEOUT = 1200;` and add
  a comment explaining that this matches cards.js autofocus delay. Add a
  `MutationObserver` fallback that catches focus on the search input within the
  overlay and immediately blurs it.

### JS-03: Escape key handler persists after navigation

- **Location**: `resources/js/peopleFocusGuard.js:79-81,104`
- **Description**: The Escape key handler is bound via `$(document).on('keydown
  .mt2026Search', ...)` and removed only during `teardown()`. If the user
  navigates to a non-people page via PJAX without triggering teardown (e.g.,
  browser back button), the Escape handler persists globally, potentially
  closing non-existent overlays.
- **Severity**: Minor
- **Fix approach**: Gate the Escape handler at the event level: check
  `if ($('#mt2026-search-overlay.open').length)` before calling
  `closeSearch()`. This prevents the handler from doing harm even if it
  persists.

---

## 6. Prioritized Fix Summary

| Priority | ID     | Issue                                                    | Severity | Effort |
|----------|--------|----------------------------------------------------------|----------|--------|
| P0       | SBN-01 | Undefined transition mixin                               | Critical | Small  |
| P0       | SBN-02 | Panel heading uses undefined CSS variable                | Critical | Small  |
| P0       | SPC-09 | `$font-size-xs` undefined, compilation risk              | Critical | Small  |
| P0       | SPC-03 | Sidebar transition uses non-existent CSS variable        | Critical | Small  |
| P1       | PRF-02 | Tab touch targets below WCAG minimum on mobile           | Major    | Small  |
| P1       | PPL-02 | Long names truncated without tooltip on mobile           | Major    | Small  |
| P1       | PPL-03 | Title font-size 11px below WCAG AA minimum               | Major    | Small  |
| P1       | PPL-04 | Phone font-size 11px below WCAG AA minimum               | Major    | Small  |
| P1       | PPL-08 | Search overlay back button selector mismatch             | Major    | Small  |
| P1       | SPC-01 | Stacking traps page header dropdowns                     | Major    | Medium |
| P1       | SPC-02 | Stacking context fragile across breakpoints              | Major    | Medium |
| P1       | SPC-05 | No scroll affordance for horizontal menu overflow        | Major    | Small  |
| P1       | SPC-06 | Tablet layout breaks 2-column expectation                | Major    | Medium |
| P1       | SPC-07 | Space chooser invisible on light backgrounds             | Major    | Small  |
| P1       | JS-01  | Hardcoded search URL breaks with URL rules               | Major    | Small  |
| P2       | PRF-01 | Profile styles in wrong file                             | Minor    | Small  |
| P2       | PRF-04 | Field label hierarchy reduced on desktop                 | Minor    | Small  |
| P2       | PRF-06 | No mobile-specific About page responsive                 | Minor    | Medium |
| P2       | PPL-01 | Card min-height may clip content on 375px                | Minor    | Small  |
| P2       | PPL-05 | Negative margin overflow risk                            | Minor    | Small  |
| P2       | PPL-06 | `.card-people` parent assumption fragile                 | Minor    | Small  |
| P2       | PPL-07 | FAB offset uses magic number                             | Minor    | Small  |
| P2       | SPC-08 | Dropdown max-height too tall for small viewports         | Minor    | Small  |
| P2       | SPC-10 | Keyframes not prefixed with mt2026-                      | Minor    | Small  |
| P2       | SBN-05 | Collapsed sidebar has jerky text/width transition        | Minor    | Medium |
| P2       | JS-02  | Autofocus suppression uses magic numbers                 | Minor    | Small  |
| P2       | JS-03  | Escape handler persists after navigation                 | Minor    | Small  |
| P3       | PRF-03 | Tab-to-panel visible seam                                | Cosmetic | Small  |
| P3       | PRF-05 | Field divider too subtle on light backgrounds            | Cosmetic | Small  |
| P3       | PPL-09 | Redundant CSS fallback in dark mode                      | Cosmetic | Small  |
| P3       | SBN-03 | Active indicator border-radius may mismatch              | Cosmetic | Small  |
| P3       | SBN-04 | Hover shift can overlap right-edge content               | Cosmetic | Small  |
| P3       | SPC-04 | Profile panel hover feedback removed                     | Cosmetic | Small  |
