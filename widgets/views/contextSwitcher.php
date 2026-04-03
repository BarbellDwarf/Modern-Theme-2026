<?php

use yii\helpers\Html;
use yii\helpers\Url;
use humhub\modules\space\widgets\Image as SpaceImage;

/* @var $user \humhub\modules\user\models\User */
/* @var $spaces array */
/* @var $recentItems array */
/* @var $recentSpacesByGuid array */
/* @var $dashboardUrl string */
/* @var $profileUrl string */
/* @var $spacesDirectoryUrl string */
/* @var $siteIconUrl string|null */
/* @var $currentContext string */
/* @var $currentSpace \humhub\modules\space\models\Space|null */
/* @var $currentRoute string */
?>
<li class="nav-item context-switcher" id="context-switcher">

    <!-- Toggle Button -->
    <button class="context-switcher-button"
            type="button"
            aria-haspopup="true"
            aria-expanded="false"
            aria-controls="context-switcher-menu"
            id="context-switcher-btn">
        <span class="context-icon">
            <?php if ($currentSpace): ?>
                <?= SpaceImage::widget([
                    'space' => $currentSpace,
                    'width' => 32,
                    'link' => false,
                    'htmlOptions' => [
                        'class' => 'context-space-image',
                        'alt' => Html::encode($currentSpace->name),
                    ],
                ]) ?>
            <?php elseif ($currentContext === 'profile'): ?>
                <?= Html::img($user->getProfileImage()->getUrl(), [
                    'class' => 'context-user-image',
                    'alt' => Yii::t('base', 'Profile'),
                ]) ?>
            <?php elseif ($currentContext === 'dashboard' && !empty($siteIconUrl)): ?>
                <?= Html::img($siteIconUrl, [
                    'class' => 'context-site-image',
                    'alt' => Yii::t('base', 'Dashboard'),
                ]) ?>
            <?php else: ?>
                <span class="context-initial">
                    D
                </span>
            <?php endif; ?>
        </span>
        <?php
        if ($currentContext === 'dashboard') {
            $buttonLabel = 'Dashboard';
        } elseif ($currentContext === 'space' && $currentSpace) {
            $buttonLabel = $currentSpace->name;
        } elseif ($currentContext === 'space') {
            $buttonLabel = 'Space';
        } else {
            $buttonLabel = $user->displayName ?? 'Navigate';
        }
        ?>
        <span class="context-label" data-default="<?= Html::encode($buttonLabel) ?>">
            <?= Html::encode($buttonLabel) ?>
        </span>
        <span class="dropdown-arrow">
            <i class="fa fa-chevron-down"></i>
        </span>
    </button>

    <!-- Dropdown Menu -->
    <div class="context-switcher-menu"
         id="context-switcher-menu"
         role="listbox"
         aria-labelledby="context-switcher-btn"
         style="display:none">

        <!-- Search -->
        <div class="context-search">
            <input type="search"
                   placeholder="Search spaces &amp; people..."
                   aria-label="Search navigation"
                   id="context-search-input"
                   autocomplete="off">
        </div>

        <div class="context-section">
            <div class="section-header">General</div>
            <div class="section-items" id="context-general-list">
                <a href="<?= Html::encode($dashboardUrl ?? Url::to(['/dashboard/dashboard'])) ?>"
                   class="context-item<?= $currentContext === 'dashboard' ? ' active' : '' ?>"
                   role="option"
                   data-search-name="dashboard home">
                    <span class="item-icon">
                        <?php if (!empty($siteIconUrl)): ?>
                            <?= Html::img($siteIconUrl, ['class' => 'context-site-image', 'alt' => Yii::t('base', 'Dashboard')]) ?>
                        <?php else: ?>
                            <i class="fa fa-dashboard"></i>
                        <?php endif; ?>
                    </span>
                    <span class="item-label">
                        <span class="item-name"><?= Yii::t('base', 'Dashboard') ?></span>
                    </span>
                </a>
                <a href="<?= Html::encode($spacesDirectoryUrl ?? Url::to(['/space/spaces'])) ?>"
                   class="context-item<?= str_contains($currentRoute, 'space/spaces') ? ' active' : '' ?>"
                   role="option"
                   data-search-name="spaces discover directory">
                    <span class="item-icon"><i class="fa fa-compass"></i></span>
                    <span class="item-label">
                        <span class="item-name"><?= Yii::t('SpaceModule.base', 'Spaces') ?></span>
                    </span>
                </a>
                <a href="<?= Html::encode($profileUrl ?? Url::to(['/user/profile'])) ?>"
                   class="context-item<?= $currentContext === 'profile' ? ' active' : '' ?>"
                   role="option"
                   data-search-name="profile account me">
                    <span class="item-icon">
                        <?= Html::img($user->getProfileImage()->getUrl(), ['class' => 'context-user-image', 'alt' => Yii::t('base', 'Profile')]) ?>
                    </span>
                    <span class="item-label">
                        <span class="item-name"><?= Yii::t('base', 'Profile') ?></span>
                    </span>
                </a>
            </div>
        </div>

        <?php if (!empty($recentItems)): ?>
        <div class="context-section">
            <div class="section-header">Recent</div>
            <div class="section-items" id="context-recent-list">
                <?php foreach ($recentItems as $item): ?>
                    <a href="<?= Html::encode($item['url'] ?? '#') ?>"
                       class="context-item"
                       role="option"
                       data-search-name="<?= Html::encode($item['label'] ?? '') ?>">
                        <span class="item-icon">
                            <?php
                            $recentSpace = null;
                            if (($item['context'] ?? '') === 'space' && !empty($item['spaceGuid'])) {
                                $recentSpace = $recentSpacesByGuid[$item['spaceGuid']] ?? null;
                            }
                            $isProfileRecent = (($item['context'] ?? '') === 'profile');
                            $isDashboardRecent = (($item['context'] ?? '') === 'dashboard');
                            ?>
                            <?php if ($recentSpace): ?>
                                <?= SpaceImage::widget([
                                    'space' => $recentSpace,
                                    'width' => 30,
                                    'link' => false,
                                    'htmlOptions' => [
                                        'class' => 'context-space-image',
                                        'alt' => Html::encode($item['label'] ?? ''),
                                    ],
                                ]) ?>
                            <?php elseif ($isProfileRecent): ?>
                                <?= Html::img($user->getProfileImage()->getUrl(), ['class' => 'context-user-image', 'alt' => Yii::t('base', 'Profile')]) ?>
                            <?php elseif ($isDashboardRecent && !empty($siteIconUrl)): ?>
                                <?= Html::img($siteIconUrl, ['class' => 'context-site-image', 'alt' => Yii::t('base', 'Dashboard')]) ?>
                            <?php else: ?>
                                <i class="fa fa-<?= Html::encode($item['icon'] ?? 'clock-o') ?>"></i>
                            <?php endif; ?>
                        </span>
                        <span class="item-label">
                            <span class="item-name"><?= Html::encode($item['label'] ?? 'Recent') ?></span>
                        </span>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>
        <?php endif; ?>

        <!-- My Spaces Section (only if user has spaces) -->
        <?php if (!empty($spaces)): ?>
        <div class="context-section">
            <div class="section-header">My Spaces</div>
            <div class="section-items" id="context-spaces-list">
                <?php foreach ($spaces as $space): ?>
                <a href="<?= $space->createUrl() ?>"
                   class="context-item<?= ($currentSpace && (int)$currentSpace->id === (int)$space->id) ? ' active' : '' ?>"
                   role="option"
                    data-search-name="<?= Html::encode($space->name) ?>">
                    <span class="item-icon">
                        <?= SpaceImage::widget([
                            'space' => $space,
                            'width' => 30,
                            'link' => false,
                            'htmlOptions' => [
                                'class' => 'context-space-image',
                                'alt' => Html::encode($space->name),
                            ],
                        ]) ?>
                    </span>
                    <span class="item-label">
                        <span class="item-name"><?= Html::encode($space->name) ?></span>
                        <?php if (!empty($space->description)): ?>
                        <span class="item-meta"><?= Html::encode(\yii\helpers\StringHelper::truncate($space->description, 40)) ?></span>
                        <?php endif; ?>
                    </span>
                </a>
                <?php endforeach; ?>
            </div>
        </div>
        <?php else: ?>
        <div class="context-section">
            <p class="context-no-spaces">You have not joined any spaces yet.</p>
        </div>
        <?php endif; ?>

        <!-- Keyboard hint footer -->
        <div class="keyboard-hint">
            <kbd>⌘</kbd><kbd>K</kbd> to open &nbsp;·&nbsp; <kbd>↑↓</kbd> navigate &nbsp;·&nbsp; <kbd>Esc</kbd> close
        </div>

    </div>
</li>
