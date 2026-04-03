humhub.module('modernTheme.mobileKeyboardFix', function(module, require, $) {
    var initialized = false;
    var SELECTORS = [
        'input[type="text"]',
        'input[type="email"]',
        'input[type="search"]',
        'input[type="url"]',
        'input[type="password"]',
        'input[type="number"]',
        'input[type="tel"]',
        'input[type="date"]',
        'input[type="time"]',
        'textarea',
        '.ql-editor',
        '[contenteditable="true"]'
    ].join(', ');

    function getViewportState() {
        if (window.visualViewport) {
            return {
                height: window.visualViewport.height,
                offsetTop: window.visualViewport.offsetTop
            };
        }
        return {
            height: window.innerHeight,
            offsetTop: 0
        };
    }

    function isMobile() {
        return window.innerWidth <= 767;
    }

    function isScrollable($el) {
        if (!$el || !$el.length) {
            return false;
        }
        var node = $el[0];
        var style = window.getComputedStyle(node);
        var overflowY = style.overflowY;
        return (overflowY === 'auto' || overflowY === 'scroll') && (node.scrollHeight > node.clientHeight + 1);
    }

    function findScrollContainer(el) {
        var $parent = $(el).parent();
        while ($parent.length && !$parent.is('body') && !$parent.is('html')) {
            if (isScrollable($parent)) {
                return $parent[0];
            }
            $parent = $parent.parent();
        }
        return window;
    }

    function scrollIntoSafeView(el) {
        if (!el || document.activeElement !== el || !isMobile()) {
            return;
        }

        var targetRect = el.getBoundingClientRect();
        var viewport = getViewportState();
        var safeBottom = viewport.height + viewport.offsetTop - 28;
        var safeTop = viewport.offsetTop + 12;
        var container = findScrollContainer(el);

        if (container !== window) {
            var containerRect = container.getBoundingClientRect();
            var visibleTop = Math.max(containerRect.top, safeTop);
            var visibleBottom = Math.min(containerRect.bottom, safeBottom);

            if (targetRect.bottom > visibleBottom) {
                container.scrollBy({
                    top: targetRect.bottom - visibleBottom + 12,
                    behavior: 'smooth'
                });
                return;
            }

            if (targetRect.top < visibleTop) {
                container.scrollBy({
                    top: targetRect.top - visibleTop - 12,
                    behavior: 'smooth'
                });
            }
            return;
        }

        if (targetRect.bottom > safeBottom) {
            window.scrollBy({
                top: targetRect.bottom - safeBottom + 12,
                behavior: 'smooth'
            });
            return;
        }

        if (targetRect.top < safeTop) {
            window.scrollBy({
                top: targetRect.top - safeTop - 12,
                behavior: 'smooth'
            });
        }
    }

    function bindKeyboardSafeScroll() {
        if (initialized) {
            return;
        }

        initialized = true;

        var setKeyboardState = function(forceOpen) {
            var active = document.activeElement;
            var hasEditableFocus = !!(active && active.matches && active.matches(SELECTORS));
            var viewportOpen = false;
            var keyboardByDelta = false;

            if (window.visualViewport) {
                var ratio = window.visualViewport.height / window.innerHeight;
                viewportOpen = ratio < 0.86;
                keyboardByDelta = (window.innerHeight - window.visualViewport.height) > 160;
            }

            var open = typeof forceOpen === 'boolean'
                ? forceOpen
                : (viewportOpen || keyboardByDelta || hasEditableFocus);

            $('body').toggleClass('mt2026-keyboard-open', open);
        };

        $(document).on('focusin.mt2026Keyboard', SELECTORS, function() {
            var el = this;
            setKeyboardState(true);
            setTimeout(function() {
                scrollIntoSafeView(el);
            }, 250);
            setTimeout(function() {
                scrollIntoSafeView(el);
            }, 500);
        });

        $(document).on('input.mt2026Keyboard', SELECTORS, function() {
            var el = this;
            setTimeout(function() {
                scrollIntoSafeView(el);
            }, 0);
        });

        $(document).on('focusout.mt2026Keyboard', SELECTORS, function() {
            setTimeout(function() {
                var active = document.activeElement;
                var stillTyping = active && active.matches && active.matches(SELECTORS);
                if (!stillTyping) {
                    setKeyboardState();
                }
            }, 50);
        });

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', function() {
                if (window.innerWidth > 767) {
                    setKeyboardState(false);
                    return;
                }

                setKeyboardState();

                var el = document.activeElement;
                if (el && el.matches && el.matches(SELECTORS)) {
                    setTimeout(function() {
                        scrollIntoSafeView(el);
                    }, 80);
                }
            });
        }
    }

    function init() {
        bindKeyboardSafeScroll();
    }

    module.initOnPjaxLoad = true;
    module.export({
        init: init
    });
});
