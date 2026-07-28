# Rework Plan: Modern Theme 2026 UI/UX Audit

**Generated**: 2026-07-28
**Module**: modern-theme-2026 v1.0.6
**Scope**: Full UI surface audit — 196 issues across 6 audit areas
**Target device**: 375–430px smartphones (primary), 768px+ tablets, 992px+ desktop

---

## Executive Summary

The audit identified **196 issues**: 17 Critical, 61 Major, 80 Minor, 38 Cosmetic. The theme has strong visual identity and functional coverage but suffers from: (1) excessive `!important` usage creating specificity debt, (2) a fragile z-index stacking system with 18+ layers, (3) mobile experience that feels cramped due to padding/breakpoint inconsistencies, (4) monolithic SCSS files that are hard to maintain, and (5) accessibility gaps in focus management, motion preferences, and touch targets.

The rework is organized into **4 phases** over **~6-8 weeks** of part-time work.

---

## Phase 1: Critical Bugfixes & Safety Net (Week 1)

**Goal**: Fix bugs that break core functionality, cause layout corruption, or fail accessibility requirements. No new features. No refactoring beyond what's needed for the fix.

### Issues addressed:

| Area | ID | Issue | Est. effort |
|------|----|-------|-------------|
| Admin/Overlays | SHT-005 | Undefined `space()` function in `gap: space(3)` — breaks SCSS compilation | 5m |
| Admin/Overlays | SHT-006 | Undefined `space()` function in `padding: space(4) space(2)` — breaks SCSS compilation | 5m |
| Stream | STC-001 | Reply comments functionally broken — `display:none !important` on reply toggle hides reply capability entirely | 1h |
| Navigation | NAV-011 | Body `padding-bottom: !important` conflicts with mail composer and other fixed elements | 30m |
| Navigation | NAV-012 | `body::after` pseudo-element at `z-index: 10000` overlaps all modals/drawers | 30m |
| Navigation | NAV-022 | Context switcher mobile overlay targets wrong breakpoint (768px vs 991px) — dead zone | 1h |
| Navigation | NAV-026 | Context switcher uses `display:none` — screen reader inaccessible | 30m |
| Navigation | NAV-034 | Guest users see unstyled legacy space chooser | 2h |
| Admin/Overlays | DRP-005 | Mail composer dropdown z-index (1035) below modal backdrop (1040) | 30m |
| Admin/Overlays | JS-001 | No focus trap in modal — WCAG 2.1 AA failure | 2h |
| Mail | M-001 | Neutral Gray palette: primary button contrast fails on own message bubbles | 30m |
| Mail | M-002 | Settings drawer HTML built in JS string concat — no i18n, XSS risk | 2h |
| Mail | M-003 | Back navigation traps page in `overflow: hidden` state | 1h |
| Accessibility | A-010 | Empty `alt` attributes missing on decorative reaction emoji icons | 30m |

**Total Phase 1**: ~12h

**Dependencies**: None — these are independent fixes.

**Files that will be modified**:
- `themes/ModernTheme2026/scss/humhub/_mobile-bottom-nav.scss` (space() function fix)
- `themes/ModernTheme2026/scss/humhub/_stream.scss` (reply comment fix)
- `themes/ModernTheme2026/scss/humhub/_mobile.scss` (body padding fix)
- `themes/ModernTheme2026/scss/humhub/_context-switcher.scss` (breakpoint fix)
- `widgets/views/contextSwitcher.php` (a11y fix for display:none)
- `themes/ModernTheme2026/views/humhub/layouts/main.php` (guest chooser)
- `themes/ModernTheme2026/scss/humhub/_dropdown.scss` (mail composer z-index)
- `resources/js/modalFocusFix.js` (focus trap rewrite)
- `resources/js/mailLayout.js` (settings drawer security + back nav)
- `views/mail/views/mail/conversation.php` (Neutral Gray fix)

**Verification**: Each fix tested on 375px emulation + desktop. `php compile-css.php` must complete without errors. Run Playwright tests.

---

