# Mail/Messenger UI/UX Audit

Audit of the Mail/Messenger component in Modern Theme 2026. Covers all sub-components: conversation list, conversation view, composer, settings drawer, dual-pane desktop layout, and mobile behaviors.

**Reviewed files:**
- `themes/ModernTheme2026/scss/humhub/_mail.scss` (1328 lines)
- `resources/js/mailLayout.js` (580 lines)
- `views/mail/views/mail/conversation.php` (105 lines)
- `views/mail/views/mail/index.php` (24 lines)

---

## 1. General / Architecture Issues

### MAIL-001 `_mail.scss` needs decomposition into partials
- **Location**: `_mail.scss` — entire file (1328 lines)
- **Description**: This is the largest SCSS file in the entire module at 1328 lines. It manages 10+ distinct concerns: layout height propagation, desktop fullscreen, sidebar/drawer, conversation bubbles, composer dock, mobile overlay, search, dark mode, empty states, notification badges, animations, accessibility, upload progress. Monolithic file makes maintenance difficult; a single change risks cascading selector breakage.
- **Severity**: Major
- **Fix approach**: Split into partials under `scss/humhub/mail/`:
  - `_mail-layout.scss` — page body, fullscreen, height propagation, two-column
  - `_mail-sidebar.scss` — conversation overview, search, message list entries
  - `_mail-bubbles.scss` — conversation entries, own/other bubbles, timestamps
  - `_mail-composer.scss` — dock, form, richtext, buttons, upload
  - `_mail-drawer.scss` — settings drawer, drawer backdrop, animations
  - `_mail-mobile.scss` — `@media (max-width: 991px)` overrides
  - `_mail-dark.scss` — `[data-bs-theme="dark"]` overrides
  - `_mail-misc.scss` — empty states, badges, accessibility, upload progress

### MAIL-002 JS dependency is heavy; `mailLayout.js` manages too many concerns
- **Location**: `resources/js/mailLayout.js` — entire file (580 lines)
- **Description**: Single module (`humhub.module('modernTheme.mailLayout')`) manages layout initialization, conversation active detection, desktop Enter-to-send, mobile list sizing, search, drawer construction, settings persistence, scroll observation, resize handling, and teardown. This is the largest JS file in the module. Any regression in one concern risks breaking others.
- **Severity**: Major
- **Fix approach**: Split into focused modules: `mailLayout.js` (core layout init), `mailEnterToSend.js`, `mailDrawer.js`, `mailSearch.js`, `mailMobile.js`. Each module exports its own init/unload.

### MAIL-003 Combinatorial body class explosion
- **Location**: `_mail.scss` selectors throughout; `mailLayout.js` lines 42–47, 72–77, 311–319
- **Description**: The mail page uses 5+ body toggle classes: `mt2026-mail-page`, `mt2026-mail-fullscreen`, `mt2026-mail-has-conversation`, `mail-list-open`, `data-mt2026-mail-overlay`. CSS selectors combine 3–4 of these to target specific states (e.g., `body.mt2026-mail-page.mt2026-mail-has-conversation.mail-list-open .messagePreviewEntry`). This creates 2^5 = 32 possible states, many untested and potentially conflicting.
- **Severity**: Major
- **Fix approach**: Reduce to fewer boolean flags. Merge `mt2026-mail-page` + `mt2026-mail-fullscreen` into a single class. Use data attributes with string values instead of multiple boolean classes (e.g., `data-mail-state="fullscreen conversation-list-open"`).

### MAIL-004 CSS media query / JS width check dual boundary
- **Location**: `_mail.scss`:13 (`@media (min-width: 992px)`); `mailLayout.js`:80–82 (`isMobileWidth(): window.innerWidth <= 991`)
- **Description**: SCSS uses `992px` as the desktop breakpoint, while JS uses `window.innerWidth <= 991`. These should be equivalent but drift independently. A scrollbar-width change (e.g., OS setting) causes `window.innerWidth` to differ from CSS viewport width, potentially creating a 16–20px dead zone where neither mobile nor desktop styles apply correctly at browser zoom levels.
- **Severity**: Minor
- **Fix approach**: Define a CSS custom property `--mt2026-breakpoint-mail` and read it via `getComputedStyle` in JS, or export a constant from a shared config. At minimum, make the JS boundary match exactly and add a comment referencing the SCSS breakpoint.

