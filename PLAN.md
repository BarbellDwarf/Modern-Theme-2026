# Modern Theme 2026 — Implementation Plan v1.0.6

## Project State (Before Changes)

**37 SCSS files** (~10,500 lines) in `themes/ModernTheme2026/scss/`
**10 JS files** in `resources/js/`
**8 PHP backend files** (Module, Events, AdminController, ContextSwitcher, EditMenuLinkForm, ModuleManagerWidget, reactionPicker widget)
**13 module view overrides** + **5 theme view overrides**
**3 Playwright test files** in `tests/playwright/`

## Architectural Notes

- SCSS is compiled by `compile-css.php` using scssphp. No Gulp/Webpack.
- Output: `themes/ModernTheme2026/resources/css/theme.css` → copied to `dist/theme.css`
- Main layout loads CSS via `Yii::$app->assetManager->publish()` from the theme's `dist/` dir
- Theme is fully self-contained — no npm/composer runtime dependencies
- `database.json` defines schema migrations (reaction_type column on like table)
- Min HumHub version: 1.18.0

---

## Phase 1 — Dark Mode Audit & Fix (CRITICAL)

### Goal
Eliminate every hardcoded light-mode color in dark-mode contexts. All `[data-bs-theme="dark"]` blocks must use only `--color-*` CSS custom properties defined in `_dark-mode.scss`.

### Audit findings across all SCSS files

