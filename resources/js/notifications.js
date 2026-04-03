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
        bindCommentDropdownStackFix();
        bindComposerDropdownStackFix();

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

    function bindCommentDropdownStackFix() {
        // Prevent comment attachment dropdowns from being painted under the next stream card.
        // We temporarily raise the parent stream entry while the dropdown is open.
        $(document).off('shown.bs.dropdown.mt2026CommentMenu hidden.bs.dropdown.mt2026CommentMenu');

        $(document).on('shown.bs.dropdown.mt2026CommentMenu', '.comment_create .btn-group', function () {
            var $entry = $(this).closest('.wall-entry, .stream-entry');
            if ($entry.length) {
                $entry.addClass('mt2026-dropdown-open');
            }
        });

        $(document).on('hidden.bs.dropdown.mt2026CommentMenu', '.comment_create .btn-group', function () {
            var $entry = $(this).closest('.wall-entry, .stream-entry');
            if ($entry.length) {
                $entry.removeClass('mt2026-dropdown-open');
            }
        });
    }

    function bindComposerDropdownStackFix() {
        var selector = '.contentForm_options .btn-group, .wall-entry-form .btn-group, .post-form .btn-group, .wall-entry-controls .btn-group, .stream-entry-addons .btn-group';

        var applyLift = function ($trigger) {
            $('body').addClass('mt2026-composer-dropdown-open-global');

            var $form = $trigger.closest('.content-form-body, #contentFormBody, #contentFormBodyModal, .wall-entry-form, .post-form, .panel, .s-wall-entry, .wall-entry, .stream-entry');
            if ($form.length) {
                $form.addClass('mt2026-composer-dropdown-open');
            }
            var $panel = $trigger.closest('.panel');
            if ($panel.length) {
                $panel.addClass('mt2026-composer-panel-open');
            }
            var $layout = $trigger.closest('.layout-content-container, .space-layout-container, .space-content');
            if ($layout.length) {
                $layout.addClass('mt2026-composer-layout-open');
            }
        };

        var clearLift = function ($trigger) {
            var $form = $trigger.closest('.content-form-body, #contentFormBody, #contentFormBodyModal, .wall-entry-form, .post-form, .panel, .s-wall-entry, .wall-entry, .stream-entry');
            if ($form.length) {
                $form.removeClass('mt2026-composer-dropdown-open');
            }
            var $panel = $trigger.closest('.panel');
            if ($panel.length) {
                $panel.removeClass('mt2026-composer-panel-open');
            }
            var $layout = $trigger.closest('.layout-content-container, .space-layout-container, .space-content');
            if ($layout.length) {
                $layout.removeClass('mt2026-composer-layout-open');
            }

            // Remove global state only when no relevant dropdown is still open.
            if (!$(selector).filter('.open, .show').length) {
                $('body').removeClass('mt2026-composer-dropdown-open-global');
            }
        };

        $(document).off('shown.bs.dropdown.mt2026ComposerMenu hidden.bs.dropdown.mt2026ComposerMenu click.mt2026ComposerMenu');

        $(document).on('shown.bs.dropdown.mt2026ComposerMenu', selector, function () {
            applyLift($(this));
        });

        $(document).on('hidden.bs.dropdown.mt2026ComposerMenu', selector, function () {
            clearLift($(this));
        });

        // Fallback for cases where Bootstrap dropdown events don't bubble reliably.
        $(document).on('click.mt2026ComposerMenu', selector + ' > .dropdown-toggle, ' + selector + ' > [data-bs-toggle="dropdown"], ' + selector + ' > [data-toggle="dropdown"]', function () {
            var $group = $(this).closest('.btn-group');
            setTimeout(function () {
                if ($group.hasClass('open') || $group.hasClass('show')) {
                    applyLift($group);
                } else {
                    clearLift($group);
                }
            }, 0);
        });
    }

});
