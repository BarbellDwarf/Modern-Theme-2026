# UI/UX Audit: Activity Stream & Content Components

**Module**: Modern Theme 2026  
**Date**: 2026-07-28  
**Scope**: Stream feed, comments, emoji reactions, post creation form

---

## 1. Activity Stream / Feed

### S01 — Double-padded content via `.wall-entry-body` + `.panel-body`

- **Location**: `_stream.scss:156-163`
- **Description**: `.wall-entry .wall-entry-body` and `.wall-entry .wall-entry-content` set `padding-left: var(--space-4) !important; padding-right: var(--space-4) !important`. The parent `.panel-body` already applies internal padding via Bootstrap / Clean Theme. This produces double-padding: content is indented ~32px from the card edge instead of the intended 16px.
- **Severity**: Major
- **Fix approach**: Remove the explicit padding from `.wall-entry-body`/`.wall-entry-content`. Let `.panel-body` padding govern. Or reset `padding` on `.panel-body` when inside a stream entry to avoid compounding.

### S02 — Flex-wrap footer wraps awkwardly at 375px

- **Location**: `_stream.scss:166-174`
- **Description**: `.wall-entry-footer` has `display: flex; flex-wrap: wrap; gap: var(--space-3)`. At 375px width, items like comment link, reaction trigger, like count link, and summary link may occupy 2-3 rows. This wastes vertical space and creates a disjointed footer.
- **Severity**: Minor
- **Fix approach**: Use `flex-wrap: nowrap` with `overflow-x: auto` for scrollable footer on small screens. Alternatively, hide secondary controls behind a "more" button at very narrow widths.

### S03 — `margin-top: 0 !important` on controls with `flex-wrap: wrap` can still break alignment

- **Location**: `_stream.scss:253-265`
- **Description**: `.wall-entry-controls a` sets `margin-top: 0 !important` to override Clean Theme's `margin-top: 10px`. However, when `flex-wrap: wrap` is active and items wrap, the gap between rows is controlled by `gap` on the parent — but individual items may still misalign if other flex properties (e.g., `align-items`) are not consistent.
- **Severity**: Minor
- **Fix approach**: Also set `align-self: center` on each control link, and ensure the parent flex container uses `align-items: center` to guarantee consistent cross-axis alignment on wrapped rows.

### S04 — `font-size: 0` on `.wall-entry-links` hides `·` text nodes but is fragile

- **Location**: `_stream.scss:294-301`
- **Description**: `.stream-entry-addons .wall-entry-controls.wall-entry-links` uses `font-size: 0` to hide `·` text node separators injected by `WallEntryLinks`. All children get `font-size: 14px` restored. Any new child element without an explicit font-size becomes invisible. This is a silent breakage trap.
- **Severity**: Minor
- **Fix approach**: Replace `font-size: 0` with `display: contents` on the parent or use a more targeted `.wall-entry-links::before` / `::after` approach. Alternatively, override the separator spans (if selectable) with `display: none`.

### S05 — Accent line `::before` on `.panel-heading` is too subtle

- **Location**: `_stream.scss:196-207`
- **Description**: The gradient accent line (2px height, `opacity: 0.68`) at the top of each post card is subtle on desktop and nearly invisible on mobile screens. It does not provide enough visual differentiation.
- **Severity**: Cosmetic
- **Fix approach**: Increase height to 3px, raise opacity to 0.85+ on mobile, or use a thicker gradient.

### S06 — `.s2_streamContent > .wall-entry` zero padding reduces tap target area

- **Location**: `_mobile.scss:166-174`
- **Description**: On mobile, `.s2_streamContent > .wall-entry` sets `padding: 0 !important`. While the inner `.panel` has its own card styling, the dead space between posts is only the `margin-bottom: 12px`. This reduces the area between post cards where users can scroll without accidentally tapping a link.
- **Severity**: Minor
- **Fix approach**: Keep `padding: 0` on the entry wrapper but add a small invisible padding area or increase margin between entries to `16px` for touch safety.

### S07 — Dark mode hover on stream entries is too subtle

- **Location**: `_stream.scss:18` (via `@include card-hover`)
- **Description**: The dark mode hover effect uses `color-mix(in srgb, var(--color-bg-secondary) 92%, var(--color-primary) 8%)` — only 8% primary. This produces a barely perceptible color shift that fails to give clear visual feedback on hover.
- **Severity**: Minor
- **Fix approach**: Increase the mix to 15-20% primary, or apply a subtle border highlight (e.g., `border-left: 3px solid var(--color-primary)`) on hover to provide stronger feedback.

---

## 2. Comments System

### C01 — Reply link hidden on all screen sizes (functional regression)

