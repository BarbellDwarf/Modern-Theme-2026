humhub.module('modernTheme.mailLayout', function(module, require, $) {
    'use strict';

    var resizeTimer = null;
    var searchTimer = null;
    var scrollObserver = null;
    var headerObserver = null;

    function isMailPage() {
        return window.location.pathname.indexOf('/mail/') !== -1
            || document.getElementById('mail-conversation-root') !== null;
    }

    function closeMailList() {
        document.body.classList.remove('mail-list-open');
        updateToggleAria(false);
    }

    function openMailList() {
        document.body.classList.add('mail-list-open');
        updateToggleAria(true);
        focusFirstEntry();
    }

    function updateToggleAria(isOpen) {
        var toggle = document.querySelector('.mt2026-mail-topbar-toggle');
        if (toggle) {
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute('aria-label', isOpen ? 'Close conversations list' : 'Open conversations list');
        }
    }

    function focusFirstEntry() {
        var first = document.querySelector('.messagePreviewEntry');
        if (first) {
            try { first.focus(); } catch (e) {}
        }
    }

    function setFullscreenMode(active) {
        if (active) {
            document.body.classList.add('mt2026-mail-fullscreen');
            document.body.classList.add('mt2026-mail-page');
        } else {
            document.body.classList.remove('mt2026-mail-fullscreen');
            document.body.classList.remove('mt2026-mail-page');
            document.body.classList.remove('mt2026-mail-has-conversation');
            closeMailList();
        }
    }

    function hasConversationIdInUrl() {
        try {
            var params = new URLSearchParams(window.location.search || '');
            var id = params.get('id');
            return !!(id && String(id).trim().length > 0);
        } catch (e) {
            return /[?&]id=\d+/.test(window.location.search || '');
        }
    }

    function hasActiveConversation() {
        if (hasConversationIdInUrl()) return true;
        if (document.querySelectorAll('.conversation-entry-list .mail-conversation-entry').length > 0) return true;
        return !!(
            document.getElementById('mail-conversation-header')
            && document.querySelector('.mail-message-form, .conversation-entry-list, .panel-body.conversation-entry-container')
        );
    }

    function setConversationActive(active) {
        if (active) {
            document.body.classList.add('mt2026-mail-has-conversation');
        } else {
            document.body.classList.remove('mt2026-mail-has-conversation');
            document.body.classList.remove('mail-list-open');
        }
    }

    function isMobileWidth() {
        return window.innerWidth <= 991;
    }

    function scrollConversationToLatest() {
        var list = document.querySelector('.conversation-entry-list');
        if (!list) return;

        window.requestAnimationFrame(function() {
            list.scrollTop = list.scrollHeight;
        });

        // Use MutationObserver instead of hardcoded timeouts
        if (scrollObserver) scrollObserver.disconnect();
        scrollObserver = new MutationObserver(function() {
            list.scrollTop = list.scrollHeight;
        });
        scrollObserver.observe(list, { childList: true, subtree: true, characterData: true });

        // Fallback timeout in case observer doesn't fire
        window.setTimeout(function() {
            if (list) list.scrollTop = list.scrollHeight;
            if (scrollObserver) { scrollObserver.disconnect(); scrollObserver = null; }
        }, 2000);
    }

    function sizeMobileConversationList() {
        if (!isMobileWidth()) return;

        var list = document.querySelector('.conversation-entry-list');
        var header = document.getElementById('mail-conversation-header');
        var composer = document.querySelector('.mt2026-mail-composer-dock, .mail-message-form');
        if (!list || !header || !composer) return;

        try {
            var headerBottom = Math.ceil(header.getBoundingClientRect().bottom);
            var composerTop = Math.floor(composer.getBoundingClientRect().top);
            var reservedBottom = Math.max(56, window.innerHeight - composerTop);
            if (!isFinite(reservedBottom) || reservedBottom < 56 || reservedBottom > window.innerHeight) {
                reservedBottom = 56;
            }
            var available = window.innerHeight - headerBottom - reservedBottom;
            if (available > 120) {
                list.style.setProperty('height', available + 'px', 'important');
                list.style.setProperty('max-height', available + 'px', 'important');
                list.style.setProperty('min-height', '120px', 'important');
            }
        } catch (e) {
            module.log.error('sizeMobileConversationList failed', e);
        }
    }

    function ensureHeaderToggle(retries) {
        var header = document.getElementById('mail-conversation-header');
        if (!header) {
            if (retries > 0) {
                window.setTimeout(function() { ensureHeaderToggle(retries - 1); }, 120);
            }
            return;
        }

        if (!header.querySelector('.mt2026-mail-topbar-toggle')) {
            var mobileButton = document.createElement('a');
            mobileButton.href = '#';
            mobileButton.className = 'mt2026-mail-topbar-toggle';
            mobileButton.setAttribute('aria-label', 'Open conversations list');
            mobileButton.setAttribute('aria-expanded', 'false');
            mobileButton.setAttribute('aria-controls', 'mail-conversation-overview');
            mobileButton.setAttribute('role', 'button');
            mobileButton.innerHTML = '<span class="mt2026-mail-topbar-toggle-icon" aria-hidden="true">&#9776;</span>';
            header.insertBefore(mobileButton, header.firstChild);
        }

        var toggles = header.querySelectorAll('.mt2026-mail-topbar-toggle');
        if (toggles.length > 1) {
            for (var i = 1; i < toggles.length; i++) {
                toggles[i].remove();
            }
        }
    }

    function ensureBackButton() {
        var header = document.getElementById('mail-conversation-header');
        if (!header) return;
        if (header.querySelector('.mt2026-mail-back-btn')) return;

        var backBtn = document.createElement('a');
        backBtn.href = '#';
        backBtn.className = 'mt2026-mail-back-btn';
        backBtn.setAttribute('aria-label', 'Back to conversations');
        backBtn.setAttribute('role', 'button');
        backBtn.innerHTML = '<span aria-hidden="true">&#8592;</span>';
        backBtn.addEventListener('click', function(e) {
            e.preventDefault();
            setConversationActive(false);
            if (isMobileWidth()) {
                openMailList();
            }
        });
        header.insertBefore(backBtn, header.firstChild);
    }

    function injectSearchHTML() {
        var sidebar = document.getElementById('mail-conversation-overview');
        if (!sidebar) return;
        if (sidebar.querySelector('.mt2026-mail-sidebar-search')) return;

        var heading = sidebar.querySelector('.panel-heading');
        if (!heading) return;

        var searchHTML = '<div class="mt2026-mail-sidebar-search">'
            + '<div class="mt2026-mail-sidebar-search__field">'
            + '<span class="mt2026-mail-sidebar-search__icon" aria-hidden="true">&#128269;</span>'
            + '<input type="search" placeholder="Search conversations..." aria-label="Search conversations">'
            + '</div>'
            + '</div>';
        heading.insertAdjacentHTML('afterend', searchHTML);
    }

    function updateSearchEmptyState(query, entries) {
        var existing = document.querySelector('.mt2026-mail-search-empty-state');
        if (!query) {
            if (existing) existing.remove();
            return;
        }
        var visible = Array.from(entries).some(function(e) { return e.style.display !== 'none'; });
        if (!visible) {
            if (!existing) {
                var empty = document.createElement('div');
                empty.className = 'mt2026-mail-empty-state mt2026-mail-search-empty-state';
                empty.innerHTML = '<div class="mt2026-mail-empty-state__icon" aria-hidden="true">&#128269;</div>'
                    + '<div class="mt2026-mail-empty-state__title">No conversations found</div>'
                    + '<div class="mt2026-mail-empty-state__text">Try a different search term</div>';
                var sidebar = document.getElementById('mail-conversation-overview');
                if (sidebar) {
                    var list = sidebar.querySelector('.inbox-wrapper, .mail-inbox-messages > div:last-child');
                    if (list) {
                        list.appendChild(empty);
                    } else {
                        sidebar.appendChild(empty);
                    }
                }
            }
        } else {
            if (existing) existing.remove();
        }
    }

    function initConversationSearch() {
        injectSearchHTML();
        var searchInput = document.querySelector('.mt2026-mail-sidebar-search input[type="search"], .mt2026-mail-sidebar-search input[type="text"]');
        if (!searchInput) return;
        if (searchInput.hasAttribute('data-mt2026-search-bound')) return;
        searchInput.setAttribute('data-mt2026-search-bound', '1');

        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(function() {
                var query = searchInput.value.toLowerCase().trim();
                var entries = document.querySelectorAll('.messagePreviewEntry');
                entries.forEach(function(entry) {
                    var text = (entry.textContent || '').toLowerCase();
                    var matches = !query || text.indexOf(query) !== -1;
                    entry.style.display = matches ? '' : 'none';
                });
                updateSearchEmptyState(query, entries);
            }, 150);
        });
    }

    // ── DESKTOP ENTER-TO-SEND ─────────────────────────────────────────────────
    function handleEnterToSend(e) {
        if (e.key !== 'Enter') return;
        if (isMobileWidth()) return;

        // Check if Enter-to-send is enabled
        try {
            var enabled = humhub && humhub.modules && humhub.modules.config
                && humhub.modules.config.get('modernTheme.mailLayout', 'mailEnterToSend');
            if (enabled === false || enabled === '0' || enabled === 0) return;
        } catch (err) {
            // Default to enabled
        }

        var editor = e.target && e.target.closest
            ? e.target.closest('.mail-message-form .ProseMirror')
            : null;
        if (!editor) return;

        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var editorEl = editor;
            var form = editorEl.closest('.mail-message-form');
            if (form) {
                var submitBtn = form.querySelector('.reply-button');
                if (submitBtn) {
                    try {
                        editorEl.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
                    } catch (err) {}
                    editorEl.blur();

                    var messageInput = form.querySelector('[name$="[message]"]');
                    if (messageInput && !String(messageInput.value || '').trim()) {
                        var plainText = String(editorEl.textContent || '').replace(/\u200B/g, '').trim();
                        if (plainText.length > 0) {
                            messageInput.value = plainText;
                            try { $(messageInput).trigger('change').trigger('blur'); } catch (err) {}
                        }
                    }

                    window.setTimeout(function() {
                        try { submitBtn.click(); } catch (err) {}
                        scrollConversationToLatest();
                    }, 0);
                }
            }
        } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            e.preventDefault();
            e.stopImmediatePropagation();
            try {
                e.target.dispatchEvent(new KeyboardEvent('keydown', {
                    key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                    shiftKey: true, bubbles: true, cancelable: true
                }));
            } catch (err) {}
        }
    }

    // ── EVENT DELEGATION ─────────────────────────────────────────────────────
    $(document).on('click.mt2026Mail', '.messagePreviewEntry, .messagePreviewEntry *', function() {
        if (!isMailPage()) return;
        closeMailList();
        setConversationActive(true);
        ensureHeaderToggle(8);
        ensureBackButton();
        if (isMobileWidth()) {
            sizeMobileConversationList();
            scrollConversationToLatest();
        }
    });

    $(document).on('click.mt2026Mail', '.mt2026-mail-topbar-toggle', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openMailList();
    });

    $(document).on('click.mt2026Mail', '.mt2026-mail-settings-btn', function(e) {
        e.preventDefault();
        e.stopPropagation();
        openSettingsDrawer();
    });

    // ── SETTINGS DRAWER ──────────────────────────────────────────────────────
    function openSettingsDrawer() {
        var existing = document.querySelector('.mt2026-drawer-settings');
        if (existing) {
            existing.remove();
            var backdrop = document.querySelector('.mt2026-drawer-backdrop');
            if (backdrop) backdrop.remove();
            return;
        }

        var drawer = document.createElement('div');
        drawer.className = 'mt2026-drawer mt2026-drawer-settings';
        drawer.setAttribute('role', 'dialog');
        drawer.setAttribute('aria-label', 'Mail settings');

        var enterToSend = true;
        try {
            var saved = humhub && humhub.modules && humhub.modules.config
                && humhub.modules.config.get('modernTheme.mailLayout', 'mailEnterToSend');
            if (saved !== null && saved !== undefined) enterToSend = saved !== '0' && saved !== false;
        } catch (e) {}

        var fontScale = 100;
        try {
            var savedFont = humhub && humhub.modules && humhub.modules.config
                && humhub.modules.config.get('modernTheme.mailLayout', 'mailFontScale');
            if (savedFont) fontScale = parseInt(savedFont, 10) || 100;
        } catch (e) {}

        var formattingBar = false;
        try {
            var savedFmt = humhub && humhub.modules && humhub.modules.config
                && humhub.modules.config.get('modernTheme.mailLayout', 'mailFormattingBar');
            if (savedFmt) formattingBar = savedFmt === '1' || savedFmt === true;
        } catch (e) {}

        drawer.innerHTML =
            '<div class="mt2026-drawer-header">'
            + '<h3>Mail Settings</h3>'
            + '<button class="mt2026-drawer-close" aria-label="Close settings">&times;</button>'
            + '</div>'
            + '<div class="mt2026-drawer-content">'
            + '<div class="mt2026-drawer-settings-list">'
            + '<label class="setting-item">'
            + '<input type="checkbox" class="mt2026-setting-enter-to-send"' + (enterToSend ? ' checked' : '') + '>'
            + '<span class="setting-label">Enter to send</span>'
            + '</label>'
            + '<label class="setting-item">'
            + '<span class="setting-label">Font size</span>'
            + '<select class="mt2026-setting-font-scale">'
            + '<option value="100"' + (fontScale === 100 ? ' selected' : '') + '>100%</option>'
            + '<option value="115"' + (fontScale === 115 ? ' selected' : '') + '>115%</option>'
            + '<option value="130"' + (fontScale === 130 ? ' selected' : '') + '>130%</option>'
            + '<option value="150"' + (fontScale === 150 ? ' selected' : '') + '>150%</option>'
            + '</select>'
            + '</label>'
            + '<label class="setting-item">'
            + '<input type="checkbox" class="mt2026-setting-formatting-bar"' + (formattingBar ? ' checked' : '') + '>'
            + '<span class="setting-label">Formatting toolbar</span>'
            + '</label>'
            + '</div>'
            + '</div>';

        document.body.appendChild(drawer);

        var backdrop = document.createElement('div');
        backdrop.className = 'mt2026-drawer-backdrop';
        document.body.appendChild(backdrop);

        // Bind close
        drawer.querySelector('.mt2026-drawer-close').addEventListener('click', closeSettingsDrawer);
        backdrop.addEventListener('click', closeSettingsDrawer);

        // Bind settings changes
        drawer.querySelector('.mt2026-setting-enter-to-send').addEventListener('change', function() {
            try {
                humhub.modules.config.set('modernTheme.mailLayout', 'mailEnterToSend', this.checked ? '1' : '0');
            } catch (e) {}
        });

        drawer.querySelector('.mt2026-setting-font-scale').addEventListener('change', function() {
            try {
                humhub.modules.config.set('modernTheme.mailLayout', 'mailFontScale', this.value);
            } catch (e) {}
            applyFontScale(parseInt(this.value, 10) || 100);
        });

        drawer.querySelector('.mt2026-setting-formatting-bar').addEventListener('change', function() {
            try {
                humhub.modules.config.set('modernTheme.mailLayout', 'mailFormattingBar', this.checked ? '1' : '0');
            } catch (e) {}
            toggleFormattingBar(this.checked);
        });

        // Close on Escape
        drawer.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeSettingsDrawer();
        });
        drawer.querySelector('select, input').focus();
    }

    function closeSettingsDrawer() {
        var drawer = document.querySelector('.mt2026-drawer-settings');
        if (drawer) drawer.remove();
        var backdrop = document.querySelector('.mt2026-drawer-backdrop');
        if (backdrop) backdrop.remove();
    }

    function applyFontScale(scale) {
        var root = document.querySelector('#mail-conversation-root');
        if (root) {
            root.style.setProperty('--mt2026-mail-font-scale', (scale / 100) + '');
        }
    }

    function toggleFormattingBar(visible) {
        var menubars = document.querySelectorAll('.ProseMirror-menubar');
        menubars.forEach(function(bar) {
            bar.classList.toggle('mt2026-formatting-bar-visible', visible);
        });
    }

    // ── INIT ─────────────────────────────────────────────────────────────────
    function initMailDrawer() {
        if (!isMailPage()) {
            setFullscreenMode(false);
            return;
        }
        setFullscreenMode(true);

        if (hasActiveConversation()) {
            setConversationActive(true);
            ensureBackButton();
            if (isMobileWidth()) {
                sizeMobileConversationList();
            }
            scrollConversationToLatest();
        } else {
            setConversationActive(false);
        }

        var sidebar = document.getElementById('mail-conversation-overview');
        ensureHeaderToggle(8);
        initConversationSearch();

        // Apply saved font scale
        try {
            var savedFont = humhub && humhub.modules && humhub.modules.config
                && humhub.modules.config.get('modernTheme.mailLayout', 'mailFontScale');
            if (savedFont) applyFontScale(parseInt(savedFont, 10) || 100);
        } catch (e) {}

        // Apply saved formatting bar
        try {
            var savedFmt = humhub && humhub.modules && humhub.modules.config
                && humhub.modules.config.get('modernTheme.mailLayout', 'mailFormattingBar');
            if (savedFmt === '1' || savedFmt === true) toggleFormattingBar(true);
        } catch (e) {}

        if (!sidebar) return;

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

        if (!document.body.hasAttribute('data-mt2026-mail-overlay')) {
            document.body.setAttribute('data-mt2026-mail-overlay', '1');
            document.body.addEventListener('click', function(e) {
                if (!document.body.classList.contains('mail-list-open')) return;
                try {
                    var withinSidebar = !!e.target.closest('#mail-conversation-overview');
                    if (!withinSidebar) {
                        closeMailList();
                    }
                } catch (err) {}
            });
        }
    }

    // ── EVENT LISTENERS ──────────────────────────────────────────────────────
    document.addEventListener('keydown', handleEnterToSend, true);

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.body.classList.contains('mail-list-open')) {
            closeMailList();
        }
    });

    $(document).on('pjax:beforeSend.mt2026Mail', function(event, xhr, options) {
        var url = (options && options.url) || '';
        if (url && url.indexOf('/mail/') === -1) {
            setConversationActive(false);
        }
    });

    $(document).on('ajaxComplete.mt2026Mail', function() {
        if (isMailPage()) {
            ensureHeaderToggle(4);
            ensureBackButton();
            if (hasActiveConversation()) {
                if (isMobileWidth()) {
                    sizeMobileConversationList();
                }
                scrollConversationToLatest();
            }
        }
    });

    $(window).on('resize.mt2026Mail orientationchange.mt2026Mail', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (isMailPage() && hasActiveConversation() && isMobileWidth()) {
                sizeMobileConversationList();
                scrollConversationToLatest();
            }
        }, 100);
    });

    $(document).on('humhub:ready pjax:end humhub:navigate', initMailDrawer);

    // ── UNLOAD / TEARDOWN ────────────────────────────────────────────────────
    function unload() {
        $(document).off('.mt2026Mail');
        $(window).off('.mt2026Mail');
        document.removeEventListener('keydown', handleEnterToSend, true);
        clearTimeout(resizeTimer);
        clearTimeout(searchTimer);
        if (scrollObserver) { scrollObserver.disconnect(); scrollObserver = null; }
        if (headerObserver) { headerObserver.disconnect(); headerObserver = null; }
        closeSettingsDrawer();
    }

    module.initOnPjaxLoad = true;
    module.export({
        init: initMailDrawer,
        unload: unload
    });
});