---

## 2. Desktop Layout Issues

### MAIL-005 `.col-lg-8.messages > .panel` fragile DOM dependency
- **Location**: `_mail.scss`:163–173; `views/mail/views/mail/index.php`:20–22
- **Description**: Desktop layout depends on `.col-lg-8.messages > .panel` for flex column behavior. If HumHub core changes the panel wrapper structure or removes `.panel`, the entire conversation view collapses. The selector is also a descendant, not a direct child (`>`), so nested panels could match incorrectly.
- **Severity**: Critical
- **Fix approach**: Add a unique class (e.g., `mt2026-mail-conversation-panel`) directly to the panel element in `conversation.php` and select by that class instead of fragile HTML structure selectors.

### MAIL-006 Fullscreen height calculation has arbitrary 8px gutter
- **Location**: `_mail.scss`:18–19
- **Description**: `height: calc(100dvh - var(--mt2026-topbar-height, 60px) - 8px)`. The 8px gutter is unexplained and does not account for margins, borders, or other spacing. At different zoom levels or on browsers that don't support `dvh` (fallback to `vh`), this may cause content overflow or scrollbar-on-scrollbar issues.
- **Severity**: Minor
- **Fix approach**: Replace hardcoded 8px with a CSS variable (`--mt2026-mail-gutter`) with a comment explaining its purpose. Consider removing it entirely if the height calculation can be delegated to flexbox.

### MAIL-007 Desktop sidebar width fixed at 33% / 67% split
- **Location**: `_mail.scss`:80–86
- **Description**: `.col-lg-4` (33.33%) and `.col-lg-8` (66.67%) on desktop. For screens between 992px and 1200px, the sidebar at 33% is only ~327px wide, which is too narrow for message previews with avatars, subject lines, and timestamps, especially on 1280px screens. Content overflows or gets truncated excessively.
- **Severity**: Minor
- **Fix approach**: Add a medium breakpoint at 1200px where the sidebar uses a fixed minimum width (e.g., `min-width: 360px` or `min-width: 320px`) with `flex: 0 0 auto`, and the main content area fills the remainder.

### MAIL-008 Unread indicator 3px border-left shifts content
- **Location**: `_mail.scss`:446–448
- **Description**: `.messagePreviewEntry.unread { border-left: 3px solid var(--color-primary) }`. The 3px border pushes all content right by 3px when a message becomes unread. This causes a visible layout shift when reading messages — clicking a message marks it read, which removes the border, which shifts the entire entry's content left by 3px.
- **Severity**: Major
- **Fix approach**: Use `box-shadow: inset 3px 0 0 var(--color-primary)` instead of border-left, which does not affect layout. Alternatively, reserve 3px of padding on all entries and use border-left on unread, making all entries occupy the same space.

### MAIL-009 `.messagePreviewEntry` min-height: 64px with padding creates cramped layout
- **Location**: `_mail.scss`:431–432
- **Description**: Entries have `min-height: 64px` and `padding: 10px 12px`. With a 40px avatar, subject line (14px), and timestamp (11px), content fitting inside 44px (64 - 10 - 10) leaves barely 14px for text after the avatar. Long subject lines truncate immediately.
- **Severity**: Minor
- **Fix approach**: Increase min-height to 72px on desktop. For entries with multi-line previews, consider `min-height: auto` with a consistent padding.

### MAIL-010 `.mt2026-mail-shell .mt2026-mail-sidebar` border-right not applied on mobile
- **Location**: `_mail.scss`:1192–1201; the `.mt2026-mail-sidebar` class is referenced but may not exist in the DOM on mobile
- **Description**: The desktop-only polish rule at breakpoint 992px adds `border-right` to `.mt2026-mail-sidebar`, but the sidebar DOM structure is `#mail-conversation-overview`, not `.mt2026-mail-sidebar`. This rule may be dead CSS if the `mt2026-mail-sidebar` class is never rendered.
- **Severity**: Cosmetic
- **Fix approach**: Either remove dead CSS or apply the border-right to `#mail-conversation-overview` on desktop.