- **Location**: `_stream.scss:469-471`
- **Description**: `.comment-container .wall-entry-controls a[data-action-click="comment.toggleComment"]:not(.d-none)` is set to `display: none !important` on all screen sizes. This removes the ability for users to reply to individual comments. The toggle to show the nested reply form is gone. This is a **major functional regression** — users cannot reply to comments anymore.
- **Severity**: **Critical**
- **Fix approach**: Revert the hide rule for ALL screen sizes, or replace it with a different UX pattern (e.g., always-visible inline reply form, or a dedicated reply button that does not rely on the `comment.toggleComment` action). If reply flattening is intentional, provide an alternative reply mechanism.

### C02 — Reply comment flat selector is fragile

- **Location**: `_stream.scss:474-491`
- **Description**: `.comment > .single-comment.p-2 ~ .single-comment.p-2` targets reply comments using the sibling combinator. This depends on exact DOM order (parent comment first, then replies as siblings) and both classes being present (`p-2`). If the DOM structure changes or classes are modified by HumHub updates, reply styling silently breaks.
- **Severity**: Major
- **Fix approach**: Use a more robust selector based on nesting depth (e.g., `.single-comment[data-depth="1"]`) or a dedicated class injected by the widget. Alternatively, apply reply styling to all `.single-comment` elements that follow the first one in their `.comment` parent.

### C03 — Reply comment avatar too small at 25px

- **Location**: `_stream.scss:482-486`
- **Description**: Reply comments use `width: 25px !important; height: 25px !important` for avatars, vs 32px for top-level comments. This is too small for touch targets on mobile (below the recommended 44px minimum).
- **Severity**: Minor
- **Fix approach**: Use 28px minimum or increase to 32px. Use CSS `min-width/min-height` rather than fixed width/height so the avatar container can grow if needed.

### C04 — Comment container padding too tight on mobile

- **Location**: `_stream.scss:563-565` (mobile `@media` block)
- **Description**: `.comment-container` on mobile uses `padding: var(--space-2) var(--space-2) !important` (8px). Content text nearly touches the container edge, especially when combined with the `padding-left: 0 !important` on `.panel-body` at the same breakpoint (line 549-551).
- **Severity**: Minor
- **Fix approach**: Increase to `var(--space-3)` (12px) minimum on all sides. Keep 0 on left/right if panel padding handles it, but add back a small gutter.

### C05 — Comment form hidden on mobile, requires JS to show

- **Location**: `_stream.scss:575-591`
- **Description**: `.comment-container > .comment_create` has `display: none !important` on mobile. It is only shown when `.show-on-mobile` class is added by JS. If the JS fails to load or is blocked, the comment form is permanently invisible on mobile — users cannot compose comments.
- **Severity**: Major
- **Fix approach**: Show the form by default on mobile and use progressive enhancement to hide it via JS if desired (e.g., for inline expansion). Alternatively, always show at minimum a "Write a comment..." placeholder input.

### C06 — Comment form ProseMirror min-height 72px causes layout shift

- **Location**: `_stream.scss:585-589` (inside `.show-on-mobile`)
- **Description**: When the comment form transitions from `display: none` to `display: block` with `.show-on-mobile`, the `.ProseMirror` jumps from 0px to `min-height: 72px`. This causes a layout shift. The shift is especially jarring when the form appears at the bottom of a long comment thread.
- **Severity**: Minor
- **Fix approach**: Use a CSS transition/animation or set a consistent height placeholder. Consider `min-height: 44px` default with a CSS `max-height` transition, not a toggle from `display: none`.

### C07 — `font-size: 0` on comment controls affects all children

- **Location**: `_stream.scss:309-318` and `_stream.scss:443-463`
- **Description**: `.comment-container .wall-entry-controls` and `.single-comment .wall-entry-controls` both use `font-size: 0` to hide `·` text separators, then restore `font-size: 14px` (or `var(--font-size-xs)` in `.single-comment`) on all children `> *`. Similar to S04, any child without an explicit font-size becomes invisible. Additionally, the reply and emoji buttons in comment controls rely on these restored font sizes.
- **Severity**: Minor
- **Fix approach**: Same as S04 — replace with `display: contents` or more targeted separator hiding.

---

## 3. Emoji Reactions

### R01 — Picker position managed entirely via JS inline styles, no CSS fallback

- **Location**: `_reactions.scss:54-56` (comment), `reactionPicker.js:82-123`
- **Description**: The `.mt2026-reaction-picker` has no CSS positioning properties (`top`, `left`, `bottom`, `right`, etc.). All placement is applied as inline styles by JS via `positionBodyPicker()`. If JS fails to load, errors, or is blocked, the picker element sits at `0,0` in the viewport with `display: none` (safe fallback), but there is no gracefully degraded positioning.
- **Severity**: Major
- **Fix approach**: Set default CSS positioning (`position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)`) as a baseline fallback in SCSS. JS overrides these values when the picker is shown. This ensures the picker is at least centered if JS positioning fails.

