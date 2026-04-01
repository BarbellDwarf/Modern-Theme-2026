# Modern Theme 2026

A contemporary HumHub theme featuring glassmorphism, depth effects, adaptive colors, and intuitive navigation.

## Features

### 🎨 Design
- **Contemporary Aesthetics**: Glassmorphism and liquid glass effects
- **Subtle Depth**: 5-level shadow system for modern depth perception
- **Smooth Animations**: Microinteractions and transitions throughout
- **Adaptive Colors**: 4 preset color palettes with dynamic switching

### 🧭 Navigation
- **Smart Context Switcher**: Unified navigation dropdown (Ctrl/Cmd+K)
- **Recent History**: Quick access to last visited spaces
- **Keyboard Shortcuts**: Power user friendly navigation
- **Breadcrumb Navigation**: Always know where you are

### 😊 Emoji Reactions
- **5 Reaction Types**: Like 👍, Love ❤️, Laugh 😂, Sad 😢, Pray 🙏
- **Hover/Tap Picker**: Hover on desktop, tap on mobile
- **Grouped Display**: See all reactions with individual counts
- **Real-time Updates**: Live reaction count updates

### 📱 Mobile Experience
- **Touch Optimized**: 44x44px minimum touch targets
- **Responsive Design**: Mobile-first approach
- **Swipe Gestures**: Intuitive mobile interactions
- **Optimized Performance**: Fast loading on mobile devices

### ♿ Accessibility
- **WCAG 2.1 AA Compliant**: Proper contrast ratios
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader Friendly**: ARIA labels and semantic HTML
- **Focus Indicators**: Clear focus states for all interactive elements

## Installation

1. Extract theme files to `/var/www/humhub/themes/ModernTheme2026/`
2. Go to Admin Panel → Appearance → Design
3. Select "Modern Theme 2026"
4. Click "Save" and then "Flush Cache"

## Customization

### Color Palettes

The theme includes 4 preset color palettes:

1. **Professional Blue** (Default)
   - Primary: #1e6ad6
   - Secondary: #7c3aed

2. **Creative Purple**
   - Primary: #7c3aed
   - Secondary: #ec4899

3. **Fresh Green**
   - Primary: #10b981
   - Secondary: #14b8a6

4. **Neutral Gray**
   - Primary: #6b7280
   - Secondary: #374151

To switch palettes, add `data-theme="purple"`, `data-theme="green"`, or `data-theme="neutral"` to the `<html>` tag.

### SCSS Variables

All design tokens are defined in `scss/variables.scss`:

- **Colors**: Primary, secondary, semantic colors, grays
- **Shadows**: 5-level elevation system
- **Typography**: Font sizes, weights, line heights
- **Spacing**: 4px base grid system
- **Border Radius**: Consistent corner rounding
- **Transitions**: Animation speeds and timing functions

### CSS Custom Properties

Dynamic theming is handled via CSS custom properties in `scss/_root.scss`. All colors, shadows, and spacing are available as CSS variables (e.g., `var(--color-primary)`).

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile Safari & Chrome (iOS/Android latest)

## Performance

- CSS file size: < 150KB (minified)
- No runtime JavaScript for styling
- Optimized SCSS compilation
- Minimal specificity conflicts

## Credits

- **Parent Theme**: Clean Theme by ArchBlood
- **Base**: HumHub Core Theme
- **Design Inspiration**: 2026 web design trends (glassmorphism, contemporary UI)

## License

Same license as HumHub (AGPLv3)

## Support

For issues or questions:
1. Check HumHub documentation
2. Review parent Clean Theme documentation
3. Contact your HumHub administrator

## Version

**1.0.0** - Initial Release

Compatible with HumHub 1.18.0+

## Changelog

### 1.0.0 (2026-04-01)
- Initial release
- Contemporary design with glassmorphism
- Smart Context Switcher navigation
- Emoji reactions system
- Adaptive color palettes
- Mobile optimizations
- Accessibility improvements
