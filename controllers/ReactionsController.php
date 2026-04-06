<?php

namespace humhub\modules\modernTheme2026\controllers;

use humhub\components\behaviors\AccessControl;
use humhub\modules\like\models\Like;
use humhub\modules\content\components\ContentAddonController;
use humhub\modules\user\models\User;
use Yii;
use yii\web\ForbiddenHttpException;

/**
 * ReactionsController
 *
 * Handles emoji reaction save/toggle for content items.
 * Requires the `reaction_type` column (added by module migration) on the `like` table.
 */
class ReactionsController extends ContentAddonController
{
    /** Allowed reaction types */
    private const VALID_TYPES = ['like', 'love', 'laugh', 'wow', 'sad', 'pray'];

    public function behaviors(): array
    {
        return [
            'acl' => [
                'class' => AccessControl::class,
            ],
        ];
    }

    /**
     * GET /modern-theme-2026/reactions/my-reaction
     * Params: contentModel, contentId
     *
     * Returns the current user's reaction type for a given content item.
     * Used by JS on page load to restore the active trigger emoji.
     */
    public function actionMyReaction(): array
    {
        Yii::$app->response->format = 'json';

        $existing = Like::find()
            ->where([
                'object_model' => $this->contentModel,
                'object_id'    => $this->contentId,
                'created_by'   => Yii::$app->user->id,
            ])
            ->one();

        return [
            'reactionType'   => $existing ? ($existing->reaction_type ?? 'like') : null,
            'reactionCounts' => $this->getReactionCounts(),
        ];
    }

    /**
     * GET /modern-theme-2026/reactions/list
     * Params: contentModel, contentId
     *
     * Renders a modal listing all users who reacted, with their actual emoji.
     */
    public function actionList(): string
    {
        /** Reaction type → emoji map (must match reactionPicker.js REACTIONS array) */
        $emojiMap = [
            'like'  => '👍',
            'love'  => '❤️',
            'laugh' => '😂',
            'wow'   => '😮',
            'sad'   => '😢',
            'pray'  => '🙏',
        ];

        // Query reaction rows (user id + reaction type), newest first
        $rows = (new \yii\db\Query())
            ->select(['l.created_by AS user_id', 'l.reaction_type', 'l.created_at'])
            ->from('{{%like}} l')
            ->where([
                'l.object_model' => $this->contentModel,
                'l.object_id'    => $this->contentId,
            ])
            ->orderBy(['l.created_at' => SORT_DESC])
            ->all();

        // Batch-load all users in a single query to avoid N+1
        $userIds = array_column($rows, 'user_id');
        $usersById = !empty($userIds)
            ? User::find()->where(['id' => $userIds])->indexBy('id')->all()
            : [];

        $reactions = [];
        foreach ($rows as $row) {
            $user = $usersById[$row['user_id']] ?? null;
            if ($user !== null) {
                $reactions[] = [
                    'user'          => $user,
                    'reaction_type' => $row['reaction_type'] ?? 'like',
                ];
            }
        }

        return $this->renderAjaxContent($this->renderPartial(
            'list',
            ['reactions' => $reactions, 'emojiMap' => $emojiMap]
        ));
    }

    /**
     * POST /modern-theme-2026/reactions/react
     * Params: contentModel, contentId, reaction_type
     *
     * Toggle behavior:
     *   - Same reaction already set  → remove it (unlike)
     *   - Different reaction already set → switch reaction type
     *   - No reaction yet             → create reaction
     *
     * Returns JSON: { reactionCounts: {type: count}, currentUserReaction: string|null }
     */
    public function actionReact(): array
    {
        $this->forcePostRequest();
        Yii::$app->response->format = 'json';

        /** @var \humhub\modules\like\Module $likeModule */
        $likeModule = Yii::$app->getModule('like');
        if (!$likeModule || !$likeModule->isEnabled) {
            throw new ForbiddenHttpException('Like module is not enabled.');
        }

        if (!$likeModule->canLike($this->parentContent)) {
            throw new ForbiddenHttpException('You are not allowed to react to this content.');
        }

        $reactionType = Yii::$app->request->post('reaction_type', 'like');
        if (!in_array($reactionType, self::VALID_TYPES, true)) {
            $reactionType = 'like';
        }

        $userId = Yii::$app->user->id;

        // Find any existing like/reaction by this user for this content
        $existing = Like::find()
            ->where([
                'object_model' => $this->contentModel,
                'object_id'    => $this->contentId,
                'created_by'   => $userId,
            ])
            ->one();

        $currentUserReaction = null;

        if ($existing !== null) {
            if ($existing->reaction_type === $reactionType) {
                // Same reaction → toggle off (delete)
                $existing->delete();
            } else {
                // Different reaction → switch
                $existing->reaction_type = $reactionType;
                $existing->save(false);
                $currentUserReaction = $reactionType;
            }
        } else {
            // No reaction yet → create
            $like = new Like();
            $like->object_model  = $this->contentModel;
            $like->object_id     = (int) $this->contentId;
            $like->reaction_type = $reactionType;
            $like->save(false);
            $currentUserReaction = $reactionType;
        }

        return [
            'currentUserReaction' => $currentUserReaction,
            'reactionCounts'      => $this->getReactionCounts(),
        ];
    }

    /**
     * Returns reaction counts grouped by type for the current content.
     */
    private function getReactionCounts(): array
    {
        $rows = Like::find()
            ->select(['reaction_type', 'COUNT(*) as cnt'])
            ->where([
                'object_model' => $this->contentModel,
                'object_id'    => $this->contentId,
            ])
            ->groupBy('reaction_type')
            ->asArray()
            ->all();

        $counts = [];
        foreach ($rows as $row) {
            $counts[$row['reaction_type']] = (int) $row['cnt'];
        }
        return $counts;
    }
}