| File | Lines | Violation | Fix |
|------|-------|-----------|-----|
| `_mail.scss` | 1407-1444 | Uses `--color-bg-dark` / `--color-bg-darker` (non-standard tokens) | Replace with `--color-bg-secondary` / `--color-bg-tertiary` |
| `_mail.scss` | 1417, 1427, 1431 | `background: var(--color-bg-darker, #111827)` — wrong fallback | Use standard tokens, no hex fallbacks |
| `_mail.scss` | 1409, 1413, 1436, 1441 | `border-color: rgba(255,255,255,0.1)` — hardcoded alpha | Replace with `var(--color-border)` + proper opacity mix |
| `_calendar.scss` | 235-286 | `rgba(255,255,255,0.04)`, `rgba(255,255,255,0.05)` — hardcoded | Use `color-mix(in srgb, var(--color-bg-tertiary) X%, transparent)` |
| `_context-switcher.scss` | 14-25 | Hardcoded hex `#1e2a3a`, `#e2e8f0`, `rgba(255,255,255,0.08)` | Remove inline dark vars; rely on global `--cs-bg` etc from `_dark-mode.scss` token override |
| `_theme.scss` | 294-329 | Profile tabs use `var(--color-border, rgba(0,0,0,0.12))` — hardcoded fallbacks | Remove `rgba(...)` fallbacks, use only `--color-*` vars with dark-mode-safe defaults |
| `_mobile.scss` | 182-187 | Stream inner panel: `background: var(--color-bg-primary) !important` — missing dark override | Add `[data-bs-theme="dark"]` override for `.s2_streamContent > .wall-entry > .panel` |
| `_mobile.scss` | 352-456 | People card `box-shadow: 0 2px 8px rgba(0,0,0,0.08)` — hardcoded | Replace with `var(--shadow-sm)` |
| `_mobile.scss` | 640 | `.mt2026-notification-mobile-bar` uses `#{$gray-50}` — fixed compile-time color | Use `var(--color-bg-secondary)` instead |
| `_mobile.scss` | 244, 249 | Dropdown max-width hardcoded calc | Replace with `var(--space-*)` |
| `_cards.scss` | 93, 96 | `.wall-entry-controls` fade on hover — opacity 0/1 fine but `@media (hover)` is pointer-device only | Add dark mode `opacity` override if needed |
| `_admin.scss` | 167, 173, 177, 185-188 | Has dark mode in lines 252-360 — already correct ✅ | No change |
| `_admin.scss` | 166-189 | `.collapsible-fields-group` uses `--color-border, #e5e7eb` fallbacks acceptable | But verify dark mode override at line 341-353 covers everything |
| `_stream.scss` | 121, 123, 130, 182 | Uses `color-mix(in srgb, var(--color-primary) X%, ...)` — this IS theme-aware ✅ | No change needed |
| `_stream.scss` | 231-233 | Wall controls dark mode colors | Uses `var(--color-text-secondary, #9ca3af)` — acceptable |
| `_reactions.scss` | 236-238 | Dark mode badge background uses `--color-bg-elevated` (non-standard token) | Replace with `--color-bg-tertiary` |
| `_reactions.scss` | 282-284 | Dark mode trigger `.reacted` uses `rgba(var(--color-primary-rgb), 0.2)` — acceptable ✅ | No change |
| `_root.scss` | (unknown) | Must be verified for dark token emission | Read + verify `--color-*` is complete |
| `_performance.scss` | — | Uses `contain: style` — acceptable ✅ | No change |
| `_accessibility.scss` | — | Uses `var()` with hex fallbacks — acceptable ✅ | No change |
| `_space-chooser.scss` | 18-19, 179, 248, 338 | Hardcoded `rgba(30, 106, 214, ...)` and `rgba(255,255,255,0.05)` — SCSS vars compiled to hex | Replace with `var(--color-primary)` and `var(--color-bg-secondary)` |
| `_palette-switcher.scss` | (all) | No dark mode violations found ✅ | No change |
| `_modal.scss` | (all) | Uses `--color-*` vars with hex fallbacks ✅. No `env(safe-area-inset-bottom)` on mobile | Add safe-area padding for mobile bottom-sheet modals |
| `_button.scss` | 168-169 | `.btn-icon` 38×38px — below 44px touch target | Bump to 44×44px on mobile |
| `_form.scss` | 52 | `rgba($danger, 0.1)` — SCSS variable compiles to fixed hex at build time | Replace with `color-mix(in srgb, var(--color-danger) 10%, transparent)` |
| `_dropdown.scss` | (all) | Uses `--color-*` vars — correct ✅. Scale-in animation at 250ms bouncy bezier | Reduce to 150ms for snappier feel |
| `_badge.scss` | (all) | Uses `--color-*` vars — correct ✅ | No change |
| `_gridview.scss` | (all) | Uses `--color-*` vars — correct ✅ | No change |
| `_list-group.scss` | (all) | Uses `--color-*` vars — correct ✅. Hover uses `translateX(4px)` — inconsistent direction | Standardize to `translateY(-1px)` |
| `_mixins.scss` | (all) | No color violations — contains only utility mixins ✅ | No change |

### Execution
1. Read every unread SCSS partial and check for hardcoded light-mode colors in dark contexts
2. Fix each violation: replace hardcoded color values with `--color-*` variables
3. Add missing `[data-bs-theme="dark"]` blocks where necessary
4. Test: toggle light↔dark on all 6 priority pages — no white flashes, no invisible text, no unreadable contrast
5. Verify: all `color-mix()` usage uses `--color-primary` (not hardcoded rgba)

---

## Phase 2 — Feed / Stream Parity (HIGH)

### Goal
All three feed entry points (Home, Space, Profile) render identically with the single-box pattern. Polls and calendar events in stream get dedicated styling.

### Tasks
1. **Verify selector coverage** — ensure `.s2_streamContent .wall-entry` / `.s2_streamContent .stream-entry` rules in `_stream.scss` match DOM output for:
   - Home feed (`#dashboard .s2_streamContent`)
   - Space feed (`.space-layout-container .layout-content-container .s2_streamContent`)
   - Profile feed (`.profile-layout-container .layout-content-container .s2_streamContent` or similar)
   - If selectors don't match, add the correct ancestors

2. **Poll stream entry styling** — (SKIPPED: polls module not installed in this instance)

