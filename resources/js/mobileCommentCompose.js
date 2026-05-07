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

    var getComposeForm = function(container) {
        if (!container) {
            return null;
        }
        return container.querySelector('.comment_create');
    };

    var showCompose = function(form) {
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
                return;
            }

            // For open containers, keep the collapsed composer visible.
            showCompose(form);
        });
    };

    var showForTrigger = function(triggerEl) {
        var entry = triggerEl && triggerEl.closest('.wall-entry, .stream-entry');
        var container = entry ? entry.querySelector('.comment-container') : null;

        if (!container || isHidden(container)) {
            container = document.querySelector('.comment-container:not(.d-none)');
        }

        if (!container) {
            return;
        }

        showCompose(getComposeForm(container));
    };

    var bindActions = function() {
        document.addEventListener('click', function(ev) {
            var trigger = ev.target.closest('[data-action-click*="comment.toggleComment"], [data-action-click*="comment.reply"], .comment-reply-link, .reply-comment-link');
            if (!trigger) {
                return;
            }

            // Let HumHub toggle/open first, then reveal composer.
            setTimeout(function() {
                showForTrigger(trigger);
                syncContainers();
            }, 120);
        }, true);
    };

    var init = function() {
        bindActions();
        syncContainers();
        setInterval(syncContainers, 350);

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