---

## 3. Conversation Bubble Issues

### MAIL-011 White text on primary color fails on Neutral Gray palette
- **Location**: `_mail.scss`:481–493
- **Description**: Own bubbles use `background: var(--color-primary); color: #fff`. On the Neutral Gray palette, `--color-primary` is `#6b7280` (medium gray). White text on `#6b7280` has a contrast ratio of ~4.3:1 — below WCAG AA for normal text (4.5:1) and borderline for large text (3:1). The `#6b7280` gray is also visually muddied as a bubble color.
- **Severity**: Critical
- **Fix approach**: For own bubbles, use a dedicated variable `--color-mail-own-bubble` that each palette defines explicitly. Neutral Gray should use a darker primary (e.g., `#4b5563`) or the secondary color for bubble backgrounds. Alternatively, add a subtle tint overlay for own bubbles: `background: color-mix(in srgb, var(--color-primary) 85%, black)`.

### MAIL-012 Other-user bubbles insufficient contrast from body background
- **Location**: `_mail.scss`:496–500
- **Description**: Other-user bubbles use `background: var(--color-bg-secondary)`. In light mode, `--color-bg-secondary` is `#f3f4f6` while the body background `--color-bg-primary` is `#ffffff`. The difference (`#f3f4f6` vs `#ffffff`) is only 6.8% perceptual brightness difference, making bubbles hard to distinguish from the empty background.
- **Severity**: Major
- **Fix approach**: Use a more distinct background for other-user bubbles: `var(--color-bg-tertiary)` (#e5e7eb) or add a 1px border. Alternatively, use `color-mix(in srgb, var(--color-primary) 6%, var(--color-bg-secondary))` for a subtle tint.

### MAIL-013 Bubble max-width inconsistent between mobile and desktop
- **Location**: `_mail.scss`:540 (`min(72%, 760px)`), `_mail.scss`:826 (`82%`)
- **Description**: Desktop bubbles max out at `min(72%, 760px)`, mobile at `82%`. This means at 768px viewport width (just under desktop breakpoint), bubbles are 630px wide (82%), which is very wide for a chat bubble on a 768px screen. The `760px` ceiling on desktop also means on a 1920px display, bubbles are 760px — narrower than on a 768px phone.
- **Severity**: Minor
- **Fix approach**: Unify the formula: use `min(75%, 680px)` across both breakpoints, with the percentage varying only at very narrow widths (< 480px, e.g., 88%). A single consistent rule reduces visual surprise.

### MAIL-014 Bubble corner radius asymmetry inconsistently applied
- **Location**: `_mail.scss`:475, 484, 499
- **Description**: Own bubbles have `border-radius: 12px` with `border-top-right-radius: 4px`. Other bubbles have `border-top-left-radius: 4px` (the rest inherit 12px). The near-side corner is 4px (pointing toward the avatar edge), far-side corner is 12px. This asymmetry matches Telegram-style but varies depending on whether the entry has an `.own` class. If `.own` is misapplied, corner radii look wrong (e.g., both bubbles getting 4px on the same side).
- **Severity**: Minor
- **Fix approach**: Ensure `.own` assignment is deterministic and well-documented. Consider using logical properties (`border-start-start-radius`, `border-start-end-radius`) for RTL language support.

### MAIL-015 `.conversation-entry-time` right-alignment inside flex column is fragile
- **Location**: `_mail.scss`:510–520
- **Description**: Time uses `align-self: flex-end; text-align: right`. Inside a flex column that does not necessarily stretch to fill the bubble's width, `align-self: flex-end` aligns the time element to the right edge of the content box — but only if the parent has `align-items: stretch` (which it doesn't; no `align-items` is set on `.conversation-entry-content`). The default is `stretch`, so it works accidentally. If any rule changes `align-items`, time alignment breaks.
- **Severity**: Minor
- **Fix approach**: Move time alignment to `margin-left: auto` (inside a flex row wrapper) or explicitly set `align-items: stretch` on the bubble content container.

---

## 4. Composer Issues

