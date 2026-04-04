# Modern Theme 2026 - AI Agent Guidelines

This document provides comprehensive guidelines for AI agents working on the Modern Theme 2026 HumHub module. This is a **standalone theme module** that adds contemporary design, mobile navigation, and emoji reactions to HumHub.

## Module Overview

**Modern Theme 2026** is a HumHub theme module featuring:
- Contemporary glassmorphism design with depth effects  
- Self-contained theme (no Clean Theme dependency)
- Custom mobile bottom navigation for thumb-friendly UX
- Emoji reaction picker (👍 ❤️ 😂 😢 🙏)
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
│       ├── reactionPicker.js
│       ├── mobileKeyboardFix.js
│       ├── paletteSwitcher.js
│       ├── notifications.js
│       ├── peopleFocusGuard.js
│       └── modalFocusFix.js
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
    ├── config/             # Admin config views
    └── reactions/          # Reaction-related views
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

## Maintenance & Versioning

- **Version**: Track in `module.json`
- **Changelog**: Maintain CHANGES-SESSION-*.md files
- **Migrations**: Always create for DB changes
- **Backwards Compatibility**: Must support HumHub 1.18.0+

---

**Created**: April 2026  
**Module**: Modern Theme 2026  
**Audience**: AI agents working on module development & maintenance
