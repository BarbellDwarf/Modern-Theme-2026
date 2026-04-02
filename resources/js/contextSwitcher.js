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
        initPeopleFilters();
        initSpaceSidebarMobile();

        if (!pjax) {
            initMobileInputScroll();
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
        var $label = $('.context-switcher-button .context-label');
        var $icon = $('.context-switcher-button .context-icon');

        if (!$label.length) return;

        // Never replace the icon class here: server-rendered icon can be an <img>.
        // Sync button state from the active context item when available.
        var $activeItem = $('#context-spaces-list .context-item.active').first();
        if ($activeItem.length) {
            var activeName = $activeItem.find('.item-name').text().trim();
            var activeIconHtml = $activeItem.find('.item-icon').html();

            if (activeName) {
                $label.text(activeName);
            }
            if (activeIconHtml && $icon.length) {
                $icon.html(activeIconHtml);
            }
            return;
        }

        // Fallback: keep server-rendered label/icon intact.
        var defaultLabel = $label.data('default');
        if (defaultLabel) {
            $label.text(defaultLabel);
        }
    };

    var initSpaceSidebarMobile = function() {
        if (window.innerWidth > 991) return;

        var $container = $('.layout-nav-container');
        if (!$container.length) return;

        // Remove any old toggle injected by a previous run to avoid duplicates on pjax navigation
        $container.find('.mt2026-space-nav-toggle').remove();

        var $nav = $container.find('.list-group, .nav').first();
        if (!$nav.length) return;

        // Remove old collapse classes — CSS handles horizontal scroll, no JS collapse needed
        $nav.removeClass('mt2026-space-nav-collapsed mt2026-space-nav-expanded');
    };

    var initPeopleFilters = function() {
        if (window.innerWidth >= 768) return;

        // Find the People page filter row (contains keyword search)
        var $row = $('.panel-body .row.gy-2').filter(function() {
            return $(this).find('.form-search-filter-keyword').length > 0;
        });

        if (!$row.length) return;

        // Only inject once
        if ($row.find('.mt2026-more-filters-btn-wrap').length) return;

        var $btnWrap = $('<div class="mt2026-more-filters-btn-wrap col-12">' +
            '<button class="mt2026-more-filters-btn" type="button">' +
            '<i class="fa fa-sliders"></i> Filters</button></div>');

        $row.find('.form-search-filter-keyword').after($btnWrap);

        $btnWrap.find('.mt2026-more-filters-btn').on('click', function() {
            var $btn = $(this);
            $row.toggleClass('filters-expanded');
            $btn.toggleClass('active');
        });

        // Prevent auto-focus on keyword input on mobile
        $row.find('.form-search-filter-keyword input').blur();
    };

    var initMobileInputScroll = function() {
        if (window.innerWidth > 767) return;

        var SELECTORS = 'input[type="text"], input[type="email"], input[type="search"], input[type="url"], input[type="password"], textarea, .ql-editor, [contenteditable="true"]';

        var scrollElIntoView = function(el) {
            if (!el || document.activeElement !== el) return;

            var rect = el.getBoundingClientRect();

            if (window.visualViewport) {
                // Use visualViewport for accurate keyboard-aware positioning
                var vv = window.visualViewport;
                var elBottom = rect.bottom;
                var visibleBottom = vv.height + vv.offsetTop;
                var margin = 40;
                if (elBottom > visibleBottom - margin) {
                    window.scrollBy({ top: elBottom - (visibleBottom - margin), behavior: 'smooth' });
                }
            } else {
                // Fallback: estimate keyboard height as 40% of viewport
                var keyboardEst = window.innerHeight * 0.4;
                var visibleBottom2 = window.innerHeight - keyboardEst;
                if (rect.bottom > visibleBottom2) {
                    window.scrollBy({ top: rect.bottom - visibleBottom2 + 40, behavior: 'smooth' });
                }
            }
        };

        $(document).on('focus', SELECTORS, function() {
            var el = this;
            // Wait for keyboard to appear (typically 300–400 ms on Android/iOS)
            setTimeout(function() { scrollElIntoView(el); }, 400);
        });

        // visualViewport resize fires when keyboard appears/disappears
        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function() {
                var el = document.activeElement;
                if (el && el.matches(SELECTORS)) {
                    setTimeout(function() { scrollElIntoView(el); }, 100);
                }
            });
        }
    };

    module.initOnPjaxLoad = true;

    module.export({
        init: init,
        open: openSwitcher,
        close: closeSwitcher,
        toggle: toggleSwitcher
    });
});
