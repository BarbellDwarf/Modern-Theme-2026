# Modern Theme 2026 - Quick Reference Card

A one-page reference for working on this HumHub module.

## 🚨 Golden Rules

| Rule | Why | Punishment |
|------|-----|-----------|
| **ONLY edit in `modern-theme-2026/`** | Module isolation | Module won't uninstall cleanly |
| **Never touch HumHub core** | Prevent conflicts | Conflicts on update |
| **Catch exceptions, don't throw** | Prevent white screens | Users annoyed, logs silenced |
| **Always cache DB queries** | Performance | Slow site = angry admins |
| **Test mobile view** | 50% of traffic is mobile | Broken UX on half the users |

## 📁 File Organization

```
modern-theme-2026/
├── AGENTS.md                 ← START HERE
├── Module.php                ← Module bootstrap
├── Events.php                ← Event handlers
├── config.php                ← Configuration
│
├── themes/ModernTheme2026/scss/        ← Theme styles
├── widgets/                            ← UI components
├── resources/js/                       ← JavaScript
├── assets/ModernThemeAsset.php         ← Asset registration
├── migrations/                         ← Database changes
├── controllers/ + views/               ← Admin config
└── .github/instructions/               ← AI agent instructions
```

## 🏗️ Architecture at a Glance

| Component | Purpose | File | Pattern |
|-----------|---------|------|---------|
| **Theme** | CSS styling, design tokens | `themes/ModernTheme2026/scss/` | SCSS with CSS variables |
| **Widgets** | UI components (Reactions, Mobile Nav, Context) | `widgets/*.php` | Extend `yii\base\Widget` |
| **Events** | Lifecycle hooks (render, register assets) | `Events.php` | Static methods + event registration |
| **Module** | Install/enable/disable lifecycle | `Module.php` | Extend `humhub\components\Module` |
| **JavaScript** | Interactivity (picker, switcher, nav) | `resources/js/*.js` | IIFE pattern with data attributes |
| **Migrations** | Database changes (install/uninstall) | `migrations/*.php` | Up/down reversible |

## 🎨 Design Tokens

**4 Color Palettes**: Professional Blue (default), Creative Purple, Fresh Green, Neutral Gray

**Shadow System**: 5 levels (1 = subtle, 5 = maximum)

**Responsive**: Mobile-first, breakpoints at 576px (sm), 768px (md), 992px (lg), 1200px (xl)

**Accessibility**: WCAG 2.1 AA compliance, focus indicators, keyboard navigation, reduced motion support

## 🔧 Common Tasks

### Add a Color Palette
**Files**: `_root.scss` (CSS variables), `_mixins.scss` (palette definitions)  
**Pattern**: `[data-theme="palette-name"] { --color-primary: #xxx; }`

### Create a Widget
**Files**: `widgets/MyWidget.php` (class) + `widgets/views/myWidget.php` (template)  
**Pattern**: Extend `yii\base\Widget`, implement `run()`, call `$this->render()`

### Add JavaScript Module
**File**: `resources/js/myModule.js`  
**Pattern**: IIFE + `data-mt2026-*` attributes + register in `ModernThemeAsset.php`

### Hook into Page Render
**File**: `Events.php`  
**Pattern**: Register callback in `config.php`, use `getModuleIfThemeActive()` guard

### Add Database Table
**File**: `migrations/m<DATETIME>_description.php`  
**Pattern**: Create in `up()`, drop in `down()`, test rollback

### Register JavaScript Assets
**File**: `assets/ModernThemeAsset.php`  
**Pattern**: Add to `$js` array, registered via `ModernThemeAsset::register($view)` in Events

## ✅ Before You Code

- [ ] Which part affects? (Theme/PHP/JS/Lifecycle)
- [ ] Is it IN the module directory? (If no → STOP)
- [ ] Is it touching HumHub core? (If yes → STOP)
- [ ] Did you read AGENTS.md + relevant instruction?
- [ ] Will this need migrations? (If yes, create them)

## 🧪 Testing Before Merge

- [ ] No errors in logs (check: `/var/www/humhub/protected/runtime/logs/app.log`)
- [ ] Mobile view (resize to < 768px, scroll, interact)
- [ ] Guest user (should see limited features, no errors)
- [ ] Enable/disable module works
- [ ] CSS compiles (no red errors)
- [ ] No console JavaScript errors
- [ ] Database changes reversible (test `down()`)
- [ ] Accessibility (Tab, ARIA labels, color contrast)

