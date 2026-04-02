<?php

namespace humhub\modules\modernTheme2026\widgets;

use Yii;
use yii\base\Widget;
use humhub\modules\user\models\User;
use humhub\modules\space\models\Space;
use humhub\modules\space\models\Membership;

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

        // Member spaces — cache 5 min per user (memberships change infrequently)
        $spacesCacheKey = 'mbn_spaces_' . $userId;
        $spaces = $cache->get($spacesCacheKey);
        if ($spaces === false) {
            try {
                $spaces = Space::find()
                    ->innerJoin('space_membership', 'space_membership.space_id = space.id')
                    ->where(['space_membership.user_id' => $userId])
                    ->andWhere(['space_membership.status' => Membership::STATUS_MEMBER])
                    ->andWhere(['space.status' => Space::STATUS_ENABLED])
                    ->orderBy(['space_membership.last_visit' => SORT_DESC])
                    ->limit(8)
                    ->all();
                $cache->set($spacesCacheKey, $spaces, 300);
            } catch (\Exception $e) {
                Yii::error('MobileBottomNav: failed to load spaces: ' . $e->getMessage(), 'modernTheme2026');
                $spaces = [];
            }
        }

        return $this->render('mobileBottomNav', [
            'user' => $user,
            'notificationCount' => $notificationCount,
            'activeItem' => $activeItem,
            'spaces' => $spaces,
        ]);
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

        // Profile/Account routes (check before generic user/ to be more specific)
        if (strpos($route, 'user/profile') !== false || strpos($route, 'user/account') !== false) {
            return 'profile';
        }

        // "More" sheet routes: People directory, Calendar, Usermap
        if (strpos($route, 'user/people') !== false
            || strpos($route, 'people') !== false
            || strpos($route, 'calendar/') !== false
            || strpos($route, 'usermap/') !== false) {
            return 'more';
        }

        // Space routes
        if (strpos($route, 'space/') !== false || strpos($route, 'content/container') !== false) {
            return 'spaces';
        }

        // Notification routes
        if (strpos($route, 'notification') !== false) {
            return 'notifications';
        }

        // Default to home
        return 'home';
    }
}
