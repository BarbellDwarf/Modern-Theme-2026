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

// Register inline script to detect mobile and add CSS fallback class
$this->registerJs("
if (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent)) {
    document.body.classList.add('mobile');
    document.body.setAttribute('data-mobile', 'true');
}
", \yii\web\View::POS_READY);
?>

<!-- Mobile Bottom Navigation -->
<nav class="mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation">
    
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
