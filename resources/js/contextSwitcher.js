humhub.module('modernTheme.contextSwitcher', function(module, require, $) {

    var isOpen = false;

    var init = function(pjax) {
        bindToggleButton();
        bindOutsideClick();
        bindKeyboard();
        bindArrowNavigation();
        bindSearch();
        bindExpandSections();
        updateActiveState();

        if (!pjax) {
            $(document).on('pjax:end', function() {
                init(true);
            });
        }
    };

    var openSwitcher = function() {
        var $menu = $('#context-switcher-menu');
        var $btn = $('.context-switcher-button');

        if (!$menu.length) return;

        $menu.css('display', '');
        $btn.attr('aria-expanded', 'true').addClass('active');
        isOpen = true;

        if (window.innerWidth < 768) {
            $('body').css('overflow', 'hidden');
        }

        var $search = $('#context-search-input');
        if ($search.length) {
            $search.val('').trigger('input').focus();
        }
    };

    var closeSwitcher = function() {
        var $menu = $('#context-switcher-menu');
        var $btn = $('.context-switcher-button');

        $menu.css('display', 'none');
        $btn.attr('aria-expanded', 'false').removeClass('active');
        isOpen = false;

        $('body').css('overflow', '');
    };

    var toggleSwitcher = function() {
        if (isOpen) {
            closeSwitcher();
        } else {
            openSwitcher();
        }
    };

    var bindToggleButton = function() {
        $(document).off('click.contextSwitcher', '#context-switcher-btn, .context-switcher-button')
            .on('click.contextSwitcher', '#context-switcher-btn, .context-switcher-button', function(e) {
                e.stopPropagation();
                toggleSwitcher();
            });
    };

    var bindOutsideClick = function() {
        $(document).off('mousedown.contextSwitcher')
            .on('mousedown.contextSwitcher', function(e) {
                if (isOpen && !$(e.target).closest('#context-switcher').length) {
                    closeSwitcher();
                }
            });
    };

    var bindKeyboard = function() {
        document.removeEventListener('keydown', handleKeydown);
        document.addEventListener('keydown', handleKeydown);
    };

    var handleKeydown = function(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            toggleSwitcher();
        }
        if (e.key === 'Escape') {
            closeSwitcher();
        }
    };

    var bindArrowNavigation = function() {
        $(document).off('keydown.contextNav', '#context-switcher-menu, #context-search-input')
            .on('keydown.contextNav', '#context-switcher-menu, #context-search-input', function(e) {
                if (!isOpen) return;

                if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                    e.preventDefault();

                    var $items = $('#context-switcher-menu .context-item:visible');
                    var $search = $('#context-search-input');
                    var $focused = $(document.activeElement);
                    var currentIndex = $items.index($focused);

                    if (e.key === 'ArrowDown') {
                        if ($focused.is($search) || currentIndex < 0) {
                            $items.first().focus();
                        } else if (currentIndex >= $items.length - 1) {
                            $search.focus();
                        } else {
                            $items.eq(currentIndex + 1).focus();
                        }
                    } else {
                        if ($focused.is($search)) {
                            $items.last().focus();
                        } else if (currentIndex <= 0) {
                            $search.focus();
                        } else {
                            $items.eq(currentIndex - 1).focus();
                        }
                    }
                }
            });
    };

    var bindSearch = function() {
        $(document).off('input.contextSearch', '#context-search-input')
            .on('input.contextSearch', '#context-search-input', function() {
                var query = $(this).val().toLowerCase().trim();
                var $menu = $('#context-switcher-menu');

                $menu.find('.context-item').each(function() {
                    var $item = $(this);
                    var name = $item.find('.item-name').text().toLowerCase();
                    var searchName = ($item.data('search-name') || '').toLowerCase();
                    var matches = !query || name.indexOf(query) !== -1 || searchName.indexOf(query) !== -1;
                    $item.toggle(matches);
                });

                $menu.find('.context-section').each(function() {
                    var hasVisible = $(this).find('.context-item:visible').length > 0;
                    $(this).toggle(hasVisible);
                });
            });
    };

    var bindExpandSections = function() {
        $(document).off('click.contextExpand', '.expand-toggle')
            .on('click.contextExpand', '.expand-toggle', function(e) {
                e.stopPropagation();
                var $toggle = $(this);
                var $content = $toggle.siblings('.expand-content');
                $toggle.toggleClass('expanded');
                $content.toggleClass('expanded');
            });
    };

    var updateActiveState = function() {
        var path = window.location.pathname;
        var $label = $('.context-switcher-button .context-label');
        var $icon = $('.context-switcher-button .context-icon');

        if (!$label.length) return;

        // Check for space context
        var spaceMatch = path.match(/\/s\/([^\/]+)/);
        // Check for user profile context
        var userMatch = path.match(/\/u\/([^\/]+)/);

        if (spaceMatch) {
            var spaceName = spaceMatch[1].replace(/-/g, ' ');
            $label.text(spaceName.charAt(0).toUpperCase() + spaceName.slice(1));
            if ($icon.length) {
                $icon.attr('class', 'context-icon fa fa-users');
            }
        } else if (userMatch) {
            $label.text(userMatch[1].replace(/-/g, ' '));
            if ($icon.length) {
                $icon.attr('class', 'context-icon fa fa-user');
            }
        } else {
            $label.text($label.data('default') || $label.text());
        }
    };

    module.export = {
        init: init,
        open: openSwitcher,
        close: closeSwitcher,
        toggle: toggleSwitcher
    };
});
