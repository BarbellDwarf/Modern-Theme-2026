humhub.module('mobileContentToggle', function(module, require, $) {
    'use strict';

    var init = function() {
        if (window.matchMedia('(max-width: 991px)').matches) {
            bindToggle();
        }
        window.matchMedia('(max-width: 991px)').addEventListener('change', function(mql) {
            if (mql.matches) {
                bindToggle();
            }
        });
    };

    var bindToggle = function() {
        $(document).off('.mt2026ContentToggle');
        $(document).on('click.mt2026ContentToggle', '.wall-entry-content.content', function() {
            this.classList.toggle('expanded');
        });
    };

    var unload = function() {
        $(document).off('.mt2026ContentToggle');
    };

    module.initOnPjaxLoad = true;
    module.export({
        init: init,
        unload: unload
    });
});
