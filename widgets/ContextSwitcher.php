<?php

namespace humhub\modules\modernTheme2026\widgets;

use humhub\modules\space\models\Space;
use Yii;
use yii\base\Widget;

class ContextSwitcher extends Widget
{
    /** Max spaces to show in the menu */
    public int $maxSpaces = 10;

    public function run(): string
    {
        if (Yii::$app->user->isGuest) {
            return '';
        }

        $user = Yii::$app->user->getIdentity();
        $currentRoute = Yii::$app->controller->route ?? '';
        $currentSpace = $this->getCurrentSpace();

        $spaces = $this->getUserSpaces($user);
        $currentContext = $this->detectCurrentContext($currentRoute);

        return $this->render('contextSwitcher', [
            'user' => $user,
            'spaces' => $spaces,
            'currentSpace' => $currentSpace,
            'currentContext' => $currentContext,
            'currentRoute' => $currentRoute,
        ]);
    }

    private function getUserSpaces($user): array
    {
        try {
            if (class_exists('humhub\modules\space\models\Space')) {
                $spaces = \humhub\modules\space\models\Space::find()
                    ->joinWith('memberships')
                    ->where(['space_membership.user_id' => $user->id])
                    ->andWhere(['space_membership.status' => 3]) // STATUS_MEMBER = 3
                    ->limit($this->maxSpaces)
                    ->all();
                return $spaces;
            }
        } catch (\Exception $e) {
            Yii::error('ContextSwitcher: Failed to get spaces: ' . $e->getMessage(), 'modern-theme-2026');
        }
        return [];
    }

    private function detectCurrentContext(string $route): string
    {
        if (str_contains($route, 'dashboard')) return 'dashboard';
        if (str_contains($route, 'space/')) return 'space';
        if (str_contains($route, 'user/')) return 'profile';
        return 'dashboard';
    }

    private function getCurrentSpace(): ?Space
    {
        $controller = Yii::$app->controller;

        if ($controller && property_exists($controller, 'contentContainer')) {
            $contentContainer = $controller->contentContainer;
            if ($contentContainer instanceof Space) {
                return $contentContainer;
            }
        }

        return null;
    }
}
