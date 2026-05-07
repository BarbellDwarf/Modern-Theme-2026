<?php

namespace humhub\modules\modernTheme2026\widgets;

use Yii;
use yii\base\Widget;
use yii\helpers\Url;
use humhub\modules\space\models\Space;
use humhub\modules\space\models\Membership;
use humhub\modules\modernTheme2026\controllers\ConfigController;
use humhub\modules\ui\menu\MenuLink;
use humhub\widgets\TopMenu;

/**
 * Mobile Bottom Navigation Widget
 * 
 * Renders a mobile-friendly bottom navigation bar with:
 * - Home/Dashboard
 * - People/Directory
 * - Spaces
 * - Notifications
 * - Profile
 * 
 * Only displays on mobile devices (< 768px via CSS)
 */
class MobileBottomNav extends Widget
{
    /**
     * Top-menu entries captured after all modules initialize the menu.
     * @var array<int, array{id:string,label:string,url:string,icon:string}>
     */
    private array $capturedTopMenuEntries = [];

    public function init()
    {
        parent::init();
        $this->capturedTopMenuEntries = $this->captureTopMenuEntries();
    }

    /**
     * @inheritdoc
     */
    public function run()
    {
        // Only render for logged-in users
        if (Yii::$app->user->isGuest) {
            return '';
        }

        $user = Yii::$app->user->getIdentity();
        $currentRoute = Yii::$app->controller->route;
        
        $userId = Yii::$app->user->id;
        $cache  = Yii::$app->cache;

        // Notification count — cache 60 s per user (badge refreshed by live updates anyway)
        $notificationCount = 0;
        if (class_exists('humhub\modules\notification\models\Notification')) {
            $cacheKey = 'mbn_notif_' . $userId;
            $notificationCount = $cache->get($cacheKey);
            if ($notificationCount === false) {
                $notificationCount = (int)\humhub\modules\notification\models\Notification::find()
                    ->where(['user_id' => $userId, 'seen' => 0])
                    ->count();
                $cache->set($cacheKey, $notificationCount, 60);
            }
        }

        // Determine active nav item based on current route
        $activeItem = $this->getActiveItem($currentRoute);
        $mobileNavLabels = ConfigController::getMobileNavLabels();

        // Member spaces — cache 5 min per user (memberships change infrequently)
        // Cache only IDs to avoid serializing heavy AR objects across cache backends.
        $spacesCacheKey = 'mbn_spaces_ids_' . $userId;
        $spaceIds = $cache->get($spacesCacheKey);
        if ($spaceIds === false) {
            try {
                $spaceTable      = Space::tableName();
                $membershipTable = Membership::tableName();
                $spaceIds = Space::find()
                    ->select($spaceTable . '.id')
                    ->innerJoin($membershipTable, $membershipTable . '.space_id = ' . $spaceTable . '.id')
                    ->where([$membershipTable . '.user_id' => $userId])
                    ->andWhere([$membershipTable . '.status' => Membership::STATUS_MEMBER])
                    ->andWhere([$spaceTable . '.status' => Space::STATUS_ENABLED])
                    ->orderBy([$membershipTable . '.last_visit' => SORT_DESC])
                    ->limit(8)
                    ->column();
                $cache->set($spacesCacheKey, $spaceIds, 300);
            } catch (\Exception $e) {
                Yii::error('MobileBottomNav: failed to load spaces: ' . $e->getMessage(), 'modernTheme2026');
                $spaceIds = [];
            }
        }

        // Re-query the actual AR models (lightweight — only up to 8 rows, never from cache)
        // Restore the last_visit ordering that was captured when the IDs were cached.
        if (empty($spaceIds)) {
            $spaces = [];
        } else {
            $spaceMap = [];
            foreach (Space::findAll(['id' => $spaceIds]) as $space) {
                $spaceMap[$space->id] = $space;
            }
            $spaces = [];
            foreach ($spaceIds as $id) {
                if (isset($spaceMap[$id])) {
                    $spaces[] = $spaceMap[$id];
                }
            }
        }

        return $this->render('mobileBottomNav', [
            'user' => $user,
            'notificationCount' => $notificationCount,
            'activeItem' => $activeItem,
            'spaces' => $spaces,
            'peopleNavLabel' => ConfigController::getPeopleNavLabel(),
            'mobileNavLabels' => $mobileNavLabels,
            'dynamicMoreItems' => $this->getDynamicMoreItems(),
        ]);
    }

