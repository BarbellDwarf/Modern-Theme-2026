/**
 * Modern Theme 2026 – Universal Dropdown Manager
 *
 * Listens for Bootstrap dropdown events and manages z-index stacking
 * for dropdowns that might be clipped by overflow containers.
 * Replaces per-widget class toggling scattered across multiple modules.
 */
humhub.module('modernTheme.dropdownManager', function(module, require, $) {
    'use strict';

    var findEntryAncestor = function(el) {
        return $(el).closest('.wall-entry, .stream-entry, .panel, .s-wall-entry')[0] || null;
    };

    var init = function() {
        $(document).on('shown.bs.dropdown.mt2026-dropdown-manager', function(e) {
            var $target = $(e.target);
            var $menu = $target.find('.dropdown-menu').first();
            if (!$menu.length) return;

            // Find the nearest stream entry or panel ancestor
            var $entry = $(findEntryAncestor(e.target));
            if ($entry.length) {
                $entry.addClass('mt2026-dropdown-open');
            }

            // Ensure the menu is visible above content
            $menu.css('z-index', 1000);
        });

        $(document).on('hidden.bs.dropdown.mt2026-dropdown-manager', function(e) {
            var $entry = $(findEntryAncestor(e.target));
            if ($entry.length) {
                $entry.removeClass('mt2026-dropdown-open');
            }
        });
    };

    var unload = function() {
        $(document).off('.mt2026-dropdown-manager');
    };

    module.initOnPjaxLoad = true;
    module.export({
        init: init,
        unload: unload
    });
});
