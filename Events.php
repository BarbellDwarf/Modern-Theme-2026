<?php

/**
 * Modern Theme 2026
 * Contemporary theme with glassmorphism, depth, and adaptive colors
 */

namespace humhub\modules\modernTheme2026;

use humhub\components\View;
use humhub\modules\modernTheme2026\assets\ModernThemeAsset;
use humhub\modules\modernTheme2026\controllers\ConfigController;
use humhub\modules\modernTheme2026\widgets\MobileBottomNav;
use humhub\widgets\TopMenu;
use Yii;

class Events
{
    public static function onViewBeginBody($event)
    {
        if (Yii::$app->request->isAjax) {
            return;
        }

        $module = static::getModuleIfThemeActive();
        if (!$module) {
            return;
        }

        if (Yii::$app->user->isGuest) {
            return;
        }

        /** @var View $view */
        $view = $event->sender;

        // TopNavigationAsset is registered by the view widget; unset it after the fact
        // so the overflow-migration JS doesn't run. The layout provides a hidden
        // #topbar-second stub that keeps isOverflow() returning false as a belt-and-suspenders guard.
        // Note: unset only works if asset was already queued; the stub approach is the reliable path.

        // Register theme JavaScript assets
        try {
            ModernThemeAsset::register($view);
        } catch (\Exception $e) {
            Yii::error('Failed to register ModernThemeAsset: ' . $e->getMessage(), 'modern-theme-2026');
        }
    }

    /**
     * Render mobile bottom navigation before body end
     * Only renders for logged-in users on non-AJAX requests
     */
    public static function onViewEndBody($event)
    {
        // Don't render on AJAX requests
        if (Yii::$app->request->isAjax) {
            return;
        }

        $module = static::getModuleIfThemeActive();
        if (!$module) {
            return;
        }

        // Don't render for guest users
        if (Yii::$app->user->isGuest) {
            return;
        }

        // Debug: Log that we're rendering the widget
        Yii::debug('Rendering MobileBottomNav widget', 'modern-theme-2026');

        // Render the mobile bottom navigation widget
        try {
            echo MobileBottomNav::widget();
        } catch (\Exception $e) {
            Yii::error('Failed to render MobileBottomNav: ' . $e->getMessage(), 'modern-theme-2026');
        }
    }

    protected static function getModuleIfThemeActive(): ?Module
    {
        if (!Module::isThemeBasedActive()) {
            return null;
        }

        /** @var Module $module */
        $module = Yii::$app->getModule('modern-theme-2026');
        if (!$module?->isEnabled) {
            return null;
        }

        return $module;
    }

    /**
     * Remove redundant default "Spaces" top menu item when using context switcher.
     * Also rename the "People" entry if a custom label has been configured.
     */
    public static function onTopMenuRun($event): void
    {
        $module = static::getModuleIfThemeActive();
        if (!$module || Yii::$app->user->isGuest) {
            return;
        }

        /** @var TopMenu $menu */
        $menu = $event->sender;

        // Remove the Spaces entry (replaced by context switcher)
        $spacesEntry = $menu->getEntryById('spaces');
        if ($spacesEntry) {
            $menu->removeEntry($spacesEntry);
        } else {
            // Fallback: match by URL
            $spacesEntry = $menu->getEntryByUrl(['/space/spaces']);
            if ($spacesEntry) {
                $menu->removeEntry($spacesEntry);
            }
        }

        // Rename "People" entry if a custom label is configured
        $customLabel = ConfigController::getPeopleNavLabel();
        if ($customLabel !== 'People') {
            $peopleEntry = $menu->getEntryByUrl(['/user/people']);
            if ($peopleEntry) {
                $peopleEntry->label = $customLabel;
            }
        }
    }

    /**
     * Registers module-internal view overrides via Yii2 pathMap so the module
     * is fully self-contained — no files need to be placed outside the module.
     *
     * Called via Application::EVENT_BEFORE_ACTION so it fires before any
     * controller renders its view.
     */
    public static function onBeforeAction($event)
    {
        $module = static::getModuleIfThemeActive();
        if (!$module) {
            return;
        }

        $view = Yii::$app->view;
        if (!$view || !$view->theme) {
            return;
        }

        $modulePath = Yii::getAlias('@modern-theme-2026');
        $overrides = [
            // HumHub user/people controller views
            Yii::getAlias('@humhub/modules/user') . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'people'
                => $modulePath . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'user' . DIRECTORY_SEPARATOR . 'people',
            // Admin module layouts — adds mt2026-admin-layout marker class for CSS targeting
            Yii::getAlias('@humhub/modules/admin') . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'layouts'
                => $modulePath . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'admin' . DIRECTORY_SEPARATOR . 'views' . DIRECTORY_SEPARATOR . 'layouts',
        ];

        $pathMap = $view->theme->pathMap ?? [];
        foreach ($overrides as $original => $override) {
            $existing = $pathMap[$original] ?? [];
            if (!is_array($existing)) {
                $existing = [$existing];
            }
            // Prepend so module override takes priority
            if (!in_array($override, $existing)) {
                array_unshift($existing, $override);
                $pathMap[$original] = $existing;
            }
        }
        $view->theme->pathMap = $pathMap;
    }
}
