<?php
/**
 * Modern Theme 2026 – override of user/widgets/views/userListBox.php
 *
 * When shown from the like/like/user-list action (reactions context), this
 * view replaces "Users who like this" with a proper "Reactions" header that
 * shows each emoji count summary, and adds the user's chosen reaction emoji
 * inline next to their name.
 */

use humhub\helpers\Html;
use humhub\modules\user\widgets\Image;
use humhub\widgets\AjaxLinkPager;
use humhub\widgets\modal\Modal;
use humhub\widgets\modal\ModalButton;
use yii\data\Pagination;

/* @var $users \humhub\modules\user\models\User[] */
/* @var $hideOnlineStatus bool */
/* @var $title string */
/* @var $pagination Pagination */

// ── Reactions context detection ────────────────────────────────────────
$reactionsByUserId = [];
$reactionCounts    = [];

$reactionMeta = [
    'like'  => ['emoji' => '👍', 'label' => Yii::t('LikeModule.base', 'Like')],
    'love'  => ['emoji' => '❤️',  'label' => Yii::t('LikeModule.base', 'Love')],
    'laugh' => ['emoji' => '😂', 'label' => Yii::t('LikeModule.base', 'Haha')],
    'sad'   => ['emoji' => '😢', 'label' => Yii::t('LikeModule.base', 'Sad')],
    'pray'  => ['emoji' => '🙏', 'label' => Yii::t('LikeModule.base', 'Care')],
];

$isLikesContext = (
    Yii::$app->controller &&
    Yii::$app->controller->module &&
    Yii::$app->controller->module->id === 'like'
);

if ($isLikesContext) {
    $objectModel = Yii::$app->request->get('objectModel', '');
    $objectId    = (int) Yii::$app->request->get('objectId', 0);

    if ($objectModel && $objectId) {
        $rows = \humhub\modules\like\models\Like::find()
            ->select(['created_by', 'reaction_type'])
            ->where(['object_model' => $objectModel, 'object_id' => $objectId])
            ->asArray()
            ->all();

        foreach ($rows as $r) {
            $type = $r['reaction_type'] ?: 'like';
            $reactionsByUserId[(int) $r['created_by']] = $type;
            $reactionCounts[$type] = ($reactionCounts[$type] ?? 0) + 1;
        }
    }

    // Build a rich title: "Reactions  👍 3  ❤️ 1 …"
    $parts = [];
    foreach ($reactionMeta as $type => $meta) {
        if (!empty($reactionCounts[$type])) {
            $parts[] = Html::tag('span',
                $meta['emoji'] . ' ' . $reactionCounts[$type],
                ['class' => 'mt2026-reaction-title-pill', 'title' => $meta['label']]
            );
        }
    }

    $reactionSummaryHtml = !empty($parts)
        ? ' <span class="mt2026-reaction-title-pills">' . implode('', $parts) . '</span>'
        : '';

    $title = '<strong>' . Yii::t('LikeModule.base', 'Reactions') . '</strong>' . $reactionSummaryHtml;
}
// ────────────────────────────────────────────────────────────────────────
?>

<?php Modal::beginDialog([
    'title' => $title,
    'footer' => ModalButton::cancel(Yii::t('base', 'Close')),
    'bodyOptions' => ['style' => 'margin: 0 calc(var(--hh-modal-content-padding) * -1); padding: var(--bs-modal-padding) 0;'],
]) ?>

    <?php if (count($users) === 0): ?>
        <p><?= Yii::t('UserModule.base', 'No users found.') ?></p>
    <?php endif; ?>

    <div id="userlist-content" class="hh-list">
        <?php foreach ($users as $user) : ?>
            <a href="<?= $user->getUrl() ?>" data-modal-close="1" class="d-flex mt2026-reaction-user-row">
                <div class="flex-shrink-0 me-2">
                    <?= Image::widget([
                        'user' => $user,
                        'link' => false,
                        'hideOnlineStatus' => $hideOnlineStatus ?? false,
                        'htmlOptions' => ['class' => 'm-0'],
                    ]) ?>
                </div>

                <div class="flex-grow-1">
                    <h4 class="mt-0"><?= Html::encode($user->displayName) ?></h4>
                    <h5><?= Html::encode($user->displayNameSub) ?></h5>
                </div>

                <?php if ($isLikesContext && isset($reactionsByUserId[$user->id])): ?>
                    <?php $rType = $reactionsByUserId[$user->id]; ?>
                    <div class="mt2026-user-reaction-badge" title="<?= Html::encode($reactionMeta[$rType]['label'] ?? $rType) ?>">
                        <?= $reactionMeta[$rType]['emoji'] ?? '👍' ?>
                    </div>
                <?php endif; ?>
            </a>
        <?php endforeach; ?>
    </div>

    <div class="pagination-container">
        <?= AjaxLinkPager::widget(['pagination' => $pagination]) ?>
    </div>

    <script <?= Html::nonce() ?>>
        $(".modal-body").animate({scrollTop: 0}, 200);
    </script>

<?php Modal::endDialog() ?>