### MAIL-016 `.ProseMirror-menubar` globally hidden by default, toggled via JS
- **Location**: `_mail.scss`:658–664; `mailLayout.js`:449–454
- **Description**: The formatting toolbar is `display: none` globally (line 658) and toggled via `mt2026-formatting-bar-visible` class. On desktop, users must open settings drawer and toggle formatting bar on — discoverability is poor. Most users will never find this feature.
- **Severity**: Major
- **Fix approach**: Show the formatting bar by default on desktop and provide the settings toggle to hide it. On mobile, keep hidden by default. This matches user expectation (formatting tools visible on desktop) while reducing clutter on mobile.

### MAIL-017 Formatting bar toggle causes layout shift
- **Location**: `_mail.scss`:658–664
- **Description**: When `.ProseMirror-menubar` transitions from `display: none` to `display: flex`, the composer input area suddenly shrinks by the height of the menubar (~36px). The send button and upload buttons reposition, causing a visual jump. The same happens when hiding.
- **Severity**: Major
- **Fix approach**: Use `visibility: hidden` / `visibility: visible` with `height: 0` / `height: auto` transition, or reserve the menubar space by always allocating `36px` for it (even when hidden). Use `opacity` and `pointer-events` for smooth animation.

### MAIL-018 Composer `min-height: 36px` is too small
- **Location**: `_mail.scss`:629, 670–671
- **Description**: `.humhub-ui-richtext` has `min-height: 36px`. With 8px padding and 14px font-size, this gives a ~1.3-line visible area. In practice, placeholder text or one line of text fills this completely, making the input feel cramped. Adjacent 36px send/upload buttons compound the density issue.
- **Severity**: Major
- **Fix approach**: Increase `min-height` to `44px` (WCAG touch target recommendation) for comfortable single-line input. The ProseMirror editor should grow naturally on multi-line input. Reduce send button size slightly to compensate.

### MAIL-019 Send button small on mobile (`.sm()` size)
- **Location**: `views/mail/views/mail/conversation.php`:78–83; `_mail.scss`:682–685
- **Description**: The reply button uses `Button::accent()->sm()`. On mobile fullscreen (lines 853–857), min-height is overridden to 40px, but the base `.btn-sm` class at lines 682–685 sets `min-height: 32px; min-width: 32px`. At 32x32px, this is below the WCAG 2.1 AA minimum touch target of 44x44px. The mobile override (40px) is still below 44px.
- **Severity**: Major
- **Fix approach**: Use `min-height: 44px; min-width: 44px` for all interactive elements in the composer on mobile. Use `Button::primary()` or add a SM+ modifier (36px for desktop, 44px for mobile).

### MAIL-020 `.richtext-create-buttons` flex: 0 0 auto may overflow narrow composer
- **Location**: `_mail.scss`:687–692
- **Description**: The buttons container uses `flex: 0 0 auto`. On narrow viewports (mobile fullscreen with column layout, lines 835–842), buttons stack below the input. But on intermediate widths (450–600px) where the composer is not yet fullscreen but the viewport is narrow, buttons sit beside the input and may overflow or wrap awkwardly.
- **Severity**: Minor
- **Fix approach**: Add a `@container` query or a mid-range breakpoint (e.g., `max-width: 600px`) that switches composer to column layout when the available width is < 400px.

### MAIL-021 `.mt2026-mail-composer-dock` z-index 1050 conflicts with modal backdrop
- **Location**: `_mail.scss`:555, 570
- **Description**: `.mt2026-mail-composer-dock` at `z-index: 1050` and `.mail-message-form` at `z-index: 1050`. Bootstrap modals use z-indices 1040–1060 (backdrop: 1040, modal: 1050, modal-content: 1060). If a modal opens over the mail page (e.g., user profile, file preview), the composer dock at 1050 may sit above the modal backdrop (1040) but below the modal panel (1055), causing visual layering issues.
- **Severity**: Major
- **Fix approach**: Lower composer z-index to 1000 or lower on desktop. On mobile, where the composer is fixed, use a higher z-index but ensure it resets when a modal opens (listen for `show.bs.modal`). A more robust solution: apply a class to body when a modal opens and lower composer z-index via CSS.

