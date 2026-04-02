humhub.module('modernTheme.reactionPicker', function(module, require, $) {

    var REACTIONS = [
        { type: 'like',    emoji: '👍', label: 'Like' },
        { type: 'love',    emoji: '❤️', label: 'Love' },
        { type: 'laugh',   emoji: '😂', label: 'Haha' },
        { type: 'wow',     emoji: '😮', label: 'Wow'  },
        { type: 'sad',     emoji: '😢', label: 'Sad'  },
        { type: 'pray',    emoji: '🙏', label: 'Care' }
    ];

    var BASE_URL = '/modern-theme-2026/reactions';

    // ── Helpers ───────────────────────────────────────────────────────────────

    function getUrlParams($container) {
        var $like = $container.find('a.likeAnchor').first();
        var url = ($like.data('action-url') || '').split('?')[1] || '';
        var p = new URLSearchParams(url);
        return { contentModel: p.get('contentModel'), contentId: p.get('contentId') };
    }

    function getReactionByType(type) {
        return REACTIONS.find(function(r) { return r.type === type; }) || REACTIONS[0];
    }

    function getSummaryLink($container) {
        var cid = $container.data('mt2026-cid');
        var $controls = $container.closest('.wall-entry-controls.wall-entry-links');
        return $controls.find('.mt2026-summary-link[data-mt2026-cid="' + cid + '"]');
    }

    // ── Build picker HTML ─────────────────────────────────────────────────────

    function buildPickerHtml() {
        var html = '<div class="mt2026-reaction-picker" role="listbox" aria-label="Choose reaction">';
        REACTIONS.forEach(function(r) {
            html += '<button class="mt2026-reaction-btn" type="button" data-reaction="' + r.type + '" title="' + r.label + '">'
                + '<span class="mt2026-reaction-emoji">' + r.emoji + '</span>'
                + '<span class="mt2026-reaction-label">' + r.label + '</span>'
                + '</button>';
        });
        html += '</div>';
        return html;
    }

    // ── Per-container state ───────────────────────────────────────────────────

    function setTrigger($container, reactionType) {
        var $btn = $container.find('.mt2026-reaction-trigger');
        if (!reactionType) {
            $btn.removeClass('reacted').removeAttr('data-active').html('<i class="fa fa-smile-o" aria-hidden="true"></i>');
        } else {
            var r = getReactionByType(reactionType);
            $btn.addClass('reacted').attr('data-active', reactionType).html('<span class="mt2026-active-emoji">' + r.emoji + '</span>');
        }
    }

    function setSummary($container, counts) {
        var $link = getSummaryLink($container);
        if (!$link.length) return;
        var total = 0;
        var html = '';
        REACTIONS.forEach(function(r) {
            var n = counts[r.type] || 0;
            if (n > 0) {
                total += n;
                html += '<span class="mt2026-reaction-count">' + r.emoji + ' ' + n + '</span>';
            }
        });
        if (total > 0) {
            $link.find('.mt2026-summary-inner').html(html);
            $link.show();
        } else {
            $link.hide();
        }
    }

    // ── Attach to each feed-entry .likeLinkContainer only ──

    function attach() {
        $('.stream-entry-addons .wall-entry-controls.wall-entry-links .likeLinkContainer')
            .not('[data-mt2026-reactions]').each(function() {
            var $c = $(this);
            $c.attr('data-mt2026-reactions', '1');

            var params = getUrlParams($c);
            if (!params.contentModel || !params.contentId) return;

            var cid = params.contentId;
            $c.data('mt2026-cid', cid);

            // 1. Prepend trigger button
            $c.prepend('<button type="button" class="mt2026-reaction-trigger" title="React" aria-haspopup="true">'
                + '<i class="fa fa-smile-o" aria-hidden="true"></i>'
                + '</button>');

            // 2. Append floating picker inside the container
            $c.append(buildPickerHtml());

            // 3. Build reaction summary link and place it in wall-entry-links (right-aligned)
            var listUrl = BASE_URL + '/list?contentModel=' + encodeURIComponent(params.contentModel) + '&contentId=' + cid;
            var $controls = $c.closest('.wall-entry-controls.wall-entry-links');
            if ($controls.length && !$controls.find('.mt2026-summary-link[data-mt2026-cid="' + cid + '"]').length) {
                $controls.append('<a class="mt2026-summary-link" href="' + listUrl
                    + '" data-bs-target="#globalModal" data-mt2026-cid="' + cid + '" style="display:none">'
                    + '<span class="mt2026-summary-inner"></span>'
                    + '</a>');
            }

            // 4. If user has already reacted (unlike link visible), fetch and restore state
            if ($c.find('a.unlike.likeAnchor').not('.d-none').length) {
                $.get(BASE_URL + '/my-reaction', params, function(resp) {
                    if (resp && resp.reactionType) setTrigger($c, resp.reactionType);
                    if (resp && resp.reactionCounts) setSummary($c, resp.reactionCounts);
                });
            } else {
                // Still fetch summary counts even when user hasn't reacted
                $.get(BASE_URL + '/my-reaction', params, function(resp) {
                    if (resp && resp.reactionCounts) setSummary($c, resp.reactionCounts);
                });
            }
        });
    }

    // ── Picker show/hide ──────────────────────────────────────────────────────

    function showPicker($c) {
        $('.mt2026-reaction-picker.visible').not($c.find('.mt2026-reaction-picker')).removeClass('visible');
        $c.find('.mt2026-reaction-picker').addClass('visible');
        $c.find('.mt2026-reaction-trigger').addClass('active');
    }

    function hidePicker($c) {
        $c.find('.mt2026-reaction-picker').removeClass('visible');
        $c.find('.mt2026-reaction-trigger').removeClass('active');
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    var init = function() {
        attach();
        $(document).on('humhub:ready humhub:stream:afterAppend humhub:content:afterMove', function() {
            setTimeout(attach, 200);
        });

        // Toggle picker on trigger click/tap
        $(document).on('click', '.stream-entry-addons .wall-entry-controls.wall-entry-links .mt2026-reaction-trigger', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $c = $(this).closest('.likeLinkContainer');
            if ($c.find('.mt2026-reaction-picker').hasClass('visible')) {
                hidePicker($c);
            } else {
                showPicker($c);
            }
        });

        // Desktop hover: open picker after delay
        var hoverTimer;
        $(document).on('mouseenter', '.stream-entry-addons .wall-entry-controls.wall-entry-links .likeLinkContainer', function() {
            var $c = $(this);
            hoverTimer = setTimeout(function() { showPicker($c); }, 400);
        }).on('mouseleave', '.stream-entry-addons .wall-entry-controls.wall-entry-links .likeLinkContainer', function() {
            clearTimeout(hoverTimer);
            var $c = $(this);
            setTimeout(function() {
                if (!$c.find('.mt2026-reaction-picker:hover').length) hidePicker($c);
            }, 300);
        });
        $(document).on('mouseleave', '.mt2026-reaction-picker', function() {
            hidePicker($(this).closest('.likeLinkContainer'));
        });

        // Pick a reaction
        $(document).on('click', '.mt2026-reaction-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $btn = $(this);
            var type = $btn.data('reaction');
            var $c = $btn.closest('.likeLinkContainer');
            hidePicker($c);

            $btn.addClass('mt2026-pop');
            setTimeout(function() { $btn.removeClass('mt2026-pop'); }, 300);

            var params = getUrlParams($c);
            if (!params.contentModel || !params.contentId) {
                $c.find('a.like.likeAnchor:not(.d-none)').first().trigger('click');
                return;
            }

            $.ajax({
                url: BASE_URL + '/react',
                method: 'POST',
                data: {
                    contentModel: params.contentModel,
                    contentId: params.contentId,
                    reaction_type: type,
                    _csrf: $('meta[name=csrf-token]').attr('content') || humhub.config.get('humhub', 'csrf')
                },
                success: function(r) {
                    var current = (r && r.currentUserReaction) || null;
                    setTrigger($c, current);
                    if (r && r.reactionCounts) setSummary($c, r.reactionCounts);

                    // Keep the native like/unlike links in sync for HumHub compatibility
                    if (current) {
                        $c.find('a.like.likeAnchor').addClass('d-none');
                        $c.find('a.unlike.likeAnchor').removeClass('d-none');
                    } else {
                        $c.find('a.like.likeAnchor').removeClass('d-none');
                        $c.find('a.unlike.likeAnchor').addClass('d-none');
                    }
                },
                error: function() {
                    $c.find('a.like.likeAnchor:not(.d-none), a.unlike.likeAnchor:not(.d-none)').first().trigger('click');
                }
            });
        });

        // Close on outside click
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

        $(document).on('pjax:end', function() { setTimeout(attach, 200); });
    };

    module.initOnPjaxLoad = true;

    module.export({ init: init });
});
