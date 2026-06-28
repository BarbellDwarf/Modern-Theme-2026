# Modern Theme 2026 - AI Agent Guidelines

This document provides comprehensive guidelines for AI agents working on the Modern Theme 2026 HumHub module. This is a **standalone theme module** that adds contemporary design, mobile navigation, and emoji reactions to HumHub.

## Module Overview

**Modern Theme 2026** is a HumHub theme module featuring:
- Contemporary glassmorphism design with depth effects  
- Self-contained theme (no Clean Theme dependency)
- Custom mobile bottom navigation for thumb-friendly UX
- Emoji reaction picker (👍 ❤️ 😂 😮 😢 🙏)
- Adaptive color palettes (4 presets)
- Full WCAG 2.1 AA accessibility compliance
- Real-time animations and microinteractions

**Minimum HumHub Version**: 1.18.0

## Architecture Overview

### Directory Structure

```
modern-theme-2026/
├── Module.php              # Main module bootstrap class
├── config.php              # Module configuration & events
├── Events.php              # Event listeners for theme lifecycle
├── module.json             # Module metadata and version
├── requirements.php        # Installation requirements (empty)
├── assets/
│   └── ModernThemeAsset.php # JavaScript asset bundle registration
├── controllers/
│   ├── ConfigController.php # Admin configuration UI
│   └── ReactionsController.php # Reaction API endpoints
├── migrations/
│   ├── m260401_000000_add_reaction_type_to_like.php
│   └── uninstall.php       # Cleanup on uninstall
├── resources/
│   └── js/                 # JavaScript modules for frontend
│       ├── contextSwitcher.js
│       ├── mailLayout.js   # Mail/messenger UI (Telegram-style, search, settings drawer)
│       ├── mobileCommentCompose.js
│       ├── mobileKeyboardFix.js
│       ├── mobileSwipeFix.js
│       ├── modalFocusFix.js
│       ├── notifications.js
│       ├── paletteSwitcher.js
│       ├── peopleFocusGuard.js
│       └── reactionPicker.js
├── themes/
│   └── ModernTheme2026/    # The actual theme files
│       ├── scss/           # SCSS stylesheets
│       ├── resources/      # Theme assets (icons, images)
│       └── views/          # PHP view files (layout, etc)
├── widgets/
│   ├── ReactionPicker.php  # Reaction UI widget
│   ├── MobileBottomNav.php # Mobile navigation widget
│   ├── ContextSwitcher.php # Context switcher widget
│   └── views/              # Widget view templates
└── views/
    ├── admin/              # Admin layout overrides
    ├── config/             # Admin config views
    ├── mail/               # Mail/messenger view overrides
    │   └── views/mail/
    │       ├── index.php
    │       └── conversation.php
    ├── reactions/          # Reaction-related views
    └── user/               # User profile & people directory overrides
        ├── people/index.php
        └── profile/_layout.php, about.php, home.php
```

### Lifecycle Overview

1. **Install** → Migrations run → Theme registered
2. **Enable** → `Module::enable()` → Sets ModernTheme2026 active → Builds CSS
3. **Usage** → Events hook into page rendering → Widgets render → CSS loads
4. **Disable** → Reverts to default HumHub theme → Cleanup runs
5. **Uninstall** → `uninstall.php` migration removes any DB changes

## Critical Boundaries: NEVER Edit Outside This Module

⚠️ **STRICT RULE**: All modifications **MUST** stay within `/var/www/humhub/protected/modules/modern-theme-2026/`

### Files You MUST NEVER Edit

- HumHub core files in `/var/www/humhub/protected/yii/` 
- Standard HumHub themes in `/var/www/humhub/themes/`
- HumHub modules other than this one
- Database schema (except via migrations in this module)
- HumHub configuration files (`/var/www/humhub/protected/config/`)
- Web server configuration

### Module Dependencies

This module depends on:
- HumHub core (1.18.0+)
- Yii2 framework (bundled with HumHub)
- Clean Theme (parent for some component initialization)

