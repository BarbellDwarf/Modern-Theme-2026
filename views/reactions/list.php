<?php

use humhub\helpers\Html;
use humhub\modules\user\widgets\Image;
use humhub\widgets\modal\Modal;
use humhub\widgets\modal\ModalButton;

/* @var $reactions array  [['user' => User, 'reaction_type' => string], ...] */
/* @var $emojiMap  array  [reaction_type => emoji] */

// Build tab counts for the header badges
$typeCounts = [];
foreach ($reactions as $row) {
    $type = $row['reaction_type'] ?? 'like';
    $typeCounts[$type] = ($typeCounts[$type] ?? 0) + 1;
}

// Header: "Reactions" followed by emoji+count pills
$headerPills = '';
foreach ($typeCounts as $type => $count) {
    $emoji = $emojiMap[$type] ?? '👍';
    $headerPills .= '<span class="mt2026-reaction-modal-badge">' . $emoji . ' ' . $count . '</span>';
}
$title = '<strong>' . 'Reactions' . '</strong>&nbsp;' . $headerPills;

?>

<?php Modal::beginDialog([
    'title'       => $title,
    'footer'      => ModalButton::cancel(Yii::t('base', 'Close')),
    'bodyOptions' => ['style' => 'margin: 0 calc(var(--hh-modal-content-padding) * -1); padding: var(--bs-modal-padding) 0;'],
]) ?>

    <?php if (empty($reactions)): ?>
        <p class="px-3"><?= Yii::t('LikeModule.base', 'No users found.') ?></p>
    <?php endif; ?>

    <div id="userlist-content" class="hh-list">
        <?php foreach ($reactions as $row):
            $user         = $row['user'];
            $reactionType = $row['reaction_type'] ?? 'like';
            $emoji        = $emojiMap[$reactionType] ?? '👍';
        ?>
            <a href="<?= $user->getUrl() ?>" data-modal-close="1" class="d-flex align-items-center">
                <div class="flex-shrink-0 me-2">
                    <?= Image::widget([
                        'user'    => $user,
                        'link'    => false,
                        'htmlOptions' => ['class' => 'm-0'],
                    ]) ?>
                </div>
                <div class="flex-grow-1">
                    <h4 class="mt-0"><?= Html::encode($user->displayName) ?></h4>
                    <h5><?= Html::encode($user->displayNameSub) ?></h5>
                </div>
                <div class="flex-shrink-0 ms-2" style="font-size:22px;" title="<?= Html::encode($reactionType) ?>">
                    <?= $emoji ?>
                </div>
            </a>
        <?php endforeach; ?>
    </div>

    <style <?= Html::nonce() ?>>
        .mt2026-reaction-modal-badge {
            display: inline-flex;
            align-items: center;
            background: var(--color-bg-secondary, #f3f4f6);
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 14px;
            margin-left: 4px;
            gap: 2px;
        }
    </style>

<?php Modal::endDialog() ?>