### R02 — `z-index: 9999` can appear above modals and overlays

- **Location**: `_reactions.scss:59`
- **Description**: `.mt2026-reaction-picker` sets `z-index: 9999`. The JS also creates a body-picker with `zIndex: 99999` (line 85). These values exceed standard stacking contexts: modals (1055), modal backdrops (1040), drawers (1090), topbar (1030), and mobile bottom nav (1030). The picker may appear above system overlays, login walls, or push notifications.
- **Severity**: Minor
- **Fix approach**: Lower to `z-index: 1070` (just above modals at 1055, below drawers at 1090), or define a named stack level variable. The JS `zIndex: 99999` should match the SCSS value.

### R03 — Reaction trigger 44×44px on mobile can cause layout shift in flex-wrap footer

- **Location**: `_reactions.scss:13-16`
- **Description**: On mobile, `.mt2026-reaction-trigger` jumps from 28×28px to 44×44px. Inside a `flex-wrap: wrap` footer (S02), this larger dimension can trigger a wrap reflow, pushing other elements to a new row.
- **Severity**: Minor
- **Fix approach**: Keep trigger at 40×40px max, or use `min-width: 44px; width: auto; aspect-ratio: 1` to maintain consistent box model. Ensure enough room so the trigger doesn't cause wrapping.

### R04 — Hardcoded FontAwesome icon in `::before` with no customization path

- **Location**: `_reactions.scss:31-37`
- **Description**: `.mt2026-reaction-trigger::before` uses `font-family: FontAwesome` with `content: "\f118"` (fa-smile-o). The icon cannot be customized or themed without overriding the `::before` content. HumHub may switch icon fonts in future versions.
- **Severity**: Cosmetic
- **Fix approach**: Use a CSS custom property for the icon content: `content: var(--reaction-trigger-icon, "\f118")`. Or use an `<svg>` sprite approach that's version-independent.

### R05 — Like count link hidden via two redundant mechanisms

- **Location**: `_reactions.scss:158-167, 178-181`
- **Description**: `.likeLinkContainer > a:not(.likeAnchor)` first uses `font-size: 0` to hide the like count link (line 159), then after `[data-mt2026-reactions]` is set, uses `display: none !important` (line 180). The `font-size: 0` is redundant once `display: none` applies, and can cause confusion about which rule is actually hiding the element.
- **Severity**: Minor
- **Fix approach**: Remove the `font-size: 0` rule from the `a:not(.likeAnchor)` block once the `display: none !important` in `[data-mt2026-reactions]` block is confirmed stable. Keep only the functional hiding mechanism.

### R06 — likeAnchor clipped to 1×1px AND parent `display: none` applied

- **Location**: `_reactions.scss:183-193`
- **Description**: After `[data-mt2026-reactions]` is set, `a.likeAnchor` is clipped to `1×1px` with `position: absolute` (lines 183-193). But the parent container's `> a:not(.likeAnchor)` has `display: none !important` at line 180. The `.likeAnchor` is NOT matched by that selector (it's excluded by `:not(.likeAnchor)`), so the 1×1px clip is technically active. However, the trigger button injected by JS overlays the area. Two hiding strategies for the same element in the same selector block.
- **Severity: Minor**
- **Fix approach**: Consolidate into a single hiding strategy — either clip + absolute (keeps element in DOM for accessibility) or `display: none` (removes from accessibility tree). Not both.

### R07 — Summary link `margin-left: auto` in flex-wrap container can cause unexpected wrapping

- **Location**: `_reactions.scss:295`
- **Description**: `.wall-entry-controls .mt2026-summary-link` uses `margin-left: auto !important` to right-align inside the addon bar. When combined with `flex-wrap: wrap` (from S02), the summary link wraps to its own row when other items no longer fit on the first row. This breaks the visual expectation that summary counts are always right-aligned on the same row as controls.
- **Severity**: Minor
- **Fix approach**: Use `margin-left: auto` but also `align-self: flex-start` and ensure the parent uses `flex-wrap: nowrap` at desktop breakpoints. On mobile, allow it to wrap but add a subtle visual separator (e.g., border-top) to distinguish it from action controls.

### R08 — Inline `<style>` block in `list.php` view prevents CSP compliance and caching

- **Location**: `views/reactions/list.php:64-126`
- **Description**: The reactions user list modal embeds an entire `<style>` block with inline CSS. This circumvents CSP nonce requirements (already using `Html::nonce()`), but the styles are not cacheable — they are served on every modal open. The `.mt2026-reaction-modal-badge`, `.mt2026-reaction-list`, and `.mt2026-reaction-row` classes should be in the compiled SCSS.
- **Severity**: Major
- **Fix approach**: Move all inline styles from `list.php` into `_reactions.scss` with an override selector or a dedicated `_modals.scss` file. Remove the `<style>` block entirely. Use the `Html::nonce()` approach only if dynamic CSP values are required.

