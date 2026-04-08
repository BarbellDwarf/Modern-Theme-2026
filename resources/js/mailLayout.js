humhub.module('modernTheme.mailLayout', function(module, require, $) {
    'use strict';

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
            document.body.classList.add('mt2026-mail-page');
        } else {
            document.body.classList.remove('mt2026-mail-fullscreen');
            document.body.classList.remove('mt2026-mail-page');
            closeMailList();
        }
    }

    function initMailDrawer() {
        if (!isMailPage()) {
            setFullscreenMode(false);
            return;
        }
        setFullscreenMode(true);

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
    module.export({
        init: initMailDrawer
    });
});
