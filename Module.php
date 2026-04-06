<?php

/**
 * Modern Theme 2026
 * Contemporary theme with glassmorphism, depth, and adaptive colors
 */

namespace humhub\modules\modernTheme2026;

use humhub\helpers\ThemeHelper;
use Yii;
use yii\base\Exception;

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
        return parent::disable();
    }

    /**
     * @inheritdoc
     */
    public function enable()
    {
        $enabled = parent::enable();
        if ($enabled === false) {
            return false;
        }

        $this->enableTheme();

        $this->rebuildThemeCss();

        return $enabled;
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
     * Rebuilds theme CSS and validates generated output.
     * HumHub's ThemeHelper::buildCss() may return an error string instead of throwing.
     */
    public static function rebuildThemeCss(): bool
    {
        $theme = ThemeHelper::getThemeByName(self::THEME_NAME);
        if ($theme === null) {
            Yii::error('Could not find theme for CSS rebuild', 'modern-theme-2026');
            return false;
        }

        try {
            // Ensure the current published asset directory exists for this theme hash.
            $theme->publishResources(true);

            $result = ThemeHelper::buildCss($theme);
            if ($result !== true) {
                Yii::warning('ThemeHelper::buildCss failed with custom SCSS: ' . (string)$result, 'modern-theme-2026');

                // Fallback: compile without admin custom SCSS so theme remains usable.
                $result = ThemeHelper::buildCss($theme, false);
                if ($result !== true) {
                    Yii::error('ThemeHelper::buildCss fallback failed: ' . (string)$result, 'modern-theme-2026');
                    return false;
                }
            }

            $cssFile = $theme->publishedResourcesPath . DIRECTORY_SEPARATOR . 'css' . DIRECTORY_SEPARATOR . 'theme.css';
            if (!is_file($cssFile) || filesize($cssFile) < 10240) {
                Yii::error('Theme CSS output invalid at ' . $cssFile, 'modern-theme-2026');
                return false;
            }
        } catch (Exception $e) {
            Yii::error('Could not build CSS: ' . $e->getMessage(), 'modern-theme-2026');
            return false;
        }

        return true;
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
