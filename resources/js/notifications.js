/**
 * Modern Theme 2026 – Mobile Notification Enhancements
 *
 * Injects a "Mark All Seen" action bar on the notification overview page
 * for mobile users. Uses HumHub's existing notification.markAsSeen action
 * handler so the same backend endpoint (/notification/list/mark-as-seen)
 * is called with proper CSRF handling.
 */
humhub.module('modernTheme.notifications', function (module, require, $) {

    var injectMobileActionBar = function () {
        // Match any URL containing notification/overview (works with sub-paths)
        if (window.location.href.indexOf('notification/overview') === -1) {
            return;
        }

        // Avoid duplicate injection (e.g. after pjax navigation)
        if ($('#mt2026-notification-mobile-bar').length) {
            return;
        }

        var $panelHeading = $('.layout-content-container .panel .panel-heading').first();
        if (!$panelHeading.length) {
            $panelHeading = $('.panel .panel-heading').first();
        }
        if (!$panelHeading.length) {
            return;
        }

        // Inherit the action URL from the existing hidden desktop button
        var $desktopBtn = $('#notification_overview_markseen');
        var actionUrl = '';
        if ($desktopBtn.length) {
            actionUrl = $desktopBtn.attr('data-action-url') || $desktopBtn.data('actionUrl') || '';
        }

        if (!actionUrl) {
            // Fall back: derive from base tag or origin
            var base = $('base').attr('href') || window.location.origin;
            actionUrl = base.replace(/\/$/, '') + '/notification/list/mark-as-seen';
        }

        var $bar = $(
            '<div id="mt2026-notification-mobile-bar" class="mt2026-notification-mobile-bar">' +
                '<button class="btn btn-sm btn-default mt2026-mark-all-seen-btn"' +
                    ' data-action-click="notification.markAsSeen"' +
                    ' data-action-url="' + actionUrl + '">' +
                    '<i class="fa fa-check-circle"></i> Mark All Seen' +
                '</button>' +
            '</div>'
        );

        $panelHeading.after($bar);
    };

    var init = function (pjax) {
        injectMobileActionBar();

        if (!pjax) {
            $(document).on('pjax:end', function () {
                // Remove stale bar then re-inject after pjax page transitions
                $('#mt2026-notification-mobile-bar').remove();
                injectMobileActionBar();
            });
        }
    };

    module.initOnPjaxLoad = true;

    module.export({
        init: init
    });

});
