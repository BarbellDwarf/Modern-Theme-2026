<?php

namespace humhub\modules\modernTheme2026\assets;

use yii\web\AssetBundle;

/**
 * Modern Theme 2026 Asset Bundle
 * Registers JavaScript modules for the theme's interactive features.
 */
class ModernThemeAsset extends AssetBundle
{
    public $sourcePath = '@modern-theme-2026/resources';

    public $js = [
        'js/contextSwitcher.js',
        'js/reactionPicker.js',
        'js/paletteSwitcher.js',
        'js/notifications.js',
    ];

    public $depends = [
        'humhub\assets\AppAsset',
    ];
}
