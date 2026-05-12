/**
 * Mobile Comment Compose Handler
 * Keeps composer hidden by default and reveals it when user taps Reply/Comment.
 */

(function() {
    'use strict';

    if (window.innerWidth >= 992) {
        return;
    }

    var isHidden = function(el) {
        return el.classList.contains('d-none') || window.getComputedStyle(el).display === 'none';
    };

    var closestElement = function(node, selector) {
        if (!node) {
            return null;
        }

        var el = (node.nodeType === 1) ? node : node.parentElement;
        if (!el || typeof el.closest !== 'function') {
            return null;
        }

        return el.closest(selector);
    };

    var getComposeForm = function(container) {
        if (!container) {
            return null;
        }

        // The top-level new-comment form is a direct child of .comment-container.
        // Nested comments also contain .comment_create forms (reply forms), which
        // should not be toggled when tapping the main Comment action.
        var focusCompose = function(form) {
            if (!form) {
                return;
            }

            var target = form.querySelector('.ProseMirror[contenteditable="true"], [contenteditable="true"], textarea, input[type="text"]');
            if (!target) {
                return;
            }

            try {
                target.focus({ preventScroll: true });
            } catch (e) {
                target.focus();
            }
        };
        for (var i = 0; i < container.children.length; i++) {
            var child = container.children[i];
            if (child.classList && child.classList.contains('comment_create')) {
                return child;
            }
        }

        return null;
    };

    var getEntryContainer = function(triggerEl) {
        if (!triggerEl) {
            return null;
        }

        var actionTarget = triggerEl.getAttribute('data-action-target');
        if (actionTarget && actionTarget.charAt(0) === '#') {
            var targeted = document.querySelector(actionTarget);
            if (targeted) {
                return targeted;
            }
        }

        var entry = triggerEl.closest('.wall-entry, .stream-entry');
        if (!entry) {
            return null;
        }

        var containers = entry.querySelectorAll('.comment-container');
        for (var i = 0; i < containers.length; i++) {
            var container = containers[i];
            if (!container.closest('.nested-comments-root')) {
                return container;
            }
        }

        return containers.length ? containers[0] : null;
    };

    var showCompose = function(form) {
            // On mobile, tapping Comment should place the cursor directly in composer.
            setTimeout(function() {
                focusCompose(form);
            }, 60);
        if (!form) {
            return;
        }
        form.classList.remove('d-none');
        form.classList.add('show-on-mobile');
    };

    var hideCompose = function(form) {
        if (!form) {
            return;
        }
        form.classList.remove('show-on-mobile');
        form.classList.add('d-none');
    };

    var syncContainers = function() {
        document.querySelectorAll('.comment-container').forEach(function(container) {
            var form = getComposeForm(container);
            if (!form) {
                return;
            }

            if (isHidden(container)) {
                hideCompose(form);
            }
        });
    };

    var showForTrigger = function(triggerEl) {
        var container = getEntryContainer(triggerEl);

        if (!container) {
            return;
        }

        var form = getComposeForm(container);
        if (!form) {
            return;
        }

        // Let HumHub handle open/close first. If container is still visible,
        // force the top-level composer visible for mobile typing.
        if (!isHidden(container)) {
            showCompose(form);
        }
    };

    var bindActions = function() {
        document.addEventListener('click', function(ev) {
            var trigger = closestElement(
                ev.target,
                '[data-action-click*="comment.toggleComment"], '
                + '[data-action-click*="comment.reply"], '
                + '[data-action-click="ui.modal.load"][data-action-url*="/comment/comment/show"], '
                + '.comment-reply-link, .reply-comment-link'
            );
            if (!trigger) {
                return;
            }

            // Let HumHub toggle/open first, then reveal composer.
            setTimeout(function() {
                showForTrigger(trigger);
                syncContainers();
            }, 220);
        }, true);

        // Popup comments are rendered into #globalModal after ui.modal.load resolves.
        document.addEventListener('shown.bs.modal', function(ev) {
            if (!ev.target || ev.target.id !== 'globalModal') {
                return;
            }

            setTimeout(syncContainers, 120);
            setTimeout(syncContainers, 320);
        });
    };

    var init = function() {
        bindActions();
        syncContainers();

        if (typeof $ !== 'undefined') {
            $(document).on('pjax:end', function() {
                setTimeout(syncContainers, 120);
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
