<?php

use yii\helpers\Url;
use yii\helpers\Html;

/**
 * Mobile Bottom Navigation View
 * 
 * @var $spaces \humhub\modules\space\models\Space[]
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

    <!-- Spaces - opens bottom sheet -->
    <button type="button"
            class="nav-item<?= $activeItem === 'spaces' ? ' active' : '' ?>"
            id="mobile-spaces-btn"
            aria-label="Spaces"
            aria-haspopup="dialog">
        <span class="nav-icon">
            <i class="fa fa-th-large"></i>
        </span>
        <span class="nav-label">Spaces</span>
    </button>

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

<!-- Spaces Bottom Sheet -->
<div id="mobile-spaces-sheet" class="mobile-sheet" role="dialog" aria-label="Your Spaces" aria-hidden="true">
    <div class="mobile-sheet-backdrop"></div>
    <div class="mobile-sheet-content">
        <div class="mobile-sheet-handle"></div>
        <div class="mobile-sheet-header">
            <h3 class="mobile-sheet-title">Your Spaces</h3>
            <button type="button" class="mobile-sheet-close" aria-label="Close">&times;</button>
        </div>
        <div class="mobile-sheet-body">
            <?php if (!empty($spaces)): ?>
                <ul class="mobile-spaces-list">
                    <?php foreach ($spaces as $space): ?>
                    <li>
                        <a href="<?= $space->getUrl() ?>" class="mobile-space-item">
                            <span class="mobile-space-icon">
                                <?php if ($space->getProfileImage()->hasImage()): ?>
                                    <?= Html::img($space->getProfileImage()->getUrl(), ['class' => 'mobile-space-img', 'alt' => Html::encode($space->name)]) ?>
                                <?php else: ?>
                                    <span class="mobile-space-initials"><?= Html::encode(mb_strtoupper(mb_substr($space->name, 0, 2))) ?></span>
                                <?php endif; ?>
                            </span>
                            <span class="mobile-space-name"><?= Html::encode($space->name) ?></span>
                        </a>
                    </li>
                    <?php endforeach; ?>
                </ul>
            <?php else: ?>
                <p class="mobile-spaces-empty">You haven't joined any spaces yet.</p>
            <?php endif; ?>
        </div>
        <div class="mobile-sheet-footer">
            <a href="<?= Url::to(['/space/spaces']) ?>" class="btn btn-primary btn-block">
                <i class="fa fa-th-large"></i> View All Spaces
            </a>
        </div>
    </div>
</div>

<?php $this->registerJs("
(function() {
    var btn = document.getElementById('mobile-spaces-btn');
    var sheet = document.getElementById('mobile-spaces-sheet');
    if (!btn || !sheet) return;

    var backdrop = sheet.querySelector('.mobile-sheet-backdrop');
    var closeBtn = sheet.querySelector('.mobile-sheet-close');

    function openSheet() {
        sheet.classList.add('open');
        sheet.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeSheet() {
        sheet.classList.remove('open');
        sheet.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (sheet.classList.contains('open')) { closeSheet(); } else { openSheet(); }
    });

    if (backdrop) backdrop.addEventListener('click', closeSheet);
    if (closeBtn) closeBtn.addEventListener('click', closeSheet);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeSheet();
    });

    sheet.querySelectorAll('.mobile-space-item').forEach(function(link) {
        link.addEventListener('click', closeSheet);
    });
})();
", \yii\web\View::POS_READY); ?>