    /**
     * Build dynamic More menu items from enabled top menu entries.
     */
    private function getDynamicMoreItems(): array
    {
        if (!ConfigController::isMobileMoreAutoModulesEnabled()) {
            return [];
        }

        $hiddenIds = ConfigController::getMobileMoreHiddenModuleIds();
        $excludedIds = ['dashboard', 'spaces', 'people', 'notifications', 'more', 'profile'];
        $excludedUrls = [
            '/dashboard/dashboard',
            '/user/people',
            '/notification/overview',
            '/space/spaces',
        ];

        $iconMap = [
            'calendar' => 'fa-calendar',
            'mail' => 'fa-envelope',
            'admin' => 'fa-cog',
            'marketplace' => 'fa-shopping-bag',
            'wiki' => 'fa-book',
            'tasks' => 'fa-check-square-o',
            'usermap' => 'fa-map-marker',
            'files' => 'fa-folder-open',
            'events' => 'fa-calendar-check-o',
            'polls' => 'fa-bar-chart',
            'groups' => 'fa-users',
        ];

        $items = [];
        $seen = [];

        foreach ($this->capturedTopMenuEntries as $entry) {
            $id = strtolower((string)($entry['id'] ?? ''));
            $label = trim(strip_tags((string)($entry['label'] ?? '')));
            $url = (string)($entry['url'] ?? '');

            if ($id === '' || $url === '' || $label === '') {
                continue;
            }

            if (in_array($id, $excludedIds, true) || in_array($id, $hiddenIds, true)) {
                continue;
            }

            foreach ($excludedUrls as $excludedUrl) {
                if (str_starts_with($url, $excludedUrl)) {
                    continue 2;
                }
            }

            if (isset($seen[$url])) {
                continue;
            }
            $seen[$url] = true;

            $icon = $entry['icon'] ?? 'fa-link';
            foreach ($iconMap as $needle => $mappedIcon) {
                if (str_contains($id, $needle) || str_contains(strtolower($label), $needle)) {
                    $icon = $mappedIcon;
                    break;
                }
            }

            $items[] = [
                'id' => $id,
                'label' => $label,
                'url' => $url,
                'icon' => $icon,
            ];
        }

        // Fallback discovery from enabled modules for entries not present in top menu.
        // This catches modules like "mail" when top-menu rendering differs by context.
        $moduleManager = Yii::$app->moduleManager;
        foreach ($moduleManager->getEnabledModules() as $moduleId => $module) {
            $id = strtolower((string)$moduleId);
            if (in_array($id, $excludedIds, true) || in_array($id, $hiddenIds, true)) {
                continue;
            }
            if (isset($seen['module:' . $id])) {
                continue;
            }

            $routeMap = [
                'mail' => ['/mail/mail/index'],
                'calendar' => ['/calendar/global/index'],
                'usermap' => ['/usermap/map/index'],
                'marketplace' => ['/marketplace/browse/index'],
            ];
            if (!isset($routeMap[$id])) {
                continue;
            }

            $url = Url::to($routeMap[$id]);
            if (isset($seen[$url])) {
                continue;
            }

            $label = trim((string)$module->getName());
            if ($label === '') {
                $label = ucfirst($id);
            }
            $icon = $iconMap[$id] ?? 'fa-link';

            $items[] = [
                'id' => $id,
                'label' => $label,
                'url' => $url,
                'icon' => $icon,
            ];
            $seen[$url] = true;
            $seen['module:' . $id] = true;
        }

        usort($items, static function ($a, $b) {
            return strcmp($a['label'], $b['label']);
        });

        return $items;
    }

    /**
     * Create a TopMenu instance and collect the final, visible links after module events.
     *
     * @return array<int, array{id:string,label:string,url:string,icon:string}>
     */
    private function captureTopMenuEntries(): array
    {
        $menu = new TopMenu();
        // run() triggers TopMenu::EVENT_RUN and module menu mutations.
        $menu->run();
        $entries = $menu->getEntries(MenuLink::class, true);
        $result = [];

        foreach ($entries as $entry) {
            if (!$entry instanceof MenuLink) {
                continue;
            }
            $result[] = [
                'id' => (string)$entry->getId(),
                'label' => (string)$entry->getLabel(),
                'url' => (string)$entry->getUrl(),
                // Keep empty by default; icon is inferred later.
                'icon' => '',
            ];
        }

        return $result;
    }

    /**
     * Determine which nav item should be active based on current route
     * 
     * @param string $route Current route
     * @return string Active item key
     */
    private function getActiveItem($route)
    {
        // Dashboard/Home routes
        if (strpos($route, 'dashboard') !== false || $route === 'dashboard/dashboard') {
            return 'home';
        }

        // People directory
        if (strpos($route, 'user/people') !== false || strpos($route, 'people') !== false) {
            return 'people';
        }

        // Calendar routes
        if (strpos($route, 'calendar/') !== false) {
            return 'calendar';
        }

        // Space routes
        if (strpos($route, 'space/') !== false || strpos($route, 'content/container') !== false) {
            return 'spaces';
        }

        // Notification routes
        if (strpos($route, 'notification') !== false) {
            return 'notifications';
        }

        // More routes
        if (strpos($route, 'usermap/') !== false || strpos($route, 'admin/') !== false) {
            return 'more';
        }

        // Profile/Account routes
        if (strpos($route, 'user/profile') !== false || strpos($route, 'user/account') !== false) {
            return 'more';
        }

        // Default: nothing selected
        return '';
    }
}
