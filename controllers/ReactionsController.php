<?php

namespace humhub\modules\modernTheme2026\controllers;

use humhub\components\behaviors\AccessControl;
use humhub\modules\like\models\Like;
use humhub\modules\content\components\ContentAddonController;
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
            $like = new Like([
                'object_model'  => $this->contentModel,
                'object_id'     => $this->contentId,
                'reaction_type' => $reactionType,
            ]);
            $like->save();
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