## Phase 2: Mobile UX Overhaul (Weeks 2-3)

**Goal**: Eliminate the "squished, clunky, claustrophobic" feeling on mobile devices (375-430px). Focus on spacing, touch targets, and visual breathing room.

### Sub-phase 2A: Mobile Bottom Navigation (Week 2)

| Issue | Description | Est. effort |
|-------|-------------|-------------|
| NAV-013 | Nav label `font-size: 10px` → increase to 11px with fluid sizing | 15m |
| NAV-017 | 5-6 nav items crammed on 375px → reduce to 5 max, merge Calendar into More sheet | 1h |
| NAV-014 | Calendar hidden at ≤380px → move to More sheet instead of hiding | 1h |
| NAV-015 | Bottom sheet animations not reduced-motion gated | 30m |
| NAV-016 | `slideUpNav` not reduced-motion gated | 15m |
| NAV-018 | `.nav-badge` positioning fragile via `translateX(14px)` → use `top/right` offsets | 15m |
| NAV-019 | Bottom sheet `padding-bottom: calc(70px + ...)` hardcodes nav height → use CSS variable | 10m |
| NAV-020 | Dark mode toggle reloads page → use class toggle + async persist | 2h |
| NAV-021 | Active state path-based matching fragile → use path segment matching | 30m |
| NAV-036 | Safe-area z-index 10000 duplicated → reduce to 1001, consolidate | 10m |
| STM-009 | Mobile stream bottom padding uses hardcoded 56px → use variable | 15m |

**Total Phase 2A**: ~6.5h

### Sub-phase 2B: Stream & Content Mobile (Week 3)

| Issue | Description | Est. effort |
|-------|-------------|-------------|
| STM-002 | `.wall-entry-footer` flex-wrap causes awkward multi-row layout on 375px | 1h |
| STM-003 | `.wall-entry-body` double padding from `.panel-body` + explicit padding | 30m |
| STM-006 | Post accent line `opacity: 0.68` too subtle on mobile | 15m |
| STM-008 | Mobile stream entries zero padding reduces tap area between posts | 15m |
| STM-010 | `.wall-entry-content` mobile 50vh truncation with gradient only — add "show more" button | 2h |
| STM-011 | Comment form hidden on mobile (`display:none`) — JS-dependent show toggle | 1h |
| STM-013 | Reply comment avatar too small (25px) → increase to 28px | 15m |
| RXN-001 | Reaction picker `z-index: 9999` excessively high → reduce to 1060 | 10m |
| RXN-003 | `font-size: 0` on comment controls hides all children without explicit font-size | 30m |
| RXN-005 | Like count link double-hidden (font-size:0 AND display:none) | 15m |

**Total Phase 2B**: ~6.5h

### Sub-phase 2C: Mobile Mail, Profile & People (Week 3 continued)

| Issue | Description | Est. effort |
|-------|-------------|-------------|
| M-004 | History scroll restoration broken by `overflow: hidden; height: 100dvh` | 2h |
| M-006 | Mobile composer `position: fixed` causes layout shift when entering fullscreen | 1h |
| M-007 | Conversation list padding-bottom 60px — content hidden behind fixed composer | 30m |
| M-008 | Composer `min-height: 36px` too small for comfortable typing | 15m |
| M-009 | Send button uses `->sm()` — too small on mobile | 15m |
| M-013 | `.messagePreviewEntry` min-height 64px with padding 10px 12px — cramped | 30m |
| M-015 | JS `sizeMobileConversationList()` overrides height with `!important` — fragile | 30m |
| M-019 | Sidebar overlay initial render can flash due to `translateX(-102%)` | 30m |
| PRF-001 | Profile tab padding 8px 20px too small on mobile | 15m |
| PRF-006 | Profile about page 2-column layout has no mobile breakpoint handling | 1h |
| PPL-001 | People card min-height: 140px insufficient on 375px 2-column grid | 30m |
| PPL-002 | `.mt2026-pc-name` truncated — no way to see full name | 15m |
| PPL-003 | People card font sizes 11px below WCAG 1.4.4 recommendation | 15m |

