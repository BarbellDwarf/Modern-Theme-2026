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
    try {
        var urlBuilder = humhub && humhub.config && humhub.config.get ? humhub.config.get('url') : null;
        if (typeof urlBuilder === 'function') {
            BASE_URL = urlBuilder('modern-theme-2026/reactions');
        }
    } catch (e) {}
    var CONTAINER_SELECTOR = '.likeLinkContainer';
    var bootstrapped = false;

    // ── Helpers ───────────────────────────────────────────────────────────────

    function getUrlParams($container) {
        var $like = $container.find('a.likeAnchor').first();
        var actionUrl = ($like.attr('data-action-url') || $like.data('action-url') || $like.attr('href') || '').toString();
        var query = (actionUrl.split('?')[1] || '').replace(/&amp;/g, '&');
        if (!query) {
            return { contentModel: null, contentId: null };
        }

        if (typeof URLSearchParams !== 'undefined') {
            var p = new URLSearchParams(query);
            return { contentModel: p.get('contentModel'), contentId: p.get('contentId') };
        }

        var modelMatch = query.match(/(?:^|&)contentModel=([^&]+)/);
        var idMatch = query.match(/(?:^|&)contentId=([^&]+)/);
        return {
            contentModel: modelMatch ? decodeURIComponent(modelMatch[1]) : null,
            contentId: idMatch ? decodeURIComponent(idMatch[1]) : null
        };
    }

    function getReactionByType(type) {
        return REACTIONS.find(function(r) { return r.type === type; }) || REACTIONS[0];
    }

    function getSummaryLink($container) {
        var cid = $container.data('mt2026-cid');
        var $controls = $container.closest('.wall-entry-controls');
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

    // ── Picker teleport: attach a single floating picker to <body> ───────────
    //
    // Positioning relative to an ancestor results in clipping when any ancestor
    // has overflow:hidden (stream cards, comment containers, etc.).
    // We maintain ONE shared picker appended to <body> and position it using
    // getBoundingClientRect() so it's completely outside the stacking context.

    var $bodyPicker = null;
    var $activeTrigger = null;
    var $activeContainer = null;

    function getOrCreateBodyPicker() {
        if (!$bodyPicker || !$bodyPicker.length) {
            $bodyPicker = $(buildPickerHtml()).css({
                position: 'fixed',
                display: 'none',
                zIndex: 99999
            }).removeClass('visible').appendTo('body');
        }
        return $bodyPicker;
    }

    function positionBodyPicker($trigger) {
        var $picker = getOrCreateBodyPicker();
        $picker.css('display', 'flex');
        var trigRect  = $trigger[0].getBoundingClientRect();
        var pickW     = $picker.outerWidth(true);
        var pickH     = $picker.outerHeight(true);
        var vpW       = window.innerWidth;
        var vpH       = window.innerHeight;

        // Prefer opening above the trigger; fall back to below if insufficient space.
        var top = trigRect.top - pickH - 8;
        if (top < 4) { top = trigRect.bottom + 8; }

        // On mobile viewports center the picker horizontally so it is never
        // clipped on either side, regardless of where the trigger sits.
        var left;
        if (vpW < 992 && pickW <= vpW - 16) {
            left = Math.round((vpW - pickW) / 2);
        } else {
            // Desktop: align left edge with trigger, clamped inside viewport.
            left = trigRect.left;
            if (left + pickW > vpW - 8) { left = vpW - pickW - 8; }
            if (left < 8) { left = 8; }
        }

        // Bottom guard
        if (top + pickH > vpH - 8) { top = Math.max(4, trigRect.top - pickH - 8); }

        // Explicitly clear bottom and right so that any residual CSS values
        // (which cannot stretch a fixed-position element unexpectedly) are zeroed.
        $picker.css({ top: top, left: left, bottom: 'auto', right: 'auto' });
        return $picker;
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
        $(CONTAINER_SELECTOR)
            .not('[data-mt2026-reactions]').each(function() {
            var $c = $(this);
            if (!$c.find('a.likeAnchor').length) {
                return;
            }
            $c.attr('data-mt2026-reactions', '1');

            var params = getUrlParams($c);
            $c.data('mt2026-params', params);

            var cid = params.contentId || ('local-' + Math.random().toString(36).slice(2));
            $c.data('mt2026-cid', cid);

            // 1. Prepend trigger button
            $c.prepend('<button type="button" class="mt2026-reaction-trigger" title="React" aria-haspopup="true">'
                + '<i class="fa fa-smile-o" aria-hidden="true"></i>'
                + '</button>');

            // 2. No longer appending an inline picker — we use a single teleported body picker.
            // (kept as comment for clarity)

            // 3. Build reaction summary link and place it in wall-entry-links (right-aligned)
            var $controls = $c.closest('.wall-entry-controls.wall-entry-links');
            if ($controls.length && params.contentModel && params.contentId && !$controls.find('.mt2026-summary-link[data-mt2026-cid="' + cid + '"]').length) {
                var listUrl = BASE_URL + '/list?contentModel=' + encodeURIComponent(params.contentModel) + '&contentId=' + params.contentId;
                $controls.append('<a class="mt2026-summary-link" href="' + listUrl
                    + '" data-bs-target="#globalModal" data-mt2026-cid="' + cid + '" style="display:none">'
                    + '<span class="mt2026-summary-inner"></span>'
                    + '</a>');
            }

            // 4. If user has already reacted (unlike link visible), fetch and restore state
            if (!params.contentModel || !params.contentId) {
                return;
            }

            if ($c.find('a.unlike.likeAnchor').not('.d-none').length) {
                $.get(BASE_URL + '/my-reaction', params, function(resp) {
                    if (resp && resp.reactionType) setTrigger($c, resp.reactionType);
                    if (resp && resp.reactionCounts) setSummary($c, resp.reactionCounts);
                }).fail(function() {});
            } else {
                // Still fetch summary counts even when user hasn't reacted
                $.get(BASE_URL + '/my-reaction', params, function(resp) {
                    if (resp && resp.reactionCounts) setSummary($c, resp.reactionCounts);
                }).fail(function() {});
            }
        });
    }

    // ── Picker show/hide ──────────────────────────────────────────────────────

    function showPicker($c) {
        var $trigger = $c.find('.mt2026-reaction-trigger');
        // Reuse the teleported body picker
        var $picker = positionBodyPicker($trigger);
        $activeContainer = $c;
        $activeTrigger   = $trigger;
        $trigger.addClass('active');
        // Ensure reaction buttons reflect active state of THIS container
        var currentReaction = $trigger.attr('data-active');
        $picker.find('.mt2026-reaction-btn').removeClass('selected');
        if (currentReaction) {
            $picker.find('.mt2026-reaction-btn[data-reaction="' + currentReaction + '"]').addClass('selected');
        }
        $picker.addClass('visible').show();
    }

    function hidePicker($c) {
        if ($bodyPicker) {
            $bodyPicker.removeClass('visible').hide();
        }
        if ($activeTrigger) { $activeTrigger.removeClass('active'); }
        $activeContainer = null;
        $activeTrigger   = null;
    }

    // ── Init ─────────────────────────────────────────────────────────────────

    var init = function() {
        attach();
        if (!bootstrapped) {
            bootstrapped = true;
            $(document).on('humhub:ready humhub:stream:afterAppend humhub:content:afterMove pjax:end', function() {
                setTimeout(attach, 200);
            });

            $(document).ajaxComplete(function() {
                setTimeout(attach, 100);
            });
        }

        // Toggle picker on trigger click/tap
        // NOTE: the picker is teleported to <body> so we check $bodyPicker directly,
        // not $c.find(...), to detect whether it is currently open for this container.
        $(document).on('click', CONTAINER_SELECTOR + ' .mt2026-reaction-trigger', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $c = $(this).closest('.likeLinkContainer');
            if ($activeContainer && $activeContainer[0] === $c[0] && $bodyPicker && $bodyPicker.hasClass('visible')) {
                hidePicker($c);
            } else {
                showPicker($c);
            }
        });

        // Desktop hover: open picker after delay
        var hoverTimer;
        $(document).on('mouseenter', CONTAINER_SELECTOR, function() {
            var $c = $(this);
            hoverTimer = setTimeout(function() { showPicker($c); }, 400);
        }).on('mouseleave', CONTAINER_SELECTOR, function() {
            clearTimeout(hoverTimer);
            var $c = $(this);
            setTimeout(function() {
                // Only hide if mouse isn't over the body picker
                if ($bodyPicker && $bodyPicker.is(':hover')) { return; }
                if ($activeContainer && $activeContainer[0] === $c[0]) { hidePicker($c); }
            }, 300);
        });
        $(document).on('mouseleave', '.mt2026-reaction-picker', function() {
            if ($activeContainer) { hidePicker($activeContainer); }
        });

        // Pick a reaction (from body-teleported picker)
        $(document).on('click', '.mt2026-reaction-btn', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var $btn = $(this);
            var type = $btn.data('reaction');
            var $c   = $activeContainer;
            if (!$c || !$c.length) { return; }
            hidePicker($c);

            $btn.addClass('mt2026-pop');
            setTimeout(function() { $btn.removeClass('mt2026-pop'); }, 300);

            var params = $c.data('mt2026-params') || getUrlParams($c);
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
            if (!$(e.target).closest('.likeLinkContainer').length
                && !$(e.target).closest('.mt2026-reaction-picker').length) {
                if ($activeContainer) hidePicker($activeContainer);
            }
        });

        // Close on Escape
        $(document).on('keydown', function(e) {
            if (e.key === 'Escape' && $activeContainer) {
                hidePicker($activeContainer);
            }
        });

        $(document).on('pjax:end', function() { setTimeout(attach, 200); });

        // Keep the floating picker aligned if the page scrolls or resizes
        $(window).on('scroll.mt2026picker resize.mt2026picker', function() {
            if ($activeContainer && $activeTrigger && $bodyPicker && $bodyPicker.is(':visible')) {
                positionBodyPicker($activeTrigger);
            }
        });
    };

    module.initOnPjaxLoad = true;

    module.export({ init: init });
});
