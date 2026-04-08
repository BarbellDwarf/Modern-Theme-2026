<?php

use humhub\modules\admin\widgets\AdminMenu;
use humhub\widgets\FooterMenu;

/** @var $content string */
?>
<div class="container mt2026-admin-layout">
    <div class="row">
        <div class="col-lg-3 mt2026-admin-sidebar">
            <?= AdminMenu::widget(); ?>
        </div>
        <div class="col-lg-9 mt2026-admin-content">
            <?= $content; ?>
            <?= FooterMenu::widget(); ?>
        </div>
    </div>
</div>
