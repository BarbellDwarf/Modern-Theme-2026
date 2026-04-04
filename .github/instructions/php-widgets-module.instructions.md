---
description: "Use when creating or modifying PHP widgets, view templates, controllers, or Events.php lifecycle handlers. Covers ReactionPicker, MobileBottomNav, ContextSwitcher widgets and event patterns."
name: "PHP Widgets & Module Components"
applyTo: ["widgets/**/*.php", "controllers/**/*.php", "Events.php", "Module.php", "config.php"]
---

# PHP Widgets & Module Components Guidelines

## Overview

Modern Theme 2026 uses PHP widgets for UI rendering and event handlers for lifecycle management. All PHP code stays within the module's namespace and never touches HumHub core files.

## Namespace & Autoloading

**Namespace**: `humhub\modules\modernTheme2026`

**PSR-4 Autoloading**:
- Class `ReactionPicker` → File `widgets/ReactionPicker.php`
- Class `Events` → File `Events.php`
- Class `Module` → File `Module.php`

**Golden Rule**: Folder structure matches namespace hierarchy; class name matches filename exactly.

## Widget Architecture

All widgets extend `yii\base\Widget` or parent classes:

```php
namespace humhub\modules\modernTheme2026\widgets;

use yii\base\Widget;

class MyWidget extends Widget
{
    // Public properties (component configuration)
    public $title = '';
    public int $id = 0;
    
    /**
     * Widget execution
     * Called by Yii when rendering
     */
    public function run()
    {
        // Validate state
        if (empty($this->id)) {
            return '';
        }
        
        // Render view with variables
        return $this->render('myWidget', [
            'data' => $this->getData(),
        ]);
    }
    
    private function getData()
    {
        // Load data from models, cache, etc
        return [];
    }
}
```

## Widget Guidelines

### 1. ReactionPicker Widget

**Purpose**: Display 5 emoji reactions (👍 ❤️ 😂 😢 🙏) for posts/comments

**File**: `widgets/ReactionPicker.php`

**Public Properties** (configuration):
```php
public $content = null;           // The content being reacted to
public int $contentId = 0;        // Primary key of content
public string $contentClass = ''; // Full class name (e.g., 'post')
public ?string $currentUserReaction = null; // User's existing reaction
public array $reactionCounts = [];// Reactions: ['like' => 5, 'love' => 2]
public string $likeUrl = '';      // URL to trigger reaction
```

**Static Reactions Array**:
```php
public static array $reactions = [
    'like'  => ['emoji' => '👍', 'label' => 'Like'],
    'love'  => ['emoji' => '❤️', 'label' => 'Love'],
    'laugh' => ['emoji' => '😂', 'label' => 'Laugh'],
    'sad'   => ['emoji' => '😢', 'label' => 'Sad'],
    'pray'  => ['emoji' => '🙏', 'label' => 'Pray'],
];
```

**Rules**:
- Check if user is guest: skip rendering if `Yii::$app->user->isGuest`
- Validate `$contentId` > 0 and `$contentClass` not empty
- Calculate `$totalCount` from `$reactionCounts` array sum
- Render via `$this->render('reactionPicker', $data)`

**View Template**: `widgets/views/reactionPicker.php`
- Display current user's reaction (if any)
- Show reaction picker UI on hover/tap
- Display total reactions grouped by type
- Handle click events to API endpoint

### 2. MobileBottomNav Widget

**Purpose**: Thumb-friendly navigation bar for mobile devices (< 768px)

**File**: `widgets/MobileBottomNav.php`

**Features**:
- 5 navigation items: Home, People, Spaces, Notifications, Profile
- Auto-detect active item based on current route
- Show notification badge count (99+ for > 99)
- Display user profile avatar
- Only renders for logged-in users

