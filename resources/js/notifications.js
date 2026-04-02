/**
 * Modern Theme 2026 – Mobile Notification Enhancements
 *
 * Injects a "Mark All Seen" action bar on the notification overview page
 * for mobile users. Uses HumHub's existing notification.markAsSeen action
 * so the same backend endpoint (/notification/list/mark-as-seen) is called.
 */
humhub.module('modernTheme.notifications', function (module, require, $) {

    var OVERVIEW_PATH_RE = /\/notification\/overview/i;

    /**
     * Inject the mobile action bar into the notification overview panel.
     * The bar is only rendered on screens ≤ 768 px and only when the page
     * URL matches the notification overview route.
     */
    var injectMobileActionBar = function () {
        if (!OVERVIEW_PATH_RE.test(window.location.pathname)) {
            return;
        }

        // Avoid duplicate injection after pjax navigation
        if ($('#mt2026-notification-mobile-bar').length) {
            return;
        }

        var $panelBody = $('.panel .panel-body').first();
        if (!$panelBody.length) {
            return;
        }

        var $bar = $(
            '<div id="mt2026-notification-mobile-bar" class="mt2026-notification-mobile-bar">' +
                '<button class="btn btn-sm btn-default mt2026-mark-all-seen-btn"' +
                    ' data-action-click="notification.markAsSeen"' +
                    ' data-action-url="' + humhub.config.get('humhub', 'baseUrl', '') + '/notification/list/mark-as-seen">' +
                    '<i class="fa fa-check-circle"></i> ' +
                    module.text('markAllSeen') +
                '</button>' +
            '</div>'
        );

        $panelBody.before($bar);
    };

    var init = function (pjax) {
        injectMobileActionBar();

        if (!pjax) {
            $(document).on('pjax:end', function () {
                injectMobileActionBar();
            });
        }
    };

    module.export({
        init: init,
    });

    module.texts = {
        markAllSeen: 'Mark all as seen',
    };

});