### MAIL-022 `.mail-message-form` z-index 1050 duplicated in multiple rules
- **Location**: `_mail.scss`:555 (`z-index: 1050`), `_mail.scss`:570 (`z-index: 1050`)
- **Description**: Two separate selectors (`.mt2026-mail-composer-dock` and `.mail-message-form`) both set `z-index: 1050`. This is a maintenance burden — if one is updated, the other must be too. Also, the mobile override at line 968 sets `.mt2026-mail-composer-dock` to `z-index: 1010`, but `.mail-message-form` stays at 1050 on mobile, creating a stacking conflict.
- **Severity**: Minor
- **Fix approach**: Use a single CSS custom property: `--mt2026-composer-z: 1050`, then override the variable at each breakpoint instead of changing the property individually on each selector.

---

## 5. Settings Drawer Issues

### MAIL-023 Settings drawer HTML constructed in JS string concatenation
- **Location**: `mailLayout.js`:370–395
- **Description**: The entire settings drawer HTML is generated via JS string concatenation with inline event handlers. This approach has multiple problems:
  1. No server-side rendering — strings are unescaped, potential XSS vector
  2. No `Yii::t()` translation support — all strings are hardcoded English
  3. Hard to maintain — HTML structure mixed with JS logic
  4. Cannot use HumHub widgets or form helpers
- **Severity**: Critical
- **Fix approach**: Move the settings drawer HTML to a server-side view file (`views/mail/mailSettings.php` or `widgets/views/mailSettings.php`). Fetch it via AJAX or embed it in the page and show/hide via JS. Use `Yii::t()` for all user-facing strings.

### MAIL-024 Settings drawer close on Escape doesn't handle multiple drawers
- **Location**: `mailLayout.js`:429–431
- **Description**: `drawer.addEventListener('keydown', function(e) { if (e.key === 'Escape') closeSettingsDrawer(); })`. If a future feature opens another drawer on top of settings, pressing Escape will close the settings drawer (the top listener) rather than the topmost drawer.
- **Severity**: Minor
- **Fix approach**: Maintain a drawer stack (array) and close the most recently opened drawer on Escape. Delegate the keydown listener to `document` instead of individual drawer elements.

### MAIL-025 Settings drawer has slideIn animation on open but no close animation
- **Location**: `_mail.scss`:1001–1002; `mailLayout.js`:435–439
- **Description**: Opening the drawer uses `animation: slideInRight 300ms ease-out forwards`. Closing it (via `closeSettingsDrawer()`) immediately calls `drawer.remove()` — no close animation, the drawer vanishes instantly. This feels jarring.
- **Severity**: Cosmetic
- **Fix approach**: On close, add a class that triggers `animation: slideOutRight 300ms forwards`, then remove the element after the animation completes (`animationend` event) or after a `setTimeout(300)`.

### MAIL-026 Drawer z-index 1000 conflicts with overlay backdrop at 999
- **Location**: `_mail.scss`:985, 1055
- **Description**: Drawer is `z-index: 1000`, backdrop is `z-index: 999`. This works for the current single-drawer case, but if both conversations drawer (`.mt2026-drawer-conversations`) and settings drawer (`.mt2026-drawer-settings`) were open simultaneously, their z-indices would conflict (both at 1000). The backdrop at 999 sits between them.
- **Severity**: Minor
- **Fix approach**: Use `z-index` increments (e.g., 1000 + drawer depth) or use `--mt2026-drawer-z` variable incremented per drawer instance.

---

## 6. Mobile Layout Issues

### MAIL-027 `overflow: hidden; height: 100dvh` on body breaks browser history scroll restoration
- **Location**: `_mail.scss`:90–93
- **Description**: `body.mt2026-mail-page { overflow: hidden; height: 100dvh }` prevents all page scrolling. When a user navigates back from the mail page to the stream, browsers typically restore scroll position — but if the previous page also set overflow: hidden, or if the transition is PJAX-based, scroll position is lost. The user is thrown to the top of the stream instead of where they were.
- **Severity**: Critical
- **Fix approach**: Use `overflow: clip` instead of `overflow: hidden` (same visual effect but does not block scroll restoration). Alternatively, save and restore scroll position on navigation using `window.scrollY` before entering mail and `window.scrollTo()` on exit.

