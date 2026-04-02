<?php

/**
 * Modern Theme 2026
 * Contemporary theme with glassmorphism, depth, and adaptive colors
 */

namespace humhub\modules\modernTheme2026;

use humhub\helpers\ThemeHelper;
use Yii;
use yii\base\Exception;
use yii\helpers\Url;

/**
 * Modern Theme 2026 Module
 */
class Module extends \humhub\components\Module
{
    /**
     * @inheritdoc
     */
    public string $icon = 'paint-brush';
    
    /**
     * @inheritdoc
     */
    public bool $collapsibleLeftNavigation = false;

    public const THEME_NAME = 'ModernTheme2026';

    public function getConfigUrl()
    {
        return \yii\helpers\Url::to(['/modern-theme-2026/config']);
    }

    public function getName()
    {
        return 'Modern Theme 2026';
    }

    public function getDescription()
    {
        return 'Contemporary theme with glassmorphism, subtle depth, and 2026 design trends';
    }

    /**
     * @inheritdoc
     */
    public function disable()
    {
        $this->disableTheme();
        parent::disable();
    }

    /**
     * @inheritdoc
     */
    public function enable()
    {
        if (parent::enable() !== false) {
            $this->enableTheme();
            
            // Rebuild CSS
            try {
                ThemeHelper::buildCss();
            } catch (Exception $e) {
                Yii::error('Could not build CSS: ' . $e->getMessage(), 'modern-theme-2026');
            }
            
            return true;
        }
        return false;
    }

    /**
     * @return void
     */
    private function disableTheme()
    {
        if (static::isThemeBasedActive()) {
            $defaultTheme = ThemeHelper::getThemeByName('HumHub');
            $defaultTheme?->activate();
        }
    }

    /**
     * @return void
     */
    private function enableTheme()
    {
        if (!static::isThemeBasedActive()) {
            $modernTheme = ThemeHelper::getThemeByName(self::THEME_NAME);
            $modernTheme?->activate();
        }
    }

    /**
     * Checks if the Modern Theme 2026, or a child theme of it, is currently active
     */
    public static function isThemeBasedActive(): bool
    {
        foreach (ThemeHelper::getThemeTree(Yii::$app->view->theme) as $theme) {
            if ($theme->name === self::THEME_NAME) {
                return true;
            }
        }
        return false;
    }
}
