<?php

/**
 * Modern Theme 2026
 * Contemporary theme with glassmorphism, depth, and adaptive colors
 */

namespace humhub\modules\modernTheme2026;

use humhub\components\View;
use humhub\modules\modernTheme2026\assets\ModernThemeAsset;
use humhub\modules\modernTheme2026\widgets\MobileBottomNav;
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
}