3. **Calendar stream entry styling** — add SCSS to `_stream.scss` targeting:
   - `.calendar-entry` or `.content-topic-calendar` in stream
   - Event date/time display
   - Event badges/tags
   - Verify DOM by inspecting a calendar event in-stream

4. **Tablet (768-991px) single-box consistency** — ensure `_mobile.scss:169-187` (inner panel as card on mobile) doesn't conflict with `_stream.scss:118-209` (outer wall-entry as card on desktop). Add unified approach:
   - **Mobile (≤991px)**: inner panel IS the visible card (current mobile.scss approach)
   - **Desktop (≥992px)**: outer wall-entry IS the visible card, inner panel transparent (current stream.scss approach)
   - Ensure no double-box at any breakpoint

5. **Desktop post composer** — add SCSS to `_stream.scss` for the ProseMirror toolbar on desktop:
   - `.post-form .ProseMirror-menubar` — subtle border, clear active states
   - `.post-form .richtext-create-buttons` — spacing and alignment
   - Match the mobile style (horizontal scrollable row) but with proper desktop padding

6. **Mobile post form toolbar** — collapse ProseMirror formatting bar on mobile (like comments do):
   - Currently only comment toolbar is hidden on mobile; post creation toolbar still shows Aa/B/I/S buttons
   - Add `display: none` on `.post-form .ProseMirror-menubar` for mobile if not needed, or make collapsible

7. **"Read more" truncation for long stream entries** on mobile:
   - Add `max-height: 40vh` + gradient fade (via `::after` pseudo-element) to `.wall-entry .content` on mobile
   - Toggle via JS click to expand full post
   - Use CSS `overflow: hidden` + `-webkit-line-clamp` as progressive enhancement

8. **Always-visible stream controls** (remove opacity:0 hover pattern):
   - `_cards.scss:88-106` — remove `opacity: 0` from `.wall-entry-controls` on desktop
   - Keep controls always visible at all breakpoints (remove `@media (hover: hover)` conditional)
   - This makes the feed more intuitive — user doesn't need to discover controls via hover

9. **Stream action link touch targets** on mobile:
   - Ensure `.wall-entry-links a`, `.like.toggleLike`, `.comment.toggleComment` have `min-height: 44px`
   - Current `min-height: 28px` on like links is below WCAG minimum

---

## Phase 3 — Interaction Polish (MEDIUM)

### Goal
Reaction picker, comment threads, and mail work reliably at all breakpoints with no z-index or overlap issues.

### Tasks
1. **Nested reply z-index audit**
   - `_reactions.scss:84-89` sets `.single-comment` z-index: 20 — verify this covers 3+ levels of nesting
   - Ensure `.mt2026-reaction-picker` (z-index: 9999, position: fixed via JS) always appears above all nesting levels
   - If nested comments clip the picker, increase z-index per nesting level or use `position: fixed`

2. **Desktop ProseMirror toolbar**
   - Style `.ProseMirror-menubar` with theme colors (currently only mobile is handled in `_richtext.scss`)
   - Add `_stream.scss` rules for desktop post form toolbar

3. **Notification dropdown**
   - `_topbar.scss:295-314` sets 420px width + scroll — verify with 20+ notifications
   - Mobile bar (`_mobile.scss:640-681`) — verify toggle works

4. **Calendar event modal**
   - `_calendar.scss` covers most cases but verify:
     - Date picker styling in dark mode
     - Recurrence/reminder checkboxes in dark mode
     - Mobile responsiveness (bottom-sheet style?)

5. **Mail composer overlap**
   - `_mail.scss` has extensive z-index management (1050, 1060, 1090) — verify no overlap with mobile bottom nav (z-index 1000) or modals (z-index 1055)
   - Verify `.mt2026-mail-composer-dock` (z-index 1050) doesn't overlap `.mobile-bottom-nav` (z-index 1000)

6. **Reaction trigger touch target** — `_reactions.scss:9-10`:
   - Bump `.mt2026-reaction-trigger` from 28×28px to 44×44px on mobile
   - Ensure the 28px emoji icon inside stays centered within the 44px hit area

