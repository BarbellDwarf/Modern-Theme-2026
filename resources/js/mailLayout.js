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
        // Conversation can be active before entries are mounted, especially on mobile.
        if (hasConversationIdInUrl()) {
            return true;
        }

        if (document.querySelectorAll('.conversation-entry-list .mail-conversation-entry').length > 0) {
            return true;
        }

        // Fallback: if conversation header + composer/form exist, thread view is active.
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

    function isComposingMessage() {
        var active = document.activeElement;
        if (!active || !active.closest) {
            return false;
        }

        if (!active.closest('.mail-message-form, .mt2026-mail-composer-dock')) {
            return false;
        }

        return true;
    }

    function scrollConversationToLatest() {
        var list = document.querySelector('.conversation-entry-list');
        if (!list) {
            return;
        }
        // Wait for layout/async content updates before forcing latest-message view.
        window.requestAnimationFrame(function() {
            list.scrollTop = list.scrollHeight;
        });

        // Some mail entries render asynchronously, so enforce bottom position a few times.
        [120, 300, 650, 1100].forEach(function(delay) {
            window.setTimeout(function() {
                if (list) {
                    list.scrollTop = list.scrollHeight;
                }
            }, delay);
        });
    }

    function sizeMobileConversationList() {
        if (!isMobileWidth()) {
            return;
        }

        var list = document.querySelector('.conversation-entry-list');
        var header = document.getElementById('mail-conversation-header');
        var composer = document.querySelector('.mt2026-mail-composer-dock, .mail-message-form');
        if (!list || !header || !composer) {
            return;
        }

        var headerBottom = Math.ceil(header.getBoundingClientRect().bottom);
        var composerTop = Math.floor(composer.getBoundingClientRect().top);

        // Reserve visible bottom area occupied by composer/nav on mobile.
        var reservedBottom = Math.max(56, window.innerHeight - composerTop);
        if (!isFinite(reservedBottom) || reservedBottom < 56 || reservedBottom > window.innerHeight) {
            reservedBottom = 56;
        }

        var available = window.innerHeight - headerBottom - reservedBottom;

        // Keep a stable, touch-scrollable region between header and composer.
        if (available > 120) {
            list.style.setProperty('height', available + 'px', 'important');
            list.style.setProperty('max-height', available + 'px', 'important');
            list.style.setProperty('min-height', '120px', 'important');
        }
    }

    function ensureHeaderToggle(retries) {
        var header = document.getElementById('mail-conversation-header');

        if (!header) {
            if (retries > 0) {
                window.setTimeout(function() {
                    ensureHeaderToggle(retries - 1);
                }, 120);
            }
            return;
        }

        if (!header.querySelector('.mt2026-mail-topbar-toggle')) {
            var mobileButton = document.createElement('a');
            mobileButton.href = '#';
            mobileButton.className = 'mt2026-mail-topbar-toggle';
            mobileButton.setAttribute('aria-label', 'Open conversations list');
            // Use a guaranteed glyph instead of font-icon dependency so the toggle stays visible.
            mobileButton.innerHTML = '<span class="mt2026-mail-topbar-toggle-icon" aria-hidden="true">&#9776;</span>';
            header.insertBefore(mobileButton, header.firstChild);
        }

        // Defensive: avoid duplicate header toggles after repeated PJAX/AJAX updates.
        var toggles = header.querySelectorAll('.mt2026-mail-topbar-toggle');
        if (toggles.length > 1) {
            for (var i = 1; i < toggles.length; i++) {
                toggles[i].remove();
            }
        }
    }

    // ── DESKTOP ENTER-TO-SEND ─────────────────────────────────────────────────
    // On desktop: Enter submits; Ctrl/Cmd+Enter inserts a newline (Shift+Enter in
    // ProseMirror maps to a hard break). Mobile keeps default ProseMirror behaviour.
    document.addEventListener('keydown', function(e) {
        if (e.key !== 'Enter') return;
        if (isMobileWidth()) return;

        var editor = e.target && e.target.closest
            ? e.target.closest('.mail-message-form .ProseMirror')
            : null;
        if (!editor) return;

        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
            // Plain Enter → submit the message.
            // Must blur the ProseMirror editor first so its focusout handler serialises
            // content into the hidden input before the form submits.
            e.preventDefault();
            e.stopImmediatePropagation();
            var editorEl = editor;
            var form = editorEl.closest('.mail-message-form');
            if (form) {
                var submitBtn = form.querySelector('.reply-button');
                if (submitBtn) {
                    // Trigger the widget sync path used by HumHub richtext.
                    editorEl.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
                    editorEl.blur();

                    // Fallback: if sync has not populated the input yet, push plain text.
                    var messageInput = form.querySelector('[name$="[message]"]');
                    if (messageInput && !String(messageInput.value || '').trim()) {
                        var plainText = String(editorEl.textContent || '').replace(/\u200B/g, '').trim();
                        if (plainText.length > 0) {
                            messageInput.value = plainText;
                            $(messageInput).trigger('change').trigger('blur');
                        }
                    }

                    window.setTimeout(function() {
                        submitBtn.click();
                        scrollConversationToLatest();
                    }, 0);
                }
            }
        } else if ((e.ctrlKey || e.metaKey) && !e.shiftKey) {
            // Ctrl/Cmd+Enter → insert a newline via Shift+Enter (ProseMirror hard break)
            e.preventDefault();
            e.stopImmediatePropagation();
            e.target.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
                shiftKey: true, bubbles: true, cancelable: true
            }));
        }
        // Shift+Enter: fall through unchanged to ProseMirror
    }, true /* capture phase – fires before ProseMirror's own handlers */);

    // ── EVENT DELEGATION ─────────────────────────────────────────────────────
    // Fires for any click on a message preview entry, even if added after init.
    // Immediately transitions to conversation view before PJAX completes.
    $(document).on('click.mt2026Mail', '.messagePreviewEntry, .messagePreviewEntry *', function() {
        if (!isMailPage()) return;
        closeMailList();
        setConversationActive(true);
        ensureHeaderToggle(8);
        if (isMobileWidth()) {
            sizeMobileConversationList();
            scrollConversationToLatest();
        }
    });

    // Always handle toggle clicks through delegation so it works after PJAX/AJAX re-renders.
    $(document).on('click.mt2026Mail', '.mt2026-mail-topbar-toggle', function(e) {
        e.preventDefault();
        e.stopPropagation();

        // On the inbox-first mobile screen there is no active conversation yet.
        // In that state the list is already visible, so drawer overlay should not open.
        if (!document.body.classList.contains('mt2026-mail-has-conversation')) {
            closeMailList();
            return;
        }

        openMailList();
    });

    // ── INIT ─────────────────────────────────────────────────────────────────
    function initMailDrawer() {
        if (!isMailPage()) {
            setFullscreenMode(false);
            return;
        }
        setFullscreenMode(true);

        // Confirm conversation-active state from URL/DOM (covers direct URL navigation
        // and async cases where entries are not mounted yet).
        if (hasActiveConversation()) {
            setConversationActive(true);
            if (isMobileWidth()) {
                sizeMobileConversationList();
            }
            scrollConversationToLatest();
        } else {
            setConversationActive(false);
        }
        // Do NOT clear the class here — the click delegation sets it eagerly
        // and entries may not yet be loaded when pjax:end fires.

        var sidebar = document.getElementById('mail-conversation-overview');
        ensureHeaderToggle(8);

        if (!sidebar) return;

        // Bind click on the overview heading toggle (open/close drawer gesture)
        var headingToggle = sidebar.querySelector('.panel-heading > a');
        if (headingToggle && !headingToggle.hasAttribute('data-mt2026-mail-toggle')) {
            headingToggle.setAttribute('data-mt2026-mail-toggle', '1');
            headingToggle.addEventListener('click', function(e) {
                e.preventDefault();

                if (!document.body.classList.contains('mt2026-mail-has-conversation')) {
                    closeMailList();
                    return;
                }

                if (document.body.classList.contains('mail-list-open')) {
                    closeMailList();
                } else {
                    openMailList();
                }
            });
        }

        // Close the drawer backdrop on outside click
        if (!document.body.hasAttribute('data-mt2026-mail-overlay')) {
            document.body.setAttribute('data-mt2026-mail-overlay', '1');
            document.body.addEventListener('click', function(e) {
                if (!document.body.classList.contains('mail-list-open')) return;
                var withinSidebar = !!e.target.closest('#mail-conversation-overview');
                if (!withinSidebar) {
                    closeMailList();
                }
            });
        }
    }

    // Clear conversation state when navigating away from mail entirely
    $(document).on('pjax:beforeSend.mt2026Mail', function(event, xhr, options) {
        var url = (options && options.url) || '';
        if (url && url.indexOf('/mail/') === -1) {
            setConversationActive(false);
        }
    });

    // Re-run mail drawer wiring after async updates that may re-render the chat header.
    $(document).on('ajaxComplete.mt2026Mail', function() {
        if (isMailPage()) {
            ensureHeaderToggle(4);
            if (hasActiveConversation()) {
                if (isMobileWidth()) {
                    sizeMobileConversationList();
                }
                scrollConversationToLatest();
            }
        }
    });

    $(window).on('resize.mt2026Mail orientationchange.mt2026Mail', function() {
        if (isMailPage() && hasActiveConversation() && isMobileWidth()) {
            // Keyboard-driven viewport resize while composing can cause visible jank.
            // Skip forced list resize/auto-scroll until composition settles.
            if (isComposingMessage() || document.body.classList.contains('mt2026-keyboard-open')) {
                return;
            }

            sizeMobileConversationList();
            scrollConversationToLatest();
        }
    });

    $(document).on('humhub:ready pjax:end humhub:navigate', initMailDrawer);
    module.export({
        init: initMailDrawer
    });
});