## 📋 Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| CSS class | BEM with prefix | `.mt2026-reaction-picker__button--active` |
| Data attribute | kebab-case with mt2026 | `data-mt2026-reaction-type` |
| Cache key | snake_case with prefix | `mbn_notif_123` (mbn = mobile-bottom-nav) |
| PHP class | PascalCase | `ReactionPicker` |
| PHP method | camelCase | `onViewBeginBody()` |
| DB column | snake_case | `content_id`, `created_at` |
| SCSS variable | $kebab-case | `$color-primary`, `$shadow-level-2` |

## 🚦 Lifecycle at a Glance

```
Install → Enable → [Usage] → Disable → Uninstall

Install:   User uploads module → HumHub discovers config.php
Enable:    User enables → Module::enable() → theme activated → CSS compiled
Usage:     Events fire → widgets render → JavaScript runs
Disable:   User disables → Module::disable() → theme reverted
Uninstall: migrations down() → DB cleaned → files deleted
```

## 🎯 Critical Code Patterns

### Event Handler Template
```php
public static function onViewBeginBody($event)
{
    if (Yii::$app->request->isAjax) return;  // Skip AJAX
    $module = static::getModuleIfThemeActive();
    if (!$module) return;  // Theme not active
    if (Yii::$app->user->isGuest) return;  // User check
    
    try {
        // Do something
    } catch (\Exception $e) {
        Yii::error('Error: ' . $e->getMessage(), 'modern-theme-2026');
    }
}
```

### Widget Template
```php
class MyWidget extends \yii\base\Widget
{
    public $data = [];
    
    public function run()
    {
        if (Yii::$app->user->isGuest) return '';
        return $this->render('myWidget', ['data' => $this->data]);
    }
}
```

### JavaScript Module Template
```javascript
(function() {
    'use strict';
    
    const MyModule = {
        init() {
            this.cacheElements();
            this.bindEvents();
        },
        cacheElements() { /* cache DOM refs */ },
        bindEvents() { /* add listeners */ }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MyModule.init());
    } else {
        MyModule.init();
    }
})();
```

## 🚫 Never Do This

❌ Edit files outside module  
❌ Throw exceptions (catch + log instead)  
❌ Query HumHub core directly  
❌ Skip user permission checks  
❌ Add external NPM dependencies  
❌ Hardcode paths (use aliases: `@modern-theme-2026`)  
❌ Assume user is logged in (always check)  
❌ Skip mobile testing  

## ✅ Always Do This

✅ Read AGENTS.md first  
✅ Validate user input  
✅ Cache DB queries  
✅ Test on mobile  
✅ Log errors properly  
✅ Test enable/disable  
✅ Handle exceptions gracefully  
✅ Verify accessibility  

## 🔗 Links to Full Instructions

- **AGENTS.md**: Overall architecture, boundaries, safety rules
- **theme-scss.instructions.md**: Design system, SCSS patterns, CSS variables
- **php-widgets-module.instructions.md**: Widgets, Events, DB migrations, Module lifecycle
- **javascript-modules.instructions.md**: JS modules, data attributes, event handling
- **module-lifecycle-installation.instructions.md**: Installation, migrations, testing, troubleshooting

## 💡 Pro Tips

**Tip 1**: Use `data-mt2026-*` attributes in HTML to select elements, not class-based selectors. Classes are for styling, data attributes for JavaScript.

**Tip 2**: Cache keys should start with a component prefix (e.g., `mbn_` for mobile-bottom-nav) so you can recognize them in logs.

**Tip 3**: Always check `isAjax` first in event handlers - prevents double-rendering and performance issues.

**Tip 4**: Test uninstallation as carefully as installation - database tables MUST be removed via migrations.

**Tip 5**: When adding SCSS, check if the breakpoint mixin exists before writing media queries - use `@include respond-to($breakpoint-md) { }`.

## 📞 Common Errors & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| "CSS build failed" | SCSS syntax error | Check `_root.scss` for unescaped colons |
| Widget not rendering | User is guest | Add `if (Yii::$app->user->isGuest) return '';` |
| JavaScript not loading | Not registered in ModernThemeAsset | Add file to `$js` array, add to Events |
| Theme not activating | `enableTheme()` failed | Check logs, verify ModernTheme2026 exists |
| DB table not created | Migration not run | Re-enable module or check migration name |
| Mobile nav too big | CSS on desktop | Check breakpoint - should hide at > 768px |

---

**Last Updated**: April 2026  
**Module**: Modern Theme 2026  
**Quick Ref**: Keep this handy while coding
