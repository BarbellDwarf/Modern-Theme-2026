<?php

if (!Yii::$app->moduleManager->hasModule('clean-theme')) {
    return 'Modern Theme 2026 requires the "clean-theme" module to be installed.';
}

return null;
