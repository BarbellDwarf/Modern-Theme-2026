<?php

namespace humhub\modules\modernTheme2026\widgets;

use Yii;

class ReactionPicker extends \yii\base\Widget
{
    public $content = null;
    public int $contentId = 0;
    public string $contentClass = '';
    public ?string $currentUserReaction = null;
    public array $reactionCounts = [];
    public string $likeUrl = '';

    public static array $reactions = [
        'like'  => ['emoji' => '👍', 'label' => 'Like'],
        'love'  => ['emoji' => '❤️', 'label' => 'Love'],
        'laugh' => ['emoji' => '😂', 'label' => 'Laugh'],
        'sad'   => ['emoji' => '😢', 'label' => 'Sad'],
        'pray'  => ['emoji' => '🙏', 'label' => 'Pray'],
    ];

    public function run(): string
    {
        if (Yii::$app->user->isGuest) {
            return '';
        }

        $isReacted = !empty($this->currentUserReaction);
        $totalCount = array_sum($this->reactionCounts);

        return $this->render('reactionPicker', [
            'currentUserReaction' => $this->currentUserReaction,
            'reactionCounts'      => $this->reactionCounts,
            'isReacted'           => $isReacted,
            'totalCount'          => $totalCount,
            'likeUrl'             => $this->likeUrl,
            'reactions'           => static::$reactions,
        ]);
    }
}