**Do NOT add external dependencies** unless absolutely necessary and documented.

## Key Components

### 1. Theme System (SCSS)

**Location**: `themes/ModernTheme2026/scss/`

All theme styling is in SCSS with variables driving the design:

- **`variables.scss`**: Design tokens (colors, shadows, typography, spacing)
- **`_root.scss`**: CSS custom properties (dynamic theme switching)
- **`_theme.scss`**: Main theme stylesheet  
- **`_mixins.scss`**: Reusable SCSS mixins for glassmorphism, shadows, etc.
- **`_accessibility.scss`**: WCAG 2.1 AA compliance helpers
- **`_performance.scss`**: Performance optimization utilities
- **`build.scss`**: Main entry point for compilation

**When modifying SCSS**:
1. Add variables to `variables.scss` first
2. Use CSS custom properties for dynamic values
3. Maintain 4 color palettes (Professional Blue, Creative Purple, Fresh Green, Neutral Gray)
4. Always test accessibility (contrast, keyboard nav)
5. Check mobile rendering (responsive breakpoints in `_mixins.scss`)

### 2. Widgets (PHP Classes)

**Location**: `widgets/`

Widgets provide reusable UI components:

#### ReactionPicker Widget
- **File**: `widgets/ReactionPicker.php`
- **Purpose**: Display emoji reactions and picker UI
- **Reactions**: Like 👍, Love ❤️, Laugh 😂, Sad 😢, Pray 🙏
- **Supported**: Posts, comments, any content with `contentId` and `contentClass`
- **Usage**: Called via PHP template rendering
- **View**: `widgets/views/reactionPicker.php`

#### MobileBottomNav Widget
- **File**: `widgets/MobileBottomNav.php`
- **Purpose**: Thumb-friendly navigation bar for mobile (< 768px)
- **Features**: Home, People, Spaces, Notifications, Profile
- **Auto-renders**: Via `EVENT_END_BODY` event
- **View**: `widgets/views/mobileBottomNav.php`
- **Cached**: Spaces list cached 5 min per user, notifications cached 60 sec

#### ContextSwitcher Widget
- **File**: `widgets/ContextSwitcher.php`
- **Purpose**: Space/user context dropdown navigation
- **Keyboard**: Ctrl/Cmd+K shortcut for power users

**When adding widgets**:
1. Extend `yii\base\Widget` or appropriate parent
2. Add comprehensive docblocks
3. Cache expensive DB queries (see MobileBottomNav)
4. Validate user permissions and guest handling
5. Create view template in `widgets/views/`
6. Register via Events.php if auto-rendering needed

### 3. Events (Module Hooks)

**Location**: `Events.php`

Events are lifecycle hooks that render widgets and register assets:

| Event | When | Purpose |
|-------|------|---------|
| `View::EVENT_BEGIN_BODY` | Start of `<body>` | Register theme JavaScript assets |
| `View::EVENT_END_BODY` | End of `<body>` before `</body>` | Render mobile bottom nav widget |
| `TopMenu::EVENT_RUN` | Top menu building | Remove redundant "Spaces" item |

**Rules for Events**:
1. Check if theme is active via `Module::isThemeBasedActive()`
2. Skip if user is guest (unless public page)
3. Skip AJAX requests to avoid double-rendering
4. Wrap in try-catch and log errors, never throw
5. Cache expensive data to avoid performance issues

### 4. Asset Registration

**Location**: `assets/ModernThemeAsset.php`

JavaScript modules are bundled for web asset serving:

```php
public $js = [
    'js/contextSwitcher.js',
    'js/reactionPicker.js',
    // ... more modules
];
```

**Rules for Assets**:
1. Register in `ModernThemeAsset::$js`
2. Source path: `'@modern-theme-2026/resources'` (module alias)
3. All depends must list `'humhub\assets\AppAsset'`
4. Use Yii2 namespace aliases, never hardcode paths
5. Load via `ModernThemeAsset::register($view)` in Events

### 5. Module Bootstrap

**Location**: `Module.php`

