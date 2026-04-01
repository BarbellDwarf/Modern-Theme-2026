<?php

/**
 * Modern Theme 2026
 * Contemporary theme with glassmorphism, depth, and adaptive colors
 */

namespace humhub\modules\modernTheme2026;

use humhub\components\View;
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

        /** @var View $view */
        $view = $event->sender;
        
        // Register custom assets if needed
        // ModernTheme2026Asset::register($view);
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