**Total Phase 2C**: ~7.5h

**Phase 2 total**: ~20.5h

**Dependencies**: Phase 1 must be complete (critical fixes provide a stable baseline). Sub-phases 2A, 2B, 2C can run in parallel.

---

## Phase 3: Stacking Contexts & Layout System (Weeks 4-5)

**Goal**: Reduce the z-index layering system from 18+ fragile layers to 4-5 stable layers. Eliminate `!important` usage where possible. Fix structural layout issues.

### Sub-phase 3A: Z-Index Consolidation (Week 4)

| Issue | Description | Est. effort |
|-------|-------------|-------------|
| DRP-001 | 18+ z-index layers across dropdown.scss — reduce to 4-5 stable layers | 4h |
| DRP-002 | `.space-layout-container > .row:first-child` DOM-order dependent fix | 1h |
| DRP-003 | `.mt2026-dropdown-open` JS class may not elevate correctly in overflow:visible containers | 1h |
| DRP-007 | Composer overflow chain uses 12+ hardcoded selectors | 1h |
| DRP-004 | Glassmorphism on dropdowns causes performance issues | 1h |
| NAV-003 | Topbar `z-index: 3000` — lower to `1030` and adjust dependent selectors | 30m |
| NAV-035 | Topbar missing `isolation: isolate` — stacking context leaks | 10m |
| MOD-002 | Modal z-index variable defined but unused | 10m |
| SHT-001 | Mobile sheet z-index 1100 can be overlapped | 30m |
| JS-003 | `.mt2026-dropdown-open` class only toggled by notifications.js — add universal dropdown manager | 2h |
| A-002 | Non-`!important` alternatives considered for `.bg-light` and `.bg-white` overrides | 1h |

**Total Phase 3A**: ~12.5h

### Sub-phase 3B: CSS Architecture Improvements (Week 5)

| Issue | Description | Est. effort |
|-------|-------------|-------------|
| A-001 | `_dark-mode.scss` 932 lines — split into per-component dark mode partials | 3h |
| A-004 | Duplicate dark mode in component files AND `_dark-mode.scss` — deduplicate | 2h |
| ADM-001 | `_admin.scss` does 7 distinct things — split into 5 partials | 2h |
| STM-001 | `_stream.scss` 647 lines — split into `_stream-posts.scss`, `_stream-comments.scss` | 1h |
| M-005 | `_mail.scss` 1328 lines — split into 4-5 partials | 3h |
| MAINT-001 | `_topbar.scss` 80-line account dropdown `!important` reset — extract to `_account-dropdown.scss` | 1h |
| NAV-005 | `#top-menu-sub` dead code — remove 17 lines | 10m |
| NAV-008 | Account dropdown 80 lines of `!important` — consolidation | 2h |
| RSP-001 | 4 different mobile breakpoints used (991px, 768px, 767px, 480px) — standardize to 2-3 | 2h |
| RSP-002 | SCSS variable `--transition-base` doesn't exist as CSS var — fix references | 30m |

**Total Phase 3B**: ~16.5h

**Phase 3 total**: ~29h

**Dependencies**: Phase 2 must be complete. Phase 3A (z-index consolidation) must precede Phase 3B (SCSS decomposition) since file splits are easier after structural changes.

---

## Phase 4: Accessibility, Performance & Polish (Weeks 6-8)

**Goal**: WCAG 2.1 AA compliance, performance optimization, visual polish, and responsive hardening.

### Sub-phase 4A: Accessibility Hardening (Week 6)