**Data Caching**:
```php
// Notifications (cached 60 seconds per user)
$cacheKey = 'mbn_notif_' . $userId;
$notificationCount = $cache->get($cacheKey);
if ($notificationCount === false) {
    $notificationCount = (int)\humhub\modules\notification\models\Notification::find()
        ->where(['user_id' => $userId, 'seen' => 0])
        ->count();
    $cache->set($cacheKey, $notificationCount, 60);
}

// Spaces (cached 5 minutes per user)
$spacesCacheKey = 'mbn_spaces_' . $userId;
$spaces = $cache->get($spacesCacheKey);
if ($spaces === false) {
    $spaces = Space::find()
        ->innerJoin('space_membership', 'space_membership.space_id = space.id')
        ->where(['space_membership.user_id' => $userId])
        ->andWhere(['space_membership.status' => Membership::STATUS_MEMBER])
        ->orderBy(['space_membership.last_visit' => SORT_DESC])
        ->limit(8)
        ->all();
    $cache->set($spacesCacheKey, $spaces, 300);
}
```

**Rules**:
- Cache queries with TTL (60s notifications, 5m spaces)
- Wrap DB queries in try-catch, log errors
- Auto-render via `EVENT_END_BODY` event (see Events.php)
- Show only for logged-in users
- Respect mobile breakpoint (CSS hides on desktop)

**View Template**: `widgets/views/mobileBottomNav.php`
- 5 nav items with icons
- Active state indicator
- Notification badge with count
- Profile avatar clickable to profile menu
- Safe area inset for iPhone notch

### 3. ContextSwitcher Widget

**Purpose**: Space/user context dropdown navigation

**File**: `widgets/ContextSwitcher.php`

**Features**:
- Quick switch between spaces
- Show current space/user context
- Keyboard shortcut: Ctrl/Cmd+K
- Search/filter spaces

**Rules**:
- Cache recent spaces list
- Show current user as option
- Filter by membership status
- Support keyboard navigation
- Prevent rendering if user is guest

## Event Handlers (Events.php)

Events hook into HumHub's page lifecycle to render widgets and register assets.

### Event Structure

```php
namespace humhub\modules\modernTheme2026;

use humhub\components\View;
use Yii;

class Events
{
    /**
     * Hook: Start of <body> tag
     * Purpose: Register theme JavaScript assets
     */
    public static function onViewBeginBody($event)
    {
        // Check conditions
        if (Yii::$app->request->isAjax) {
            return;  // Skip AJAX
        }
        
        $module = static::getModuleIfThemeActive();
        if (!$module) {
            return;  // Theme not active
        }
        
        if (Yii::$app->user->isGuest) {
            return;  // User not logged in
        }
        
        // DO THE THING
        try {
            ModernThemeAsset::register($event->sender);
        } catch (\Exception $e) {
            Yii::error('Failed to register asset: ' . $e->getMessage(), 'modern-theme-2026');
        }
    }
    
    /**
     * Helper: Check if theme is active
     * Returns Module or null
     */
    protected static function getModuleIfThemeActive(): ?Module
    {
        if (!Module::isThemeBasedActive()) {
            return null;
        }
        
        $module = Yii::$app->getModule('modern-theme-2026');
        if (!$module?->isEnabled) {
            return null;
        }
        
        return $module;
    }
}
```

### Event Registration (config.php)

Events must be registered in `config.php`:

```php
'events' => [
    [
        'class' => View::class,
        'event' => View::EVENT_BEGIN_BODY,
        'callback' => [Events::class, 'onViewBeginBody'],
    ],
    [
        'class' => View::class,
        'event' => View::EVENT_END_BODY,
        'callback' => [Events::class, 'onViewEndBody'],
    ],
    [
        'class' => TopMenu::class,
        'event' => TopMenu::EVENT_RUN,
        'callback' => [Events::class, 'onTopMenuRun'],
    ],
]
```

### Common Events

| Event | Class | Trigger | Use Case |
|-------|-------|---------|----------|
| `EVENT_BEGIN_BODY` | `View` | Start of `<body>` | Register assets, setup |
| `EVENT_END_BODY` | `View` | End of `<body>` | Render widgets |
| `EVENT_RUN` | `TopMenu` | Top menu building | Modify menu items |
| `EVENT_RUN` | `LeftNavigation` | Left nav building | Modify sidebar |

### Event Handler Rules

✅ **DO**:
- Check `isAjax` first (skip AJAX requests)
- Verify theme is active via `getModuleIfThemeActive()`
- Skip guest users for user-only features
- Wrap in try-catch, log errors with module name
- Cache expensive data
- Return early to avoid extra processing

