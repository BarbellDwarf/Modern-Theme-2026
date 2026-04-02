humhub.module('modernTheme.reactionPicker', function(module, require, $) {
    var event = require('event');

    var REACTIONS = {
        like:  { emoji: '👍', label: 'Like' },
        love:  { emoji: '❤️', label: 'Love' },
        laugh: { emoji: '😂', label: 'Laugh' },
        sad:   { emoji: '😢', label: 'Sad' },
        pray:  { emoji: '🙏', label: 'Pray' }
    };

    var HOVER_DELAY = 300;
    var LONGPRESS_DELAY = 500;

    // Timers keyed by container element
    var hoverTimers = new WeakMap();
    var hideTimers = new WeakMap();
    var longpressTimers = new WeakMap();
    var touchStartPos = new WeakMap();

    function buildPickerHtml() {
        var html = '<div class="reaction-picker" role="listbox" aria-label="Choose reaction" style="display:none;">';
        Object.keys(REACTIONS).forEach(function(type) {
            var r = REACTIONS[type];
            html += '<button class="reaction-item" type="button" role="option"' +
                    ' data-reaction="' + type + '" aria-label="' + r.label + '">' +
                    '<span class="reaction-emoji">' + r.emoji + '</span>' +
                    '<span class="reaction-label">' + r.label + '</span>' +
                    '</button>';
        });
        html += '</div>';
        return html;
    }

    // Bridge HumHub's .likeLinkContainer elements to our .like-link-container
    // and inject the reaction picker HTML so event delegation can find them.
    function attachToHumHubLikeContainers() {
        $('.likeLinkContainer:not(.like-link-container)').each(function() {
            var $container = $(this);
            $container.addClass('like-link-container');

            // Store the like URL so submitReaction can find it
            var likeUrl = $container.find('a[data-action-url]').first().attr('data-action-url') || '';
            if (likeUrl) {
                $container.attr('data-like-url', likeUrl);
            }

            if (!$container.find('.reaction-picker').length) {
                $container.append(buildPickerHtml());
            }
        });
    }

    function init() {
        attachToHumHubLikeContainers();

        // Re-attach after stream loads more content (infinite scroll, PJAX)
        $(document).on('humhub:ready humhub:stream:afterAppend', function() {
            setTimeout(attachToHumHubLikeContainers, 100);
        });

        // Desktop hover: show picker after delay
        $(document).on('mouseover', '.like-link-container', function() {
            var container = this;
            // Cancel any pending hide
            var hideTimer = hideTimers.get(container);
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimers.delete(container);
            }
            if (!hoverTimers.has(container)) {
                var timer = setTimeout(function() {
                    hoverTimers.delete(container);
                    showPicker(container);
                }, HOVER_DELAY);
                hoverTimers.set(container, timer);
            }
        });

        // Desktop hover: hide picker after short delay (allows moving mouse to picker)
        $(document).on('mouseleave', '.like-link-container', function() {
            var container = this;
            var hoverTimer = hoverTimers.get(container);
            if (hoverTimer) {
                clearTimeout(hoverTimer);
                hoverTimers.delete(container);
            }
            var timer = setTimeout(function() {
                hideTimers.delete(container);
                hidePicker(container);
            }, 150);
            hideTimers.set(container, timer);
        });

        // Cancel hide when mouse enters the picker itself
        $(document).on('mouseenter', '.reaction-picker', function() {
            var container = $(this).closest('.like-link-container')[0];
            if (!container) return;
            var hideTimer = hideTimers.get(container);
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimers.delete(container);
            }
        });

        // Hide when mouse leaves the picker
        $(document).on('mouseleave', '.reaction-picker', function() {
            var container = $(this).closest('.like-link-container')[0];
            if (!container) return;
            var timer = setTimeout(function() {
                hideTimers.delete(container);
                hidePicker(container);
            }, 150);
            hideTimers.set(container, timer);
        });

        // Mobile: long-press on like button to show picker
        $(document).on('touchstart', '.like-button', function(e) {
            var btn = this;
            var container = $(btn).closest('.like-link-container')[0];
            if (!container) return;

            var touch = e.originalEvent.touches[0];
            touchStartPos.set(btn, { x: touch.clientX, y: touch.clientY });

            var timer = setTimeout(function() {
                longpressTimers.delete(btn);
                showPicker(container);
            }, LONGPRESS_DELAY);
            longpressTimers.set(btn, timer);
        });

        $(document).on('touchmove', '.like-button', function(e) {
            var btn = this;
            var startPos = touchStartPos.get(btn);
            if (!startPos) return;
            var touch = e.originalEvent.touches[0];
            var dx = Math.abs(touch.clientX - startPos.x);
            var dy = Math.abs(touch.clientY - startPos.y);
            if (dx > 10 || dy > 10) {
                var timer = longpressTimers.get(btn);
                if (timer) {
                    clearTimeout(timer);
                    longpressTimers.delete(btn);
                }
            }
        });

        $(document).on('touchend', '.like-button', function(e) {
            var btn = this;
            var container = $(btn).closest('.like-link-container')[0];
            var timer = longpressTimers.get(btn);
            if (timer) {
                // Timer still pending: short tap — submit like (or toggle off)
                clearTimeout(timer);
                longpressTimers.delete(btn);
                if (container) {
                    var current = container.dataset.reactionCurrent || '';
                    var reactionType = current === 'like' ? '' : 'like';
                    submitReaction(container, reactionType);
                }
            }
            touchStartPos.delete(btn);
        });

        // Click reaction item
        $(document).on('click', '.reaction-item[data-reaction]', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var reactionType = this.dataset.reaction;
            var container = $(this).closest('.like-link-container')[0];
            if (!container) return;

            var current = container.dataset.reactionCurrent || '';
            if (current === reactionType) {
                reactionType = '';
            }

            var item = this;
            $(item).addClass('animating');
            setTimeout(function() { $(item).removeClass('animating'); }, 300);

            submitReaction(container, reactionType);
            hidePicker(container);
        });

        // Keyboard navigation inside picker
        $(document).on('keydown', '.reaction-picker', function(e) {
            var picker = this;
            var items = Array.prototype.slice.call(picker.querySelectorAll('.reaction-item'));
            var focused = document.activeElement;
            var idx = items.indexOf(focused);

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                var next = items[(idx + 1) % items.length];
                if (next) next.focus();
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                var prev = items[(idx - 1 + items.length) % items.length];
                if (prev) prev.focus();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                var container = $(picker).closest('.like-link-container')[0];
                hidePicker(container);
            } else if (e.key === 'Enter' && focused && focused.classList.contains('reaction-item')) {
                e.preventDefault();
                $(focused).trigger('click');
            }
        });

        // PJAX re-init
        $(document).on('pjax:end', function() {
            // Event delegation means no re-attachment needed,
            // but clear stale timer maps by re-assigning
            hoverTimers = new WeakMap();
            hideTimers = new WeakMap();
            longpressTimers = new WeakMap();
            touchStartPos = new WeakMap();
        });
    }

    function showPicker(container) {
        var picker = container.querySelector('.reaction-picker');
        if (picker) {
            picker.style.display = 'flex';
            picker.style.animation = 'scaleIn 0.15s ease-out';
        }
    }

    function hidePicker(container) {
        var picker = container && container.querySelector('.reaction-picker');
        if (picker) picker.style.display = 'none';
    }

    function submitReaction(container, reactionType) {
        var likeUrl = container.dataset.likeUrl;
        if (!likeUrl) {
            var urlEl = container.closest('[data-like-url]');
            if (urlEl) likeUrl = urlEl.dataset.likeUrl;
        }
        if (!likeUrl) return;

        $.post(likeUrl, { reaction_type: reactionType || '' })
            .done(function(response) {
                updateUI(container, reactionType, response);
            })
            .fail(function() {
                // Silently fail — UI stays in previous state
            });
    }

    function updateUI(container, reactionType, response) {
        // Update stored current reaction
        container.dataset.reactionCurrent = reactionType || '';

        // Update like button appearance
        var likeBtn = container.querySelector('.like-button');
        if (likeBtn) {
            if (reactionType && REACTIONS[reactionType]) {
                $(likeBtn).addClass('liked');
                var emojiEl = likeBtn.querySelector('.reaction-emoji');
                var labelEl = likeBtn.querySelector('.reaction-label');
                if (emojiEl) emojiEl.textContent = REACTIONS[reactionType].emoji;
                if (labelEl) labelEl.textContent = REACTIONS[reactionType].label;
            } else {
                $(likeBtn).removeClass('liked');
                var emojiEl = likeBtn.querySelector('.reaction-emoji');
                var labelEl = likeBtn.querySelector('.reaction-label');
                if (emojiEl) emojiEl.textContent = REACTIONS.like.emoji;
                if (labelEl) labelEl.textContent = REACTIONS.like.label;
            }
        }

        // Update reaction summary badges
        var summary = container.querySelector('.reaction-summary');
        if (!summary) return;

        if (response && response.counts) {
            rebuildSummary(summary, response.counts);
        } else {
            optimisticSummaryUpdate(summary, reactionType, container.dataset.reactionCurrent);
        }
    }

    function rebuildSummary(summary, counts) {
        $(summary).empty();
        Object.keys(counts).forEach(function(type) {
            var count = counts[type];
            if (count > 0 && REACTIONS[type]) {
                var badge = document.createElement('span');
                badge.className = 'reaction-count';
                badge.dataset.reaction = type;
                badge.textContent = REACTIONS[type].emoji + ' ' + count;
                summary.appendChild(badge);
            }
        });
    }

    function optimisticSummaryUpdate(summary, newReaction, previousReaction) {
        // Decrement previous reaction badge
        if (previousReaction && previousReaction !== newReaction) {
            var prevBadge = summary.querySelector('.reaction-count[data-reaction="' + previousReaction + '"]');
            if (prevBadge) {
                var prevCount = parseInt(prevBadge.textContent.replace(/\D/g, ''), 10) - 1;
                if (prevCount <= 0) {
                    prevBadge.remove();
                } else {
                    prevBadge.textContent = REACTIONS[previousReaction].emoji + ' ' + prevCount;
                }
            }
        }

        // Increment or create new reaction badge
        if (newReaction && REACTIONS[newReaction]) {
            var badge = summary.querySelector('.reaction-count[data-reaction="' + newReaction + '"]');
            if (badge) {
                var count = parseInt(badge.textContent.replace(/\D/g, ''), 10) + 1;
                badge.textContent = REACTIONS[newReaction].emoji + ' ' + count;
            } else {
                badge = document.createElement('span');
                badge.className = 'reaction-count';
                badge.dataset.reaction = newReaction;
                badge.textContent = REACTIONS[newReaction].emoji + ' 1';
                summary.appendChild(badge);
            }
        }
    }

    module.export = {
        init: init
    };
});