| Issue | Description | Est. effort |
|-------|-------------|-------------|
| A-003 | No `:focus-visible` on notification/action icons and nav items | 30m |
| A-005 | Focus trap not implemented in `modalFocusFix.js` | 2h |
| A-006 | `peopleFocusGuard.js` time-based autofocus suppression heuristic | 1h |
| A-007 | Reduced-motion: gate ALL animations (sheets, picker, nav, pop, backdrop) | 1h |
| A-008 | Keyboard navigation help: document keyboard shortcuts | 30m |
| A-009 | `.mobile-bottom-nav .nav-item` uses `:active` opacity-only feedback | 15m |
| A-011 | Reaction trigger button lacks ARIA attributes (aria-label, aria-pressed) | 30m |
| A-012 | `.likeLinkContainer[data-mt2026-reactions]` uses deprecated `clip: rect()` | 15m |
| MAIL-012 | Settings drawer settings list lacks keyboard navigation between items | 30m |
| DRP-006 | Desktop notification dropdown 420px width overflows on smaller viewports | 30m |
| SPC-003 | `.space-name` truncated — add `title` attribute for full name on hover | 15m |

**Total Phase 4A**: ~7.5h

### Sub-phase 4B: Performance (Week 7)

| Issue | Description | Est. effort |
|-------|-------------|-------------|
| PRF-001 | `backdrop-filter: blur()` on modals — gate to desktop only | 30m |
| PRF-002 | `backdrop-filter: blur()` on mobile topbar — remove or gate | 15m |
| PRF-003 | `.dropdown-menu` glassmorphism + fade-in + scale-in = 3 concurrent animations | 1h |
| PRF-004 | `.mt2026-reaction-btn:hover` scale+translate on 5 buttons simultaneously | 15m |
| PRF-005 | Multiple `box-shadow` changes on hover — triggers layout | 30m |
| PRF-006 | `color-mix()` usage — verify browser support, provide fallback | 30m |
| MOD-003 | Modal backdrop blur — no performance gate, not reduced-motion gated | 15m |
| SPC-006 | Space chooser `backdrop-filter` on mobile — remove | 15m |
| NAV-033 | Space chooser dropdown `backdrop-filter: blur(12px)` — mobile perf | 15m |

**Total Phase 4B**: ~4h

### Sub-phase 4C: Visual Polish & Responsive Hardening (Week 7-8)

| Issue | Description | Est. effort |
|-------|-------------|-------------|
| NAV-001 | User-title hidden at 992-1199px — add graceful truncation instead of hide | 30m |
| NAV-002 | `.topbar-brand` max-width 180px clips logo on medium screens | 15m |
| NAV-004 | Topbar vanishes instantly on mobile — add transition | 30m |
| NAV-007 | Notification badge overlaps bell icon | 15m |
| NAV-009 | Hardcoded 4px margin instead of `var(--space-1)` | 5m |
| NAV-010 | Unnecessary `!important` on light mode color guard | 15m |
| NAV-024 | `.context-label` truncation — add `title` attribute | 15m |
| NAV-025 | Context switcher tablet menu alignment | 15m |
| NAV-027 | Context switcher mobile overlay z-index can be overlapped | 10m |
| NAV-028 | Space chooser button barely visible on light backgrounds | 15m |
| NAV-029 | Space name hidden on mobile — use truncation | 15m |
| NAV-030 | Dark mode fallback colors use light values | 10m |
| NAV-031 | Create space button `2px dashed` low prominence | 15m |
| NAV-032 | Space chooser dropdown max-height not viewport-aware | 15m |
| STM-005 | Dark mode stream hover: 8% primary mix — too subtle for feedback | 15m |
| STM-007 | `.wall-entry-footer` background transparent in dark mode — no card footer distinction | 30m |
| RXN-004 | `.mt2026-reaction-trigger::before` hardcoded FA icon | 30m |
| M-010 | `.conversation-entry-content:not(.own)` bg too close to body bg on light mode | 30m |
| M-011 | Unread indicator `border-left: 3px` pushes content — use `box-shadow` inset instead | 15m |
| M-014 | Mobile bubble max-width 82% vs desktop `min(72%, 760px)` — inconsistency | 15m |
| MOD-001 | Modal 8px gutter arbitrary — use `--space-2` | 10m |
| MOD-006 | `.modal-lg` no responsive handling near 992px | 15m |
| MOD-007 | `.modal-sm` unattainable on 375px — add viewport constraint | 15m |
| ADM-003 | GridView min-width forces mobile scroll — add card-style alternative | 2h |
| ADM-007 | Palette button border fallback color mismatch | 10m |
| CFG-003 | Hardcoded active palette border color | 15m |
| PPL-005 | People 2-column grid negative margins can cause overflow | 15m |
| PPL-007 | Search FAB bottom offset uses magic number 70px | 10m |

