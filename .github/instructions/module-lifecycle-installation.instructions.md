---
description: "Use when working on module installation, uninstallation, theme lifecycle, database migrations, or testing module setup. Covers clean installation, proper theme activation, CSS building, and complete remnant removal."
name: "Module Lifecycle & Installation"
---

# Module Lifecycle & Installation Guidelines

## Overview

Modern Theme 2026 is designed as a **self-contained, cleanly installable module** that requires no modifications to HumHub core files and leaves no remnants when uninstalled. All lifecycle operations live within `/var/www/humhub/protected/modules/modern-theme-2026/`.

## Installation Process

### Step 1: Module Discovery

HumHub scans `protected/modules/` for `config.php` and loads the module configuration:

```
/var/www/humhub/protected/modules/modern-theme-2026/
├── config.php         ← HumHub reads this during module discovery
└── module.json        ← Metadata (version, requirements, etc.)
```

**What Happens**:
- HumHub parses `config.php` 
- Module is registered in the system
- Icon defined in Module.php appears in Admin Panel → Modules

### Step 2: Database Migrations

When module is enabled, HumHub runs all migrations in `migrations/`:

```php
// migrations/m260401_000000_add_reaction_type_to_like.php
public function up()
{
    // Creates DB table (only if module uses reactions)
    $this->createTable('reaction', [
        'id' => $this->primaryKey(),
        'content_id' => $this->integer()->notNull(),
        // ... columns
    ]);
}
```

**Execution Order**:
1. Check migration history (prevent re-running)
2. Run each migration in `up()` sequentially
3. Record completion in `migration` table

### Step 3: Theme Activation

`Module::enable()` is called:

```php
public function enable()
{
    // 1. Call parent enable
    $enabled = parent::enable();
    if (!$enabled) return false;
    
    // 2. Activate theme
    $this->enableTheme();  // Sets ModernTheme2026 as active
    
    // 3. Build CSS
    try {
        ThemeHelper::buildCss();
    } catch (Exception $e) {
        Yii::error('CSS build failed: ' . $e->getMessage(), 'modern-theme-2026');
        return false;
    }
    
    return true;
}

private function enableTheme()
{
    // Find ModernTheme2026 theme and set as active
    $theme = Theme::find()->where(['url' => self::THEME_NAME])->one();
    if ($theme) {
        $theme->active = 1;
        $theme->save();
    }
}
```

### Step 4: Assets Served

On page load, HumHub serves compiled CSS and JavaScript:

```
Asset Files Created by Compilation:
/var/www/humhub/assets/[hash]/resources/css/theme.css    ← Compiled SCSS
/var/www/humhub/assets/[hash]/resources/js/...           ← JavaScript bundles
```

## Lifecycle Events

### Event 1: `View::EVENT_BEGIN_BODY`

Fires at `<body>` tag start. Used to register JavaScript assets:

```php
// Events.php
public static function onViewBeginBody($event)
{
    // Skip AJAX requests
    if (Yii::$app->request->isAjax) return;
    
    // Verify theme is active
    $module = static::getModuleIfThemeActive();
    if (!$module) return;
    
    // Skip guest users (user-only module)
    if (Yii::$app->user->isGuest) return;
    
    // Register JavaScript asset bundle
    try {
        ModernThemeAsset::register($event->sender);
    } catch (\Exception $e) {
        Yii::error('Asset registration failed: ' . $e->getMessage(), 'modern-theme-2026');
    }
}
```

**Timing**: Very beginning of page render, before other content

### Event 2: `View::EVENT_END_BODY`

Fires at `</body>` tag end. Used to render widgets:

```php
public static function onViewEndBody($event)
{
    // Skip AJAX
    if (Yii::$app->request->isAjax) return;
    
    $module = static::getModuleIfThemeActive();
    if (!$module) return;
    
    // Skip guests
    if (Yii::$app->user->isGuest) return;
    
    // Render mobile bottom navigation widget
    try {
        echo MobileBottomNav::widget();
    } catch (\Exception $e) {
        Yii::error('Widget render failed: ' . $e->getMessage(), 'modern-theme-2026');
    }
}
```

