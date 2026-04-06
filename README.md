# Modern Theme 2026

Do you enjoy using HumHub but find the UI a little clunky? Tried the Clean Theme and it just doesn't seem to scratch that itch? Well that was me. And I decided to do something about it. I built this theme from the ground up to fix all the issues I saw with the base theme and the Clean Theme. Try it out and let me know what you think!

## Key Features

- Contemporary Design with glassmorphism effects and liquid glass surfaces
- Subtle Depth using a 5-level shadow system for modern visual hierarchy
- Adaptive Color System with 12 preset color palettes to choose from
- Improved Typography with modern font scaling and readability
- Smooth Animations and microinteractions throughout the interface
- Enhanced Mobile Experience with touch-optimized interactions
- Full Dark Mode Support compatible with HumHub's dark-mode module
- Emoji Reactions System with 6 reaction types (like, love, laugh, wow, sad, pray)
- Better Administration Interface with improved spacing and layout
- Accessibility Features including WCAG 2.1 AA compliance
- Smart Mobile Bottom Navigation for app-like experience
- Profile Improvements with clickable phone/email links
- Fully Self-Contained with zero external dependencies

## Install Instructions

### Option 1: Via Module Directory (Recommended)

1. Download the module files to your HumHub installation:
   ```bash
   cd /var/www/humhub/protected/modules
   git clone https://github.com/BarbellDwarf/Modern-Theme-2026.git modern-theme-2026
   ```

2. Set proper file permissions:
   ```bash
   sudo chown -R www-data:www-data modern-theme-2026
   ```

3. Enable the module:
   - Log in to HumHub as Administrator
   - Go to Administration > Modules
   - Find "Modern Theme 2026" and click Enable
   - Wait for the installation to complete

4. Activate the theme:
   - Go to Administration > Settings > Design & Appearance
   - Select "ModernTheme2026" from the Theme dropdown
   - Click Save
   - Clear cache if needed: Administration > Settings > Advanced > Caching

The theme will be active immediately after activation.

### Option 2: Manual Installation

1. Extract the module to: `/var/www/humhub/protected/modules/modern-theme-2026/`
2. Set permissions: `sudo chown -R www-data:www-data /var/www/humhub/protected/modules/modern-theme-2026`
3. Enable via Admin Panel: Modules > Modern Theme 2026 > Enable
4. Activate theme: Design & Appearance > Select ModernTheme2026

## Update Instructions

To update the theme to a newer version:

1. Pull the latest changes:
   ```bash
   cd /var/www/humhub/protected/modules/modern-theme-2026
   git pull origin V2026.0.0
   ```

2. Clear HumHub cache:
   - Administration > Settings > Advanced > Caching > "Flush caches"
   - Or from command line: `php /var/www/humhub/protected/yii cache/flush-all`

3. The theme will rebuild automatically on next page load

Note: Database migrations (if any) are applied automatically when you reload HumHub.

## Customization

To customize colors and design tokens:

1. Edit the variables file:
   ```bash
   nano /var/www/humhub/protected/modules/modern-theme-2026/themes/ModernTheme2026/scss/variables.scss
   ```

2. Available customizations:
   - Primary, secondary, and accent colors
   - Shadow system intensity
   - Typography scales
   - Border radius settings
   - Spacing grid

3. After making changes:
   - Clear HumHub cache for changes to take effect
   - SCSS will recompile automatically

## Theme Customization Panel

The theme includes a dedicated admin panel for customization:

1. Go to Administration > Modern Theme 2026 Settings
2. Choose from 12 preset color palettes
3. Fine-tune individual colors (Primary, Accent, Secondary, etc.)
4. Customize the "People" navigation label
5. Changes apply immediately

## Features in Detail

### Design System
- 12 carefully crafted color palettes with harmony
- 5-level shadow system (xs, sm, md, lg, xl)
- Modern border radius for elements
- Consistent 4px-based spacing grid
- Professional typography scale

### Components
- Redesigned buttons with depth and hover states
- Enhanced form inputs and validation states
- Modern cards and panels with shadows
- Improved dropdowns and select controls
- Contemporary badges and pills
- Enhanced modal dialogs

### Mobile & Responsive
- Touch-optimized interface with proper hit targets
- Mobile-first approach across all pages
- Custom bottom navigation bar for mobile apps
- Responsive layout that adapts to all screen sizes
- Optimized for both phones and tablets

### Accessibility
- Full WCAG 2.1 AA compliance
- Proper color contrast ratios
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators on interactive elements

### Dark Mode
- Full support for dark mode
- Compatible with HumHub's dark-mode module
- Automatic color adjustment
- Seamless light/dark switching

## Technical Details

### Requirements
- HumHub 1.18.0 or higher
- No additional dependencies required
- No composer/npm packages needed

### Database Changes
- Adds `reaction_type` column to the `like` table for emoji reactions
- All changes are automatically applied when enabling the module
- Automatically cleaned up if module is uninstalled

### Performance
- Optimized CSS (550KB minified)
- No additional JavaScript required for styling
- Theme compiles on first page load if needed
- Cached assets for optimal performance

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Troubleshooting

### Theme not appearing after installation
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Clear HumHub cache: Administration > Settings > Advanced > Caching
- Ensure www-data user has proper file permissions

### Styles look broken or incomplete
- Check that CSS file was compiled: `/var/www/humhub/assets/*/resources/css/theme.css`
- Clear application cache and reload
- Verify ModernTheme2026 is selected as active theme

### Issues with mobile app
- Ensure you're on the latest version
- Clear app cache and data, then restart the app
- Check that JavaScript is enabled in your browser

## Support & Feedback

Found an issue or have a suggestion? Visit the GitHub repository:
https://github.com/BarbellDwarf/Modern-Theme-2026

Please report bugs with:
- Steps to reproduce
- Browser and OS information
- Screenshots if applicable
- HumHub version number

## Version

1.0.0 - Initial Release

## License

This theme is compatible with HumHub's licensing model. See HumHub documentation for details.

## Credits

Built for HumHub users who want a modern, polished interface that just works. Incorporates 2026 design trends including contemporary glassmorphism, subtle depth perception, smooth animations, and intuitive interactions.