**Total Phase 4C**: ~8h

**Phase 4 total**: ~19.5h

---

## Effort Summary

| Phase | Description | Est. hours | Dependencies |
|-------|-------------|------------|--------------|
| 1 | Critical Bugfixes & Safety | ~12h | None |
| 2A | Mobile Bottom Navigation | ~6.5h | Phase 1 |
| 2B | Stream & Content Mobile | ~6.5h | Phase 1 |
| 2C | Mobile Mail, Profile, People | ~7.5h | Phase 1 |
| 3A | Z-Index Consolidation | ~12.5h | Phase 2 |
| 3B | CSS Architecture | ~16.5h | Phase 2, 3A |
| 4A | Accessibility Hardening | ~7.5h | Phase 3 |
| 4B | Performance | ~4h | Phase 3 |
| 4C | Visual Polish & Responsive | ~8h | Phase 3 |
| **Total** | | **~81h** | |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking HumHub core compatibility | Low | Critical | All changes stay within module directory. No core overrides. |
| SCSS compilation failures after restructuring | Medium | High | Run `php compile-css.php` after every file modification. Keep backup of original file structure. |
| Z-index consolidation causes new stacking bugs | Medium | High | Test with dropdown open in every context: modal, mail, stream, composer, admin. Test dark mode + dropdowns. |
| Mobile nav layout changes break responsive views | Medium | Medium | Test on 375px, 768px, 992px, 1400px. Use Playwright tests. |
| Reply comment restore breaks comment UX | Medium | Critical | Verify comment reply functionality manually on post, comment, and mobile. |
| Dark mode deduplication causes visual regression | Medium | Medium | Side-by-side comparison of all components before/after in dark mode. |
| Browser support for `color-mix()` | Low | Low | Provide hex fallback for `color-mix()` where possible. |

---

## Test Plan

### Per-Phase Tests
1. **Phase 1**: Compile CSS, verify reply comments work, verify modal focus trap, check guest view
2. **Phase 2**: Mobile screenshot comparison at 375px, 768px. Verify all nav items clickable. Check mail composer on mobile.
3. **Phase 3**: Open dropdown on every page type (dashboard, space, profile, admin, mail). Verify no stacking bugs. Compile CSS.
4. **Phase 4**: Run accessibility audit (axe DevTools). Check contrast ratios. Verify reduced-motion. Profile performance (DevTools Performance tab).

### Full Regression Suite
- Admin Panel → enable/disable module
- View stream in light + dark mode
- Post a comment, reply to comment
- React with each emoji type
- Open mail conversation, send message
- Open/close all modals
- Use keyboard navigation (Tab, Enter, Escape)
- Resize from 320px to 1920px

---

## File Change Inventory (Consolidated)

Files needing changes across all phases:

**SCSS (22 files)**:
- `themes/ModernTheme2026/scss/humhub/_mobile-bottom-nav.scss` — Phase 1 (space()), Phase 2 (nav items), Phase 4 (reduced-motion)
- `themes/ModernTheme2026/scss/humhub/_stream.scss` — Phase 1 (reply fix), Phase 2 (mobile layout), Phase 4 (visual polish)
- `themes/ModernTheme2026/scss/humhub/_mobile.scss` — Phase 1 (body padding), Phase 2 (stream), Phase 4 (responsive)
- `themes/ModernTheme2026/scss/humhub/_context-switcher.scss` — Phase 1 (breakpoint), Phase 4 (a11y)
- `themes/ModernTheme2026/scss/humhub/_dropdown.scss` — Phase 1 (z-index), Phase 3 (consolidation)
- `themes/ModernTheme2026/scss/humhub/_mail.scss` — Phase 2 (mobile), Phase 3 (split), Phase 4 (visual)
- `themes/ModernTheme2026/scss/humhub/_dark-mode.scss` — Phase 3 (deduplicate), Phase 4 (contrast)
- `themes/ModernTheme2026/scss/humhub/_topbar.scss` — Phase 3 (z-index), Phase 4 (polish)
- `themes/ModernTheme2026/scss/humhub/_modal.scss` — Phase 3 (z-index), Phase 4 (perf)
- `themes/ModernTheme2026/scss/humhub/_admin.scss` — Phase 3 (split), Phase 4 (grid)
- `themes/ModernTheme2026/scss/humhub/_space-chooser.scss` — Phase 4 (visual, perf)
- `themes/ModernTheme2026/scss/humhub/_reactions.scss` — Phase 2 (z-index), Phase 4 (a11y)
- `themes/ModernTheme2026/scss/humhub/_sidebar.scss` — Phase 3 (z-index)
- `themes/ModernTheme2026/scss/humhub/_spaces.scss` — Phase 4 (visual)
- `themes/ModernTheme2026/scss/humhub/_cards.scss` — Phase 3 (z-index)
- `themes/ModernTheme2026/scss/humhub/_button.scss` — Phase 4 (a11y active states)
- `themes/ModernTheme2026/scss/humhub/_base.scss` — Phase 4 (responsive)
- `themes/ModernTheme2026/scss/_theme.scss` — Phase 2 (profile tabs mobile), Phase 4
- `themes/ModernTheme2026/scss/_accessibility.scss` — Phase 4 (reduced-motion, focus)
- `themes/ModernTheme2026/scss/_performance.scss` — Phase 4 (backdrop-filter gates)
- `themes/ModernTheme2026/scss/_root.scss` — Phase 3 (new z-index variables)
- `themes/ModernTheme2026/scss/variables.scss` — Phase 3 (z-index variable refactor)

**PHP (7 files)**:
- `Events.php` — No changes expected (event handlers are stable)
- `widgets/views/contextSwitcher.php` — Phase 1 (a11y display:none fix)
- `widgets/MobileBottomNav.php` — Phase 2 (nav items, Calendar logic)
- `widgets/views/mobileBottomNav.php` — Phase 2 (dark mode, Calendar in More)
- `controllers/ConfigController.php` — Phase 4 (CFG-002 split actions)
- `views/config/index.php` — Phase 4 (inline styles → CSS classes)
- `views/user/people/index.php` — Phase 2 (mobile people layout)

**JavaScript (8 files)**:
- `resources/js/modalFocusFix.js` — Phase 1 (focus trap rewrite)
- `resources/js/mailLayout.js` — Phase 1 (settings drawer security), Phase 2 (mobile layout)
- `resources/js/reactionPicker.js` — Phase 4 (a11y ARIA attributes)
- `resources/js/notifications.js` — Phase 3 (dropdown management)
- `resources/js/peopleFocusGuard.js` — Phase 4 (mutation-based autofocus)
- `resources/js/paletteSwitcher.js` — Phase 4
- `resources/js/mobileCommentCompose.js` — Phase 2
- (New) `resources/js/dropdownManager.js` — Phase 3 (universal dropdown z-index management)

---

## Recommended Sprint Plan

| Sprint | Duration | Focus | Phases |
|--------|----------|-------|--------|
| Sprint 1 | 1 week | Safety + Reply Fix | Phase 1 |
| Sprint 2 | 1 week | Mobile Nav | Phase 2A |
| Sprint 3 | 1 week | Stream & Content Mobile | Phase 2B |
| Sprint 4 | 1 week | Mail, Profile, People Mobile | Phase 2C |
| Sprint 5 | 1 week | Z-Index + Dropdown Manager | Phase 3A |
| Sprint 6 | 1 week | SCSS Architecture Split | Phase 3B |
| Sprint 7 | 1 week | Accessibility + Performance | Phase 4A + 4B |
| Sprint 8 | 1 week | Visual Polish + Test Pass | Phase 4C + regression |

**Total**: ~8 weeks of focused effort.
