humhub.module('modernTheme.peopleFocusGuard', function(module, require, $) {

    function isMobileViewport() {
        return window.innerWidth <= 991 || /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }

    function isPeoplePage() {
        return (window.location.pathname || '').indexOf('/user/people') !== -1;
    }

    // ─── Autofocus suppression (prevents cards.js from opening keyboard) ────────

    var suppressUntil = 0;
    var captureInstalled = false;

    function onFocusCapture(e) {
        if (Date.now() > suppressUntil) {
            return;
        }
        var target = e.target;
        if (!target) {
            return;
        }
        var $t = $(target);
        if ($t.closest('.form-search-filter-keyword').length || $t.closest('form.form-search').length) {
            e.stopImmediatePropagation();
            setTimeout(function() {
                if (document.activeElement === target) {
                    target.blur();
                }
            }, 0);
        }
    }

    function installCaptureGuard() {
        if (!captureInstalled) {
            document.addEventListener('focus', onFocusCapture, true);
            captureInstalled = true;
        }
        suppressUntil = Date.now() + 1200;
    }

    function removeCaptureGuard() {
        if (captureInstalled) {
            document.removeEventListener('focus', onFocusCapture, true);
            captureInstalled = false;
        }
        suppressUntil = 0;
    }

    function blurCurrentIfSearch() {
        var active = document.activeElement;
        if (!active) {
            return;
        }
        var $a = $(active);
        if ($a.closest('.form-search-filter-keyword').length || $a.closest('form.form-search').length) {
            active.blur();
        }
    }

    // ─── FAB Search UI ──────────────────────────────────────────────────────────

    var fabInjected = false;

    function getSearchPanel() {
        // The panel-body that wraps form.form-search
        return $('form.form-search').closest('.panel-body');
    }

    function injectFAB() {
        if (fabInjected) {
            return;
        }

        var $panel = getSearchPanel();
        if (!$panel.length) {
            return;
        }

        // Mark panel with our class for CSS targeting
        $panel.addClass('mt2026-people-search-panel');
        $('body').addClass('mt2026-people-mobile');

        // Build the overlay: back arrow + cloned input from form + submit
        var $form = $panel.find('form.form-search');
        var $input = $panel.find('input[type="text"], input[type="search"]').first();
        var inputName = $input.attr('name') || 'keyword';
        var inputVal  = $input.val() || '';
        var placeholder = $input.attr('placeholder') || 'Search...';
        var formAction = $form.attr('action') || window.location.pathname;
        var formMethod = ($form.attr('method') || 'get').toLowerCase();

        var overlayHtml =
            '<div class="mt2026-search-overlay" id="mt2026-search-overlay" role="search">' +
            '  <button type="button" class="mt2026-search-overlay-back" id="mt2026-search-back" aria-label="Close search">' +
            '    <i class="fa fa-arrow-left"></i>' +
            '  </button>' +
            '  <form method="' + formMethod + '" action="' + formAction + '" style="display:contents">' +
            '    <input type="hidden" name="page" value="1">' +
            '    <input type="text" name="' + inputName + '" value="' + $('<div>').text(inputVal).html() + '" placeholder="' + $('<div>').text(placeholder).html() + '" autocomplete="off">' +
            '    <button type="submit"><i class="fa fa-search"></i></button>' +
            '  </form>' +
            '</div>';

        var fabHtml =
            '<button type="button" class="mt2026-search-fab" id="mt2026-search-fab" aria-label="Search people">' +
            '  <i class="fa fa-search"></i>' +
            '</button>';

        $('body').append(overlayHtml).append(fabHtml);

        // Wire events
        $(document).on('click', '#mt2026-search-fab', function() {
            openSearchOverlay();
        });

        $(document).on('click', '#mt2026-search-back', function() {
            closeSearchOverlay();
        });

        // Close overlay on Escape
        $(document).on('keydown.mt2026SearchOverlay', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                closeSearchOverlay();
            }
        });

        fabInjected = true;
    }

    function openSearchOverlay() {
        var $overlay = $('#mt2026-search-overlay');
        if (!$overlay.length) {
            return;
        }
        $overlay.addClass('open');
        // Intentional focus — user requested the keyboard by tapping
        var $input = $overlay.find('input[type="text"]');
        setTimeout(function() {
            $input[0] && $input[0].focus();
        }, 100);
    }

    function closeSearchOverlay() {
        $('#mt2026-search-overlay').removeClass('open');
    }

    function removeFAB() {
        $('#mt2026-search-fab').remove();
        $('#mt2026-search-overlay').remove();
        $('body').removeClass('mt2026-people-mobile');
        $('.mt2026-people-search-panel').removeClass('mt2026-people-search-panel');
        fabInjected = false;
    }

    // ─── Module init ────────────────────────────────────────────────────────────

    var init = function() {
        var onMobile = isMobileViewport();
        var onPeople = isPeoplePage();

        if (!onPeople) {
            removeFAB();
            removeCaptureGuard();
            return;
        }

        if (!onMobile) {
            // Desktop: ensure any leftover mobile UI is removed
            removeFAB();
            removeCaptureGuard();
            return;
        }

        // Mobile people page: suppress autofocus + inject FAB
        installCaptureGuard();

        // Inject FAB after a short delay so the DOM is ready
        setTimeout(function() {
            injectFAB();
            blurCurrentIfSearch();
        }, 50);

        setTimeout(blurCurrentIfSearch, 200);
        setTimeout(function() {
            blurCurrentIfSearch();
            setTimeout(removeCaptureGuard, 100);
        }, 1200);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init });
});


