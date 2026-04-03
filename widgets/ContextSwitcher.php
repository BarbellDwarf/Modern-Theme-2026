<?php

namespace humhub\modules\modernTheme2026\widgets;

use humhub\modules\space\models\Membership;
use humhub\modules\space\models\Space;
use Yii;
use yii\base\Widget;
use yii\helpers\Url;

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

        $currentContext = $this->detectCurrentContext($currentRoute);
        $this->trackRecentContext($currentContext, $currentRoute, $currentSpace);
        $spaces = $this->getUserSpaces($user);
        $recentItems = $this->getRecentItems();
        $recentSpacesByGuid = $this->getRecentSpacesByGuid($recentItems);
        $profileUrl = method_exists($user, 'getUrl') ? $user->getUrl() : Url::to(['/user/profile']);
        $spacesDirectoryUrl = Url::to(['/space/spaces']);

        return $this->render('contextSwitcher', [
            'user' => $user,
            'spaces' => $spaces,
            'recentItems' => $recentItems,
            'recentSpacesByGuid' => $recentSpacesByGuid,
            'dashboardUrl' => Url::to(['/dashboard/dashboard']),
            'profileUrl' => $profileUrl,
            'spacesDirectoryUrl' => $spacesDirectoryUrl,
            'siteIconUrl' => $this->getSiteIconUrl(),
            'currentSpace' => $currentSpace,
            'currentContext' => $currentContext,
            'currentRoute' => $currentRoute,
        ]);
    }

    private function getUserSpaces($user): array
    {
        try {
            if (class_exists('humhub\modules\space\models\Space')) {
                $smTable = Membership::tableName();
                $spTable = Space::tableName();
                $spaces = Space::find()
                    ->innerJoin($smTable . ' sm', 'sm.space_id = ' . $spTable . '.id')
                    ->where(['sm.user_id' => $user->id])
                    ->andWhere(['sm.status' => Membership::STATUS_MEMBER])
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
            'spaceGuid' => $currentSpace?->guid,
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

    private function getSiteIconUrl(): ?string
    {
        try {
            return \humhub\modules\web\pwa\widgets\SiteIcon::getUrl(32);
        } catch (\Throwable $e) {
            Yii::warning('ContextSwitcher: Failed to resolve site icon URL: ' . $e->getMessage(), 'modern-theme-2026');
            return null;
        }
    }

    private function getRecentSpacesByGuid(array $recentItems): array
    {
        $spaceGuids = [];
        foreach ($recentItems as $item) {
            if (($item['context'] ?? null) !== 'space') {
                continue;
            }
            $guid = $item['spaceGuid'] ?? null;
            if (is_string($guid) && $guid !== '') {
                $spaceGuids[] = $guid;
            }
        }

        if (empty($spaceGuids)) {
            return [];
        }

        return Space::find()
            ->where(['guid' => array_values(array_unique($spaceGuids))])
            ->indexBy('guid')
            ->all();
    }
}