The module class extends `humhub\components\Module` and manages:
- Theme activation on enable
- CSS compilation on enable  
- Theme revert on disable
- CSS cleanup

**Key Methods**:
- `enable()`: Activate theme and build CSS
- `disable()`: Revert to default theme
- `getConfigUrl()`: Link to admin config page
- `getName()`, `getDescription()`: Metadata

**Rules**:
1. Never modify HumHub settings directly
2. Only interact with `ThemeHelper::buildCss()` for CSS
3. Use Yii logging: `Yii::error()`, `Yii::debug()`
4. Handle exceptions gracefully
5. Return proper enable/disable status

## Development Workflow

### Adding a New Feature

1. **Create in module only**: Feature goes in `modern-theme-2026/` folder
2. **Add widget or event**: If UI needed, create widget + view template
3. **Register in Events.php**: If page rendering needed
4. **Update SCSS**: Add styles to theme
5. **Register JS**: Add to `ModernThemeAsset.php` if needed
6. **Test lifecycle**: Enable/disable module, verify installation works
7. **Test permissions**: Verify guest/user handling
8. **Documentation**: Update README or widget docblocks

### Modifying Existing Features

1. **Locate the code**: Find in module structure
2. **Check usage**: Search for references (especially in views)
3. **Maintain compatibility**: HumHub 1.18.0+ must work
4. **Test thoroughly**: Including mobile, accessibility, performance
5. **Cache handling**: Invalidate relevant caches if modifying cached data
6. **Documentation**: Update if behavior changes

### Installation/Uninstallation

**Installation Process**:
1. Files extracted to module directory
2. `config.php` parsed and module registered
3. Migrations run (creates DB table if needed)
4. `Module::enable()` called → theme activated
5. CSS compiled via `ThemeHelper::buildCss()`

**Uninstallation Process**:
1. `uninstall.php` migration runs (removes DB changes)
2. `Module::disable()` reverts theme to default
3. Module files can be safely deleted

**Critical**: No remnants should be left in HumHub files or database.

## Code Standards

### PHP

- Use full namespace: `namespace humhub\modules\modernTheme2026;`
- PSR-4 autoloading (folder structure matches namespace)
- Add docblocks to all public methods
- Type hints for parameters and returns
- Use Yii utilities: `Yii::$app`, `Yii::error()`, etc.
- Exception handling: always try-catch, log errors

### SCSS

- Variables in `variables.scss` with `$var-name` convention
- CSS custom properties for dynamic values: `var(--color-primary)`
- Mobile-first approach: base styles, then breakpoints
- BEM naming for component classes: `.mt2026-component__element--modifier`
- Use mixins from `_mixins.scss` for consistency

### JavaScript (ES6+)

- Module pattern: IIFE or ES6 modules
- Event listeners on specific data attributes: `data-mt2026-component`
- No jQuery unless necessary (HumHub provides it)
- Cache DOM queries
- Responsive design: test on 320px+ screens

## Testing Checklist

Before considering changes complete, verify:

- [ ] **Theme Activation**: Module enable/disable works without errors
- [ ] **CSS Building**: No CSS compilation errors
- [ ] **Mobile View**: Responsive at 320px, 768px, 1920px widths
- [ ] **Guest Access**: Guest users don't see admin/user-only features  
- [ ] **Performance**: No console errors, fast load times
- [ ] **Accessibility**: Tab navigation, ARIA labels, color contrast
- [ ] **Browser Support**: Chrome, Firefox, Safari, Mobile browsers
- [ ] **Dark/Light Mode**: Palette switching works smoothly
- [ ] **Caching**: Cached data invalidates correctly
- [ ] **Permissions**: Reaction/message features check user permissions

## Common Patterns

### Cache Key Convention

Always prefix cache keys with module prefix:
```php
$cacheKey = 'mbn_notif_' . $userId;  // mbn = mobile-bottom-nav
$cacheKey = 'rp_reactions_' . $contentId;  // rp = reaction-picker
```

### Event Checking

