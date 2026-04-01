<?php

use yii\helpers\Url;
use yii\helpers\Html;

/**
 * Mobile Bottom Navigation View
 * 
 * @var $user \humhub\modules\user\models\User
 * @var $notificationCount int
 * @var $activeItem string
 */

// Register inline script to detect mobile and add class
$this->registerJs("
// Add mobile class to body for CSS fallback
if (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent)) {
    document.body.classList.add('mobile');
    document.body.setAttribute('data-mobile', 'true');
    console.log('Mobile Bottom Nav: Mobile device detected, width=' + window.innerWidth);
} else {
    console.log('Mobile Bottom Nav: Desktop device detected, width=' + window.innerWidth);
}
// Debug: Check if nav element exists
setTimeout(function() {
    var nav = document.querySelector('.mobile-bottom-nav');
    if (nav) {
        console.log('Mobile Bottom Nav: Element found in DOM');
        console.log('Mobile Bottom Nav: Display style =', window.getComputedStyle(nav).display);
        console.log('Mobile Bottom Nav: Position =', window.getComputedStyle(nav).position);
    } else {
        console.log('Mobile Bottom Nav: Element NOT found in DOM!');
    }
}, 100);
", \yii\web\View::POS_READY);
?>

<!-- Mobile Bottom Navigation - Debug Comment: Rendered at " . date('Y-m-d H:i:s') . " -->
<nav class="mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation" style="display: flex !important; position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; z-index: 9999 !important; background: #fff !important; border-top: 2px solid #000 !important;">
    
    <!-- Home/Dashboard -->
    <a href="<?= Url::to(['/dashboard/dashboard']) ?>" 
       class="nav-item<?= $activeItem === 'home' ? ' active' : '' ?>"
       aria-label="Home"
       aria-current="<?= $activeItem === 'home' ? 'page' : 'false' ?>">
        <span class="nav-icon">
            <i class="fa fa-home"></i>
        </span>
        <span class="nav-label">Home</span>
    </a>

    <!-- People/Directory -->
    <a href="<?= Url::to(['/user/people']) ?>" 
       class="nav-item<?= $activeItem === 'people' ? ' active' : '' ?>"
       aria-label="People"
       aria-current="<?= $activeItem === 'people' ? 'page' : 'false' ?>">
        <span class="nav-icon">
            <i class="fa fa-users"></i>
        </span>
        <span class="nav-label">People</span>
    </a>

    <!-- Spaces -->
    <a href="<?= Url::to(['/space/spaces']) ?>" 
       class="nav-item<?= $activeItem === 'spaces' ? ' active' : '' ?>"
       aria-label="Spaces"
       aria-current="<?= $activeItem === 'spaces' ? 'page' : 'false' ?>">
        <span class="nav-icon">
            <i class="fa fa-th-large"></i>
        </span>
        <span class="nav-label">Spaces</span>
    </a>

    <!-- Notifications -->
    <a href="<?= Url::to(['/notification/overview']) ?>" 
       class="nav-item<?= $activeItem === 'notifications' ? ' active' : '' ?>"
       aria-label="Notifications<?= $notificationCount > 0 ? " ($notificationCount unread)" : '' ?>"
       aria-current="<?= $activeItem === 'notifications' ? 'page' : 'false' ?>">
        <span class="nav-icon">
            <i class="fa fa-bell"></i>
            <?php if ($notificationCount > 0): ?>
                <span class="nav-badge" aria-hidden="true">
                    <?= $notificationCount > 99 ? '99+' : $notificationCount ?>
                </span>
            <?php endif; ?>
        </span>
        <span class="nav-label">Notifications</span>
    </a>

    <!-- Profile -->
    <a href="<?= Url::to(['/user/profile', 'uguid' => $user->guid]) ?>" 
       class="nav-item<?= $activeItem === 'profile' ? ' active' : '' ?>"
       aria-label="Profile"
       aria-current="<?= $activeItem === 'profile' ? 'page' : 'false' ?>">
        <span class="nav-icon">
            <?php if ($user->getProfileImage()): ?>
                <?= Html::img($user->getProfileImage()->getUrl(), [
                    'class' => 'nav-avatar',
                    'alt' => $user->displayName,
                    'width' => 24,
                    'height' => 24,
                ]) ?>
            <?php else: ?>
                <i class="fa fa-user"></i>
            <?php endif; ?>
        </span>
        <span class="nav-label">Profile</span>
    </a>
    
</nav>
