<?php

namespace humhub\modules\modernTheme2026\widgets;

use Yii;
use yii\base\Widget;
use humhub\modules\user\models\User;

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
        
        // Get notification count
        $notificationCount = 0;
        if (class_exists('humhub\modules\notification\models\Notification')) {
            $notificationCount = \humhub\modules\notification\models\Notification::find()
                ->where(['user_id' => Yii::$app->user->id, 'seen' => 0])
                ->count();
        }

        // Determine active nav item based on current route
        $activeItem = $this->getActiveItem($currentRoute);

        return $this->render('mobileBottomNav', [
            'user' => $user,
            'notificationCount' => $notificationCount,
            'activeItem' => $activeItem,
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
        
        // People/User routes
        if (strpos($route, 'user/') !== false || strpos($route, 'people') !== false) {
            return 'people';
        }
        
        // Space routes
        if (strpos($route, 'space/') !== false || strpos($route, 'content/container') !== false) {
            return 'spaces';
        }
        
        // Notification routes
        if (strpos($route, 'notification') !== false) {
            return 'notifications';
        }
        
        // Profile routes
        if (strpos($route, 'user/profile') !== false || strpos($route, 'user/account') !== false) {
            return 'profile';
        }

        // Default to home
        return 'home';
    }
}