Always verify theme is active before processing:
```php
$module = static::getModuleIfThemeActive();
if (!$module) return;  // Theme not active, skip
```

### View Rendering

Render widget views via render() method:
```php
return $this->render('reactionPicker', ['data' => $data]);
```

### ⚠️ HumHub Controller View Overrides — Self-Contained via pathMap

**Do NOT place view overrides outside this module.** Use Yii2's `pathMap` system instead.

The `Events::onBeforeAction()` handler registers path mappings at request time, pointing HumHub's view resolver to override files inside this module:

```php
// Events.php — onBeforeAction registers this mapping:
'@humhub/modules/user/views/people'  →  '@modern-theme-2026/views/user/people'
```

This means view overrides live at:
```
views/user/people/index.php   ✅ Inside the module — ships with the module
```

**Never** place overrides at:
```
/var/www/humhub/themes/HumHub/views/…    ❌ Outside module — breaks portability
themes/ModernTheme2026/views/…           ❌ Wrong dir — never loaded by HumHub
```

**Adding a new view override:**
1. Create the file at `views/[moduleId]/[controller]/[viewName].php` inside this module
2. Add its path mapping to `Events::onBeforeAction()`:
```php
Yii::getAlias('@humhub/modules/[moduleId]') . '/views/[controller]'
    => $modulePath . '/views/[moduleId]/[controller]',
```
3. No changes needed outside the module

**Currently active overrides (tracked here):**
- `views/user/people/index.php` — People page: adds `mt2026-people-search-panel` class to hide search panel on mobile; wraps invite button in `.mt2026-people-invite-btn`

## File Structure Summary

### Never Edit These (HumHub Core)
- `/var/www/humhub/protected/` (except this module)
- `/var/www/humhub/themes/` (standard themes)
- `/var/www/humhub/modules/` (other modules)

### Always Work In These (Module Files)
- `modern-theme-2026/Module.php` - Module bootstrap
- `modern-theme-2026/Events.php` - Lifecycle events
- `modern-theme-2026/config.php` - Configuration
- `modern-theme-2026/widgets/` - UI components
- `modern-theme-2026/themes/ModernTheme2026/` - All theme files
- `modern-theme-2026/resources/js/` - JavaScript modules
- `modern-theme-2026/migrations/` - Database changes

## Quick Reference: Most Common Tasks

| Task | Location | Key File |
|------|----------|----------|
| Add theme colors | `themes/ModernTheme2026/scss/variables.scss` | Color section |
| Create new widget | `widgets/NewWidget.php` | Create class + view |
| Add page render hook | `Events.php` | Add event handler |
| Add theme JavaScript | `assets/ModernThemeAsset.php` | Add to `$js` array |
| Modify mobile nav | `widgets/MobileBottomNav.php` + scss | Mobile-specific |
| Update SCSS styles | `themes/ModernTheme2026/scss/` | Relevant `.scss` file |
| Handle new config option | `views/config/index.php` + `Module.php` | Both files |
| Add DB schema change | `migrations/` | New migration file |

## Safe Operations

✅ These are safe to do:
- Add new SCSS files (will be included in build.scss)
- Add new JavaScript modules (register in ModernThemeAsset)
- Create new widgets or Events handlers
- Modify theme files within `themes/ModernTheme2026/`
- Add migrations for module-specific DB changes
- Update module configuration

❌ These are forbidden:
- Edit files outside `modern-theme-2026/` directory
- Modify HumHub core classes
- Add external npm dependencies
- Change database schema without migration
- Edit other modules
- Modify web server configuration
- Create files outside module structure

## Debugging & Error Handling

**Enable Debug Mode**:
```bash
# In /var/www/humhub/protected/config/main-local.php
'debug' => true,
'logLevel' => ['trace', 'error', 'warning'],
```

**Check Logs**:
```bash
tail -f /var/www/humhub/protected/runtime/logs/app.log
```

**Verify Theme Active**:
```bash
# Check which theme is active via HumHub admin panel
# Or in code: Theme::find()->where(['active' => 1])->one();
```

