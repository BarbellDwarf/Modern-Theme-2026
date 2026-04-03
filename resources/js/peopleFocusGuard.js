humhub.module('modernTheme.peopleFocusGuard', function(module, require, $) {
    function isPeoplePage() {
        var path = window.location.pathname || '';
        return path.indexOf('/user/people') !== -1;
    }

    function blurPeopleKeywordInput() {
        if (!isPeoplePage()) {
            return;
        }

        var $input = $('.form-search-filter-keyword input[type="text"], .form-search-filter-keyword input[type="search"]').first();
        if (!$input.length) {
            return;
        }

        if (document.activeElement === $input[0]) {
            $input.trigger('blur');
        }

        // Prevent subsequent scripted focus when navigating into People via PJAX.
        $input.attr('autofocus', false);
    }

    var init = function() {
        setTimeout(blurPeopleKeywordInput, 0);
        setTimeout(blurPeopleKeywordInput, 150);
        setTimeout(blurPeopleKeywordInput, 350);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init });
});
