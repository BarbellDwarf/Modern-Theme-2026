<?php
/**
 * Modern Theme 2026 — topNavigation widget view override.
 *
 * HumHub's ThemeViews::legacyTranslate() maps:
 *   protected/humhub/widgets/views/topNavigation.php
 * to (for the special "humhub" module case):
 *   {theme}/views/widgets/topNavigation.php      ← THIS file
 *
 * We intentionally do NOT call TopNavigationAsset::register($this).
 * That asset loads humhub.ui.topNavigation.js which measures #topbar-second
 * to decide whether to collapse nav items into a hidden "Menu" overflow
 * dropdown.  Our single-bar layout has no #topbar-second and all items
 * must remain visible, so we skip that asset entirely.
 *
 * @var $this    \humhub\components\View
 * @var $menu    \humhub\widgets\TopMenu
 * @var $entries \humhub\modules\ui\menu\MenuEntry[]
 */

use humhub\helpers\Html;
?>
<?php foreach ($entries as $entry) : ?>
    <li class="nav-item top-menu-item">
        <?php
        $options = $entry->getHtmlOptions();
        $class = $options['class'] ?? '';
        $class = is_array($class) ? implode(' ', $class) : $class;
        $options['class'] = trim('nav-link ' . ($entry->getIsActive() ? 'active ' : '') . $class);
        ?>
        <?= Html::a(
            $entry->getIcon() . '<br />' . $entry->getLabel(),
            $entry->getUrl(),
            $options,
        ) ?>
    </li>
<?php endforeach; ?>

<?php
/*
 * Include the hidden overflow-bucket stub so that IF core
 * humhub.ui.topNavigation.js is ever loaded (e.g. via another asset
 * dependency path), it has a #top-menu-sub element to work with.
 * The #topbar-second stub in main.php (height:9999px) ensures
 * isOverflow() always returns false, so this element stays hidden.
 */
?>
<li id="top-menu-sub" class="nav-item dropdown" style="display:none;">
    <a href="#" id="top-dropdown-menu" class="nav-link dropdown-toggle" data-bs-toggle="dropdown">
        <i class="fa fa-align-justify"></i><br>
        <?= Yii::t('base', 'Menu'); ?>
    </a>
    <ul id="top-menu-sub-dropdown" class="dropdown-menu dropdown-menu-end"></ul>
</li>
