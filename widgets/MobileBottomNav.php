<?php

namespace humhub\modules\modernTheme2026\widgets;

use Yii;
use yii\base\Widget;
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

        $menu = new TopMenu();
        $entries = $menu->getEntries(MenuLink::class, true);
        $items = [];
        $seen = [];

        foreach ($entries as $entry) {
            if (!$entry instanceof MenuLink) {
                continue;
            }

            $id = strtolower((string)$entry->getId());
            $label = trim(strip_tags((string)$entry->getLabel()));
            $url = (string)$entry->getUrl();

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

            $icon = 'fa-link';
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

        usort($items, static function ($a, $b) {
            return strcmp($a['label'], $b['label']);
        });

        return $items;
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
