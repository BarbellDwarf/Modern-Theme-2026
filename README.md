# Modern Theme 2026

Do you enjoy using HumHub but find the UI a little clunky? Tried the Clean Theme and it just doesn't seem to scratch that itch? Well that was me. And I decided to do something about it. I built this theme from the ground up to fix all the issues I saw with the base theme and the Clean Theme. Try it out and let me know what you think!

## Key Features

- Contemporary Design with glassmorphism effects and liquid glass surfaces
- Subtle Depth using a 5-level shadow system for modern visual hierarchy
- Adaptive Color System with 12 preset color palettes to choose from
- Improved Typography with modern font scaling and readability
- Smooth Animations and microinteractions throughout the interface
- Enhanced Mobile Experience with touch-optimized interactions
- Enhanced Mail UI on desktop and mobile (chat-style alignment, drawer behavior, Enter-to-send on desktop)
- Full Dark Mode Support compatible with HumHub's dark-mode module
- Emoji Reactions System with 6 reaction types (like, love, laugh, wow, sad, pray)
- Better Administration Interface with improved spacing and layout
- Accessibility Features including WCAG 2.1 AA compliance
- Smart Mobile Bottom Navigation for app-like experience
- Profile Improvements with clickable phone/email links
- Fully Self-Contained with zero external dependencies

## Install Instructions

### Option 1: Automated Installation Script (Easiest)

1. Place the module at `/var/www/humhub/protected/modules/modern-theme-2026/`:
   ```bash
   cd /var/www/humhub/protected/modules
   git clone https://github.com/BarbellDwarf/Modern-Theme-2026.git modern-theme-2026
   ```
   Or extract a release zip into that path.

2. Run the installer and follow the prompts:
   ```bash
   cd /var/www/humhub/protected/modules/modern-theme-2026
   ./install.sh /var/www/humhub
   ```

3. Enable the module and activate the theme via the admin panel, then run the final update:
   ```bash
   cd /var/www/humhub/protected
   php yii modern-theme-2026/update
   ```

### Option 2: Manual

1. Place module at `/var/www/humhub/protected/modules/modern-theme-2026/`
2. Set permissions: `sudo chown -R www-data:www-data` on that directory
3. Compile CSS: `php compile-css.php`
4. Enable module: Administration → Modules → Modern Theme 2026 → Enable
5. Activate theme: Administration → Design → Select ModernTheme2026 → Save
6. Finish setup: `php yii modern-theme-2026/update` (from protected directory)

## Update Instructions

After any code change (git pull, manual edit, etc.):

```bash
cd /var/www/humhub/protected
php yii modern-theme-2026/update
```

This single command rebuilds CSS, runs the standalone compiler, flushes all caches, and republishes theme assets. No manual cache clearing, asset deletion, or theme toggling needed.

## Releases & Packaging

This repository includes automated release packaging on pushes to `main`.

- Workflow: `.github/workflows/release-module.yml`
- Trigger: push to `main`
- Output: GitHub Release artifact zip named `modern-theme-2026-v<version>.zip`
- Version source: `module.json` (`version` field)
- Release notes source: `CHANGELOG.md` entry matching the version

Before merging to `main`:

1. Update `module.json` version if needed.
2. Add a matching `CHANGELOG.md` section header in this format:
   `## [<version>] - YYYY-MM-DD`
3. Merge to `main` to trigger zip packaging and release publication.

## Recent Branch Changes (V1.0.5)

- Mail conversation UI refinements across desktop and mobile:
   - own messages align right, other users align left
   - improved bubble spacing and timestamp placement
   - edit button placement next to the related message bubble
   - desktop Enter sends message, Ctrl/Cmd+Enter inserts a newline
   - improved auto-scroll behavior to newest messages
- Legacy local infrastructure files removed from this branch:
   - `docker-compose.yml`
   - `caddy/Caddyfile`
- Playwright helper scripts were streamlined. Current lightweight scripts in `tests/playwright/` are:
   - `test_android_nav.js`
   - `view_ui_mcp.js`

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
   - Rebuild: `php compile-css.php` then `php yii modern-theme-2026/update` (from protected dir)

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
- Optimized compiled CSS and lightweight JavaScript modules for interactive behavior
- CSS is served from precompiled `dist/theme.css` for predictable runtime performance
- Cached assets for optimal performance

### Browser Support
- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Android)

## Troubleshooting

### Installation Issues

**If the installation script fails:**
- Ensure you're running the script FROM the module directory: `cd modern-theme-2026 && ./install.sh /var/www/humhub`
- Ensure the module directory is named exactly `modern-theme-2026` (lowercase with hyphens)
- Check that you have write permissions to the HumHub modules directory
- Try with `sudo`: `sudo ./install.sh /var/www/humhub`
- Check that HumHub path is correct (typically `/var/www/humhub`)

**Directory naming issue from extracted zip:**
- The zip file should extract with the correct casing: `modern-theme-2026`
- If you see a different name (e.g., `Modern-Theme-2026` or `MODERN-THEME-2026`), the script will auto-detect and rename it
- Or manually rename: `mv Modern-Theme-2026 modern-theme-2026`

### Theme not appearing after installation
- Run `php yii modern-theme-2026/update` from the protected directory
- Clear your browser cache
- Verify ModernTheme2026 is selected in Administration → Design
- Ensure the module is enabled in Administration → Modules
- Ensure www-data has proper file permissions on the module directory

### Styles look broken or incomplete
- Run `php yii modern-theme-2026/update` from the protected directory
- Verify ModernTheme2026 is selected as active theme
- Check that CSS file was compiled: `themes/ModernTheme2026/dist/theme.css` exists and is not empty

### Issues with mobile app
- Ensure you're on the latest version of Modern Theme 2026
- Clear app cache and data, then restart the app
- Check that JavaScript is enabled in your browser
- Clear HumHub cache via admin panel or command line

## Support & Feedback

Found an issue or have a suggestion? Visit the GitHub repository:
https://github.com/BarbellDwarf/Modern-Theme-2026

Please report bugs with:
- Steps to reproduce
- Browser and OS information
- Screenshots if applicable
- HumHub version number

## Version

- 1.0.5 - Continued mobile stability investigations and refinements
- 1.0.4 - Mobile stream comment reliability and reaction picker fixes
- 1.0.3 - Mobile comment composer focus/scope regression fixes and improved mobile comment handling
- 1.0.2 - Stream and messages UI refinements
- 1.0.1 - Mail layout and mobile UX refinements
- 1.0.0 - Initial release

## License

This theme is compatible with HumHub's licensing model. See HumHub documentation for details.

## Credits

Built for HumHub users who want a modern, polished interface that just works. Incorporates 2026 design trends including contemporary glassmorphism, subtle depth perception, smooth animations, and intuitive interactions.
