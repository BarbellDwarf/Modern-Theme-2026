# Mobile Bottom Navigation - Implementation Guide

## Overview
The mobile bottom navigation bar provides thumb-friendly access to key actions on mobile devices (< 768px width). The CSS styling is complete and ready to use.

## CSS Features
- ✅ Fixed bottom position with safe-area-inset support (iPhone notch)
- ✅ 5 navigation items with icons and labels
- ✅ Active state indicators
- ✅ Notification badges
- ✅ Ripple effect on tap
- ✅ Dark mode support
- ✅ Slide-up animation

## HTML Structure Needed

The mobile bottom nav requires this HTML structure to be added to the layout:

```html
<nav class="mobile-bottom-nav">
    <a href="/dashboard" class="nav-item active">
        <span class="nav-icon"><i class="fa fa-home"></i></span>
        <span class="nav-label">Home</span>
    </a>
    
    <a href="/directory" class="nav-item">
        <span class="nav-icon"><i class="fa fa-users"></i></span>
        <span class="nav-label">People</span>
    </a>
    
    <a href="/space/list" class="nav-item">
        <span class="nav-icon"><i class="fa fa-th-large"></i></span>
        <span class="nav-label">Spaces</span>
    </a>
    
    <a href="/notification" class="nav-item">
        <span class="nav-icon">
            <i class="fa fa-bell"></i>
            <span class="nav-badge">3</span>
        </span>
        <span class="nav-label">Alerts</span>
    </a>
    
    <a href="/user/account" class="nav-item">
        <span class="nav-icon"><i class="fa fa-user"></i></span>
        <span class="nav-label">Profile</span>
    </a>
</nav>
```

## Integration Options

### Option 1: Add to Main Layout (Recommended)
Add the HTML to the main layout template:
```
/var/www/humhub/themes/ModernTheme2026/views/layouts/main.php
```

### Option 2: Create a Widget
Create a widget class:
```php
// /var/www/humhub/protected/modules/modern-theme-2026/widgets/MobileBottomNav.php

namespace humhub\modules\modernTheme2026\widgets;

use humhub\components\Widget;

class MobileBottomNav extends Widget
{
    public function run()
    {
        return $this->render('mobileBottomNav', [
            'user' => \Yii::$app->user->identity
        ]);
    }
}
```

Then create the view:
```php
// /var/www/humhub/protected/modules/modern-theme-2026/widgets/views/mobileBottomNav.php

<nav class="mobile-bottom-nav">
    <a href="<?= \yii\helpers\Url::to(['/dashboard/dashboard']) ?>" 
       class="nav-item <?= \Yii::$app->controller->module->id === 'dashboard' ? 'active' : '' ?>">
        <span class="nav-icon"><i class="fa fa-home"></i></span>
        <span class="nav-label"><?= \Yii::t('base', 'Home') ?></span>
    </a>
    
    <a href="<?= \yii\helpers\Url::to(['/directory/directory']) ?>" 
       class="nav-item <?= \Yii::$app->controller->module->id === 'directory' ? 'active' : '' ?>">
        <span class="nav-icon"><i class="fa fa-users"></i></span>
        <span class="nav-label"><?= \Yii::t('base', 'People') ?></span>
    </a>
    
    <a href="<?= \yii\helpers\Url::to(['/space/spaces']) ?>" 
       class="nav-item <?= \Yii::$app->controller->module->id === 'space' ? 'active' : '' ?>">
        <span class="nav-icon"><i class="fa fa-th-large"></i></span>
        <span class="nav-label"><?= \Yii::t('base', 'Spaces') ?></span>
    </a>
    
    <a href="<?= \yii\helpers\Url::to(['/notification/overview']) ?>" 
       class="nav-item <?= \Yii::$app->controller->module->id === 'notification' ? 'active' : '' ?>">
        <span class="nav-icon">
            <i class="fa fa-bell"></i>
            <?php if ($notificationCount = \humhub\modules\notification\models\Notification::find()->unseen()->count()): ?>
                <span class="nav-badge"><?= $notificationCount > 9 ? '9+' : $notificationCount ?></span>
            <?php endif; ?>
        </span>
        <span class="nav-label"><?= \Yii::t('base', 'Notifications') ?></span>
    </a>
    
    <a href="<?= \yii\helpers\Url::to(['/user/account']) ?>" 
       class="nav-item <?= \Yii::$app->controller->id === 'account' ? 'active' : '' ?>">
        <span class="nav-icon"><i class="fa fa-user"></i></span>
        <span class="nav-label"><?= \Yii::t('base', 'Profile') ?></span>
    </a>
</nav>
```

Then register the widget in Events.php:
```php
public static function onViewBeginBody($event)
{
    if (Yii::$app->request->isAjax) {
        return;
    }

    $module = static::getModuleIfThemeActive();
    if (!$module) {
        return;
    }

    /** @var View $view */
    $view = $event->sender;
    
    // Register mobile bottom nav
    echo \humhub\modules\modernTheme2026\widgets\MobileBottomNav::widget();
}
```

### Option 3: JavaScript Injection (Quick Test)
For quick testing, add via JavaScript in Events.php:

```php
Yii::$app->view->registerJs("
if (window.innerWidth < 768) {
    var bottomNav = `
        <nav class='mobile-bottom-nav'>
            <a href='/dashboard' class='nav-item active'>
                <span class='nav-icon'><i class='fa fa-home'></i></span>
                <span class='nav-label'>Home</span>
            </a>
            <a href='/directory' class='nav-item'>
                <span class='nav-icon'><i class='fa fa-users'></i></span>
                <span class='nav-label'>People</span>
            </a>
            <a href='/space/spaces' class='nav-item'>
                <span class='nav-icon'><i class='fa fa-th-large'></i></span>
                <span class='nav-label'>Spaces</span>
            </a>
            <a href='/notification' class='nav-item'>
                <span class='nav-icon'><i class='fa fa-bell'></i></span>
                <span class='nav-label'>Alerts</span>
            </a>
            <a href='/user/account' class='nav-item'>
                <span class='nav-icon'><i class='fa fa-user'></i></span>
                <span class='nav-label'>Profile</span>
            </a>
        </nav>
    `;
    $('body').append(bottomNav);
}
", \yii\web\View::POS_READY);
```

## Customization

### Change Icons
Edit the `<i class="fa fa-icon-name"></i>` to use different FontAwesome icons.

### Change Labels
Edit the `<span class="nav-label">Label</span>` text.

### Add/Remove Items
Add or remove `<a class="nav-item">` elements (recommend 4-6 items max).

### Adjust Colors
Modify variables in `_mobile-bottom-nav.scss`:
- Background: `background-color: var(--bg-elevated);`
- Active color: `color: var(--primary);`
- Badge color: `background-color: var(--danger);`

## Browser Compatibility
- ✅ iOS Safari 12+
- ✅ Chrome Mobile 80+
- ✅ Firefox Mobile 80+
- ✅ Samsung Internet 12+

## Status
- ✅ CSS Implementation: Complete
- ⏸️ HTML/PHP Implementation: Needs to be added
- ⏸️ JavaScript for active state: Optional enhancement

The styling is production-ready. You just need to add the HTML markup via one of the options above.