**Timing**: Very end of page, just before closing `</body>`

### Event 3: `TopMenu::EVENT_RUN`

Fires when top menu is being built. Used to modify menu items:

```php
public static function onTopMenuRun($event): void
{
    $module = static::getModuleIfThemeActive();
    if (!$module || Yii::$app->user->isGuest) return;
    
    // Remove redundant "Spaces" menu item (we have context switcher)
    $menu = $event->sender;
    $spacesEntry = $menu->getEntryById('spaces');
    if ($spacesEntry) {
        $menu->removeEntry($spacesEntry);
    }
}
```

**Timing**: After top menu is built but before rendering

## Disable Process

When module is disabled (Admin Panel → Modules → Disable):

```php
public function disable()
{
    // 1. Revert theme
    $this->disableTheme();  // Switch back to default HumHub theme
    
    // 2. Call parent disable
    return parent::disable();
}

private function disableTheme()
{
    // Find default "HumHub" theme
    $theme = Theme::find()->where(['url' => 'HumHub'])->one();
    if ($theme) {
        $theme->active = 1;
        $theme->save();
    }
}
```

**Result**: ModernTheme2026 is deactivated, HumHub default theme restored.

## Uninstall Process

When module is uninstalled (Admin Panel → Modules → Uninstall):

1. **Disable is called first** → Reverts theme, calls `disable()`
2. **Migrations rollback** → `down()` method runs on all migrations
3. **Module files remain** (must be deleted manually or via SSH)

### Uninstall Migration

```php
// migrations/uninstall.php
class uninstall extends Migration
{
    public function up()
    {
        // Drop reaction table if it exists
        if ($this->db->getSchema()->getTableSchema('reaction')) {
            $this->dropTable('reaction');
        }
    }
    
    public function down()
    {
        // Reverse of uninstall (usually does nothing)
        // Can't re-create table in down() because uninstall shouldn't be reverted
    }
}
```

**Critical**: All database changes must be reversible.

## Clean Installation Checklist

✅ **Verify completion**:

1. [ ] **Module shows in Admin Panel**
   - Admin Panel → Modules → Search "Modern Theme 2026"
   - Icon appears with description

2. [ ] **Theme activation works**
   - Enable module via checkbox
   - Check: Admin Panel → Design & Appearance → "ModernTheme2026" is active
   - Webpage changes to modern theme appearance

3. [ ] **CSS compiles**
   - No errors in logs after enabling
   - Check: `/var/www/humhub/assets/` contains new compiled CSS
   - Browser DevTools → Styles show modern theme CSS

4. [ ] **JavaScript loads**
   - Browser Console has no errors
   - Reaction picker interactive
   - Mobile bottom nav appears on mobile view

5. [ ] **Database tables created** (if applicable)
   - Check database for `reaction` table
   - Table has proper structure

6. [ ] **No errors in logs**
   - Run: `tail -f /var/www/humhub/protected/runtime/logs/app.log`
   - Enable module and check for errors
   - Should see only info messages, no ERROR level logs

7. [ ] **Cache working**
   - Mobile bottom nav caches spaces (no DB hit on second request)
   - Notifications badge updates with caching

## Clean Uninstall Checklist

✅ **Verify complete removal**:

1. [ ] **Theme reverted**
   - Disable module
   - Check: Admin Panel → Design → Theme is back to default "HumHub"
   - Webpage returns to original appearance

2. [ ] **Database cleaned**
   - Check database for `reaction` table
   - Table should NOT exist after uninstall
   - No module-specific data remains

3. [ ] **Assets removed**
   - Run: `ls /var/www/humhub/assets/`
   - No `modern-theme-2026` folder or references
   - Old compiled CSS removed by cache clear

4. [ ] **No configuration remnants**
   - Check: `/var/www/humhub/protected/config/` (config.php, params.php)
   - No modern-theme-2026 settings in config
   - No hardcoded theme references

