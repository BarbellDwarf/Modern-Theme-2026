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

            // Inject a visible FA-icon trigger button at the start of the container
            var $trigger = $('<button type="button" class="mt2026-reaction-trigger" title="React to this" aria-haspopup="listbox">' +
                '<i class="fa fa-smile-o"></i>' +
                '</button>');
            $container.prepend($trigger);

            // Mark active reaction from server-rendered data (if present)
            var currentReaction = $container.data('currentReaction') || null;
            if (currentReaction) {
                $container.find('.mt2026-reaction-btn[data-reaction="' + currentReaction + '"]').addClass('active');
                updateTriggerState($container, currentReaction);
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

    /** Update reaction summary counts in the container */
    function updateReactionSummary($container, reactionCounts) {
        var $summary = $container.find('.mt2026-reaction-summary');
        if (!$summary.length) {
            $summary = $('<div class="mt2026-reaction-summary"></div>');
            $container.append($summary);
        }

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
        $summary.html(hasAny ? html : '').toggle(hasAny);
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

    var init = function() {
        // Run immediately and after every stream content update
        attach();

        $(document).on('humhub:ready humhub:stream:afterAppend humhub:content:afterMove', function() {
            setTimeout(attach, 150);
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