### MAIL-028 Mobile composer `position: fixed; bottom: calc(56px + env(safe-area-inset-bottom, 0))` assumes 56px bottom nav
- **Location**: `_mail.scss`:885–886
- **Description**: The fixed composer assumes the mobile bottom navigation is exactly 56px tall. If the bottom nav widget is resized or hidden (e.g., user-enabled setting), the composer either overlaps content or leaves a gap. The `env(safe-area-inset-bottom)` only handles iPhone notches, not variable-height navigation bars.
- **Severity**: Major
- **Fix approach**: Use a CSS variable `--mt2026-bottom-nav-height` set by the bottom nav widget in JS. Calculate the composer position as `calc(var(--mt2026-bottom-nav-height, 56px) + env(safe-area-inset-bottom, 0))`. Recalculate on resize/orientation change.

### MAIL-029 `.conversation-entry-list` padding-bottom 60px can hide content
- **Location**: `_mail.scss`:900–902
- **Description**: `padding-bottom: 60px` is added to the entry list to clear the fixed composer. However, if the composer grows taller (e.g., upload preview appears, formatting bar visible, multi-line input), 60px may be insufficient. The last message becomes partially hidden behind the composer.
- **Severity**: Major
- **Fix approach**: Instead of a hardcoded padding-bottom, measure the composer height dynamically in JS and set it as a CSS variable on the list: `list.style.setProperty('--composer-height', composerHeight + 'px')`. In CSS: `padding-bottom: calc(var(--composer-height, 60px) + 8px)`.

### MAIL-030 Sidebar overlay `translateX(-102%)` may flash on initial render
- **Location**: `_mail.scss`:208
- **Description**: `transform: translateX(-102%)` hides the sidebar off-screen. On slow connections or when CSS loads late, the sidebar may briefly appear at `translateX(0)` (its natural position before the stylesheet applies) before snapping off-screen. This causes a visible flash.
- **Severity**: Minor
- **Fix approach**: Set `display: none` by default in HTML/initial state and only switch to block + transform after CSS is loaded. Alternatively, add `<style>` inline in the head that hides the sidebar before any CSS loads.

### MAIL-031 Mobile composer switches from `position: relative` to `position: fixed` causing layout shift
- **Location**: `_mail.scss`:884–890; 966–968
- **Description**: On mobile fullscreen, composer is `position: fixed; bottom: ...`. On non-fullscreen mobile, it's `position: relative` (line 968). The transition between these states (when entering/exiting fullscreen or when conversation loads) causes a visible content jump because `fixed` removes the composer from normal flow, collapsing the space it occupied.
- **Severity**: Major
- **Fix approach**: Keep composer `position: fixed` consistently on mobile whenever a conversation is active. Reserve the composer's space using `padding-bottom` on the entry list (see MAIL-029). Or always use `position: sticky` within a flex container to avoid flow issues entirely.

### MAIL-032 Navigating back from conversation leaves body overflow hidden, trapping page
- **Location**: `mailLayout.js`:42–49; `_mail.scss`:905–907
- **Description**: When a user opens a conversation (mobile), `body.mt2026-mail-page.mt2026-mail-has-conversation` is set with `overflow: hidden` (line 907). When navigating back (back button click at `mailLayout.js`:172–178), `setConversationActive(false)` removes `mt2026-mail-has-conversation` but the CSS selector `body.mt2026-mail-page` still has `overflow: hidden` from line 91. The page remains unscrollable.
- **Severity**: Critical
- **Fix approach**: The `overflow: hidden` on `body.mt2026-mail-page` should only apply when `body.mt2026-mail-has-conversation` is present. Change line 91 to `body.mt2026-mail-page.mt2026-mail-has-conversation { overflow: hidden; }`. Or, on back navigation, call `setFullscreenMode(false)` which removes all mail body classes.

### MAIL-033 Search empty state injects into fragile selectors
- **Location**: `mailLayout.js`:199–226
- **Description**: `updateSearchEmptyState` targets `.inbox-wrapper` or `.mail-inbox-messages > div:last-child`. These selectors depend on HumHub's mail inbox markup structure. If the inbox widget changes class names or wrapping hierarchy, the empty state element is appended to the wrong container or silently fails.
- **Severity**: Major
- **Fix approach**: Add a specific container element with a stable ID or class (e.g., `id="mt2026-mail-search-results"`) to the sidebar template, and always append/search within that container. Alternatively, render the empty state in the server-side view and toggle its visibility.

