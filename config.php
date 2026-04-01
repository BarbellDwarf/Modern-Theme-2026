<?php

/**
 * Modern Theme 2026
 * Contemporary theme with glassmorphism, depth, and adaptive colors
 */

use humhub\components\View;
use humhub\modules\modernTheme2026\Events;

return [
    'id' => 'modern-theme-2026',
    'class' => humhub\modules\modernTheme2026\Module::class,
    'namespace' => 'humhub\modules\modernTheme2026',
    'events' => [
        [
            'class' => View::class,
            'event' => View::EVENT_BEGIN_BODY,
            'callback' => [Events::class, 'onViewBeginBody'],
        ],
    ],
];