**Cache Flush**:
- Admin Panel → Settings → Advanced → Caching → "Flush Caches"
- Or: `Yii::$app->cache->flush();` in code
- Or CLI: `rm -rf /var/www/humhub/runtime/cache/*`

**CSS Compilation**:
```bash
php /var/www/humhub/protected/modules/modern-theme-2026/compile-css.php
```
This writes to both `themes/ModernTheme2026/resources/css/theme.css` and the published assets directory. After compilation, clear the runtime cache and the published assets directory to force regeneration:
```bash
rm -rf /var/www/humhub/runtime/cache/*
rm -rf /var/www/humhub/assets/decca576
```

## ⚠️ CSS Specificity: Working with the Clean Theme

The Clean Theme's CSS is loaded FIRST (stylesheet index 0), and our module's CSS is loaded SECOND (stylesheet index 1). However, the Clean Theme uses `!important` extensively, which means our rules need `!important` to override them in many cases.

### Known DOM Structure & Override Patterns

**Stream Entry DOM:**
```
.s2_streamContent > .wall-entry (transparent wrapper)
  > .panel.panel-default (the actual card — has bg, border, shadow)
    > .panel-body
      > .wall-entry-header (flex, align-items: center)
      > .wall-entry-body (content text)
      > .wall-entry-footer (action bar)
      > .stream-entry-addons.clearfix
        > .wall-entry-controls.wall-entry-links
        > .comment-container.bg-light.p-2.mt-3
```

