<?php

use yii\helpers\Html;
use yii\helpers\Url;

/* @var $user \humhub\modules\user\models\User */
/* @var $spaces array */
/* @var $currentContext string */
/* @var $currentRoute string */
?>
<div class="context-switcher" id="context-switcher">

    <!-- Toggle Button -->
    <button class="context-switcher-button"
            type="button"
            aria-haspopup="true"
            aria-expanded="false"
            aria-controls="context-switcher-menu"
            id="context-switcher-btn">
        <span class="context-icon">
            <i class="fa fa-th-large"></i>
        </span>
        <span class="context-label">
            <?php
            if ($currentContext === 'dashboard') echo 'Dashboard';
            elseif ($currentContext === 'space') echo 'Space';
            else echo Html::encode($user->displayName ?? 'Navigate');
            ?>
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

        <!-- Quick Links Section -->
        <div class="context-section">
            <div class="section-header">Quick Access</div>
            <div class="section-items">
                <a href="<?= Url::to(['/dashboard/dashboard']) ?>"
                   class="context-item <?= $currentContext === 'dashboard' ? 'active' : '' ?>"
                   role="option">
                    <span class="item-icon"><i class="fa fa-home"></i></span>
                    <span class="item-label">
                        <span class="item-name">Dashboard</span>
                    </span>
                </a>
                <a href="<?= Url::to(['/user/people']) ?>"
                   class="context-item"
                   role="option">
                    <span class="item-icon"><i class="fa fa-users"></i></span>
                    <span class="item-label">
                        <span class="item-name">People</span>
                    </span>
                </a>
                <a href="<?= Url::to(['/space/spaces']) ?>"
                   class="context-item"
                   role="option">
                    <span class="item-icon"><i class="fa fa-th-large"></i></span>
                    <span class="item-label">
                        <span class="item-name">Explore Spaces</span>
                    </span>
                </a>
            </div>
        </div>

        <!-- My Spaces Section (only if user has spaces) -->
        <?php if (!empty($spaces)): ?>
        <div class="context-section">
            <div class="section-header">My Spaces</div>
            <div class="section-items" id="context-spaces-list">
                <?php foreach ($spaces as $space): ?>
                <a href="<?= $space->createUrl() ?>"
                   class="context-item"
                   role="option"
                   data-search-name="<?= Html::encode($space->name) ?>">
                    <span class="item-icon">
                        <?php if ($space->hasProfileImage()): ?>
                            <?= Html::img($space->getProfileImage()->getUrl('_48'), ['alt' => Html::encode($space->name)]) ?>
                        <?php else: ?>
                            <i class="fa fa-th-large"></i>
                        <?php endif; ?>
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
        <?php endif; ?>

        <!-- Keyboard hint footer -->
        <div class="keyboard-hint">
            <kbd>⌘</kbd><kbd>K</kbd> to open &nbsp;·&nbsp; <kbd>↑↓</kbd> navigate &nbsp;·&nbsp; <kbd>Esc</kbd> close
        </div>

    </div>
</div>
