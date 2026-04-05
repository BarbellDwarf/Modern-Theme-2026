humhub.module('modernTheme.peopleFocusGuard', function(module, require, $) {

    function isMobile() {
        return window.innerWidth <= 991;
    }

    function isPeoplePage() {
        var p = window.location.pathname || '';
        return p.indexOf('/user/people') !== -1 || p === '/people' || p.indexOf('/people?') !== -1;
    }

    // ─── Autofocus suppression ────────────────────

    var suppressUntil = 0;
    var captureInstalled = false;

    function onFocusCapture(e) {
        if (Date.now() > suppressUntil) { return; }
        var $t = $(e.target);
        if ($t.closest('form.form-search').length) {
            e.stopImmediatePropagation();
            setTimeout(function() {
                if (document.activeElement === e.target) { e.target.blur(); }
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

    // ─── FAB Search UI ──────────────────────────────────────────────────────────

    var fabInjected = false;

    function setupPeopleMobile() {
        // Hide search panel — use PHP-rendered class if present, else add it via JS
        var $panel = $('.mt2026-people-search-panel');
        if (!$panel.length) {
            // Fallback: find the panel-body containing the people search form
            $panel = $('form.form-search').closest('.panel-body');
            $panel.addClass('mt2026-people-search-panel');
        }

        // Hide invite button on mobile
        $('.mt2026-people-invite-btn').addClass('mt2026-people-invite-hidden');

        // Inject FAB + overlay once
        if (fabInjected || $('#mt2026-search-fab').length) { return; }

        var fabHtml =
            '<button type="button" class="mt2026-search-fab" id="mt2026-search-fab" aria-label="Search people">' +
            '<i class="fa fa-search"></i></button>';

        var overlayHtml =
            '<div class="mt2026-search-overlay" id="mt2026-search-overlay" role="search">' +
            '<button type="button" id="mt2026-search-back" aria-label="Close search"><i class="fa fa-arrow-left"></i></button>' +
            '<form method="get" action="/user/people" style="display:contents">' +
            '<input type="text" name="keyword" placeholder="Search people\u2026" autocomplete="off">' +
            '<button type="submit" aria-label="Search"><i class="fa fa-search"></i></button>' +
            '</form></div>';

        $('body').append(fabHtml).append(overlayHtml);

        $(document).on('click.mt2026Fab', '#mt2026-search-fab', openSearch);
        $(document).on('click.mt2026Fab', '#mt2026-search-back', closeSearch);
        $(document).on('keydown.mt2026Search', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) { closeSearch(); }
        });

        fabInjected = true;
    }

    function openSearch() {
        $('#mt2026-search-overlay').addClass('open');
        setTimeout(function() {
            var inp = document.querySelector('#mt2026-search-overlay input[type="text"]');
            if (inp) { inp.focus(); }
        }, 80);
    }

    function closeSearch() {
        $('#mt2026-search-overlay').removeClass('open');
    }

    function teardown() {
        $('#mt2026-search-fab').remove();
        $('#mt2026-search-overlay').remove();
        // Do NOT remove mt2026-people-search-panel — it's rendered by PHP and
        // the CSS hide rule is intentional when not on the people page.
        $('.mt2026-people-invite-btn').removeClass('mt2026-people-invite-hidden');
        $(document).off('click.mt2026Fab keydown.mt2026Search');
        fabInjected = false;
        removeCaptureGuard();
    }

    // ─── Module init ────────────────────────────────────────────────────────────

    var init = function() {
        if (!isPeoplePage() || !isMobile()) {
            teardown();
            return;
        }

        installCaptureGuard();
        setupPeopleMobile();

        // Belt-and-suspenders: blur any search input that cards.js may have focused
        setTimeout(function() {
            var a = document.activeElement;
            if (a && $(a).closest('form.form-search').length) { a.blur(); }
        }, 200);
        setTimeout(function() {
            var a = document.activeElement;
            if (a && $(a).closest('form.form-search').length) { a.blur(); }
            setTimeout(removeCaptureGuard, 100);
        }, 1200);
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init });
});