### MAIL-034 Mobile composer `overflow: visible` firehose (lines 972–977) overly broad
- **Location**: `_mail.scss`:972–977, 1316–1321
- **Description**: `.mt2026-mail-composer-dock, .mt2026-mail-composer-dock *, .mail-message-form, .mail-message-form * { overflow: visible }` is repeated twice (lines 972–977 in mobile block, lines 1316–1321 globally). Setting `overflow: visible` on all descendants can cause content to leak outside the composer boundaries and overlap with the entry list or bottom nav. Repeated code at two locations guarantees they'll drift.
- **Severity**: Minor
- **Fix approach**: Consolidate into one rule outside any media query. Scope `overflow: visible` to only the elements that specifically need it (e.g., `.ProseMirror` overflow menu, dropdowns) rather than all children.

### MAIL-035 `body.mt2026-mail-fullscreen #mail-conversation-root > .mt2026-mail-shell` rules duplicate across mobile block
- **Location**: `_mail.scss`:782–805, 913–919
- **Description**: The same selector/set of rules appears twice in the `@media (max-width: 991px)` block: lines 782–805 and 913–919 both target `body.mt2026-mail-fullscreen #mail-conversation-root > .mt2026-mail-shell` with identical `height: 100%; max-height: 100%; overflow: hidden; flex: 1 1 auto`. The earlier block is overridden by the later one, making lines 782–805 dead code.
- **Severity**: Cosmetic
- **Fix approach**: Remove the first occurrence (lines 782–805) — only lines 913–919 are effective. Similarly check for other duplicated blocks within the media query.

### MAIL-036 Mobile `sizeMobileConversationList()` uses hardcoded 56px reserved bottom space
- **Location**: `mailLayout.js`:106–130
- **Description**: The function calculates `reservedBottom` as `Math.max(56, window.innerHeight - composerTop)`. The 56px floor value assumes the bottom nav height plus safe area is always at least 56px. If the bottom nav is taller (e.g., 60px) or the safe area is larger (e.g., iPhone 14 Pro Max), the 56px floor clips the composer or leaves content hidden.
- **Severity**: Major
- **Fix approach**: Read `--mt2026-bottom-nav-height` CSS variable or measure the bottom nav element's actual height via `getBoundingClientRect()`. Fall back to 56px only if no nav element is found.

### MAIL-037 Mobile `sizeMobileConversationList()` reserves entire bottom area but composer is already flex-positioned
- **Location**: `mailLayout.js`:106–130
- **Description**: The function sets `height` and `max-height` on `.conversation-entry-list` via inline style with `!important`. This overrides the flex-based height calculation in CSS (lines 193–197: `flex: 1; min-height: 0`). The JS-based height is brittle — it doesn't recalculate on content changes (image load, upload preview), so the list can overflow or underflow.
- **Severity**: Major
- **Fix approach**: Use CSS-only approach: let the flex container naturally size the entry list. Set `padding-bottom` on the list to account for the composer (see MAIL-029). Remove the JS height-setting entirely, and rely on `flex: 1` with `min-height: 0` and `overflow-y: auto`.

---

## 7. Prioritized Fix Summary

