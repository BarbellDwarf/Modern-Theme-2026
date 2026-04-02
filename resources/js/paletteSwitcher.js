humhub.module('modernTheme.paletteSwitcher', function(module, require, $) {
    
    var STORAGE_KEY = 'modernTheme2026_palette';
    
    var PALETTES = [
        { id: '',         label: 'Blue',    primary: '#1e6ad6', secondary: '#7c3aed', accent: '#5a8eeb' },
        { id: 'purple',   label: 'Purple',  primary: '#7c3aed', secondary: '#ec4899', accent: '#a78bfa' },
        { id: 'green',    label: 'Green',   primary: '#10b981', secondary: '#14b8a6', accent: '#6ee7b7' },
        { id: 'neutral',  label: 'Gray',    primary: '#6b7280', secondary: '#374151', accent: '#9ca3af' }
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
    
    // Inject preset palette buttons into the admin design settings page
    function renderAdminPresets() {
        var $primaryField = $('#designsettingsform-themeprimarycolor');
        if (!$primaryField.length) return; // Not on the design settings page
        
        // Avoid double-inject
        if ($('#moderntheme-palette-presets').length) return;
        
        var html = '<div id="moderntheme-palette-presets" class="mb-3">';
        html += '<label class="form-label fw-semibold">Preset Color Palettes</label>';
        html += '<div class="d-flex flex-wrap gap-2 p-3 bg-light rounded">';
        
        PALETTES.forEach(function(p) {
            html += '<button type="button" class="btn btn-sm moderntheme-preset-btn d-flex align-items-center gap-2"';
            html += ' data-palette-id="' + p.id + '"';
            html += ' data-primary="' + p.primary + '"';
            html += ' data-secondary="' + p.secondary + '"';
            html += ' style="border: 2px solid #dee2e6; background: #fff; padding: 6px 12px;">';
            html += '<span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:' + p.primary + ';flex-shrink:0;"></span>';
            html += '<span>' + p.label + '</span>';
            html += '</button>';
        });
        
        html += '</div>';
        html += '<small class="text-muted">Clicking a preset fills in the color fields below. Save the form to apply.</small>';
        html += '</div>';
        
        // Insert the preset section before the first color input group
        $primaryField.closest('.col-lg-4').closest('.row').before(html);
        
        // Handle preset button click: fill in the form color fields
        $(document).on('click', '.moderntheme-preset-btn', function() {
            var primary   = $(this).data('primary');
            var secondary = $(this).data('secondary');
            
            // Uncheck "use default" checkboxes and fill colors
            function fillColor(fieldSuffix, color) {
                var $checkbox = $('#designsettingsform-usedefaulttheme' + fieldSuffix + 'color');
                var $field    = $('#designsettingsform-theme' + fieldSuffix + 'color');
                if ($checkbox.length && $field.length) {
                    $checkbox.prop('checked', false).trigger('change');
                    $field.prop('disabled', false).val(color).trigger('input');
                }
            }
            
            fillColor('primary',   primary);
            fillColor('accent',    secondary);
            fillColor('secondary', secondary);
            
            // Highlight selected preset
            $('.moderntheme-preset-btn').css('border-color', '#dee2e6').css('box-shadow', 'none');
            $(this).css('border-color', primary).css('box-shadow', '0 0 0 2px ' + primary + '33');
            
            // Apply palette visually (saved to localStorage)
            var paletteId = $(this).data('palette-id');
            applyPalette(paletteId);
            savePalette(paletteId);
        });
    }
    
    function renderSwitcher() {
        // Remove existing switcher if present (pjax re-init)
        $('#moderntheme-palette-switcher').remove();
        
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
        
        // Toggle popover
        $(document).on('click.paletteSwitcher', '#moderntheme-palette-switcher .palette-trigger', function() {
            var popover = $('#moderntheme-palette-switcher .palette-popover');
            var isOpen = popover.is(':visible');
            popover.toggle(!isOpen);
            $(this).attr('aria-expanded', !isOpen);
        });
        
        // Select palette
        $(document).on('click.paletteSwitcher', '.palette-swatch', function() {
            var paletteId = $(this).data('palette');
            applyPalette(paletteId);
            savePalette(paletteId);
            
            // Update active state
            $('.palette-swatch').removeClass('active').attr('aria-selected', 'false');
            $(this).addClass('active').attr('aria-selected', 'true');
            
            // Close popover
            $('.palette-popover').hide();
            $('.palette-trigger').attr('aria-expanded', 'false');
        });
        
        // Close on outside click
        $(document).on('click.paletteSwitcherOutside', function(e) {
            if (!$(e.target).closest('#moderntheme-palette-switcher').length) {
                $('.palette-popover').hide();
                $('.palette-trigger').attr('aria-expanded', 'false');
            }
        });
        
        // Keyboard: Escape closes
        $(document).on('keydown.paletteSwitcher', function(e) {
            if (e.key === 'Escape') {
                $('.palette-popover').hide();
                $('.palette-trigger').attr('aria-expanded', 'false');
            }
        });
    }
    
    function init(pjax) {
        // Apply saved palette immediately (also called on DOMContentLoaded via inline script)
        loadSavedPalette();
        
        // Render the floating switcher for regular pages
        renderSwitcher();
        
        // Render preset buttons if we're on the admin design settings page
        renderAdminPresets();
        
        // Re-render after pjax navigation
        if (!pjax) {
            $(document).on('pjax:end', function() {
                $(document).off('.paletteSwitcher .paletteSwitcherOutside');
                renderSwitcher();
                renderAdminPresets();
            });
        }
    }
    
    module.export = {
        init: init
    };
});
    
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
    
    function renderSwitcher() {
        // Remove existing switcher if present (pjax re-init)
        $('#moderntheme-palette-switcher').remove();
        
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
        
        // Toggle popover
        $(document).on('click.paletteSwitcher', '#moderntheme-palette-switcher .palette-trigger', function() {
            var popover = $('#moderntheme-palette-switcher .palette-popover');
            var isOpen = popover.is(':visible');
            popover.toggle(!isOpen);
            $(this).attr('aria-expanded', !isOpen);
        });
        
        // Select palette
        $(document).on('click.paletteSwitcher', '.palette-swatch', function() {
            var paletteId = $(this).data('palette');
            applyPalette(paletteId);
            savePalette(paletteId);
            
            // Update active state
            $('.palette-swatch').removeClass('active').attr('aria-selected', 'false');
            $(this).addClass('active').attr('aria-selected', 'true');
            
            // Close popover
            $('.palette-popover').hide();
            $('.palette-trigger').attr('aria-expanded', 'false');
        });
        
        // Close on outside click
        $(document).on('click.paletteSwitcherOutside', function(e) {
            if (!$(e.target).closest('#moderntheme-palette-switcher').length) {
                $('.palette-popover').hide();
                $('.palette-trigger').attr('aria-expanded', 'false');
            }
        });
        
        // Keyboard: Escape closes
        $(document).on('keydown.paletteSwitcher', function(e) {
            if (e.key === 'Escape') {
                $('.palette-popover').hide();
                $('.palette-trigger').attr('aria-expanded', 'false');
            }
        });
    }
    
    function init(pjax) {
        // Apply saved palette immediately (also called on DOMContentLoaded via inline script)
        loadSavedPalette();
        
        // Render the UI
        renderSwitcher();
        
        // Re-render after pjax navigation
        if (!pjax) {
            $(document).on('pjax:end', function() {
                $(document).off('.paletteSwitcher .paletteSwitcherOutside');
                renderSwitcher();
            });
        }
    }
    
    module.export = {
        init: init
    };
});
