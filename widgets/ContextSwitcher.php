<?php

namespace humhub\modules\modernTheme2026\widgets;

use humhub\modules\space\models\Space;
use Yii;
use yii\base\Widget;

class ContextSwitcher extends Widget
{
    /** Max spaces to show in the menu */
    public int $maxSpaces = 10;
    private const RECENT_HISTORY_LIMIT = 5;

    public function run(): string
    {
        if (Yii::$app->user->isGuest) {
            return '';
        }

        $user = Yii::$app->user->getIdentity();
        $currentRoute = Yii::$app->controller->route ?? '';
        $currentSpace = $this->getCurrentSpace();

        $spaces = $this->getUserSpaces($user);
        $recentItems = $this->getRecentItems();
        $currentContext = $this->detectCurrentContext($currentRoute);
        $this->trackRecentContext($currentContext, $currentRoute, $currentSpace);

        return $this->render('contextSwitcher', [
            'user' => $user,
            'spaces' => $spaces,
            'recentItems' => $recentItems,
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

    private function getRecentItems(): array
    {
        if (Yii::$app->user->isGuest) {
            return [];
        }

        $raw = Yii::$app->session->get('mt2026.context.recent', []);
        return is_array($raw) ? $raw : [];
    }

    private function trackRecentContext(string $context, string $route, ?Space $currentSpace): void
    {
        if (Yii::$app->user->isGuest) {
            return;
        }

        $items = $this->getRecentItems();

        $entry = [
            'context' => $context,
            'route' => $route,
            'url' => Yii::$app->request->url,
            'label' => $this->buildRecentLabel($context, $currentSpace),
            'icon' => $this->buildRecentIcon($context),
            'spaceId' => $currentSpace?->id,
        ];

        $items = array_values(array_filter($items, function ($item) use ($entry) {
            return ($item['url'] ?? null) !== $entry['url'];
        }));

        array_unshift($items, $entry);
        $items = array_slice($items, 0, self::RECENT_HISTORY_LIMIT);

        Yii::$app->session->set('mt2026.context.recent', $items);
    }

    private function buildRecentLabel(string $context, ?Space $currentSpace): string
    {
        if ($context === 'space' && $currentSpace) {
            return $currentSpace->name;
        }
        if ($context === 'profile') {
            return Yii::t('base', 'Profile');
        }
        return Yii::t('base', 'Dashboard');
    }

    private function buildRecentIcon(string $context): string
    {
        if ($context === 'space') {
            return 'users';
        }
        if ($context === 'profile') {
            return 'user';
        }
        return 'dashboard';
    }
}
