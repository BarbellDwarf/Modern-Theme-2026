# Modern Theme 2026

A contemporary HumHub theme featuring glassmorphism effects, subtle depth, smooth animations, and 2026 design trends.

## Features

- **Contemporary Design**: Glassmorphism and liquid glass effects
- **Subtle Depth**: 5-level shadow system for modern depth perception
- **Adaptive Colors**: 4 preset color palettes (Professional Blue, Creative Purple, Fresh Green, Neutral Gray)
- **Fluid Typography**: Modern type scale with system fonts
- **Smooth Animations**: Microinteractions and transitions throughout
- **Mobile-First**: Responsive design optimized for all devices
- **Accessibility**: WCAG 2.1 AA compliance
- **Self-contained Theme Module**: No dependency on Clean Theme

## Installation

### Via Module Directory (Recommended)

1. Download and extract to `/var/www/humhub/protected/modules/modern-theme-2026/`
2. Set proper ownership:
   ```bash
   sudo chown -R www-data:www-data /var/www/humhub/protected/modules/modern-theme-2026
   ```
3. Enable the module via Admin Panel → Modules
4. Flush cache: Administration → Settings → Advanced → Caching → "Flush caches"
5. The theme will be automatically activated

### Via Git

```bash
cd /var/www/humhub/protected/modules
git clone https://github.com/BarbellDwarf/Modern-Theme-2026.git modern-theme-2026
sudo chown -R www-data:www-data modern-theme-2026
```

Then enable via Admin Panel → Modules.

## Activation

The theme activates automatically when you enable the module. To manually switch themes:

1. Admin Panel → Settings → Design & Appearance
2. Select "ModernTheme2026"
3. Save and flush cache

## Lifecycle Behavior

- **First install/enable:** runs module migrations, activates `ModernTheme2026`, and rebuilds theme CSS.
- **Disable/uninstall:** switches back to default `HumHub` theme and runs uninstall cleanup.
- **Database cleanup on uninstall:** removes the `like.reaction_type` column and restores the original
  `unique-object-user` index on the `like` table.

## Documentation

- **QUICK-START.md** - Quick activation guide
- **ACTIVATION-GUIDE.md** - Detailed testing and troubleshooting
- **IMPLEMENTATION-SUMMARY.md** - Technical implementation details

## What's Included

### Design System
- 4 color palettes with CSS custom properties
- 5-level shadow system (xs, sm, md, lg, xl, 2xl)
- Fluid typography (9 sizes)
- 4px base spacing grid
- Modern border radius system

### Component Styling
- Modern buttons with depth
- Enhanced forms and inputs
- Refined badges and pills
- Improved cards and panels
- Contemporary navigation
- Smooth dropdowns and modals
- Stream/activity feed enhancements

### Mobile Experience
- Touch-optimized interactions (44x44px touch targets)
- Mobile-first responsive breakpoints
- Optimized navigation for mobile
- Fullscreen mobile modals

## Future Features (Ready for Backend Implementation)

### Emoji Reactions
Visual styles complete, requires:
- Database migration for reaction types
- PHP controller updates
- JavaScript updates

### Smart Context Switcher
Visual styles complete, requires:
- Custom PHP widget
- Keyboard navigation (Ctrl/Cmd+K)
- Recent history tracking

## Customization

Edit color palette and design tokens:
```bash
nano /var/www/humhub/protected/modules/modern-theme-2026/themes/ModernTheme2026/scss/variables.scss
```

After changes, flush cache to recompile SCSS.

## Requirements

- HumHub 1.18.0 or higher
- No additional theme module dependencies

## Support

For issues, please visit: https://github.com/BarbellDwarf/Modern-Theme-2026/issues

## Version

**1.0.0** - Initial release

## License

Compatible with HumHub licensing.

## Credits

Built with contemporary 2026 design trends including glassmorphism, subtle depth, and fluid interactions.
