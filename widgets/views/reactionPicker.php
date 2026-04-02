<?php

use yii\helpers\Html;

/* @var $currentUserReaction string|null */
/* @var $reactionCounts array */
/* @var $isReacted bool */
/* @var $totalCount int */
/* @var $likeUrl string */
/* @var $reactions array */
?>
<div class="like-link-container"
     data-reaction-current="<?= Html::encode($currentUserReaction) ?>"
     data-like-url="<?= Html::encode($likeUrl) ?>">

  <button class="like-button <?= $isReacted ? 'liked' : '' ?>" type="button">
    <i class="fa <?= $isReacted ? '' : 'fa-thumbs-up' ?>">
      <?= $isReacted ? ($reactions[$currentUserReaction]['emoji'] ?? '👍') : '' ?>
    </i>
    <span class="like-count"><?= $totalCount > 0 ? $totalCount : '' ?></span>
    <span class="like-label"><?= $isReacted ? Html::encode($reactions[$currentUserReaction]['label'] ?? 'Like') : 'Like' ?></span>
  </button>

  <div class="reaction-picker" role="listbox" aria-label="Choose reaction" style="display:none">
    <?php foreach ($reactions as $type => $reaction): ?>
    <button class="reaction-item <?= $currentUserReaction === $type ? 'active' : '' ?>"
            type="button"
            role="option"
            data-reaction="<?= Html::encode($type) ?>"
            aria-label="<?= Html::encode($reaction['label']) ?>"
            aria-selected="<?= $currentUserReaction === $type ? 'true' : 'false' ?>">
      <span class="reaction-emoji"><?= $reaction['emoji'] ?></span>
      <span class="reaction-label"><?= Html::encode($reaction['label']) ?></span>
    </button>
    <?php endforeach; ?>
  </div>

  <?php if (!empty($reactionCounts)): ?>
  <div class="reaction-summary" role="group" aria-label="Reactions">
    <?php foreach ($reactions as $type => $reaction): ?>
      <?php if (!empty($reactionCounts[$type])): ?>
      <button class="reaction-count <?= $currentUserReaction === $type ? 'user-reacted' : '' ?>"
              type="button"
              data-reaction="<?= Html::encode($type) ?>"
              aria-label="<?= Html::encode($reaction['label']) . ': ' . (int)$reactionCounts[$type] ?> people">
        <span class="emoji"><?= $reaction['emoji'] ?></span>
        <span class="count"><?= (int)$reactionCounts[$type] ?></span>
      </button>
      <?php endif; ?>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</div>
