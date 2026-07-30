<?php

/**
 * Modern Theme 2026
 * Contemporary theme with glassmorphism, depth, and adaptive colors
 */

use humhub\components\View;
use humhub\modules\modernTheme2026\Events;
use humhub\widgets\TopMenu;
use yii\base\Application;

return [
    'id' => 'modern-theme-2026',
    'class' => humhub\modules\modernTheme2026\Module::class,
    'namespace' => 'humhub\modules\modernTheme2026',
    'events' => [
        [
            'class' => Application::class,
            'event' => Application::EVENT_BEFORE_ACTION,
            'callback' => [Events::class, 'onBeforeAction'],
        ],
        [
            'class' => View::class,
            'event' => View::EVENT_BEGIN_BODY,
            'callback' => [Events::class, 'onViewBeginBody'],
        ],
        [
            'class' => View::class,
            'event' => View::EVENT_END_BODY,
            'callback' => [Events::class, 'onViewEndBody'],
        ],
        [
            'class' => TopMenu::class,
            'event' => TopMenu::EVENT_RUN,
            'callback' => [Events::class, 'onTopMenuRun'],
        ],
    ],
];
