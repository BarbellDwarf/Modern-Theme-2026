humhub.module('modernTheme.mailLayout', function(module, require, $) {
    'use strict';
    var composerObserver = null;

    function isMailPage() {
        return window.location.pathname.indexOf('/mail/') !== -1
            || document.getElementById('mail-conversation-root') !== null;
    }

    function closeMailList() {
        document.body.classList.remove('mail-list-open');
    }

    function openMailList() {
        document.body.classList.add('mail-list-open');
    }

    function setFullscreenMode(active) {
        if (active) {
            document.body.classList.add('mt2026-mail-fullscreen');
        } else {
            document.body.classList.remove('mt2026-mail-fullscreen');
            document.body.classList.remove('mt2026-mail-composer-docked');
            document.body.style.removeProperty('--mt2026-mail-composer-height');
            closeMailList();
        }
    }

    function updateComposerHeight() {
        var dock = document.getElementById('mt2026-mail-composer-dock');
        if (!dock || !dock.firstElementChild) {
            return;
        }
        var height = dock.getBoundingClientRect().height;
        if (height > 0) {
            document.body.style.setProperty('--mt2026-mail-composer-height', (Math.ceil(height) + 12) + 'px');
        }
    }

    function dockComposer() {
        if (!isMailPage()) {
            var oldDock = document.getElementById('mt2026-mail-composer-dock');
            if (oldDock) {
                oldDock.remove();
            }
            document.body.classList.remove('mt2026-mail-composer-docked');
            document.body.style.removeProperty('--mt2026-mail-composer-height');
            return;
        }

        var root = document.getElementById('mail-conversation-root');
        if (!root) {
            return;
        }
        var composer = root.querySelector('.mail-message-form');
        if (!composer) {
            return;
        }

        var dock = document.getElementById('mt2026-mail-composer-dock');
        if (!dock) {
            dock = document.createElement('div');
            dock.id = 'mt2026-mail-composer-dock';
            document.body.appendChild(dock);
        }

        if (composer.parentElement !== dock) {
            dock.appendChild(composer);
        }

        document.body.classList.add('mt2026-mail-composer-docked');
        updateComposerHeight();
    }

    function ensureObserver() {
        if (composerObserver) {
            return;
        }
        composerObserver = new MutationObserver(function() {
            dockComposer();
        });
        composerObserver.observe(document.body, {childList: true, subtree: true});
    }

    function initMailDrawer() {
        if (!isMailPage()) {
            setFullscreenMode(false);
            return;
        }
        setFullscreenMode(true);
        ensureObserver();
        dockComposer();

        var sidebar = document.getElementById('mail-conversation-overview');

        var header = document.getElementById('mail-conversation-header');
        if (header && !header.querySelector('.mt2026-mail-topbar-toggle')) {
            var mobileButton = document.createElement('a');
            mobileButton.href = '/mail/mail/index';
            mobileButton.className = 'mt2026-mail-topbar-toggle';
            mobileButton.setAttribute('aria-label', 'Open conversations');
            mobileButton.innerHTML = '<i class="fa fa-bars"></i>Conversations';
            mobileButton.addEventListener('click', function(e) {
                if (document.getElementById('mail-conversation-overview')) {
                    e.preventDefault();
                    openMailList();
                }
            });
            header.insertBefore(mobileButton, header.firstChild);
        }

        if (!sidebar) {
            return;
        }

        var headingToggle = sidebar.querySelector('.panel-heading > a');
        if (headingToggle && !headingToggle.hasAttribute('data-mt2026-mail-toggle')) {
            headingToggle.setAttribute('data-mt2026-mail-toggle', '1');
            headingToggle.addEventListener('click', function(e) {
                e.preventDefault();
                if (document.body.classList.contains('mail-list-open')) {
                    closeMailList();
                } else {
                    openMailList();
                }
            });
        }

        sidebar.querySelectorAll('.messagePreviewEntry a, .messagePreviewEntry').forEach(function(el) {
            if (el.hasAttribute('data-mt2026-mail-select')) {
                return;
            }
            el.setAttribute('data-mt2026-mail-select', '1');
            el.addEventListener('click', function() {
                closeMailList();
            });
        });

        if (!document.body.hasAttribute('data-mt2026-mail-overlay')) {
            document.body.setAttribute('data-mt2026-mail-overlay', '1');
            document.body.addEventListener('click', function(e) {
                if (!document.body.classList.contains('mail-list-open')) {
                    return;
                }
                var withinSidebar = !!e.target.closest('#mail-conversation-overview');
                var isToggle = !!e.target.closest('#mail-conversation-overview .panel-heading > a');
                if (!withinSidebar && !isToggle) {
                    closeMailList();
                }
            });
        }
    }

    $(document).on('humhub:ready pjax:end humhub:navigate', initMailDrawer);
    $(window).on('resize orientationchange', function() {
        updateComposerHeight();
    });
    module.export({
        init: initMailDrawer
    });
});