7. **Uniform hover animations** — standardize across all interactive elements:
   - `.card` hover: `translateY(-2px)` → change to `translateY(-1px)`
   - `.list-group-item` hover: `translateX(4px)` → change to `translateY(-1px)`
   - `.btn` hover: `translateY(-1px)` — already correct, keep
   - Single direction (translateY only), single timing (150ms ease-out)

8. **Standardize border-radius across components**:
   - **Small elements** (buttons, inputs, badges, pills): `--radius` (8px) [currently correct ✅]
   - **Containers** (cards, panels, stream entries): `--radius-lg` (12px) [currently correct ✅]
   - **Dropdowns & modals**: `--radius-lg` (12px) [currently correct ✅]
   - **Pills/chips** (like `.mt2026-mobile-pill`): `--radius-full` (9999px) [currently uses 22px — unify to var]
   - Audit all `border-radius` values that don't use `--radius` variables; replace with token

9. **Swipe gestures for mobile mail**:
   - Add `touchstart`/`touchend` listeners to `.mt2026-mail-drawer` for swipe-left/right
   - Swipe left → open drawer, swipe right → close drawer (complements existing hamburger tap)
   - Use CSS `transition: transform 0.25s ease` for smooth swipe animation

10. **Aria-labels on stream action buttons**:
    - `.mt2026-reaction-trigger` — add `aria-label` showing current reaction count (e.g., "Like (3)")
    - Ensure screen readers can identify Like/Comment/Share buttons — verify HumHub core renders `aria-label` or add fallback

11. **Safe-area-inset-bottom on mobile modals and bottom-sheets**:
    - `.modal-content` on mobile (≤991px): add `padding-bottom: max(16px, env(safe-area-inset-bottom, 0px))`
    - `.mobile-bottom-nav`: add `padding-bottom: env(safe-area-inset-bottom)` to prevent home bar overlap
    - `.mt2026-mail-composer-dock`: add safe-area padding

---

## Phase 4 — Visual Regression Testing (MEDIUM)

### Goal
Create a Playwright test suite that catches regressions before they ship.

### Tasks
1. **Install Playwright browsers** (if not already):
   ```bash
   cd /var/www/humhub/protected/modules/modern-theme-2026
   npx playwright install chromium
   ```

2. **Test matrix**:

   | Dimension | Values |
   |-----------|--------|
   | Breakpoints | 375px (mobile), 768px (tablet), 1440px (desktop) |
   | Theme | light, dark |
   | Pages | Home feed, Space feed, Profile, People, Mail, Admin |
   | Content types | Text post, Image post, Poll, Calendar event (in stream) |

3. **Component snapshots**:
   - Stream entry (each content type) — with reactions, with comments
   - Reaction picker open/closed
   - Post composer empty/with content
   - Comment thread (0, 1, 5, 20 replies)
   - Mobile bottom nav (all 5 items)
   - Context switcher (0, 5, 20+ spaces)
   - Notification dropdown (mixed types, 0, 10, 30 items)
   - People FAB search open/closed
   - Mail conversation (short, long, blocked)
   - Admin settings page

4. **Interaction tests**:
   - Theme toggle: light → dark → light — no flash
   - Reaction pick: click → emoji appears → count updates
   - Comment toggle: open → type → submit → appears
   - Mobile hamburger: menu opens and closes
   - Context switcher: open → search → select

---

## Phase 5 — Admin & Performance (LOW)

### Goal
All admin pages render with proper spacing. CSS size is within standard bounds.

### Tasks
1. **Admin page verification** — test each admin sub-layout:
   - Users (list, edit, permissions)
   - Spaces (list, edit)
   - Settings (Design, General, Advanced, Caching)
   - Information (all tabs)
   - Modules (list, enable/disable)