| Priority | ID | Issue | Location | Severity |
|----------|----|-------|----------|----------|
| 1 | MAIL-005 | Fragile `.col-lg-8.messages > .panel` DOM dependency | `_mail.scss`:163 | Critical |
| 1 | MAIL-011 | White text on Neutral Gray primary fails contrast | `_mail.scss`:481–493 | Critical |
| 1 | MAIL-023 | Settings drawer HTML in JS string — no i18n, XSS vector | `mailLayout.js`:370–395 | Critical |
| 1 | MAIL-027 | `overflow: hidden` breaks history scroll restoration | `_mail.scss`:90–93 | Critical |
| 1 | MAIL-032 | Back navigation leaves body overflow hidden, trapped page | `_mail.scss`:905–907, `mailLayout.js`:172–178 | Critical |
| 2 | MAIL-001 | `_mail.scss` 1328 lines — needs decomposition | Entire file | Major |
| 2 | MAIL-002 | `mailLayout.js` 580 lines — manages too many concerns | Entire file | Major |
| 2 | MAIL-003 | Combinatorial body class explosion (2^5 states) | Throughout | Major |
| 2 | MAIL-008 | 3px border-left unread indicator shifts content | `_mail.scss`:446–448 | Major |
| 2 | MAIL-012 | Other-user bubbles insufficient contrast from body bg | `_mail.scss`:496–500 | Major |
| 2 | MAIL-016 | Formatting bar hidden by default, poor discoverability | `_mail.scss`:658–664 | Major |
| 2 | MAIL-017 | Formatting bar toggle causes layout shift | `_mail.scss`:658–664 | Major |
| 2 | MAIL-018 | Composer min-height 36px too small | `_mail.scss`:629 | Major |
| 2 | MAIL-019 | Send button below WCAG touch target on mobile | `conversation.php`:78–83 | Major |
| 2 | MAIL-021 | Composer z-index 1050 conflicts with modal backdrop | `_mail.scss`:555 | Major |
| 2 | MAIL-028 | Mobile composer assumes 56px bottom nav height | `_mail.scss`:885–886 | Major |
| 2 | MAIL-029 | `padding-bottom: 60px` can hide content behind composer | `_mail.scss`:900–902 | Major |
| 2 | MAIL-031 | Composer position relative→fixed causes layout shift | `_mail.scss`:884–890 | Major |
| 2 | MAIL-033 | Search empty state fragile selectors | `mailLayout.js`:199–226 | Major |
| 2 | MAIL-036 | `sizeMobileConversationList()` hardcoded 56px floor | `mailLayout.js`:117 | Major |
| 2 | MAIL-037 | JS-based height calc overrides flex CSS | `mailLayout.js`:106–130 | Major |
| 3 | MAIL-004 | CSS/JS breakpoint boundary 991 vs 992 may drift | `_mail.scss`:13, `mailLayout.js`:80–82 | Minor |
| 3 | MAIL-006 | Fullscreen height has arbitrary 8px gutter | `_mail.scss`:18–19 | Minor |
| 3 | MAIL-007 | Desktop sidebar 33% too narrow at 992–1200px | `_mail.scss`:80–86 | Minor |
| 3 | MAIL-009 | Message entry 64px min-height feels cramped | `_mail.scss`:431–432 | Minor |
| 3 | MAIL-013 | Bubble max-width inconsistent mobile/desktop | `_mail.scss`:540, 826 | Minor |
| 3 | MAIL-014 | Bubble corner radius asymmetry fragile | `_mail.scss`:475, 484, 499 | Minor |
| 3 | MAIL-015 | Time right-alignment accidentally correct | `_mail.scss`:510–520 | Minor |
| 3 | MAIL-020 | Button container may overflow narrow composer | `_mail.scss`:687–692 | Minor |
| 3 | MAIL-022 | z-index 1050 duplicated across selectors | `_mail.scss`:555, 570 | Minor |
| 3 | MAIL-024 | Drawer Escape doesn't handle multiple drawers | `mailLayout.js`:429–431 | Minor |
| 3 | MAIL-026 | Drawer z-index 1000 conflicts backdrop at 999 | `_mail.scss`:985, 1055 | Minor |
| 3 | MAIL-030 | Sidebar `translateX(-102%)` may flash on load | `_mail.scss`:208 | Minor |
| 3 | MAIL-034 | `overflow: visible` firehose too broad, repeated | `_mail.scss`:972–977, 1316–1321 | Minor |
| 4 | MAIL-010 | `.mt2026-mail-sidebar` border-right may be dead CSS | `_mail.scss`:1192–1201 | Cosmetic |
| 4 | MAIL-025 | Settings drawer has no close animation | `mailLayout.js`:435–439 | Cosmetic |
| 4 | MAIL-035 | Duplicate shell height rules in mobile block | `_mail.scss`:782–805, 913–919 | Cosmetic |