5. [ ] **No errors after uninstall**
   - Admin Panel → Settings → Advanced → Caching → "Flush Caches"
   - Browse site normally
   - No broken links or missing CSS

6. [ ] **Cache flushed**
   - Run: `rm -rf /var/www/humhub/protected/runtime/cache/*`
   - Or: Admin Panel → Caching → Flush

## CSS Compilation

### Manual Compilation

CSS is compiled from SCSS via HumHub's ThemeHelper:

```bash
# In HumHub PHP CLI or cron
php -r "
include('/var/www/humhub/protected/yii.php');
\humhub\helpers\ThemeHelper::buildCss();
"
```

**Trigger Points**:
- Module enable (automatic via `Module::enable()`)
- Admin Panel → Design → Save (manual)
- Cache flush

### CSS Compilation Stages

1. **1. SCSS Parsing**
   - Read: `themes/ModernTheme2026/scss/build.scss`
   - Import all dependencies
   - Process variables and mixins

2. **2. Processing**
   - Replace variables with values
   - Process media queries
   - Handle nested selectors

3. **3. Output**
   - Write to: `/var/www/humhub/assets/[hash]/resources/css/theme.css`
   - Minification (production)
   - Sourcemap (dev)

### CSS Compilation Troubleshooting

| Issue | Solution |
|-------|----------|
| "CSS build failed" error | Check logs: `tail -f runtime/logs/app.log` |
| SCSS syntax error | Check color palette commas in `_root.scss` |
| New styles not showing | Clear cache: Admin → Caching → Flush |
| CSS too large | Check for duplicate imports in `build.scss` |

## Database Migration Workflow

### Creating a Migration

```bash
# HumHub CLI command (from humhub root)
./yii migrate/create m260401_000000_my_migration \
    --migrationPath=@modern-theme-2026/migrations
```

This creates: `migrations/m260401_000000_my_migration.php`

### Migration Structure

```php
use yii\db\Migration;

class m260401_000000_my_migration extends Migration
{
    /**
     * Apply migration
     * Called when enabling or running migrations
     */
    public function up()
    {
        // Create, modify, or populate tables
        $this->createTable('my_table', [
            'id' => $this->primaryKey(),
            'name' => $this->string(255)->notNull(),
            'created_at' => $this->integer(),
        ]);
    }
    
    /**
     * Rollback migration
     * Called during uninstall or explicit rollback
     */
    public function down()
    {
        // Reverse the up() changes
        $this->dropTable('my_table');
    }
    
    /**
     * Safety check
     * Run before up() to prevent duplicate execution
     */
    public function safeUp()
    {
        return $this->up();
    }
    
    /**
     * Safety check
     * Run before down()
     */
    public function safeDown()
    {
        return $this->down();
    }
}
```

### Migration Rules

✅ **DO**:
- Always implement both `up()` and `down()`
- Make migrations reversible
- Use type hints for columns
- Check if table exists before creating: `if (!$this->db->getSchema()->getTableSchema('table_name')) {}`
- Test rollback before merging

❌ **DON'T**:
- Modify other modules' tables
- Assume database connection name (use `$this->db`)
- Drop columns without versioning comment
- Create magic column names ("temp_", "old_")

## Testing Before Release

### Pre-Installation Test

```bash
# 1. Ensure module folder exists and is readable
ls -la /var/www/humhub/protected/modules/modern-theme-2026/

# 2. Check config.php is valid PHP
php -l /var/www/humhub/protected/modules/modern-theme-2026/config.php

# 3. Check for syntax errors in Module.php
php -l /var/www/humhub/protected/modules/modern-theme-2026/Module.php
```

### Installation Test Checklist

- [ ] Module appears in Admin Panel → Modules
- [ ] Enable module without errors
- [ ] Theme automatically activates
- [ ] CSS compiles (check `/var/www/humhub/assets/` changed timestamp)
- [ ] No errors in logs
- [ ] Page renders correctly (modern styles visible)
- [ ] Mobile bottom nav shows on mobile
- [ ] Reaction picker works
- [ ] No console errors in DevTools

