<?php

use yii\helpers\Html;
use yii\helpers\Url;

/* @var $user \humhub\modules\user\models\User */
/* @var $spaces array */
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
            <?php if ($currentSpace && $currentSpace->getProfileImage()->hasImage()): ?>
                <?= Html::img($currentSpace->getProfileImage()->getUrl('_48'), ['alt' => Html::encode($currentSpace->name)]) ?>
            <?php else: ?>
                <span class="context-initial">
                    <?= Html::encode(mb_strtoupper(mb_substr(($currentSpace->name ?? 'D'), 0, 1))) ?>
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
                        <?php if ($space->getProfileImage()->hasImage()): ?>
                            <?= Html::img($space->getProfileImage()->getUrl('_48'), ['alt' => Html::encode($space->name)]) ?>
                        <?php else: ?>
                            <span class="item-initial">
                                <?= Html::encode(mb_strtoupper(mb_substr($space->name, 0, 1))) ?>
                            </span>
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
