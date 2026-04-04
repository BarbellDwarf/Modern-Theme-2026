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
 * @var $peopleNavLabel string
 */

// Register inline script to detect mobile and add CSS fallback class
$this->registerJs("
if (window.innerWidth < 992 || /Mobi|Android/i.test(navigator.userAgent)) {
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

    <!-- People/Directory -->
    <a href="<?= Url::to(['/user/people']) ?>" 
       class="nav-item<?= $activeItem === 'people' ? ' active' : '' ?>"
       aria-label="<?= Html::encode($peopleNavLabel) ?>"
       aria-current="<?= $activeItem === 'people' ? 'page' : 'false' ?>">
        <span class="nav-icon">
            <i class="fa fa-users"></i>
        </span>
        <span class="nav-label"><?= Html::encode($peopleNavLabel) ?></span>
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

    <?php if (\Yii::$app->moduleManager->hasModule('calendar')): ?>
    <!-- Calendar (visible on comfortable mobile widths; moved into More on narrow screens) -->
    <a href="<?= Url::to(['/calendar/global/index']) ?>" 
       class="nav-item nav-item-calendar<?= $activeItem === 'calendar' ? ' active' : '' ?>"
       aria-label="Calendar"
       aria-current="<?= $activeItem === 'calendar' ? 'page' : 'false' ?>">
        <span class="nav-icon">
            <i class="fa fa-calendar"></i>
        </span>
        <span class="nav-label">Calendar</span>
    </a>
    <?php endif; ?>

    <!-- More Menu -->
    <button type="button"
            class="nav-item<?= $activeItem === 'more' ? ' active' : '' ?>"
            id="mobile-more-btn"
            aria-label="More"
            aria-haspopup="dialog">
        <span class="nav-icon">
            <i class="fa fa-ellipsis-h"></i>
        </span>
        <span class="nav-label">More</span>
    </button>
    
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

<!-- More Menu Bottom Sheet -->
<div id="mobile-more-sheet" class="mobile-sheet" role="dialog" aria-label="More options" aria-hidden="true">
    <div class="mobile-sheet-backdrop"></div>
    <div class="mobile-sheet-content">
        <div class="mobile-sheet-handle"></div>
        <div class="mobile-sheet-header">
            <h3 class="mobile-sheet-title">More</h3>
            <button type="button" class="mobile-sheet-close" aria-label="Close">&times;</button>
        </div>
        <div class="mobile-sheet-body">
            <ul class="mobile-more-list">
                <li>
                    <a href="<?= Url::to(['/user/profile', 'uguid' => $user->guid]) ?>" class="mobile-more-item">
                        <span class="mobile-more-icon">
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
                        <span class="mobile-more-label">Profile</span>
                        <i class="fa fa-chevron-right mobile-more-arrow"></i>
                    </a>
                </li>
                <?php if (\Yii::$app->moduleManager->hasModule('calendar')): ?>
                <li class="mobile-more-calendar-fallback">
                    <a href="<?= Url::to(['/calendar/global/index']) ?>" class="mobile-more-item">
                        <span class="mobile-more-icon"><i class="fa fa-calendar"></i></span>
                        <span class="mobile-more-label">Calendar</span>
                        <i class="fa fa-chevron-right mobile-more-arrow"></i>
                    </a>
                </li>
                <?php endif; ?>
                <?php if (\Yii::$app->moduleManager->hasModule('usermap')): ?>
                <li>
                    <a href="<?= Url::to(['/usermap/map/index']) ?>" class="mobile-more-item">
                        <span class="mobile-more-icon"><i class="fa fa-map-marker"></i></span>
                        <span class="mobile-more-label">User Map</span>
                        <i class="fa fa-chevron-right mobile-more-arrow"></i>
                    </a>
                </li>
                <?php endif; ?>
                <?php if (!\Yii::$app->user->isGuest && \Yii::$app->user->identity->isSystemAdmin()): ?>
                <li>
                    <a href="<?= Url::to(['/admin/index']) ?>" class="mobile-more-item">
                        <span class="mobile-more-icon"><i class="fa fa-cog"></i></span>
                        <span class="mobile-more-label">Administration</span>
                        <i class="fa fa-chevron-right mobile-more-arrow"></i>
                    </a>
                </li>
                <?php endif; ?>
                <?php if (\Yii::$app->moduleManager->hasModule('dark-mode')): ?>
                <?php
                    $darkModeSetting = new \humhub\modules\darkMode\models\UserSetting();
                    $currentDarkMode = $darkModeSetting->darkMode;
                ?>
                <li class="mobile-more-item mobile-more-darkmode-row" style="cursor:default;">
                    <span class="mobile-more-icon"><i class="fa fa-adjust"></i></span>
                    <span class="mobile-more-label">Appearance</span>
                    <span class="mobile-darkmode-toggle" role="group" aria-label="Color scheme">
                        <button type="button"
                                class="mobile-darkmode-btn<?= $currentDarkMode === 'light' ? ' active' : '' ?>"
                                data-dark-mode="light"
                                title="Light"
                                aria-pressed="<?= $currentDarkMode === 'light' ? 'true' : 'false' ?>">
                            <i class="fa fa-sun-o"></i>
                        </button>
                        <button type="button"
                                class="mobile-darkmode-btn<?= $currentDarkMode === 'default' ? ' active' : '' ?>"
                                data-dark-mode="default"
                                title="System"
                                aria-pressed="<?= $currentDarkMode === 'default' ? 'true' : 'false' ?>">
                            <i class="fa fa-adjust"></i>
                        </button>
                        <button type="button"
                                class="mobile-darkmode-btn<?= $currentDarkMode === 'dark' ? ' active' : '' ?>"
                                data-dark-mode="dark"
                                title="Dark"
                                aria-pressed="<?= $currentDarkMode === 'dark' ? 'true' : 'false' ?>">
                            <i class="fa fa-moon-o"></i>
                        </button>
                    </span>
                </li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</div>

<?php $this->registerJs("
(function() {
    function initSheet(btnId, sheetId, itemSelector) {
        var btn = document.getElementById(btnId);
        var sheet = document.getElementById(sheetId);
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
            sheet.classList.contains('open') ? closeSheet() : openSheet();
        });
        if (backdrop) backdrop.addEventListener('click', closeSheet);
        if (closeBtn) closeBtn.addEventListener('click', closeSheet);
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeSheet();
        });
        if (itemSelector) {
            sheet.querySelectorAll(itemSelector).forEach(function(link) {
                link.addEventListener('click', closeSheet);
            });
        }
        var footerLinks = sheet.querySelectorAll('.mobile-sheet-footer a');
        footerLinks.forEach(function(link) {
            link.addEventListener('click', closeSheet);
        });
    }

    initSheet('mobile-spaces-btn', 'mobile-spaces-sheet', '.mobile-space-item');
    initSheet('mobile-more-btn',   'mobile-more-sheet',   '.mobile-more-item');

    // Dark mode inline toggle in More sheet
    document.querySelectorAll('.mobile-darkmode-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var mode = btn.getAttribute('data-dark-mode');
            // Optimistically update UI
            document.querySelectorAll('.mobile-darkmode-btn').forEach(function(b) {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            // POST to dark-mode modal endpoint
            var csrfToken = document.querySelector('meta[name=\"csrf-token\"]');
            var formData = new FormData();
            formData.append('UserSetting[darkMode]', mode);
            if (csrfToken) {
                formData.append('_csrf', csrfToken.getAttribute('content'));
            }
            fetch('/dark-mode/user/modal', {
                method: 'POST',
                body: formData,
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            }).then(function() {
                // Reload to apply theme assets (same as desktop toggle behaviour)
                window.location.reload();
            }).catch(function() {
                // If fetch fails, fall back to opening the modal
                window.location.href = '/dark-mode/user';
            });
        });
    });

    // After pjax navigation to the spaces page, blur any auto-focused input to prevent keyboard pop-up
    $(document).on('pjax:end', function() {
        if (window.location.pathname.indexOf('space/spaces') !== -1) {
            setTimeout(function() {
                if (document.activeElement &&
                    (document.activeElement.tagName === 'INPUT' ||
                     document.activeElement.tagName === 'TEXTAREA')) {
                    document.activeElement.blur();
                }
            }, 300);
        }
    });
})();
", \yii\web\View::POS_READY); ?>