### Uninstallation Test Checklist

- [ ] Disable module without errors
- [ ] Theme reverts to default
- [ ] Page looks like standard HumHub
- [ ] Database tables removed
- [ ] No remnants in filesystem
- [ ] No errors after cache flush
- [ ] Site functions normally

### Performance Test

```bash
# Check for performance issues
# 1. Load a post/comment page
# 2. DevTools → Network: check CSS/JS file sizes
#    - CSS: < 150KB
#    - Total JS: < 200KB
#
# 3. DevTools → Performance: record page load
#    - First Contentful Paint < 2s
#    - Time to Interactive < 3s
```

### Accessibility Test

- [ ] Tab through page → all elements reachable
- [ ] Screen reader announces content correctly
- [ ] Reaction picker keyboard navigable
- [ ] Modals trap focus
- [ ] Colors pass WCAG AA contrast check
- [ ] Reduced motion preference respected

## File Organization Summary

```
modern-theme-2026/
├── Module.php                          # Lifecycle: enable, disable
├── Events.php                          # Lifecycle: event handlers
├── config.php                          # Module configuration
├── module.json                         # Metadata (for HumHub discovery)
│
├── themes/ModernTheme2026/
│   └── scss/
│       ├── build.scss                  # Compilation entry point
│       ├── variables.scss              # Design tokens
│       ├── _root.scss                  # CSS custom properties
│       ├── _theme.scss                 # Main styles
│       ├── _mixins.scss                # Reusable mixins
│       ├── _accessibility.scss         # WCAG 2.1 AA helpers
│       ├── _performance.scss           # Performance optimizations
│       └── humhub/                     # Component overrides
│
├── widgets/
│   ├── ReactionPicker.php              # Reaction UI widget
│   ├── MobileBottomNav.php             # Mobile nav widget
│   ├── ContextSwitcher.php             # Context switcher widget
│   └── views/
│       ├── reactionPicker.php
│       ├── mobileBottomNav.php
│       └── contextSwitcher.php
│
├── resources/js/
│   ├── reactionPicker.js               # Reaction picker module
│   ├── contextSwitcher.js              # Context switcher module
│   ├── paletteSwitcher.js              # Theme switcher module
│   ├── notifications.js                # Notification handling
│   ├── peopleFocusGuard.js             # Accessibility (focus trap)
│   ├── modalFocusFix.js                # Modal focus management
│   └── mobileKeyboardFix.js            # Mobile keyboard fixes
│
├── assets/
│   └── ModernThemeAsset.php            # Asset bundle registration
│
├── migrations/
│   ├── m260401_000000_add_reaction_type_to_like.php
│   └── uninstall.php
│
├── controllers/
│   ├── ConfigController.php            # Admin config controller
│   └── ReactionsController.php         # Reaction API controller
│
└── views/
    ├── config/
    │   └── index.php                   # Admin config form
    └── reactions/
        └── list.php                    # Reactions list view
```

## Never Edit

❌ **Forbidden**:
- `/var/www/humhub/protected/config/`
- `/var/www/humhub/themes/` (other than ModernTheme2026)
- `/var/www/humhub/protected/yii/`
- `/var/www/humhub/protected/modules/` (other modules)
- Database schema outside migrations
- Web server configuration

## Key Principles

1. **Self-Contained**: Everything in module directory
2. **Reversible**: Disable/uninstall leaves no remnants
3. **Graceful Degradation**: Errors logged, not fatal
4. **Performance**: Cache expensive queries
5. **Security**: Validate input, check permissions
6. **Accessibility**: WCAG 2.1 AA compliance
7. **Maintainability**: Clear code, proper documentation

---

**Created**: April 2026  
**Module**: Modern Theme 2026  
**Purpose**: Guide AI agents with installation/uninstallation processes