**Key Override Rules:**
- `.s2_streamContent > .wall-entry` — Clean Theme sets `background: transparent !important`. To override, use `background-color: ... !important` (NOT `background` shorthand, which gets overridden by Clean Theme's `background` shorthand).
- `.comment-container.bg-light` — Bootstrap's `.bg-light` class has `background-color: ... !important`. Override with `background-color: transparent !important` on `.comment-container.bg-light`.
- `.wall-entry .wall-entry-body` — Clean Theme sets `padding-left: 50px; padding-right: 50px`. Override with `padding-left: ... !important; padding-right: ... !important`.
- `.wall-entry .wall-entry-header` — Clean Theme sets `padding-bottom: 10px; margin-bottom: 10px`. Override with `!important`.

**General Rule:** When the Clean Theme uses `!important`, our module must also use `!important` with equal or higher specificity to win. When the Clean Theme does NOT use `!important`, our module's later position in the stylesheet (index 1 vs index 0) is sufficient.

### CSS Compilation Note

The `compile-css.php` script reads custom colors from the database using environment variables (`HUMHUB_DB_*`). When running outside the HumHub context (e.g., standalone theme development), it falls back to default colors. The compiled CSS is written to two locations:
1. `themes/ModernTheme2026/resources/css/theme.css` — for theme manager compatibility
2. Published assets directory (e.g., `assets/decca576/resources/css/theme.css`) — for web serving

## Recent Improvements (June 2026)

### Post & Comment Visual Overhaul
- Header: `align-items: center` — avatar and name vertically centered
- Content padding: 50px → 16px (`var(--space-4)`)
- Font size: 13px → 14px (`var(--font-size-base)`), line-height 1.6
- Accent line: gradient line at top of each post card
- Footer: removed blue-tinted background, clean border separator
- Comment container: transparent background (overrides `.bg-light`), proper padding
- Comment entries: proper spacing, 32px avatars, hover states
- Comment form: 44px min-height input, focus ring with box-shadow
- Comment controls: inline-flex, muted color, hover → primary

### Performance & Security Fixes
- `forceCopy` on asset publishing gated to `YII_DEBUG` only
- XSS fix in `notifications.js` — switched from string concat to `.attr()`
- Scroll handler debounced in `reactionPicker.js`
- `-webkit-overflow-scrolling: touch` removed from all SCSS (deprecated)
- `will-change` anti-pattern removed from `_performance.scss`
- Duplicate SCSS blocks consolidated (`_theme.scss` → `_accessibility.scss`)
- Wrong CSS variable names fixed (`var(--secondary)` → `var(--color-secondary)`)
- `--color-primary-rgb` defined in `_root.scss`

### Cache & Session Optimizations
- Full cache flush → targeted key deletion in `ConfigController.php`
- Session write only when data changes in `ContextSwitcher.php`
- TopMenu built once per request via static cache in `MobileBottomNav.php`
- Error handling: `@mkdir` and `file_put_contents` now check return values
- PDO error mode set to `ERRMODE_EXCEPTION` in `compile-css.php`
- Hardcoded table name → `HUMHUB_DB_TABLE_PREFIX` env var

### JavaScript Improvements
- `mobileCommentCompose.js` converted to `humhub.module()` pattern
- Event listener cleanup/teardown added to all JS modules
- Silent AJAX failures now logged with `module.log.error()`
- `'wow'` reaction type added to `ReactionPicker.php` (was missing from widget)
- Duplicate view files removed (kept `views/` copies, removed theme copies)

### Mail/Messenger UI Overhaul (June 2026)
- Telegram-style message bubbles: own messages use `var(--color-primary)` background with white text, others use `var(--color-bg-secondary)` background
- 40px avatars in conversation list
- Conversation list search with 150ms debounce filtering
- Settings drawer with Enter-to-send toggle, font scaling (100-150%), formatting bar toggle
- Back button on mobile to return from conversation to list
- Rewrote `mailLayout.js` with `unload`/teardown, `MutationObserver`, debounce, Escape key, focus management, ARIA
- Mail settings added to admin config page (`ConfigController.php`, `views/config/index.php`)
- Removed inline styles from `conversation.php`, added CSS classes
- Fixed composer gap: removed 92px padding-bottom on entry list, reduced composer sizing (dock padding 4px, input min-height 36px, buttons 36px, border-radius 10px with focus ring)
- Fixed mobile composer gap: `padding-bottom: 60px` on `.conversation-entry-list` when composer is `position: fixed`
- Fixed desktop padding: `body.mt2026-mail-page { padding-bottom: 0 }` on desktop
- Fixed AJAX-loaded conversation gap: `#mail-conversation-root > .panel.panel-default { margin: 0 !important; height: 100%; display: flex; flex-direction: column; }` — conversation content is loaded via AJAX into `#mail-conversation-root`, so `.col-lg-8.messages > .panel` never matches; generic `.panel` rules from Clean Theme (like `margin-top: 50px`, `margin-bottom: 15px`) leak in without this override
- `#mail-conversation-root { display: flex; flex-direction: column; }` ensures flex chain propagates
- Empty states: `.mt2026-mail-empty-state` with icon, title, text sub-elements, centered with muted colors
- Search "no results" empty state: `updateSearchEmptyState()` in `mailLayout.js` injects styled message when search filters out all entries
- Dark mode for empty states: proper color tokens in `[data-bs-theme="dark"]`
- Mail SCSS reduced from 1842→1316 lines, eliminated 462 `!important`
- Mail composer uses `position: relative` in flex flow on mobile (not fixed), except on fullscreen mobile where it's `position: fixed` at `bottom: calc(56px + env(safe-area-inset-bottom, 0))`

### Reply Comments Flattened (June 2026)
- Reply comments flattened on all screen sizes (same padding, heading, avatar as top-level)
- Reply links hidden on all screen sizes (`display: none !important`)
- Removed desktop nesting block with thread lines and smaller avatars
- Fixed `·` text node separator in comment-level controls (`font-size: 0`)
- Toned down dark mode hover effect on posts (reduced shadow opacity, subtle bg mix)
- Made dark mode `.stream-entry-addons` and `.wall-entry-footer` transparent

## Maintenance & Versioning

- **Version**: Track in `module.json`
- **Changelog**: Maintain CHANGES-SESSION-*.md files
- **Migrations**: Always create for DB changes
- **Backwards Compatibility**: Must support HumHub 1.18.0+

---

**Created**: April 2026  
**Module**: Modern Theme 2026  
**Audience**: AI agents working on module development & maintenance
