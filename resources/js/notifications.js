/**
 * Modern Theme 2026 – Mobile Notification Enhancements
 *
 * Injects a "Mark All Seen" action bar on the notification overview page
 * for mobile users. Uses HumHub's existing notification.markAsSeen action
 * handler so the same backend endpoint (/notification/list/mark-as-seen)
 * is called with proper CSRF handling.
 */
humhub.module('modernTheme.notifications', function (module, require, $) {

    var OVERVIEW_PATH_RE = /\/notification\/overview/i;

    /**
     * Inject the mobile action bar into the notification overview panel.
     * The bar is only rendered on the notification overview route.
     * The action URL is copied from the existing (desktop) mark-seen button
     * so we don't have to hard-code the application base path.
     */
    var injectMobileActionBar = function () {
        if (!OVERVIEW_PATH_RE.test(window.location.pathname)) {
            return;
        }

        // Avoid duplicate injection (e.g. after pjax navigation)
        if ($('#mt2026-notification-mobile-bar').length) {
            return;
        }

        var $panelHeading = $('.panel .panel-heading').first();
        if (!$panelHeading.length) {
            return;
        }

        // Inherit the action URL from the existing hidden desktop button
        var $desktopBtn = $('#notification_overview_markseen');
        var actionUrl = $desktopBtn.length
            ? $desktopBtn.attr('data-action-url') || $desktopBtn.data('action-url')
            : null;

        if (!actionUrl) {
            // Fall back: derive from existing links on the page
            var baseHref = $('base').attr('href') || '';
            actionUrl = baseHref.replace(/\/$/, '') + '/notification/list/mark-as-seen';
        }

        var $bar = $(
            '<div id="mt2026-notification-mobile-bar" class="mt2026-notification-mobile-bar">' +
                '<button class="btn btn-sm btn-default mt2026-mark-all-seen-btn"' +
                    ' data-action-click="notification.markAsSeen"' +
                    ' data-action-url="' + actionUrl + '">' +
                    '<i class="fa fa-check-circle"></i> ' +
                    '<span>' + module.text('markAllSeen') + '</span>' +
                '</button>' +
            '</div>'
        );

        $panelHeading.after($bar);
    };

    var init = function (pjax) {
        injectMobileActionBar();

        if (!pjax) {
            $(document).on('pjax:end', function () {
                // Re-inject after pjax page transitions
                injectMobileActionBar();
            });
        }
    };

    module.export = {
        init: init,
    };

    module.texts = {
        markAllSeen: 'Mark all as seen',
    };

});