2. **CSS size audit**:
   - Current compiled CSS (`dist/theme.css`): measure size
   - Identify unused Bootstrap components (modals? tooltips? carousel? accordion?)
   - Remove unused partials from `build.scss` or mark as optional

3. **CSS containment review**:
   - `_performance.scss` uses `contain: style` on `.panel`, `.card`, `.s-wall-entry`, `.list-group-item`
   - Verify no dropdown/popover/modal content is clipped by containing contexts
   - If overlays break, remove `contain` from parent elements

4. **Print styles**:
   - `_theme.scss:240-267` has basic print styles — test on stream, profile, mail
   - Ensure print doesn't show mobile bottom nav or topbar

---

## Phase 6 — Code Cleanliness & Tech Debt (LOW)

### Goal
Remove all compile-time color embedding, fix SCSS interpolation that bypasses CSS custom property system, and ensure all colors propagate correctly through theme toggles.

### Tasks
1. **Replace SCSS-interpolated colors with CSS vars**:
   - `_mobile.scss:640` — `#{$gray-50}` → `var(--color-bg-secondary)`
   - `_form.scss:52` — `rgba($danger, 0.1)` → `color-mix(in srgb, var(--color-danger) 10%, transparent)`
   - `_space-chooser.scss:179, 248, 338` — `rgba(30, 106, 214, X)` → `color-mix(in srgb, var(--color-primary) X%, transparent)`

2. **Standardize color-mix ratios**:
   - Currently `_stream.scss` uses 6% primary tint, `_mail.scss` uses 20% for similar effects
   - Agree on convention: 8-12% for subtle backgrounds, 20% for hover states, 30% for active states
   - Apply consistently across all `color-mix()` calls

3. **Remove non-standard CSS custom property tokens**:
   - `_mail.scss:1407-1444` — `--color-bg-dark` / `--color-bg-darker` (non-standard)
   - `_reactions.scss:236-238` — `--color-bg-elevated` (non-standard)
   - Replace with `--color-bg-secondary` / `--color-bg-tertiary` which are already defined in `_dark-mode.scss`

4. **Consistent shadow tokens**:
   - Currently `box-shadow: 0 2px 8px rgba(0,0,0,0.08)` in `_mobile.scss:352-456` (people cards)
   - Replace with `var(--shadow-sm)` — already defined in `_root.scss`
   - Audit all `box-shadow` values in SCSS files and replace with `--shadow-*` tokens

5. **Dropdown animation timing**:
   - `_dropdown.scss` scale-in at 250ms with `cubic-bezier(0.68, -0.55, 0.265, 1.55)` (bouncy)
   - Reduce to 150ms for snappier UX
   - Mobile bottom nav slide-up: reduce from 300ms to 200ms

6. **Ensure CSS custom property emission**:
   - Read `_root.scss` and verify all `--color-*` tokens used in the theme are emitted as fallbacks
   - No token should be consumed without being defined somewhere in the cascade

## Priority Order & Estimated Effort

```
Phase 1 — Dark Mode Audit    ⭐⭐⭐ HIGH   ~6-8 hours     ← START HERE
Phase 2 — Feed Parity        ⭐⭐⭐ HIGH   ~8-10 hours
Phase 3 — Interaction Polish ⭐⭐  MED    ~10-14 hours
Phase 4 — Visual Tests       ⭐⭐  MED    ~4-6 hours
Phase 5 — Admin & Perf       ⭐   LOW     ~2-4 hours
Phase 6 — Code Cleanliness   ⭐   LOW     ~3-5 hours
```

## Compilation & Deploy Workflow

```bash
# After each phase:
php compile-css.php                              # Compile SCSS → CSS
php /var/www/humhub/protected/yii cache/flush-all  # Clear humhub cache
rm -rf /var/www/humhub/assets/*                   # Remove stale published assets
```

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- iOS Safari, Chrome Android

## Next Steps

The user confirmed: implement phase by phase. Starting with **Phase 1 (Dark Mode)**.
