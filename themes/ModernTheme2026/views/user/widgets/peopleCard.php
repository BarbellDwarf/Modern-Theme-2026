<?php
/**
 * ModernTheme2026 - Theme view override for People directory card.
 *
 * Replaces the default card-panel structure that Clean Theme's CSS
 * interferes with on mobile. Uses mt2026-specific classes so our
 * SCSS has full, unambiguous control over the card layout.
 */

use humhub\helpers\Html;
use humhub\modules\user\models\User;
use humhub\modules\user\widgets\Image;
use humhub\modules\user\widgets\PeopleActionButtons;

/* @var $user User */
?>
<div class="card-panel mt2026-people-card">
    <div class="mt2026-pc-avatar">
        <?= Image::widget([
            'user' => $user,
            'htmlOptions' => ['class' => 'mt2026-pc-img-wrapper'],
            'linkOptions' => ['class' => 'mt2026-pc-img-link'],
            'width' => 72,
            'showSelfOnlineStatus' => true,
        ]); ?>
    </div>
    <div class="mt2026-pc-info">
        <strong class="mt2026-pc-name">
            <?= Html::containerLink($user) ?>
        </strong>
        <?php if (!empty($user->displayNameSub)) : ?>
            <div class="mt2026-pc-title"><?= Html::encode($user->displayNameSub) ?></div>
        <?php else : ?>
            <div class="mt2026-pc-title mt2026-pc-title-empty">&nbsp;</div>
        <?php endif; ?>
    </div>
    <?= PeopleActionButtons::widget([
        'user' => $user,
        'template' => '<div class="mt2026-pc-actions">{buttons}</div>',
    ]); ?>
</div>