❌ **DON'T**:
- Throw exceptions (catch and log instead)
- Assume user is logged in (always check)
- Perform expensive DB queries for every request (cache!)
- Modify HumHub core classes
- Re-register globally available assets

## Module Lifecycle (Module.php)

The Module class manages installation, activation, and removal:

```php
namespace humhub\modules\modernTheme2026;

use humhub\helpers\ThemeHelper;
use Yii;

class Module extends \humhub\components\Module
{
    public string $icon = 'paint-brush';
    public bool $collapsibleLeftNavigation = false;
    
    public const THEME_NAME = 'ModernTheme2026';
    
    /**
     * Called when module is enabled via admin panel
     */
    public function enable()
    {
        // Call parent first
        $enabled = parent::enable();
        if ($enabled === false) {
            return false;
        }
        
        // Activate the theme
        $this->enableTheme();
        
        // Rebuild CSS
        try {
            ThemeHelper::buildCss();
        } catch (Exception $e) {
            Yii::error('CSS build failed: ' . $e->getMessage(), 'modern-theme-2026');
            return false;
        }
        
        return true;
    }
    
    /**
     * Called when module is disabled
     */
    public function disable()
    {
        $this->disableTheme();  // Revert to default theme
        return parent::disable();
    }
    
    private function enableTheme()
    {
        // Set ModernTheme2026 as active theme
        // NEVER modify HumHub core settings directly
    }
    
    private function disableTheme()
    {
        // Revert to default HumHub theme
        // NEVER modify HumHub core settings directly
    }
}
```

**Lifecycle Rules**:
1. `enable()` → Install migrations, activate theme, build CSS
2. `disable()` → Revert theme to default, run cleanup
3. Always call `parent::enable()` and `parent::disable()`
4. Never throw exceptions; return false on failure
5. Log all errors with Yii logging

## Controller Pattern (ConfigController.php)

Controllers handle admin configuration:

```php
namespace humhub\modules\modernTheme2026\controllers;

use humhub\modules\admin\components\Controller;
use Yii;

class ConfigController extends Controller
{
    /**
     * Admin configuration page
     */
    public function actionIndex()
    {
        // Load current settings
        $model = new ConfigForm();
        
        // Save on POST
        if ($model->load(Yii::$app->request->post())) {
            if ($model->validate() && $model->save()) {
                return $this->redirect([]);
            }
        }
        
        return $this->render('index', [
            'model' => $model,
        ]);
    }
}
```

**Rules**:
- Extend `humhub\modules\admin\components\Controller`
- Handle GET (display form) and POST (process form)
- Validate user input
- Store settings appropriately
- Redirect after save
- Log errors

## View Templates

View templates render widgets and forms:

**File Structure**:
```
widgets/views/
├── reactionPicker.php     # ReactionPicker widget view
├── mobileBottomNav.php    # MobileBottomNav widget view
└── contextSwitcher.php    # ContextSwitcher widget view

views/
├── config/
│   └── index.php          # Admin configuration form
└── reactions/
    └── list.php           # Reactions list view
```

**Rendering from Widget**:
```php
// In widget's run() method
return $this->render('reactionPicker', [
    'reactions' => $this->reactions,
    'currentReaction' => $this->currentUserReaction,
]);

// In template (widgets/views/reactionPicker.php)
<?php
/** @var array $reactions */
foreach ($reactions as $type => $data) {
    echo $data['emoji'];
}
?>
```

**Rendering from Event**:
```php
echo MobileBottomNav::widget();  // Auto-renders with default config
```

## Database Migrations

Changes to database schema go in `migrations/`:

```php
namespace humhub\modules\modernTheme2026\migrations;

use yii\db\Migration;

class m260401_000000_add_reaction_type_to_like extends Migration
{
    public function up()
    {
        // Create/modify table
        $this->createTable('reaction', [
            'id' => $this->primaryKey(),
            'content_id' => $this->integer()->notNull(),
            'content_class' => $this->string(255)->notNull(),
            'user_id' => $this->integer()->notNull(),
            'reaction_type' => $this->string(50)->notNull(),
            'created_at' => $this->integer()->notNull(),
        ]);
    }
    
    public function down()
    {
        $this->dropTable('reaction');
    }
}
```

