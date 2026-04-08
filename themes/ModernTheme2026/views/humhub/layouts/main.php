<?php
/* @var $this View */
/* @var $content string */

use humhub\assets\AppAsset;
use humhub\components\View;
use humhub\helpers\DeviceDetectorHelper;
use humhub\helpers\Html;
use humhub\modules\modernTheme2026\widgets\ContextSwitcher;
use humhub\modules\space\widgets\Chooser;
use humhub\modules\user\widgets\AccountTopMenu;
use humhub\widgets\NotificationArea;
use humhub\widgets\SiteLogo;
use humhub\widgets\TopMenu;
use humhub\widgets\TopMenuRightStack;

AppAsset::register($this);

$bodyClasses = DeviceDetectorHelper::getBodyClasses();
$bodyClasses[] = 'modern-theme-2026';

$useContextSwitcher = !Yii::$app->user->isGuest;
?>

<?php $this->beginPage() ?>
<!DOCTYPE html>
<html lang="<?= Yii::$app->language ?>">
    <head>
        <title><?= strip_tags((string) $this->pageTitle) ?></title>
        <meta charset="<?= Yii::$app->charset ?>">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <?php $this->head() ?>
        <?= $this->render('head') ?>

    </head>

    <?= Html::beginTag('body', ['class' => $bodyClasses]) ?>
    <?php $this->beginBody() ?>

        <!-- start: top navigation bar -->
        <div id="topbar" class="topbar fixed-top navbar">
            <div class="container flex-nowrap">
                <div class="topbar-brand d-flex text-nowrap overflow-hidden">
                    <?= SiteLogo::widget() ?>
                </div>

                <ul id="top-menu-nav" class="flex-grow-1 nav">
                    <?php if ($useContextSwitcher): ?>
                        <!-- Modern Theme 2026: Context Switcher replaces Space Chooser -->
                        <?= ContextSwitcher::widget() ?>
                    <?php else: ?>
                        <?= Chooser::widget() ?>
                    <?php endif; ?>

                    <!-- load navigation from widget -->
                    <?= TopMenu::widget() ?>
                </ul>

                <!--
                    Hidden stub so core humhub.ui.topNavigation.js finds #topbar-second.
                    height: 9999px (with visibility:hidden + position:absolute) ensures
                    isOverflow() always returns false: nav height (56px) < 9999px → no items migrate.
                -->
                <div id="topbar-second" style="position:absolute;visibility:hidden;height:9999px;width:0;overflow:hidden;pointer-events:none;" aria-hidden="true"></div>

                <ul class="nav" id="search-menu-nav">
                    <?= TopMenuRightStack::widget() ?>
                </ul>

                <div class="notifications">
                    <?= NotificationArea::widget() ?>
                </div>

                <div class="topbar-actions">
                    <?= AccountTopMenu::widget() ?>
                </div>
            </div>
        </div>
        <!-- end: top navigation bar -->

        <?= $content ?>

        <?php $this->endBody() ?>
    <?= Html::endTag('body') ?>
</html>
<?php $this->endPage() ?>
