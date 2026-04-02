humhub.module('modernTheme.reactionPicker', function(module, require, $) {

    var REACTIONS = [
        { type: 'like',    emoji: '👍', label: 'Like' },
        { type: 'love',    emoji: '❤️', label: 'Love' },
        { type: 'laugh',   emoji: '😂', label: 'Haha' },
        { type: 'wow',     emoji: '😮', label: 'Wow'  },
        { type: 'sad',     emoji: '😢', label: 'Sad'  },
        { type: 'pray',    emoji: '🙏', label: 'Care' }
    ];

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
        });
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
            var $container = $btn.closest('.likeLinkContainer');

            // Animate
            $btn.addClass('mt2026-pop');
            setTimeout(function() { $btn.removeClass('mt2026-pop'); }, 300);

            // Delegate to HumHub's built-in like toggle
            var $likeLink = $container.find('a.like.likeAnchor:not(.d-none)');
            var $unlikeLink = $container.find('a.unlike.likeAnchor:not(.d-none)');

            if ($likeLink.length) {
                $likeLink.trigger('click');
            } else if ($unlikeLink.length) {
                $unlikeLink.trigger('click');
            }

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

    module.export = {
        init: init,
        initOnPjaxLoad: true
    };
});
