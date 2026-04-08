/**
 * Modern Theme 2026 - Mobile Swipe Sidebar Fix
 *
 * HumHub core (humhub-app.js, ui.view module) sets up .layout-sidebar-container
 * as a swipe-activated panel: swiped-left slides it in from the right (white
 * background), swiped-right slides it back. This was designed for the default
 * HumHub theme where the sidebar is the only mobile navigation.
 *
 * Modern Theme 2026 replaces that with a bottom navigation bar. The sidebar
 * is hidden on mobile, so the swipe gesture just animates a blank white box
 * in from the right — confusing and broken UX.
 *
 * Fix: intercept the 'swiped-left' and 'swiped-right' custom events in the
 * capture phase (before HumHub's bubble-phase handler fires) and stop
 * propagation when the mobile bottom nav is present, preventing HumHub
 * from animating the sidebar.
 */
humhub.module('modernTheme.mobileSwipeFix', function(module, require, $) {

    function hasMobileBottomNav() {
        return !!document.querySelector('.mobile-bottom-nav');
    }

    function blockSwipeSidebar(e) {
        if (hasMobileBottomNav()) {
            e.stopImmediatePropagation();
        }
    }

    function init() {
        // Use native addEventListener with capture:true so we fire BEFORE
        // HumHub's jQuery .on('swiped-left') bubble-phase handler.
        document.addEventListener('swiped-left',  blockSwipeSidebar, true);
        document.addEventListener('swiped-right', blockSwipeSidebar, true);
    }

    module.initOnPjaxLoad = true;
    module.export({
        init: init
    });
});
