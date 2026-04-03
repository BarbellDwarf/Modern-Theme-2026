humhub.module('modernTheme.topbarStabilizer', function(module, require, $) {
    var BREAKPOINT = 768;

    function isDesktopOrTablet() {
        return window.innerWidth >= BREAKPOINT;
    }

    function restoreTopMenuItems() {
        if (!isDesktopOrTablet()) {
            return;
        }

        var $topNav = $('#top-menu-nav');
        var $menuSub = $('#top-menu-sub');
        var $menuSubDropdown = $('#top-menu-sub-dropdown');
        if (!$topNav.length || !$menuSub.length || !$menuSubDropdown.length) {
            return;
        }

        var $movedItems = $menuSubDropdown.children('.top-menu-item');
        if ($movedItems.length) {
            $movedItems.appendTo($topNav).find('i').after('<br>');
        }

        $menuSub.hide();
    }

    var init = function() {
        restoreTopMenuItems();
        $(window).off('resize.mt2026TopbarStabilizer').on('resize.mt2026TopbarStabilizer', restoreTopMenuItems);
        $(document).off('pjax:end.mt2026TopbarStabilizer').on('pjax:end.mt2026TopbarStabilizer', function() {
            setTimeout(restoreTopMenuItems, 60);
        });
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init });
});
