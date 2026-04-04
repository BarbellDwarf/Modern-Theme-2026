humhub.module('modernTheme.mobileKeyboardFix', function(module, require, $) {
    var initialized = false;

    // HumHub uses ProseMirror for rich-text editing (.ProseMirror[contenteditable="true"]).
    // The legacy .ql-editor (Quill) selector is replaced with the correct ProseMirror class.
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
        '.ProseMirror',
        '[contenteditable="true"]'
    ].join(', ');

    function getViewportState() {
        if (window.visualViewport) {
            return {
                height: window.visualViewport.height,
                offsetTop: window.visualViewport.offsetTop,
                pageTop: window.visualViewport.pageTop || 0
            };
        }
        return {
            height: window.innerHeight,
            offsetTop: 0,
            pageTop: window.pageYOffset || 0
        };
    }

    function isMobile() {
        return window.innerWidth <= 991;
    }

    // Set --vvh CSS variable on :root so CSS can react to visual viewport height
    // (e.g. modal max-height when keyboard is open on iOS).
    function updateVvhVar() {
        var h = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        document.documentElement.style.setProperty('--vvh', h + 'px');
    }

    function isScrollableNode(node) {
        if (!node || node === document.body || node === document.documentElement) {
            return false;
        }
        var style = window.getComputedStyle(node);
        var overflowY = style.overflowY;
        return (overflowY === 'auto' || overflowY === 'scroll') && (node.scrollHeight > node.clientHeight + 1);
    }

    // Walk up the DOM looking for a scrollable container.
    // Prefer .modal-content on mobile (modals scroll their own body).
    function findScrollContainer(el) {
        var node = el.parentElement;
        while (node && node !== document.body && node !== document.documentElement) {
            // Prefer modal content container — it's the right scroll parent on mobile
            if (node.classList && node.classList.contains('modal-content')) {
                return node;
            }
            if (isScrollableNode(node)) {
                return node;
            }
            node = node.parentElement;
        }
        return window;
    }

    function scrollIntoSafeView(el) {
        if (!el || !isMobile()) {
            return;
        }
        // Only act when this element (or one of its children for contenteditable) is still active
        var active = document.activeElement;
        var stillActive = active === el || (el.contains && el.contains(active));
        if (!stillActive) {
            return;
        }

        var viewport = getViewportState();
        // safeBottom: the lowest visible Y coordinate (above keyboard + small margin)
        var safeBottom = viewport.height - 28;
        var safeTop = 12;

        // For contenteditable elements (ProseMirror), prefer scrolling the cursor
        // into view using the browser-native method first, then do manual correction.
        if (el.isContentEditable) {
            try {
                var sel = window.getSelection();
                if (sel && sel.rangeCount > 0) {
                    var range = sel.getRangeAt(0);
                    var cursorRect = range.getBoundingClientRect();
                    if (cursorRect.height > 0) {
                        // Use cursor position for scroll target
                        if (cursorRect.bottom > safeBottom) {
                            window.scrollBy({ top: cursorRect.bottom - safeBottom + 12, behavior: 'smooth' });
                        } else if (cursorRect.top < safeTop) {
                            window.scrollBy({ top: cursorRect.top - safeTop - 12, behavior: 'smooth' });
                        }
                        return;
                    }
                }
            } catch (e) { /* selection API not available */ }
        }

        var targetRect = el.getBoundingClientRect();
        var container = findScrollContainer(el);

        if (container !== window) {
            // Scroll within the container (e.g. .modal-content)
            var containerRect = container.getBoundingClientRect();
            var visibleTop = Math.max(containerRect.top, safeTop);
            var visibleBottom = Math.min(containerRect.bottom, safeBottom);

            if (targetRect.bottom > visibleBottom) {
                container.scrollBy({ top: targetRect.bottom - visibleBottom + 12, behavior: 'smooth' });
                return;
            }
            if (targetRect.top < visibleTop) {
                container.scrollBy({ top: targetRect.top - visibleTop - 12, behavior: 'smooth' });
            }
            return;
        }

        // Fallback: scroll the page
        if (targetRect.bottom > safeBottom) {
            window.scrollBy({ top: targetRect.bottom - safeBottom + 12, behavior: 'smooth' });
            return;
        }
        if (targetRect.top < safeTop) {
            window.scrollBy({ top: targetRect.top - safeTop - 12, behavior: 'smooth' });
        }
    }

    function bindKeyboardSafeScroll() {
        if (initialized) {
            return;
        }

        initialized = true;

        // Initialise --vvh immediately
        updateVvhVar();

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
                : ((viewportOpen || keyboardByDelta) && hasEditableFocus);

            $('body').toggleClass('mt2026-keyboard-open', open);
        };

        $(document).on('focusin.mt2026Keyboard', SELECTORS, function() {
            var el = this;
            setKeyboardState(true);
            // Scroll after keyboard animation: 300ms (Android), 400ms (iOS), 600ms (safety)
            setTimeout(function() { scrollIntoSafeView(el); }, 300);
            setTimeout(function() { scrollIntoSafeView(el); }, 600);
        });

        $(document).on('input.mt2026Keyboard', SELECTORS, function() {
            var el = this;
            setTimeout(function() { scrollIntoSafeView(el); }, 0);
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
                updateVvhVar();

                if (window.innerWidth > 991) {
                    setKeyboardState(false);
                    return;
                }

                setKeyboardState();

                var el = document.activeElement;
                if (el && el.matches && el.matches(SELECTORS)) {
                    setTimeout(function() { scrollIntoSafeView(el); }, 80);
                }
            });

            // Also update on scroll (iOS Safari can fire scroll on visualViewport)
            window.visualViewport.addEventListener('scroll', function() {
                updateVvhVar();
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
