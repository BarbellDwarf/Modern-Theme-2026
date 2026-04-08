<?php

use humhub\helpers\ThemeHelper;
use humhub\modules\mail\assets\MailMessengerAsset;
use humhub\modules\mail\models\UserMessage;
use humhub\modules\mail\widgets\ConversationView;

/* @var $messageId int */
/* @var $userMessages UserMessage[] */

MailMessengerAsset::register($this);
$this->registerJs("document.body.classList.add('mt2026-mail-page','mt2026-mail-fullscreen');");
?>
<div class="<?= ThemeHelper::isFluid() ? 'container-fluid' : 'container' ?> mt2026-mail-index<?= $messageId ? ' mail-conversation-single-message' : '' ?>">
    <div class="row">
        <div class="col-lg-4">
            <?= $this->render('_conversation_sidebar') ?>
        </div>

        <div class="col-lg-8 messages">
            <?= ConversationView::widget(['messageId' => $messageId]) ?>
        </div>
    </div>
</div>
