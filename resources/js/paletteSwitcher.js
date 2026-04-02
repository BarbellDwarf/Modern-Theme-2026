humhub.module('modernTheme.paletteSwitcher', function(module, require, $) {
    
    var STORAGE_KEY = 'modernTheme2026_palette';
    
    var PALETTES = [
        { id: '',         label: 'Blue',    primary: '#1e6ad6', secondary: '#7c3aed' },
        { id: 'purple',   label: 'Purple',  primary: '#7c3aed', secondary: '#ec4899' },
        { id: 'green',    label: 'Green',   primary: '#10b981', secondary: '#14b8a6' },
        { id: 'neutral',  label: 'Gray',    primary: '#6b7280', secondary: '#374151' }
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
