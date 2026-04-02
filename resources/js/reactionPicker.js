humhub.module('modernTheme.reactionPicker', function(module, require, $) {

    var REACTIONS = [
        { type: 'like',    emoji: '👍', label: 'Like' },
        { type: 'love',    emoji: '❤️', label: 'Love' },
        { type: 'laugh',   emoji: '😂', label: 'Haha' },
        { type: 'wow',     emoji: '😮', label: 'Wow'  },
        { type: 'sad',     emoji: '😢', label: 'Sad'  },
        { type: 'pray',    emoji: '🙏', label: 'Care' }
    ];

    // Base URL for the ReactionsController endpoint (set by PHP via data attribute or inline JS)
    var REACT_BASE_URL = humhub.config.get('modernTheme.reactionPicker', 'reactBaseUrl') || '/modern-theme-2026/reactions/react';

    // Build the floating picker popup HTML
    function buildPicker() {
        var html = '<div class="mt2026-reaction-picker" role="listbox" aria-label="Choose reaction">';
        REACTIONS.forEach(function(r) {
            html += '<button class="mt2026-reaction-btn" type="button" role="option"' +
                    ' data-reaction="' + r.type + '" title="' + r.label + '">' +
                    '<span class="mt2026-reaction-emoji">' + r.emoji + '</span>' +
                    '<span class="mt2026-reaction-label">' + r.label + '</span>' +
                    '</button>';
        });
        html += '</div>';
        return html;
    }

    // Attach trigger button + picker to every .likeLinkContainer not yet processed
    function attach() {
        $('.likeLinkContainer').not('[data-mt2026-reactions]').each(function() {
            var $container = $(this);
            $container.attr('data-mt2026-reactions', '1');
            $container.css('position', 'relative');

            // Inject the floating picker into the container
            $container.append(buildPicker());

            // Inject a visible trigger button at the start of the container
            var $trigger = $('<button type="button" class="mt2026-reaction-trigger" title="React to this" aria-haspopup="listbox">' +
                '<i class="fa fa-smile-o" aria-hidden="true"></i>' +
                '</button>');
            $container.prepend($trigger);

            // Mark active reaction from server-rendered data (if present)
            var currentReaction = $container.data('currentReaction') || null;
            if (currentReaction) {
                $container.find('.mt2026-reaction-btn[data-reaction="' + currentReaction + '"]').addClass('active');
                updateTriggerState($container, currentReaction);
            }

            // Build the reaction summary link in the addons bar (right side)
            var $addons = $container.closest('.stream-entry-addons, .wall-entry-addons');
            if ($addons.length) {
                // Remove any existing summary link for this container
                $addons.find('.mt2026-reaction-summary-link[data-for="' + $container.attr('id') + '"]').remove();

                // Parse the list URL from the existing like link
                var $likeLink = $container.find('a.likeAnchor');
                var actionUrl = $likeLink.first().data('action-url') || '';
                var urlParams = new URLSearchParams(actionUrl.split('?')[1] || '');
                var contentModel = urlParams.get('contentModel');
                var contentId = urlParams.get('contentId');

                var listUrl = (contentModel && contentId)
                    ? '/modern-theme-2026/reactions/list?contentModel=' + encodeURIComponent(contentModel) + '&contentId=' + encodeURIComponent(contentId)
                    : '#';

                var summaryId = 'mt2026-summary-' + (contentId || Math.random().toString(36).slice(2));
                $container.attr('id', $container.attr('id') || summaryId);

                var $summaryLink = $('<a class="mt2026-reaction-summary-link" href="' + listUrl + '" ' +
                    'data-bs-target="#globalModal" data-for="' + summaryId + '" style="display:none">' +
                    '<span class="mt2026-reaction-summary"></span>' +
                    '</a>');

                $addons.append($summaryLink);
            }
        });
    }

    /** Update the trigger button emoji/style to reflect the current reaction */
    function updateTriggerState($container, reactionType) {
        var $trigger = $container.find('.mt2026-reaction-trigger');
        if (!reactionType) {
            $trigger.removeClass('reacted').removeAttr('data-active-reaction').html('<i class="fa fa-smile-o"></i>');
            return;
        }
        var reaction = REACTIONS.find(function(r) { return r.type === reactionType; });
        if (reaction) {
            $trigger.addClass('reacted').attr('data-active-reaction', reactionType)
                .html('<span class="mt2026-active-emoji">' + reaction.emoji + '</span>');
        }
    }

    /** Update reaction summary counts in the external summary link */
    function updateReactionSummary($container, reactionCounts) {
        var $addons = $container.closest('.stream-entry-addons, .wall-entry-addons');
        var $summaryLink = $addons.find('.mt2026-reaction-summary-link');
        if (!$summaryLink.length) return;

        var $summary = $summaryLink.find('.mt2026-reaction-summary');

        var hasAny = false;
        var html = '';
        REACTIONS.forEach(function(r) {
            var count = reactionCounts[r.type] || 0;
            if (count > 0) {
                hasAny = true;
                html += '<span class="mt2026-reaction-count" data-reaction="' + r.type + '" title="' + r.label + '">' +
                        r.emoji + ' <span class="cnt">' + count + '</span></span>';
            }
        });
        $summary.html(hasAny ? html : '');
        $summaryLink.toggle(hasAny);
    }

    function showPicker($container) {
        // Hide all others first
        $('.mt2026-reaction-picker.visible').not($container.find('.mt2026-reaction-picker')).removeClass('visible');
        $container.find('.mt2026-reaction-picker').addClass('visible');
        $container.find('.mt2026-reaction-trigger').addClass('active');
    }

    function hidePicker($container) {
        $container.find('.mt2026-reaction-picker').removeClass('visible');
        $container.find('.mt2026-reaction-trigger').removeClass('active');
    }

    function togglePicker($container) {
        if ($container.find('.mt2026-reaction-picker').hasClass('visible')) {
            hidePicker($container);
        } else {
            showPicker($container);
        }
    }

    /**
     * For containers where the user has already reacted (unlike link is visible),
     * fetch the actual reaction type from the server and restore the trigger state.
     */
    function restoreReactionStates() {
        $('.likeLinkContainer[data-mt2026-reactions]').each(function() {
            var $container = $(this);
            var $unlike = $container.find('a.unlike.likeAnchor');
            // If the unlike link is not hidden, user has an existing reaction
            if ($unlike.length && !$unlike.hasClass('d-none')) {
                var $likeLink = $container.find('a.likeAnchor');
                var actionUrl = $likeLink.first().data('action-url') || '';
                var urlParams = new URLSearchParams(actionUrl.split('?')[1] || '');
                var contentModel = urlParams.get('contentModel');
                var contentId = urlParams.get('contentId');
                if (!contentModel || !contentId) return;

                $.ajax({
                    url: '/modern-theme-2026/reactions/my-reaction',
                    method: 'GET',
                    data: { contentModel: contentModel, contentId: contentId },
                    success: function(response) {
                        if (response && response.reactionType) {
                            $container.find('.mt2026-reaction-btn').removeClass('active');
                            $container.find('.mt2026-reaction-btn[data-reaction="' + response.reactionType + '"]').addClass('active');
                            updateTriggerState($container, response.reactionType);
                        }
                        if (response && response.reactionCounts) {
                            updateReactionSummary($container, response.reactionCounts);
                        }
                    }
                });
            }
        });
    }

    var init = function() {
        // Run immediately and after every stream content update
        attach();
        restoreReactionStates();

        $(document).on('humhub:ready humhub:stream:afterAppend humhub:content:afterMove', function() {
            setTimeout(function() { attach(); restoreReactionStates(); }, 150);
        });

        // Trigger button click: toggle picker
        $(document).on('click', '.mt2026-reaction-trigger', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $container = $(this).closest('.likeLinkContainer');
            togglePicker($container);
        });

        // Hover on desktop: show picker after short delay
        var hoverTimer = null;
        $(document).on('mouseenter', '.likeLinkContainer', function() {
            var $container = $(this);
            hoverTimer = setTimeout(function() {
                showPicker($container);
            }, 400);
        });
        $(document).on('mouseleave', '.likeLinkContainer', function() {
            clearTimeout(hoverTimer);
            var $container = $(this);
            // Small delay so user can move mouse to picker
            setTimeout(function() {
                if (!$container.find('.mt2026-reaction-picker:hover').length) {
                    hidePicker($container);
                }
            }, 300);
        });

        // Keep picker open while hovering over it
        $(document).on('mouseleave', '.mt2026-reaction-picker', function() {
            var $container = $(this).closest('.likeLinkContainer');
            setTimeout(function() { hidePicker($container); }, 200);
        });

        // Click a reaction
        $(document).on('click', '.mt2026-reaction-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $btn = $(this);
            var reactionType = $btn.data('reaction');
            var $container = $btn.closest('.likeLinkContainer');

            // Animate
            $btn.addClass('mt2026-pop');
            setTimeout(function() { $btn.removeClass('mt2026-pop'); }, 300);

            // Extract contentModel and contentId from the existing like/unlike URL
            var $likeLink = $container.find('a.likeAnchor');
            var actionUrl = $likeLink.first().data('action-url') || $likeLink.first().attr('href');

            if (!actionUrl) {
                // Fallback: delegate to the built-in like link
                $container.find('a.like.likeAnchor:not(.d-none), a.unlike.likeAnchor:not(.d-none)').first().trigger('click');
                hidePicker($container);
                return;
            }

            // Parse contentModel and contentId from the existing URL query string
            var urlParams = new URLSearchParams(actionUrl.split('?')[1] || '');
            var contentModel = urlParams.get('contentModel');
            var contentId = urlParams.get('contentId');

            if (!contentModel || !contentId) {
                // Fallback to built-in like
                $container.find('a.like.likeAnchor:not(.d-none), a.unlike.likeAnchor:not(.d-none)').first().trigger('click');
                hidePicker($container);
                return;
            }

            // POST to our ReactionsController
            $.ajax({
                url: REACT_BASE_URL,
                method: 'POST',
                data: {
                    contentModel: contentModel,
                    contentId: contentId,
                    reaction_type: reactionType,
                    _csrf: humhub.config.get('humhub', 'csrf') || $('meta[name=csrf-token]').attr('content')
                },
                success: function(response) {
                    if (response && typeof response === 'object') {
                        var currentReaction = response.currentUserReaction || null;
                        // Update active states on picker buttons
                        $container.find('.mt2026-reaction-btn').removeClass('active');
                        if (currentReaction) {
                            $container.find('.mt2026-reaction-btn[data-reaction="' + currentReaction + '"]').addClass('active');
                        }
                        updateTriggerState($container, currentReaction);
                        updateReactionSummary($container, response.reactionCounts || {});

                        // Also update the built-in Like/Unlike link visibility
                        if (currentReaction) {
                            $container.find('a.like.likeAnchor').addClass('d-none');
                            $container.find('a.unlike.likeAnchor').removeClass('d-none');
                        } else {
                            $container.find('a.like.likeAnchor').removeClass('d-none');
                            $container.find('a.unlike.likeAnchor').addClass('d-none');
                        }
                    }
                },
                error: function() {
                    // Fallback to built-in like on error
                    $container.find('a.like.likeAnchor:not(.d-none), a.unlike.likeAnchor:not(.d-none)').first().trigger('click');
                }
            });

            hidePicker($container);
        });

        // Close picker on outside click
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.likeLinkContainer').length) {
                $('.mt2026-reaction-picker.visible').removeClass('visible');
                $('.mt2026-reaction-trigger.active').removeClass('active');
            }
        });

        // Close on Escape
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape') {
                $('.mt2026-reaction-picker.visible').removeClass('visible');
                $('.mt2026-reaction-trigger.active').removeClass('active');
            }
        });

        // Re-attach after pjax navigation
        $(document).on('pjax:end', function() {
            setTimeout(attach, 200);
        });
    };

    module.initOnPjaxLoad = true;

    module.export({
        init: init
    });
});
