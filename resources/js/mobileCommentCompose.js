humhub.module('modernTheme.mobileCommentCompose', function(module, require, $) {

    if (window.innerWidth >= 992) {
        return;
    }

    var submittingForms = new Map();
    var submitTimers = new Map();
    var transitionTimers = new Map();
    var SHOW_TRANSITION_MS = 400;
    var HIDE_TRANSITION_MS = 300;

    var isHidden = function(el) {
        return el.classList.contains('d-none') || window.getComputedStyle(el).display === 'none';
    };

    var closestElement = function(node, selector) {
        if (!node) return null;
        var el = (node.nodeType === 1) ? node : node.parentElement;
        if (!el || typeof el.closest !== 'function') return null;
        return el.closest(selector);
    };

    var getComposeForm = function(container) {
        if (!container) return null;
        for (var i = 0; i < container.children.length; i++) {
            var child = container.children[i];
            if (child.classList && child.classList.contains('comment_create')) {
                return child;
            }
        }
        return null;
    };

    var getEntryContainer = function(triggerEl) {
        if (!triggerEl) return null;
        var actionTarget = triggerEl.getAttribute('data-action-target');
        if (actionTarget && actionTarget.charAt(0) === '#') {
            var targeted = document.querySelector(actionTarget);
            if (targeted) return targeted;
        }
        var entry = triggerEl.closest('.wall-entry, .stream-entry');
        if (!entry) return null;
        var containers = entry.querySelectorAll('.comment-container');
        for (var i = 0; i < containers.length; i++) {
            var container = containers[i];
            if (!container.closest('.nested-comments-root')) return container;
        }
        return containers.length ? containers[0] : null;
    };

    var focusCompose = function(form) {
        if (!form) return;
        var target = form.querySelector('.ProseMirror[contenteditable="true"], [contenteditable="true"], textarea, input[type="text"]');
        if (!target) return;
        try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
    };

    var showCompose = function(form) {
        if (!form) return;
        if (transitionTimers.has(form)) {
            clearTimeout(transitionTimers.get(form));
            transitionTimers.delete(form);
        }
        var isAlreadyVisible = form.classList.contains('show-on-mobile')
            && form.style.maxHeight !== '0px'
            && form.style.maxHeight !== '0';
        if (isAlreadyVisible) {
            focusCompose(form);
            return;
        }
        form.classList.remove('d-none');
        form.classList.add('show-on-mobile');
        form.style.opacity = '0';
        form.style.maxHeight = '0';
        form.style.overflow = 'hidden';
        form.style.transition = 'opacity 0.25s ease, max-height 0.35s ease';
        void form.offsetHeight;
        form.style.opacity = '1';
        form.style.maxHeight = '300px';
        setTimeout(function() {
            form.style.transition = '';
            focusCompose(form);
        }, SHOW_TRANSITION_MS);
    };

    var hideCompose = function(form) {
        if (!form) return;
        if (transitionTimers.has(form)) {
            clearTimeout(transitionTimers.get(form));
            transitionTimers.delete(form);
        }
        form.style.transition = 'opacity 0.15s ease, max-height 0.25s ease';
        form.style.opacity = '0';
        form.style.maxHeight = '0';
        form.style.overflow = 'hidden';
        var timer = setTimeout(function() {
            form.classList.remove('show-on-mobile');
            form.classList.add('d-none');
            form.style.transition = '';
            form.style.opacity = '';
            form.style.maxHeight = '';
            form.style.overflow = '';
            transitionTimers.delete(form);
        }, HIDE_TRANSITION_MS);
        transitionTimers.set(form, timer);
    };

    var syncContainers = function() {
        document.querySelectorAll('.comment-container').forEach(function(container) {
            var form = getComposeForm(container);
            if (!form) return;
            var isContainerHidden = isHidden(container);
            var isSubmitting = submittingForms.has(form);
            if (isContainerHidden && !isSubmitting) {
                hideCompose(form);
            }
        });
    };

    var showForTrigger = function(triggerEl) {
        var actionClick = triggerEl && triggerEl.getAttribute && triggerEl.getAttribute('data-action-click');
        if (actionClick && actionClick.indexOf('comment.reply') !== -1) return;
        if (triggerEl && (triggerEl.classList.contains('comment-reply-link') || triggerEl.classList.contains('reply-comment-link'))) return;
        var container = getEntryContainer(triggerEl);
        if (!container) return;
        var form = getComposeForm(container);
        if (!form) return;
        if (!isHidden(container)) {
            showCompose(form);
        }
    };

    var bindActions = function() {
        document.addEventListener('click.mt2026CommentCompose', function(ev) {
            var trigger = closestElement(ev.target,
                '[data-action-click*="comment.toggleComment"], '
                + '[data-action-click="ui.modal.load"][data-action-url*="/comment/comment/show"], '
                + '.comment-link'
            );
            if (!trigger) return;
            setTimeout(function() {
                showForTrigger(trigger);
                syncContainers();
            }, 220);
        }, true);

        document.addEventListener('shown.bs.modal.mt2026CommentCompose', function(ev) {
            if (!ev.target || ev.target.id !== 'globalModal') return;
            setTimeout(syncContainers, 120);
            setTimeout(syncContainers, 320);
        });

        document.addEventListener('submit.mt2026CommentCompose', function(ev) {
            var form = ev.target;
            if (!form.classList.contains('comment_create')) return;
            submittingForms.set(form, true);
            var timer = setTimeout(function() {
                submittingForms.delete(form);
                submitTimers.delete(form);
            }, 3000);
            submitTimers.set(form, timer);
        }, true);
    };

    var init = function() {
        bindActions();
        syncContainers();
        $(document).on('pjax:end.mt2026CommentCompose', function() {
            setTimeout(syncContainers, 120);
        });
    };

    var unload = function() {
        document.removeEventListener('click.mt2026CommentCompose', null);
        document.removeEventListener('shown.bs.modal.mt2026CommentCompose', null);
        document.removeEventListener('submit.mt2026CommentCompose', null);
        $(document).off('.mt2026CommentCompose');
        submitTimers.forEach(function(timer) { clearTimeout(timer); });
        transitionTimers.forEach(function(timer) { clearTimeout(timer); });
        submitTimers.clear();
        transitionTimers.clear();
        submittingForms.clear();
    };

    module.initOnPjaxLoad = true;
    module.export({ init: init, unload: unload });
});
