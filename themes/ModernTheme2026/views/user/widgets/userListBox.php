<?php
/**
 * Modern Theme 2026 – override of user/widgets/views/userListBox.php
 *
 * Renders the reactions/likes user list with a 👍 emoji badge next to each
 * user (HumHub's built-in like system is binary — no per-reaction type stored).
 */

use humhub\helpers\Html;
use humhub\modules\user\widgets\Image;
use humhub\widgets\AjaxLinkPager;
use humhub\widgets\modal\Modal;
use humhub\widgets\modal\ModalButton;

/* @var $users \humhub\modules\user\models\User[] */
/* @var $hideOnlineStatus bool */
/* @var $title string */
/* @var $pagination \yii\data\Pagination */

$isLikesContext = (
    Yii::$app->controller &&
    Yii::$app->controller->module &&
    Yii::$app->controller->module->id === 'like'
);

if ($isLikesContext) {
    $count = count($users);
    $countBadge = $count ? Html::tag('span', '👍 ' . $count, ['class' => 'mt2026-reaction-title-pill']) : '';
    $title = '<strong>' . Yii::t('LikeModule.base', 'Reactions') . '</strong>'
           . ($countBadge ? ' <span class="mt2026-reaction-title-pills">' . $countBadge . '</span>' : '');
}
?>

<?php Modal::beginDialog([
    'title' => $title,
    'footer' => ModalButton::cancel(Yii::t('base', 'Close')),
    'bodyOptions' => ['style' => 'padding: 0;'],
]) ?>

    <?php if (count($users) === 0): ?>
        <p class="p-3"><?= Yii::t('UserModule.base', 'No users found.') ?></p>
    <?php endif; ?>

    <div id="userlist-content" class="hh-list">
        <?php foreach ($users as $user) : ?>
            <a href="<?= $user->getUrl() ?>" data-modal-close="1" class="d-flex align-items-center px-3 py-2 mt2026-reaction-user-row">
                <div class="flex-shrink-0 me-2">
                    <?= Image::widget([
                        'user' => $user,
                        'link' => false,
                        'hideOnlineStatus' => $hideOnlineStatus ?? false,
                        'htmlOptions' => ['class' => 'm-0'],
                    ]) ?>
                </div>

                <div class="flex-grow-1">
                    <div class="fw-semibold" style="color:var(--color-text-primary)"><?= Html::encode($user->displayName) ?></div>
                    <div class="text-muted small"><?= Html::encode($user->displayNameSub) ?></div>
                </div>

                <?php if ($isLikesContext): ?>
                    <div class="mt2026-user-reaction-badge" title="<?= Yii::t('LikeModule.base', 'Like') ?>">👍</div>
                <?php endif; ?>
            </a>
        <?php endforeach; ?>
    </div>

    <?php if ($pagination->pageCount > 1): ?>
        <div class="pagination-container px-3 pb-2">
            <?= AjaxLinkPager::widget(['pagination' => $pagination]) ?>
        </div>
    <?php endif; ?>

    <script <?= Html::nonce() ?>>
        $(".modal-body").animate({scrollTop: 0}, 200);
    </script>

<?php Modal::endDialog() ?>