**Rules**:
- File name: `m<YYMMDD>_<HHMMSS>_<description>.php`
- Implement both `up()` (apply) and `down()` (rollback)
- Test rollback before merge
- Never modify other modules' tables
- Use Yii2 migration syntax

## Asset Registration (ModernThemeAsset.php)

```php
namespace humhub\modules\modernTheme2026\assets;

use yii\web\AssetBundle;

class ModernThemeAsset extends AssetBundle
{
    public $sourcePath = '@modern-theme-2026/resources';  // Module alias
    
    public $js = [
        'js/contextSwitcher.js',
        'js/reactionPicker.js',
        'js/notifications.js',
        // List all JS modules
    ];
    
    public $depends = [
        'humhub\assets\AppAsset',  // Always depend on HumHub core
    ];
}
```

**Rules**:
- Use Yii2 module alias: `@modern-theme-2026`
- Always depend on `humhub\assets\AppAsset`
- List all JS modules
- Register in Event handler: `ModernThemeAsset::register($view)`

## Permissions & Security

### User Type Checks

```php
// Check if user is guest
if (Yii::$app->user->isGuest) {
    return '';  // Don't render for non-authenticated users
}

// Get current user
$user = Yii::$app->user->getIdentity();

// Check if user can perform action
if (!$user->canCreateSpaces) {
    return '';
}
```

### Input Validation

Always validate before processing:

```php
// Validate widget configuration
if (empty($this->id) || !is_int($this->id)) {
    Yii::warning('Invalid configuration for ' . static::class, 'modern-theme-2026');
    return '';
}

// Validate user input from request
$reaction = Yii::$app->request->post('reaction');
if (!in_array($reaction, array_keys(self::$reactions))) {
    return $this->asMessage('Invalid reaction type');
}
```

## Error Handling & Logging

**Logging Pattern**:
```php
// Debug
Yii::debug('MobileBottomNav loaded with ' . count($spaces) . ' spaces', 'modern-theme-2026');

// Warning
Yii::warning('Notification count cache miss for user ' . $userId, 'modern-theme-2026');

// Error
Yii::error('Failed to render widget: ' . $e->getMessage(), 'modern-theme-2026');
```

**Exception Handling**:
```php
try {
    $spaces = Space::find()->all();
} catch (\Exception $e) {
    Yii::error('Database error: ' . $e->getMessage(), 'modern-theme-2026');
    $spaces = [];  // Graceful fallback
}
```

## Code Standards

### PHP Style

- PSR-12 coding standard
- Type hints for parameters and returns
- Full namespace paths
- @param and @return docblocks
- Consistent indentation (4 spaces)

### Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Classes | PascalCase | `ReactionPicker` |
| Methods | camelCase | `onViewBeginBody()` |
| Properties | camelCase | `$contentId` |
| Constants | UPPER_SNAKE | `THEME_NAME` |
| DB fields | snake_case | `content_id` |
| Cache keys | snake_case with prefix | `mbn_notif_123` |

### Docblock Template

```php
/**
 * Brief one-line description
 * 
 * Longer explanation if complex behavior
 * 
 * @param string $param Description
 * @return array Results
 * @throws \Exception If something fails
 */
public function myMethod($param)
{
    // Implementation
}
```

## Testing Checklist

Before considering changes complete:

- [ ] Widget renders without errors
- [ ] Guest users don't see user-only widgets
- [ ] Caching works (data loads from cache on second request)
- [ ] Exceptions caught and logged (no white screens)
- [ ] Mobile view renders correctly
- [ ] No database queries outside migrations
- [ ] Module enable/disable works
- [ ] CSS rebuilds on enable
- [ ] No errors in HumHub logs

## Never Do

❌ **Forbidden**:
- Edit files outside `modern-theme-2026/` module
- Throw exceptions instead of catching and logging
- Query other modules' private methods
- Modify HumHub core classes
- Add external dependencies
- Hardcode paths (use aliases)
- Assume production configuration
- Skip user permission checks

---

**Key Principle**: All PHP code lives in the module's namespace. Never touch HumHub core files or other modules.