---

## 4. Post Creation Form

### P01 — ProseMirror toolbar hidden on mobile post form

- **Location**: `_mobile.scss:844-849`
- **Description**: `#contentFormBody .ProseMirror-menubar` and `.content-form-body .ProseMirror-menubar` are set to `display: none` on mobile (max-width 991px). Users composing posts on mobile phones cannot bold, italicize, create lists, or use any formatting.
- **Severity**: Major
- **Fix approach**: Replace `display: none` with a collapsible toolbar (toggled by a formatting button) or horizontal scroll. Use the same `overflow-x: auto` pattern already applied to the general `.ProseMirror-menubar` at `_mobile.scss:688-695`.

### P02 — Inconsistent formatting capability between mobile and desktop

- **Location**: `_mobile.scss:844-849` vs `_stream.scss:96-119`
- **Description**: Desktop post form shows the full ProseMirror toolbar (bold, italic, lists, links). Mobile post form hides it entirely. Content created with formatting on desktop cannot be edited with the same tools on mobile. Creates a confusing two-tier experience.
- **Severity**: Major
- **Fix approach**: Provide a simplified toolbar for mobile with bold/italic/link only, or move formatting into a bottom sheet / contextual menu.

### P03 — Hardcoded `56px` nav height in bottom padding

- **Location**: `_stream.scss:611-613`
- **Description**: `.wall-stream` and `.stream-container` on mobile use `padding-bottom: calc(56px + var(--space-4) + env(safe-area-inset-bottom, 0))`. The `56px` assumes the mobile bottom navigation is exactly 56px tall. If the nav height changes, this breaks and content is hidden behind the nav bar.
- **Severity**: Minor
- **Fix approach**: Use a CSS custom property for the nav height: `padding-bottom: calc(var(--mbn-height, 56px) + var(--space-4) + env(safe-area-inset-bottom, 0))`. Define `--mbn-height` in the nav widget's SCSS as a variable that can be updated in one place.

---

## 5. Prioritized Fix Summary

| Priority | ID | Issue | Severity |
|----------|----|-------|----------|
| 1 | C01 | Reply link hidden on all sizes — cannot reply to comments | **Critical** |
| 2 | S01 | Double-padded content body | **Major** |
| 3 | C05 | Comment form invisible on mobile without JS | **Major** |
| 4 | P01 | ProseMirror toolbar hidden on mobile post form | **Major** |
| 5 | P02 | Inconsistent formatting between mobile and desktop | **Major** |
| 6 | R01 | No CSS positioning fallback for picker | **Major** |
| 7 | R08 | Inline `<style>` block prevents caching | **Major** |
| 8 | C02 | Fragile reply comment sibling selector | **Major** |
| 9 | S02 | Flex-wrap footer awkward wrapping on narrow screens | **Minor** |
| 10 | S03 | Flex alignment on wrapped controls | **Minor** |
| 11 | S04 | `font-size: 0` fragile separator hiding | **Minor** |
| 12 | S06 | Low tap target space between posts | **Minor** |
| 13 | S07 | Dark mode hover too subtle | **Minor** |
| 14 | C03 | Reply avatar too small for touch | **Minor** |
| 15 | C04 | Comment container padding tight on mobile | **Minor** |
| 16 | C06 | Layout shift on comment form show | **Minor** |
| 17 | C07 | `font-size: 0` on comment controls (same as S04) | **Minor** |
| 18 | R02 | z-index 9999 above modals | **Minor** |
| 19 | R03 | Trigger size causes wrap reflow | **Minor** |
| 20 | R05 | Redundant like count hiding mechanisms | **Minor** |
| 21 | R06 | Double hiding strategies for likeAnchor | **Minor** |
| 22 | R07 | Summary link margin-left + flex-wrap breakage | **Minor** |
| 23 | S05 | Accent line too subtle | **Cosmetic** |
| 24 | R04 | Hardcoded FA icon without customization | **Cosmetic** |
| 25 | P03 | Hardcoded 56px nav height | **Minor** |

### Key findings

- **1 Critical**: Reply-to-comment functionality is entirely broken (C01). This must be fixed before any other work.
- **7 Major**: Double padding (S01), comment form mobile reliance on JS (C05), mobile formatting toolbar hidden (P01, P02), no CSS fallback for reaction picker (R01), inline `<style>` in reactions list (R08), fragile reply selectors (C02).
- **14 Minor**: Wrapping, alignment, tap targets, animations, stacking, and redundant CSS.
- **2 Cosmetic**: Accent line (S05), icon customization (R04).
