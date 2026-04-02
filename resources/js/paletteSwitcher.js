humhub.module('modernTheme.paletteSwitcher', function(module, require, $) {

    var STORAGE_KEY = 'modernTheme2026_palette';

    var PALETTES = [
        {
            id: 'ocean-blue', label: 'Ocean Blue',
            primary: '#1e6ad6', accent: '#5a8eeb', secondary: '#7c3aed',
            success: '#10b981', danger: '#ef4444', warning: '#f59e0b',
            info: '#3b82f6', light: '#f8fafc', dark: '#1e293b'
        },
        {
            id: 'royal-purple', label: 'Royal Purple',
            primary: '#7c3aed', accent: '#a78bfa', secondary: '#ec4899',
            success: '#10b981', danger: '#ef4444', warning: '#f59e0b',
            info: '#8b5cf6', light: '#faf5ff', dark: '#1e1b4b'
        },
        {
            id: 'forest-green', label: 'Forest Green',
            primary: '#059669', accent: '#34d399', secondary: '#10b981',
            success: '#16a34a', danger: '#dc2626', warning: '#d97706',
            info: '#0891b2', light: '#f0fdf4', dark: '#14532d'
        },
        {
            id: 'slate-gray', label: 'Slate Gray',
            primary: '#475569', accent: '#94a3b8', secondary: '#334155',
            success: '#16a34a', danger: '#dc2626', warning: '#d97706',
            info: '#0284c7', light: '#f8fafc', dark: '#0f172a'
        },
        {
            id: 'sunset-orange', label: 'Sunset Orange',
            primary: '#ea580c', accent: '#fb923c', secondary: '#dc2626',
            success: '#16a34a', danger: '#b91c1c', warning: '#f59e0b',
            info: '#0284c7', light: '#fff7ed', dark: '#431407'
        },
        {
            id: 'rose-pink', label: 'Rose Pink',
            primary: '#db2777', accent: '#f472b6', secondary: '#ec4899',
            success: '#16a34a', danger: '#dc2626', warning: '#d97706',
            info: '#0284c7', light: '#fdf2f8', dark: '#500724'
        },
        {
            id: 'teal-cyan', label: 'Teal Cyan',
            primary: '#0891b2', accent: '#22d3ee', secondary: '#0e7490',
            success: '#059669', danger: '#dc2626', warning: '#d97706',
            info: '#06b6d4', light: '#ecfeff', dark: '#164e63'
        },
        {
            id: 'midnight-dark', label: 'Midnight Dark',
            primary: '#6366f1', accent: '#818cf8', secondary: '#4f46e5',
            success: '#10b981', danger: '#f43f5e', warning: '#fbbf24',
            info: '#38bdf8', light: '#1e1b4b', dark: '#0f0a1e'
        }
    ];

    function applyPalette(paletteId) {
        var html = document.documentElement;
        if (paletteId) {
            html.setAttribute('data-theme', paletteId);
        } else {
            html.removeAttribute('data-theme');
        }
    }

    function savePalette(paletteId) {
        try {
            localStorage.setItem(STORAGE_KEY, paletteId);
        } catch(e) {}
    }

    function loadSavedPalette() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            if (saved !== null) {
                applyPalette(saved);
                return saved;
            }
        } catch(e) {}
        return '';
    }

    function fillColor(fieldSuffix, color) {
        var $checkbox = $('#designsettingsform-usedefaulttheme' + fieldSuffix + 'color');
        var $field    = $('#designsettingsform-theme' + fieldSuffix + 'color');
        if ($checkbox.length) {
            $checkbox.prop('checked', false).trigger('change');
        }
        if ($field.length) {
            $field.prop('disabled', false).val(color).trigger('input');
        }
    }

    function renderAdminPresets() {
        if (!$('#designsettingsform-themeprimarycolor').length) return;
        if ($('#moderntheme-palette-presets').length) return;

        var html = '<div id="moderntheme-palette-presets" class="mb-3">';
        html += '<label class="form-label fw-semibold">Preset Color Palettes</label>';
        html += '<div class="d-flex flex-wrap gap-2 p-3 bg-light rounded">';

        PALETTES.forEach(function(p) {
            html += '<button type="button" class="btn btn-sm moderntheme-preset-btn d-flex align-items-center gap-2"';
            html += ' data-palette-id="' + p.id + '"';
            html += ' data-primary="' + p.primary + '"';
            html += ' data-accent="' + p.accent + '"';
            html += ' data-secondary="' + p.secondary + '"';
            html += ' data-success="' + p.success + '"';
            html += ' data-danger="' + p.danger + '"';
            html += ' data-warning="' + p.warning + '"';
            html += ' data-info="' + p.info + '"';
            html += ' data-light="' + p.light + '"';
            html += ' data-dark="' + p.dark + '"';
            html += ' style="border: 2px solid #dee2e6; background: #fff; padding: 6px 12px;">';
            html += '<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:' + p.primary + ';flex-shrink:0;"></span>';
            html += '<span>' + p.label + '</span>';
            html += '</button>';
        });

        html += '</div>';
        html += '<small class="text-muted">Clicking a preset fills the color fields below. Save the form to apply.</small>';
        html += '</div>';

        $('#designsettingsform-themeprimarycolor').closest('.col-lg-4').closest('.row').before(html);

        $(document).on('click', '.moderntheme-preset-btn', function() {
            var $btn = $(this);
            fillColor('primary',   $btn.data('primary'));
            fillColor('accent',    $btn.data('accent'));
            fillColor('secondary', $btn.data('secondary'));
            fillColor('success',   $btn.data('success'));
            fillColor('danger',    $btn.data('danger'));
            fillColor('warning',   $btn.data('warning'));
            fillColor('info',      $btn.data('info'));
            fillColor('light',     $btn.data('light'));
            fillColor('dark',      $btn.data('dark'));

            var primary = $btn.data('primary');
            $('.moderntheme-preset-btn').css({'border-color': '#dee2e6', 'box-shadow': 'none'});
            $btn.css({'border-color': primary, 'box-shadow': '0 0 0 2px ' + primary + '33'});

            applyPalette($btn.data('palette-id'));
            savePalette($btn.data('palette-id'));
        });
    }

    function renderSwitcher() {
        $('#moderntheme-palette-switcher').remove();
        $(document).off('.paletteSwitcher').off('.paletteSwitcherOutside');

        var currentPalette = loadSavedPalette();

        var html = '<div id="moderntheme-palette-switcher" class="palette-switcher" role="region" aria-label="Color theme switcher">';
        html += '<button class="palette-trigger" type="button" aria-haspopup="true" aria-expanded="false" title="Change color theme">';
        html += '<i class="fa fa-paint-brush"></i>';
        html += '</button>';
        html += '<div class="palette-popover" role="listbox" aria-label="Select color palette" style="display:none">';
        html += '<div class="palette-title">Color Theme</div>';
        html += '<div class="palette-swatches">';

        PALETTES.forEach(function(p) {
            var isActive = (p.id === currentPalette);
            html += '<button class="palette-swatch' + (isActive ? ' active' : '') + '"';
            html += ' type="button" role="option" data-palette="' + p.id + '"';
            html += ' aria-selected="' + isActive + '" aria-label="' + p.label + ' theme"';
            html += ' title="' + p.label + '">';
            html += '<span class="swatch-color" style="background:' + p.primary + '"></span>';
            html += '<span class="swatch-label">' + p.label + '</span>';
            html += '</button>';
        });

        html += '</div></div></div>';
        $('body').append(html);

        $(document).on('click.paletteSwitcher', '#moderntheme-palette-switcher .palette-trigger', function() {
            var $popover = $('#moderntheme-palette-switcher .palette-popover');
            var isOpen = $popover.is(':visible');
            $popover.toggle(!isOpen);
            $(this).attr('aria-expanded', !isOpen);
        });

        $(document).on('click.paletteSwitcher', '.palette-swatch', function() {
            var paletteId = $(this).data('palette');
            applyPalette(paletteId);
            savePalette(paletteId);
            $('.palette-swatch').removeClass('active').attr('aria-selected', 'false');
            $(this).addClass('active').attr('aria-selected', 'true');
            $('.palette-popover').hide();
            $('.palette-trigger').attr('aria-expanded', 'false');
        });

        $(document).on('click.paletteSwitcherOutside', function(e) {
            if (!$(e.target).closest('#moderntheme-palette-switcher').length) {
                $('.palette-popover').hide();
                $('.palette-trigger').attr('aria-expanded', 'false');
            }
        });

        $(document).on('keydown.paletteSwitcher', function(e) {
            if (e.key === 'Escape') {
                $('.palette-popover').hide();
                $('.palette-trigger').attr('aria-expanded', 'false');
            }
        });
    }

    function init(pjax) {
        loadSavedPalette();
        // Only render the floating FAB on the admin appearance settings page
        renderAdminPresets();
        if ($('#designsettingsform-themeprimarycolor').length) {
            renderSwitcher();
        }

        if (!pjax) {
            $(document).on('pjax:end', function() {
                renderAdminPresets();
                if ($('#designsettingsform-themeprimarycolor').length) {
                    renderSwitcher();
                } else {
                    $('#moderntheme-palette-switcher').remove();
                }
            });
        }
    }

    module.export({
        init: init
    });
});
