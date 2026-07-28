# Modern Theme 2026 UI/UX Overhaul — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use subagent-driven-development (recommended) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. Each task is designed to be isolated to non-overlapping files so multiple subagents can work in parallel without merge conflicts.

**Goal:** Fix 197 UI/UX issues identified in the audit — 17 critical, 61 major, 80 minor, 38 cosmetic — across 40+ files in 4 sequential phases.

**Architecture:** Sequential phases (Phase 1→2→3→4, each merged to main before next starts). Within each phase, file-group-level parallelization. Each phase branch isolates changes from other phases. Subagents get one file (or one file group) and apply ALL issues for that file within the phase.

**Tech Stack:** SCSS (with scssphp compiler), PHP 8.x (Yii2), JavaScript (ES6, humhub.module pattern)

## Global Constraints

- All changes stay within `/var/www/humhub/protected/modules/modern-theme-2026/`
- Never edit HumHub core (`/var/www/humhub/protected/` except this module)
- After SCSS changes: run `php compile-css.php`, delete assets dir, flush cache
- Test on 375px, 768px, 992px, 1400px viewports
- Run Playwright tests after each phase
- No external dependencies
- Version bumps: follow `.github/BRANCH-VERSION-UPDATE-RULES.md` — release branches (VMAJOR.MINOR.PATCH) require aligned version in `module.json`, `package.json`, `CHANGELOG.md`
- Non-release branches (phase-*/*): do NOT bump version metadata. Version is updated only when merging to a release branch or creating a new release
- After each phase merge to main, if delivering a release, create a Vx.y.z branch and bump versions before PR

---

## Conflict-Avoidance Architecture

### The Problem

40+ files need changes across 4 phases. Many files are touched by MULTIPLE phases:
- `_mobile.scss` — Phases 1, 2, 4
- `_stream.scss` — Phases 1, 2, 3, 4
- `_mail.scss` — Phases 2, 3, 4
- `_dark-mode.scss` — Phases 3, 4
- `_dropdown.scss` — Phases 1, 3
- `mailLayout.js` — Phases 1, 2

Running parallel subagents on the same file from different phases guarantees merge conflicts.

### Solution: Phase-Branch Isolation + Within-Phase File-Level Parallelism

```
main ──► phase-1/critical ──► (merge) ──► main
main ──► phase-2/mobile-ux ──► (merge) ──► main
main ──► phase-3/architecture ──► (merge) ──► main
main ──► phase-4/polish ──► (merge) ──► main
```

**Within each phase branch**, subagents work on DIFFERENT files in parallel. Within a single phase, no file is touched by more than one subagent — each subagent gets an entire file with ALL its changes for that phase.

### File-Group Allocation Within Phases

Each phase's files are partitioned into non-overlapping groups. Subagents work on one group each. Groups are designed so that:
1. No file appears in >1 group within the same phase
2. Group boundaries follow file boundaries (never split a file across groups)
3. Dependencies between groups are documented (e.g., "modify `_root.scss` first, then `_mobile.scss` uses the new variable")

---

## Phase 1: Critical Bugfixes & Safety (12h estimated)

**Branch**: `phase-1/critical`
**Strategy**: 4 file groups, no overlap, can run partly in parallel.

### File Partition

| Group | Files | Issues | Dependencies |
|-------|-------|--------|--------------|
| 1a. Compilation fix | `_mobile-bottom-nav.scss` | SHT-005, SHT-006 (undefined `space()` function) | None — can run first |
| 1b. Reply comment fix | `_stream.scss` | STC-001 (reply toggle hidden) | None |
| 1c. Mobile layout safety | `_mobile.scss`, `_context-switcher.scss`, `main.php` | NAV-011, NAV-012, NAV-022, NAV-034 | None |
| 1d. Stacking & modals | `_dropdown.scss`, `_modal.scss`, `modalFocusFix.js` | DRP-005, JS-001 | None |
| 1e. Mail critical | `mailLayout.js`, `conversation.php` | M-001, M-002, M-003 | None |
| 1f. Context switcher a11y | `contextSwitcher.php`, `_context-switcher.scss` | NAV-026 | Group 1c must merge first (same file) |

### Task 1a: Fix SCSS compilation errors

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_mobile-bottom-nav.scss`

**Issues fixed:** SHT-005 (gap: space(3)), SHT-006 (padding: space(4) space(2))

**Changes:**
- Line 456: `gap: space(3)` → `gap: var(--space-3)`
- Line 457: `padding: space(4) space(2)` → `padding: var(--space-4) var(--space-2)`

- [ ] Replace `space(3)` with `var(--space-3)` in `.mobile-more-item`
- [ ] Replace `space(4) space(2)` with `var(--space-4) var(--space-2)` in `.mobile-more-item`
- [ ] Run `php compile-css.php` — verify no errors
- [ ] Commit

### Task 1b: Restore reply comment functionality

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_stream.scss`

**Issues fixed:** STC-001 (reply toggle hidden)

**Changes:**
- Remove the rule at line ~469-471 that hides `.comment-container .wall-entry-controls a[data-action-click="comment.toggleComment"]:not(.d-none)` with `display: none !important`
- Instead, restore reply visibility but keep flattened (same visual weight as top-level)

- [ ] Read `_stream.scss` around lines 467-471 to confirm exact selector
- [ ] Remove or modify the `display: none !important` rule on reply toggle
- [ ] Restore reply link visibility (keep it as a flat reply at same level, just make the link visible again)
- [ ] Run `php compile-css.php` — verify
- [ ] Commit

### Task 1c: Fix mobile layout safety issues

**Files:** 
- Modify `themes/ModernTheme2026/scss/humhub/_mobile.scss`
- Modify `themes/ModernTheme2026/scss/humhub/_context-switcher.scss`
- Modify `themes/ModernTheme2026/views/humhub/layouts/main.php`

**Issues fixed:** NAV-011 (body padding !important), NAV-012 (z-index 10000), NAV-022 (context switcher breakpoint), NAV-034 (guest chooser)

**Changes in `_mobile.scss`:**
- Line ~146-148: Remove `!important` from `body { padding-bottom: ... }`. Change to use `.mt2026-mobile-nav-active` class toggled by JS
- Lines ~150-163: Change `body::after` z-index from `10000` to `1001`, or remove entirely and let nav background fill safe area

**Changes in `_context-switcher.scss`:**
- Lines ~334-345: Change `@include mobile-only` to `@media (max-width: 991px)` to match topbar hidden breakpoint

**Changes in `main.php`:**
- Line ~31: Change `$useContextSwitcher = !Yii::$app->user->isGuest;` to always show context switcher (with restricted items for guests)
- Or add basic styling for `Chooser::widget()` when it renders for guests

- [ ] Fix body padding in `_mobile.scss` — remove `!important`, add `.mt2026-mobile-nav-active` class
- [ ] Fix `body::after` z-index — reduce to 1001 or remove pseudo-element approach
- [ ] Fix context switcher breakpoint — align to 991px
- [ ] Fix guest context switcher — always show, restrict items for guests
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 1d: Fix stacking contexts and modal focus

**Files:**
- Modify `themes/ModernTheme2026/scss/humhub/_dropdown.scss`
- Modify `themes/ModernTheme2026/scss/humhub/_modal.scss`
- Rewrite `resources/js/modalFocusFix.js`

**Issues fixed:** DRP-005 (mail composer z-index), JS-001 (focus trap)

**Changes in `_dropdown.scss`:**
- Lines ~272-279: Raise `z-index: $z-mt2026-dropdown` to `$z-mt2026-modal-backdrop + 1` (1051) for mail composer dropdowns

**Changes in `_modal.scss`:**
- Add `z-index: $z-mt2026-modal` to `.modal` class (currently using Bootstrap default 1050 vs variable 1055)

**Changes in `modalFocusFix.js`:**
- Rewrite to implement full focus trap on `shown.bs.modal`:
  - Find all focusable elements within the modal
  - On Tab: cycle between first and last focusable
  - Store trigger element on `show.bs.modal`
  - Return focus to trigger on `hidden.bs.modal`
  - Handle Escape key beyond Bootstrap's built-in

- [ ] Raise mail composer z-index in `_dropdown.scss`
- [ ] Apply `$z-mt2026-modal` to `.modal` in `_modal.scss`
- [ ] Rewrite `modalFocusFix.js` with full focus trap
- [ ] Run `php compile-css.php`
- [ ] Test: Tab through modal on desktop + mobile
- [ ] Commit

### Task 1e: Fix mail critical issues

**Files:**
- Modify `resources/js/mailLayout.js`
- Modify `views/mail/views/mail/conversation.php`

**Issues fixed:** M-001 (Neutral Gray contrast), M-002 (settings drawer XSS/i18n), M-003 (back nav trap)

**Changes in `mailLayout.js`:**
- Settings drawer: Replace HTML string concatenation with a server-rendered template (or at minimum use DOM API / textContent to avoid XSS)
- Back navigation: Add cleanup on `pjax:beforeSend` that properly resets `overflow` on body

**Changes in `conversation.php`:**
- Neutral Gray palette fix: Add a CSS class `.mt2026-own-bubble` that sets `background` to a computed color that passes contrast on all palettes, or use `color-mix()` with white overlay

- [ ] Fix settings drawer — extract HTML to a template or use secure DOM construction
- [ ] Fix back navigation — ensure `body.style.overflow` is properly reset
- [ ] Fix Neutral Gray contrast — add override class or use `color-mix()` for bubble bg
- [ ] Commit

### Task 1f: Fix context switcher accessibility

**Files:** Modify `widgets/views/contextSwitcher.php`

**Issues fixed:** NAV-026 (display:none hides from screen readers)

**Changes:**
- Replace `style="display:none"` with `style="visibility: hidden; opacity: 0; pointer-events: none"` and `aria-hidden="true"`
- JS toggle should switch between visible/hidden states

- [ ] Read `contextSwitcher.php` to find the display:none element
- [ ] Replace with visibility/opacity approach
- [ ] Ensure JS toggle handles the new states
- [ ] Commit

---

## Phase 2: Mobile UX Overhaul (20.5h estimated)

**Branch**: `phase-2/mobile-ux`
**Strategy**: 10 file groups, highly parallelizable since most files are unique per sub-phase.

### File Partition

| Group | Files | Issues |
|-------|-------|--------|
| 2a. Mobile nav SCSS | `_mobile-bottom-nav.scss` | NAV-013, NAV-015, NAV-016, NAV-018, NAV-019, NAV-036 |
| 2b. Mobile nav PHP | `MobileBottomNav.php`, `mobileBottomNav.php` | NAV-014, NAV-017, NAV-020, NAV-021 |
| 2c. Stream mobile | `_stream.scss`, `_cards.scss` | STM-002, STM-003, STM-006, STM-008, STM-009, STM-010, STM-011, STM-013 |
| 2d. Reactions | `_reactions.scss`, `reactionPicker.js`, `ReactionPicker.php` | RXN-001, RXN-003, RXN-005 |
| 2e. Mail mobile | `_mail.scss`, `mailLayout.js` | M-004, M-006, M-007, M-008, M-009, M-015, M-019 |
| 2f. Profile | `_theme.scss`, `_mobile.scss` | PRF-001, PRF-006 (profile sections in these files) |
| 2g. People dir | `_mobile.scss` (people section), `peopleCard.php`, `peopleFocusGuard.js`, `people/index.php` | PPL-001, PPL-002, PPL-003, PPL-005, PPL-007 |
| 2h. Mail list/composer | `_mail.scss` (conversation list section), `conversation.php` | M-010, M-011, M-013, M-014 |
| 2i. Comment compose JS | `mobileCommentCompose.js` | STM-011 companion fix |

**Dependencies:** Group 2a and 2b must merge before 2c (stream mobile depends on stable nav). Groups 2d, 2f, 2g, 2h, 2i are independent and can run in parallel.

### Task 2a: Mobile nav SCSS polish

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_mobile-bottom-nav.scss`

**Changes:**
- NAV-013: `.nav-label` font-size: `10px` → `clamp(10px, 2.5vw, 12px)` with `line-height: 1.15`
- NAV-015: Add `@media (prefers-reduced-motion: reduce)` guard for `.mobile-sheet-content` and `.mobile-sheet-backdrop` animations
- NAV-016: Add reduced-motion guard for `.mobile-bottom-nav` slideUpNav animation
- NAV-018: `.nav-badge` positioning: `transform: translateX(14px)` → `right: -4px; top: -4px` relative to `.nav-icon`
- NAV-019: Bottom sheet padding-bottom: replace `70px` with `calc(var(--mobile-nav-height, 56px) + 14px)`
- NAV-036: `body::after` safe-area: remove duplicate z-index rule, set once at 1001

- [ ] Fix font-size, reduced-motion, badge positioning, sheet padding, safe-area z-index
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 2b: Mobile nav PHP/JS logic

**Files:** Modify `widgets/MobileBottomNav.php` and `widgets/views/mobileBottomNav.php`

**Changes:**
- NAV-014: Move Calendar into More sheet instead of hiding at ≤380px. Remove the `display:none` rule from SCSS. Inject Calendar into `$dynamicMoreItems` on narrow screens
- NAV-017: Reduce to 5 max items. Calendar always lives in More sheet (remove calendar conditional from nav bar). Adjust the `flex` distribution
- NAV-020: Replace page-reload dark mode toggle with class toggle on `<html>` + async persistence. Keep reload as fallback only
- NAV-021: `updateMobileNavActive()` — replace `path.indexOf('/people')` with `path.split('/')[1] === 'people'`

- [ ] Move Calendar to More sheet
- [ ] Reduce nav to 5 items max
- [ ] Replace dark mode page reload with class toggle
- [ ] Fix path matching
- [ ] Commit

### Task 2c: Stream mobile layout

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_stream.scss`, `themes/ModernTheme2026/scss/humhub/_cards.scss`

**Changes:**
- STM-002: `.wall-entry-footer` — on ≤375px, switch from `flex-wrap: wrap` to `flex-direction: column` or reduce gap/size of action buttons
- STM-003: Remove double-padding from `.wall-entry-body` where `.panel-body` already provides padding
- STM-006: Increase post accent line opacity from 0.68 to 0.8 on mobile
- STM-008: Add `padding: 2px 0` to `.wall-entry` on mobile for tap separation between posts
- STM-009: Replace hardcoded `56px` in `.wall-stream` padding-bottom with `var(--mobile-nav-height, 56px)`
- STM-010: Add a "Show more" link below truncated `.wall-entry-content` on mobile (requires JS)
- STM-011: Comment form on mobile — replace `display:none` with `max-height: 0; overflow: hidden` CSS transition approach, show on interaction
- STM-013: Reply comment avatar: 25px → 28px

- [ ] Fix footer layout on small screens
- [ ] Remove double padding on wall-entry-body
- [ ] Increase accent line opacity
- [ ] Add tap separation between posts
- [ ] Replace hardcoded 56px with variable
- [ ] Add show-more button for truncated content
- [ ] Fix comment form visibility approach
- [ ] Increase reply avatar size
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 2d: Reaction picker fixes

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_reactions.scss`

**Changes:**
- RXN-001: `.mt2026-reaction-picker` z-index: `9999` → `1060` (above modals at 1055, below topbar at 3000 → will be 1030 after Phase 3)
- RXN-003: `.comment-container .wall-entry-controls` with `font-size: 0` — add explicit `font-size: 14px` to ALL child elements that need it, not just `> *`
- RXN-005: Remove duplicate hiding of like count link — keep ONE mechanism (either `font-size:0` or `display:none`, not both)

- [ ] Fix z-index on reaction picker
- [ ] Fix font-size:0 on comment controls — ensure ALL children have explicit font-size
- [ ] Consolidate like count hiding — pick one mechanism
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 2e: Mail mobile layout

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_mail.scss`, modify `resources/js/mailLayout.js`

**Changes in `_mail.scss`:**
- M-007: `.conversation-entry-list` padding-bottom — replace hardcoded `60px` with `var(--mobile-nav-height, 56px)`
- M-008: Composer `.humhub-ui-richtext` min-height: `36px` → `44px`
- M-009: Send button — ensure `.reply-button` has proper mobile sizing (not just `->sm()`)

**Changes in `mailLayout.js`:**
- M-004: Body `overflow: hidden` — use a class `.mt2026-mail-scroll-lock` instead of inline style, so it can be properly cleaned up on navigation
- M-006: Composer position — avoid `position: fixed` → `position: relative` toggle. Use `position: sticky; bottom: 0` with flex layout instead
- M-015: `sizeMobileConversationList()` — remove `!important` from `style.setProperty` calls, use CSS class instead
- M-019: Initial sidebar render flash — ensure `translateX(-102%)` is set in CSS, not toggled by JS after paint

- [ ] Fix composer min-height and send button sizing
- [ ] Replace hardcoded padding with variable
- [ ] Replace inline body overflow with class
- [ ] Replace composer position toggle with sticky approach
- [ ] Remove !important from JS height overrides
- [ ] Fix sidebar flash
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 2f: Profile mobile

**Files:** Modify `themes/ModernTheme2026/scss/_theme.scss`, modify `themes/ModernTheme2026/scss/humhub/_mobile.scss` (profile section)

**Changes:**
- PRF-001: Profile tab `.nav-link` padding: `8px 20px` → `8px clamp(12px, 3vw, 20px)` on mobile
- PRF-006: Profile about page — add `@media (max-width: 767px)` rule to stack label+value vertically with proper spacing

- [ ] Fix profile tab touch targets on mobile
- [ ] Add mobile responsive layout for about page 2-column fields
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 2g: People directory mobile

**Files:** 
- Modify `themes/ModernTheme2026/scss/humhub/_mobile.scss` (people card section)
- Modify `themes/ModernTheme2026/views/user/widgets/peopleCard.php`
- Modify `views/user/people/index.php`
- Modify `resources/js/peopleFocusGuard.js`

**Changes:**
- PPL-001: `.mt2026-people-card` min-height: `140px` → `min-height: clamp(120px, 40vw, 160px)` on mobile
- PPL-002: `.mt2026-pc-name` — add `title` attribute to anchor for full name on hover
- PPL-003: Font sizes: `.mt2026-pc-title` `11px` → `12px`, `.mt2026-pc-phone` `11px` → `12px`
- PPL-005: 2-column grid: replace negative margins with `gap` or positive padding
- PPL-007: Search FAB bottom offset: `70px` → `calc(var(--mobile-nav-height, 56px) + var(--space-4))`

- [ ] Fix min-height with fluid sizing
- [ ] Add title attribute for full name
- [ ] Increase font sizes to meet WCAG minimums
- [ ] Fix 2-column grid overflow
- [ ] Replace magic number with CSS variable
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 2h: Mail conversation list polish

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_mail.scss`

**Changes:**
- M-010: `.conversation-entry-content:not(.own)` — increase bg contrast from `var(--color-bg-secondary)` to something more distinct, or add a subtle border
- M-011: Unread indicator — replace `border-left: 3px solid ...` with `box-shadow: inset 3px 0 0 ...` to avoid layout shift
- M-013: `.messagePreviewEntry` — increase padding from `10px 12px` to `12px 14px` for breathing room
- M-014: Bubble max-width — align mobile `82%` with desktop `min(72%, 760px)` — use `min(85%, 760px)` on both

- [ ] Fix contrast on non-own bubbles
- [ ] Replace border-left with inset box-shadow for unread
- [ ] Increase preview entry padding
- [ ] Align bubble max-width between mobile/desktop
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 2i: Mobile comment compose

**Files:** Modify `resources/js/mobileCommentCompose.js`

**Changes:**
- STM-011 companion: Ensure comment form visibility toggling uses smooth transitions instead of `display: none/block` toggle

- [ ] Read `mobileCommentCompose.js` and refactor show/hide to use opacity/height transitions
- [ ] Commit

---

## Phase 3: Stacking Contexts & Architecture (29h estimated)

**Branch**: `phase-3/architecture`
**Strategy**: File splits + structural changes. Lower parallelism due to dependencies between splits and their consumers.

### File Partition

| Group | Files | Issues |
|-------|-------|--------|
| 3a. Z-index foundation | `_root.scss`, `variables.scss` | MOD-002 (z-index variable alignment) |
| 3b. Dropdown consolidation | `_dropdown.scss`, NEW: `_dropdown-z-index.scss` | DRP-001, DRP-002, DRP-003, DRP-007 |
| 3c. Topbar cleanup | `_topbar.scss` | NAV-003, NAV-035, NAV-005 |
| 3d. Dropdown JS manager | NEW: `resources/js/dropdownManager.js`, update `notifications.js` | JS-003 |
| 3e. SCSS splits | Split `_dark-mode.scss`, `_admin.scss`, `_stream.scss`, `_mail.scss`, `_topbar.scss` (account dropdown) | A-001, A-004, ADM-001, STM-001, M-005, MAINT-001 |
| 3f. Mail SCSS | Split `_mail.scss` into `_mail-layout.scss`, `_mail-bubbles.scss`, `_mail-composer.scss`, `_mail-drawers.scss` | M-005 |
| 3g. Dark mode dedup | Merge duplicate dark mode from component files into split dark mode partials | A-004 |

**Dependencies:** 3a → 3b → 3d (foundation first). 3c is independent. 3e, 3f, 3g can run after 3a.

### Task 3a: Z-index foundation

**Files:** Modify `themes/ModernTheme2026/scss/_root.scss`, `themes/ModernTheme2026/scss/variables.scss`

**Changes:**
- Align `$z-mt2026-modal` (1055) with Bootstrap's `.modal` (1050) — either change variable to 1050 or apply to `.modal`
- Document the 5-layer z-index system:
  - 1000: Bottom nav, page content
  - 1040: Dropdowns, menus
  - 1050: Modals, modal backdrops
  - 1100: Drawers, overlays
  - 3000: System notifications (toasts)

- [ ] Align modal z-index variable with Bootstrap default
- [ ] Document 5-layer system in variables.scss
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 3b: Dropdown z-index consolidation

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_dropdown.scss`

**Changes:**
- DRP-001: Collapse 18+ z-index layers into 3-4:
  - Remove `+30`, `+35`, `+40`, `+55`, `+56` increment patterns
  - `z-dropdown` (1000) for document-level dropdowns
  - `z-dropdown` (1040) for elevated dropdowns within content
  - `z-dropdown` (1050) for modal-context dropdowns
  - Use `isolation: isolate` on `.space-content` and `.layout-content-container`
- DRP-002: Replace `.space-layout-container > .row:first-child` selector with `isolation: isolate` on `.space-content` + explicit stacking on header wrapper
- DRP-003: Replace `position: relative` on `.wall-entry.mt2026-dropdown-open` with `transform: translateZ(0)` to avoid layout shift
- DRP-007: Replace 12-selector overflow chain with JS-driven approach (handled in Task 3d)

- [ ] Consolidate z-index layers to 3-4 levels
- [ ] Replace DOM-order-dependent selector with isolation approach
- [ ] Replace position:relative with translateZ(0)
- [ ] Remove hardcoded overflow chain selectors
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 3c: Topbar cleanup

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_topbar.scss`

**Changes:**
- NAV-003: `#topbar` z-index: `3000` → `1030`. Ensure `.dropdown-menu` inside topbar gets `z-index: 1040`
- NAV-035: Add `isolation: isolate` to `#topbar`
- NAV-005: Remove `#top-menu-sub` display: none rules (lines 349-351, 422-423)
- Adjust `#topbar .dropdown-menu, #topbar .popover, #topbar .tooltip` z-index from 3200 to 1040

- [ ] Reduce topbar z-index to 1030
- [ ] Add isolation:isolate to topbar
- [ ] Remove dead code for #top-menu-sub
- [ ] Adjust topbar dropdown z-indices
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 3d: Universal dropdown manager

**Files:** Create `resources/js/dropdownManager.js`, modify `resources/js/notifications.js`

**Changes:**
- New `dropdownManager.js`:
  - Listens for Bootstrap dropdown `shown.bs.dropdown` and `hidden.bs.dropdown` events
  - On show: finds nearest `.wall-entry`/`.stream-entry`/`.panel` ancestor, adds `.mt2026-dropdown-open` class
  - Toggles `overflow: visible` on the nearest positioned ancestor
  - On hide: removes the class
- Update `notifications.js` to remove its own `.mt2026-dropdown-open` toggling (delegate to manager)

- [ ] Create `dropdownManager.js` with event delegation
- [ ] Update `notifications.js` to remove manual class toggling
- [ ] Register the new JS file in `assets/ModernThemeAsset.php`
- [ ] Remove or simplify the hardcoded overflow chain in `_dropdown.scss`
- [ ] Test dropdowns in: stream, comments, composer, mail, admin, modals
- [ ] Commit

### Task 3e: Split monolithic SCSS files

**Files:** Split `_dark-mode.scss`, `_admin.scss`, `_stream.scss`, `_topbar.scss` (account dropdown), update `build.scss`

**Changes:**
- Split `_dark-mode.scss` (932 lines) into:
  - `_dark-mode-base.scss` (tokens, body, links)
  - `_dark-mode-panels.scss` (panels, cards, sidebar)
  - `_dark-mode-forms.scss` (forms, buttons, inputs, select2)
  - `_dark-mode-components.scss` (modals, dropdowns, alerts, badges, nav-tabs, etc.)
  - `_dark-mode-stream.scss` (stream entries, comments, reactions)
  - `_dark-mode-mail.scss` (mail-specific overrides)
  - `_dark-mode-mobile.scss` (mobile nav, mobile-specific overrides)
- Split `_admin.scss` (359 lines) into:
  - `_admin-layout.scss`
  - `_admin-gridview.scss`
  - `_admin-settings.scss` (color pickers, collapsible groups)
  - `_admin-codemirror.scss`
  - `_admin-dark.scss`
- Split `_stream.scss` (647 lines) into:
  - `_stream-posts.scss` (wall entries, cards, layout)
  - `_stream-comments.scss` (comment entries, forms, replies)
- Extract account dropdown from `_topbar.scss` (lines 530-610) → `_account-dropdown.scss`

- [ ] Create dark mode partials (7 new files)
- [ ] Create admin partials (5 new files)
- [ ] Create stream partials (2 new files)
- [ ] Extract account dropdown partial
- [ ] Update `build.scss` imports
- [ ] Run `php compile-css.php` — verify output unchanged
- [ ] Commit

### Task 3f: Split mail SCSS

**Files:** Split `_mail.scss` (1328 lines) into partials, update `build.scss`

**Changes:**
- Create:
  - `_mail-layout.scss` (desktop fullscreen, height propagation, shell, two-column)
  - `_mail-bubbles.scss` (conversation entries, own/other bubbles, timestamps)
  - `_mail-composer.scss` (composer dock, message form, richtext, buttons, upload)
  - `_mail-drawers.scss` (settings drawer, sidebar overlay, animations)
  - Keep: inbox list, search, dark mode, badges, empty states in `_mail.scss` (~200 lines remaining)

- [ ] Create 4 new mail partials
- [ ] Move sections from `_mail.scss` to new partials
- [ ] Update `build.scss` imports
- [ ] Run `php compile-css.php` — verify output unchanged
- [ ] Commit

### Task 3g: Deduplicate dark mode

**Files:** Modify component SCSS files to remove duplicate dark mode blocks, ensure `_dark-mode-*.scss` partials cover them

**Changes:**
- Remove duplicate dark mode blocks from:
  - `_mobile-bottom-nav.scss` (lines 174-206) — already covered by `_dark-mode-mobile.scss`
  - `_context-switcher.scss` (lines 14-25) — already covered by `_dark-mode-components.scss`
  - `_space-chooser.scss` (lines 281-323) — add to `_dark-mode-panels.scss` if missing
  - `_mail.scss` (lines 1123-1189) — move to `_dark-mode-mail.scss`
  - `_topbar.scss` (lines 599-610) — move to `_dark-mode-base.scss`
  - `_reactions.scss` (lines 219-220, 242-244, 287-289) — move to `_dark-mode-stream.scss`
- Keep unique dark mode rules (mail-specific, reaction-specific) in their respective partials

- [ ] Audit all component files for duplicate dark mode blocks
- [ ] Remove duplicates, ensure coverage in dark mode partials
- [ ] Run `php compile-css.php`
- [ ] Commit

---

## Phase 4: Accessibility, Performance & Polish (19.5h estimated)

**Branch**: `phase-4/polish`
**Strategy**: Independent file groups, maximum parallelism.

### File Partition

| Group | Files | Issues |
|-------|-------|--------|
| 4a. Accessibility SCSS | `_accessibility.scss`, `_topbar.scss` (focus-visible), `_button.scss`, `_reactions.scss` | A-003, A-008, A-011, A-012 |
| 4b. Performance | `_performance.scss`, `_modal.scss`, `_mobile.scss`, `_space-chooser.scss` | PRF-001, PRF-002, PRF-003, PRF-004, PRF-005, PRF-006, MOD-003, SPC-006, NAV-033 |
| 4c. Visual polish nav | `_topbar.scss`, `_space-chooser.scss`, `_context-switcher.scss` | NAV-001, NAV-002, NAV-004, NAV-007, NAV-009, NAV-010, NAV-024, NAV-025, NAV-027 |
| 4d. Visual polish content | `_stream.scss`, `_reactions.scss`, `_cards.scss` | STM-005, STM-007, RXN-004 |
| 4e. Visual polish mail | `_mail.scss` | M-010, M-011, M-013, M-014, M-017 |
| 4f. Visual polish spaces | `_space-chooser.scss`, `_spaces.scss`, `_sidebar.scss` | NAV-028, NAV-029, NAV-030, NAV-031, NAV-032 |
| 4g. Responsive hardening | `_base.scss`, `_mobile.scss`, `_modal.scss` | MOD-001, MOD-006, MOD-007, RSP-001, RSP-002 |
| 4h. Admin polish | `_admin.scss`, `views/config/index.php`, `controllers/ConfigController.php` | ADM-003, ADM-007, CFG-001, CFG-002, CFG-003 |
| 4i. JS a11y | `reactionPicker.js`, `peopleFocusGuard.js`, `paletteSwitcher.js` | A-006, A-007, A-009 |

**Dependencies:** All can run in parallel since Phase 3 structural changes are already in main.

### Task 4a: Accessibility SCSS

**Files:** Modify `themes/ModernTheme2026/scss/_accessibility.scss`, `themes/ModernTheme2026/scss/humhub/_topbar.scss`, `themes/ModernTheme2026/scss/humhub/_button.scss`, `themes/ModernTheme2026/scss/humhub/_reactions.scss`

**Changes:**
- A-003: Add `:focus-visible` outline to notification/action icons in `_topbar.scss` (lines 63-77)
- A-008: Add keyboard shortcut documentation in `_accessibility.scss` (comment block)
- A-011: Add `aria-label` and `aria-pressed` to `.mt2026-reaction-trigger` in `_reactions.scss` (style the ARIA attributes)
- A-012: Replace `clip: rect(0,0,0,0)` with `clip-path: inset(50%)` in `_reactions.scss`
- Also: add `:focus-visible` outline to `.mobile-bottom-nav .nav-item` in `_mobile-bottom-nav.scss`

- [ ] Add focus-visible to nav icons
- [ ] Add keyboard shortcut docs
- [ ] Add ARIA styling for reaction trigger
- [ ] Replace deprecated clip with clip-path
- [ ] Add focus-visible to mobile nav items
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 4b: Performance

**Files:** Modify `themes/ModernTheme2026/scss/_performance.scss`, `_modal.scss`, `_mobile.scss`, `_space-chooser.scss`, `_dropdown.scss`

**Changes:**
- PRF-001: Gate `backdrop-filter: blur(4px)` on `.modal-backdrop` to `@media (min-width: 992px)` only
- PRF-002: Remove or gate `backdrop-filter: blur(12px)` on `.navbar-header` (mobile topbar)
- PRF-003: Reduce `.dropdown-menu` animation to just `opacity` transition (remove `scale-in`)
- PRF-004: `.mt2026-reaction-btn:hover` — remove `translateY(-3px)` on mobile, keep `scale(1.15)` only
- PRF-005: Replace `box-shadow` changes on hover with `opacity` changes where possible
- PRF-006: Add hex fallbacks for `color-mix()` usage
- MOD-003: Performance gate + reduced-motion gate for backdrop blur
- SPC-006, NAV-033: Remove `backdrop-filter` from space chooser on mobile, remove from dropdown menus

- [ ] Gate backdrop-filter to desktop only
- [ ] Remove/reduce mobile backdrop-filter
- [ ] Simplify dropdown animations
- [ ] Reduce reaction button hover movement on mobile
- [ ] Replace box-shadow hover with opacity, add color-mix fallbacks
- [ ] Remove expensive filters from mobile space chooser
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 4c: Visual polish — navigation

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_topbar.scss`, `_space-chooser.scss`, `_context-switcher.scss`

**Changes:**
- NAV-001: Replace `display: none` on `.user-title` at 992-1199px with `max-width: 80px; text-overflow: ellipsis`
- NAV-002: Change `.topbar-brand` max-width to `clamp(120px, 20vw, 200px)` 
- NAV-004: Add `transition: opacity 0.2s, transform 0.2s` to topbar hide on mobile
- NAV-007: Increase notification badge offset to `top: 6px; right: 6px`
- NAV-009: Replace `margin-right: 4px` with `margin-right: var(--space-1)`
- NAV-010: Remove `!important` from light mode color guard where cascade suffices
- NAV-024: Add `max-width: min(180px, 20vw)` for context-label, add `title` attribute
- NAV-025: Center context-switcher-menu on tablet: `left: 50%; transform: translateX(-50%)`
- NAV-027: Add mobile-specific z-index for context switcher overlay (`$z-mt2026-modal` level)

- [ ] Fix user-title truncation at 992-1199px
- [ ] Fix brand logo max-width
- [ ] Add transition to topbar hide
- [ ] Fix badge positioning
- [ ] Replace hardcoded 4px with variable
- [ ] Remove unnecessary !important
- [ ] Fix context-label truncation
- [ ] Center context menu on tablet
- [ ] Fix mobile overlay z-index
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 4d: Visual polish — content

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_stream.scss`, `_reactions.scss`

**Changes:**
- STM-005: Dark mode stream hover — increase `color-mix` primary percentage from `8%` to `15%` for more visible feedback
- STM-007: `.wall-entry-footer` dark mode — add subtle `border-top` or `background: var(--color-bg-tertiary)` to distinguish footer from body
- RXN-004: `.mt2026-reaction-trigger::before` — use a data attribute for the icon so it can be customized, or use `content: attr(data-icon)` pattern

- [ ] Increase dark mode hover visibility
- [ ] Add footer distinction in dark mode
- [ ] Make reaction trigger icon customizable
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 4e: Visual polish — mail

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_mail.scss`

**Changes:**
- M-010: Increase contrast of `.conversation-entry-content:not(.own)` — add `border: 1px solid var(--color-border-light)` for visual distinction from body bg
- M-011: Replace unread `border-left: 3px` with `box-shadow: inset 3px 0 0 var(--color-primary)` to avoid layout shift
- M-013: `.messagePreviewEntry` — padding `10px 12px` → `12px 14px`
- M-014: Align mobile bubble max-width with desktop: use `min(82%, 760px)` on both

- [ ] Add border to non-own bubbles for contrast
- [ ] Replace border-left with box-shadow for unread
- [ ] Increase preview padding
- [ ] Unify bubble max-width
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 4f: Visual polish — spaces

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_space-chooser.scss`, `_spaces.scss`, `_sidebar.scss`

**Changes:**
- NAV-028: Space chooser button — use `var(--color-bg-secondary)` for light mode instead of `rgba(255,255,255,0.05)`
- NAV-029: `.space-name` — replace `display: none` on mobile with `max-width: 60px; text-overflow: ellipsis`
- NAV-030: Fix dark mode fallback colors (`#f8fafc` → `#1e293b`, `#e5e7eb` → `#334155`)
- NAV-031: Create space button — increase prominence with `var(--color-primary)` border and `var(--color-primary-lightest)` background
- NAV-032: Space chooser dropdown max-height — use `min(400px, calc(100vh - 120px))`

- [ ] Fix space chooser button visibility
- [ ] Show space name on mobile with truncation
- [ ] Fix dark mode fallback colors
- [ ] Improve create space button prominence
- [ ] Make dropdown viewport-aware
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 4g: Responsive hardening

**Files:** Modify `themes/ModernTheme2026/scss/humhub/_base.scss`, `_mobile.scss`, `_modal.scss`

**Changes:**
- MOD-001: Replace `8px` gutter in `.modal-dialog` margin with `var(--space-2)`
- MOD-006: Extend responsive block for `.modal-lg` to cover up to `max-width: 1024px`
- MOD-007: Add `max-width: calc(100vw - 32px)` to `.modal-sm` for viewports <400px
- RSP-001: Standardize breakpoints — replace all `767px` with `768px`, `480px` with `576px`. 
  - Note: `991px` is `$breakpoint-lg - 1` and is correct. `767px` and `480px` create non-standard gaps.
- RSP-002: Fix `--transition-base` CSS variable — define it in `_root.scss` or replace with explicit values

- [ ] Fix modal margin gutter
- [ ] Extend modal-lg responsive
- [ ] Fix modal-sm viewport constraint
- [ ] Standardize breakpoints (767→768, 480→576)
- [ ] Fix transition-base variable
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 4h: Admin polish

**Files:** 
- Modify `themes/ModernTheme2026/scss/humhub/_admin.scss`
- Modify `views/config/index.php`
- Modify `controllers/ConfigController.php`

**Changes:**
- ADM-003: Add responsive table alternative for GridView at <576px (stacked card layout)
- ADM-007: Fix palette button border fallback: `#dee2e6` → `#e5e7eb`
- CFG-001: Move 20+ inline styles from `config/index.php` to a `.mt2026-config` SCSS class
- CFG-002: Split `ConfigController::actionIndex()` into separate actions
- CFG-003: Replace hardcoded `#1e6ad6` active border with `var(--color-primary)`

- [ ] Add responsive table for GridView
- [ ] Fix fallback border color
- [ ] Extract inline styles → CSS classes
- [ ] Split controller action
- [ ] Use CSS variable for active border
- [ ] Run `php compile-css.php`
- [ ] Commit

### Task 4i: JS accessibility

**Files:** Modify `resources/js/reactionPicker.js`, `resources/js/peopleFocusGuard.js`, `resources/js/paletteSwitcher.js`

**Changes:**
- A-006: `peopleFocusGuard.js` — replace time-based autofocus suppression (1200ms) with MutationObserver
- A-007: `reactionPicker.js` — add `aria-label` and `aria-pressed` on reaction buttons when toggling
- A-009: `.mobile-bottom-nav .nav-item` — add `aria-current="page"` to active item (already in template but verify JS updates it, and add `aria-pressed` for non-link button items)

- [ ] Refactor peopleFocusGuard autofocus to MutationObserver
- [ ] Add ARIA attributes to reaction buttons
- [ ] Verify mobile nav ARIA is correctly updated by JS
- [ ] Commit

---

## Execution Order Summary

```
Branch: phase-1/critical
├── Task 1a (space() fix) ── runs parallel with ──┐
├── Task 1b (reply fix) ──── runs parallel with ──┤
├── Task 1c (mobile safety) ── runs parallel with ├── ALL PARALLEL
├── Task 1d (stacking/focus) ── runs parallel with─┤
├── Task 1e (mail critical) ── runs parallel with ─┘
└── Task 1f (context a11y) ── AFTER 1c (same file)
         │
         ▼
MERGE phase-1/critical → main

Branch: phase-2/mobile-ux
├── Task 2a (nav SCSS) ──────────────┐
├── Task 2b (nav PHP) ───── AFTER 2a ┤
├── Task 2c (stream) ──── AFTER 2a ──┤
├── Task 2d (reactions) ─────────────┤
├── Task 2e (mail mobile) ───────────┤── MOSTLY PARALLEL
├── Task 2f (profile) ───────────────┤  (2a→2b→2c is sequential chain)
├── Task 2g (people) ────────────────┤
├── Task 2h (mail list) ─────────────┤
└── Task 2i (comment JS) ────────────┘
         │
         ▼
MERGE phase-2/mobile-ux → main

Branch: phase-3/architecture
├── Task 3a (z-index foundation) ──┐
├── Task 3b (dropdown consolidate) ─┤── 3a→3b→3d sequential
├── Task 3c (topbar cleanup) ──────┤  (others parallel after 3a)
├── Task 3d (dropdown JS manager) ──┘
├── Task 3e (SCSS splits) ─────────┐
├── Task 3f (mail split) ──────────┤── PARALLEL after 3a
└── Task 3g (dark mode dedup) ─────┘
         │
         ▼
MERGE phase-3/architecture → main

Branch: phase-4/polish
├── Task 4a (a11y SCSS) ─────┐
├── Task 4b (performance) ───┤
├── Task 4c (nav polish) ────┤
├── Task 4d (content polish) ─┤── ALL PARALLEL
├── Task 4e (mail polish) ───┤
├── Task 4f (spaces polish) ─┤
├── Task 4g (responsive) ────┤
├── Task 4h (admin polish) ──┤
└── Task 4i (JS a11y) ──────┘
         │
         ▼
MERGE phase-4/polish → main
         │
         ▼
DONE
```
