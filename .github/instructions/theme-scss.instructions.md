---
description: "Use when modifying SCSS theme files, design tokens, CSS variables, or style architecture. Covers variables, glassmorphism effects, responsive design, accessibility, dark mode support, color palettes."
name: "Theme & SCSS Guidelines"
applyTo: "themes/ModernTheme2026/scss/**/*.scss"
---

# Theme & SCSS Development Guidelines

## Overview

The Modern Theme 2026 uses SCSS to define a cohesive design system based on:
- **Design tokens** (colors, shadows, typography, spacing)
- **CSS custom properties** for dynamic theming
- **BEM naming** for scalable component architecture
- **Mobile-first responsive design**
- **WCAG 2.1 AA accessibility** compliance

All SCSS compiles to CSS served by HumHub's theme system.

## File Organization

```
themes/ModernTheme2026/scss/
├── variables.scss          # Design tokens (colors, shadows, typography)
├── _root.scss              # CSS custom properties for dynamic values
├── _theme.scss             # Main component stylesheet
├── _mixins.scss            # Reusable SCSS mixins (glassmorphism, shadows, etc)
├── _accessibility.scss     # WCAG 2.1 AA helpers
├── _performance.scss       # Performance optimization utilities
├── build.scss              # Entry point (imports all others)
└── humhub/                 # HumHub-specific component overrides
    ├── _buttons.scss
    ├── _forms.scss
    ├── _navigation.scss
    └── [other component overrides]
```

## Design System: The 4 Pillars

### 1. Color Palettes (4 Presets)

Each palette has Primary, Secondary, and semantic colors:

**Professional Blue** (Default)
```scss
$color-primary: #1e6ad6;
$color-secondary: #7c3aed;
$color-accent: #ec4899;
```

**Creative Purple**
```scss
$color-primary: #7c3aed;
$color-secondary: #ec4899;
$color-accent: #06b6d4;
```

**Fresh Green**
```scss
$color-primary: #10b981;
$color-secondary: #14b8a6;
$color-accent: #f59e0b;
```

**Neutral Gray**
```scss
$color-primary: #6b7280;
$color-secondary: #374151;
$color-accent: #8b5cf6;
```

**Rules**:
- Define all 4 palettes in `variables.scss`
- Use CSS custom properties for dynamic switching: `var(--color-primary)`
- Store in `_root.scss` with `[data-theme="palette-name"]` selectors
- Maintain WCAG AA contrast (4.5:1 for text, 3:1 for interactive)

### 2. Shadow System (5 Levels)

5-level elevation system for depth perception:

```scss
$shadow-level-1: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-level-2: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
$shadow-level-3: 0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06);
$shadow-level-4: 0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05);
$shadow-level-5: 0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04);
```

**Usage**:
- Level 1: Subtle hover states
- Level 2: Default card state
- Level 3: Cards on hover, dropdowns
- Level 4: Modals, floating action buttons
- Level 5: Maximum elevation (tooltips, popovers)

### 3. Glassmorphism Effects

Frozen glass aesthetic with blur and transparency:

```scss
@mixin glassmorphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

**Rules**:
- Use in `_mixins.scss`
- Apply to cards, modals, overlays on desktop
- **Remove on mobile** for performance (use standard backgrounds)
- Support dark mode: adjust opacity values
- Test browser support (check caniuse for backdrop-filter)

### 4. Responsive Breakpoints

Mobile-first approach with standard breakpoints:

```scss
$breakpoint-sm: 576px;   // Small phones
$breakpoint-md: 768px;   // Tablets & medium
$breakpoint-lg: 992px;   // Desktop
$breakpoint-xl: 1200px;  // Large desktop
```

**Mobile-First Pattern**:
```scss
.component {
  // Base: mobile styles (320px+)
  padding: 1rem;
  font-size: 14px;
  
  // Tablet & up
  @media (min-width: $breakpoint-md) {
    padding: 1.5rem;
    font-size: 16px;
  }
  
  // Desktop & up
  @media (min-width: $breakpoint-lg) {
    padding: 2rem;
    font-size: 18px;
  }
}
```

## Design Tokens (variables.scss)

All color, spacing, typography values go here:

```scss
// Colors
$color-primary: #1e6ad6;
$color-secondary: #7c3aed;
$color-success: #10b981;
$color-warning: #f59e0b;
$color-danger: #ef4444;
$color-info: #3b82f6;

// Grays (for backgrounds, borders, text)
$gray-50: #f9fafb;
$gray-100: #f3f4f6;
$gray-200: #e5e7eb;
// ... through $gray-900: #111827;

// Shadows (5 levels)
$shadow-level-1: 0 1px 2px rgba(0, 0, 0, 0.05);
// ... through $shadow-level-5

// Typography
$font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
$font-size-base: 14px;
$font-size-sm: 12px;
$font-size-lg: 16px;
$font-weight-normal: 400;
$font-weight-bold: 600;
$line-height-base: 1.5;

// Spacing (4px base grid)
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 12px;
$spacing-lg: 16px;
$spacing-xl: 24px;
$spacing-2xl: 32px;

// Border radius
$border-radius-sm: 4px;
$border-radius-md: 8px;
$border-radius-lg: 12px;
$border-radius-full: 9999px;

// Transitions
$transition-fast: 150ms ease-in-out;
$transition-base: 300ms ease-in-out;
$transition-slow: 500ms ease-in-out;
```

## CSS Custom Properties (_root.scss)

Dynamic theming via CSS variables for runtime palette switching:

```scss
:root {
  // Professional Blue (default)
  --color-primary: #1e6ad6;
  --color-primary-light: #3b82f6;
  --color-primary-dark: #1e40af;
  --color-secondary: #7c3aed;
  
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  
  // ... all semantic colors as variables
}

[data-theme="purple"] {
  --color-primary: #7c3aed;
  --color-primary-light: #a78bfa;
  --color-primary-dark: #6d28d9;
  --color-secondary: #ec4899;
  // ... override other colors
}

[data-theme="green"] {
  // ... green palette
}

[data-theme="neutral"] {
  // ... gray palette
}

// Dark mode
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #1f2937;
    --color-bg-secondary: #111827;
    --color-text-primary: #f3f4f6;
    --color-text-secondary: #d1d5db;
  }
}
```

## Mixins & Helper Functions (_mixins.scss)

Reusable SCSS mixins for consistency:

```scss
// Glassmorphism
@mixin glassmorphism {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

// Responsive media query
@mixin respond-to($breakpoint) {
  @media (min-width: $breakpoint) {
    @content;
  }
}

// Text truncate
@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// Flex center
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

// Focus state (accessibility)
@mixin focus-ring {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

## Naming Convention (BEM)

Follow Block-Element-Modifier for CSS classes:

```scss
// Block: standalone component
.mt2026-card { }

// Element: part of block (double underscore)
.mt2026-card__header { }
.mt2026-card__body { }
.mt2026-card__footer { }

// Modifier: variation (double dash)
.mt2026-card--elevated { }
.mt2026-card--compact { }
.mt2026-card__header--dark { }
```

**Prefix Rule**: Always prefix with `mt2026-` to avoid conflicts with HumHub core styles.

## Accessibility (_accessibility.scss)

WCAG 2.1 AA compliance helpers:

```scss
// High contrast mode support
@media (prefers-contrast: more) {
  .mt2026-component {
    border-width: 2px;
    font-weight: 600;
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// Focus visible only (keyboard navigation)
.focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

// Screen reader only text
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Performance Optimization (_performance.scss)

CSS optimization for fast rendering:

```scss
// Reduce repaints via will-change
.mt2026-button {
  will-change: transform, box-shadow;
  
  &:hover {
    // Only these properties animate
    transform: translateY(-2px);
    box-shadow: var(--shadow-level-3);
  }
}

// Disable glassmorphism on mobile (expensive blur)
@media (max-width: $breakpoint-md) {
  .mt2026-card {
    background: var(--color-bg-primary);
    border: 1px solid var(--color-border);
    // No backdrop-filter on mobile
  }
}

// GPU acceleration for transforms
.mt2026-modal {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

## Component Styling Workflow

### 1. Define Token in variables.scss
```scss
$color-component-bg: #f3f4f6;
$component-padding: 1rem;
```

### 2. Add CSS Variable in _root.scss
```scss
:root {
  --component-bg: #f3f4f6;
  --component-padding: 1rem;
}
```

### 3. Create Component in _theme.scss
```scss
.mt2026-component {
  background: var(--component-bg);
  padding: var(--component-padding);
  border-radius: var(--border-radius-md);
  
  @include focus-ring;
  
  @media (min-width: $breakpoint-md) {
    padding: var(--component-padding-lg);
  }
}
```

## Dark Mode Support

Dark mode colors use `prefers-color-scheme` media query:

```scss
:root {
  // Light mode (default)
  --color-bg-primary: #ffffff;
  --color-text-primary: #111827;
}

@media (prefers-color-scheme: dark) {
  :root {
    // Dark mode
    --color-bg-primary: #1f2937;
    --color-text-primary: #f3f4f6;
  }
}
```

**Rules**:
- Define both light and dark variants
- Use CSS variables for switchable values
- Test all components in both modes
- Maintain WCAG contrast in both modes
- Test with system dark mode toggle

## Testing SCSS Changes

✅ Verify:
- [ ] CSS compiles without errors: `humhub\helpers\ThemeHelper::buildCss()`
- [ ] Colors meet WCAG AA contrast (4.5:1 text, 3:1 interactive)
- [ ] Mobile view works at 320px, 768px, 1920px
- [ ] Dark mode works with system preference
- [ ] All 4 palettes render correctly
- [ ] Animations smooth at 60 FPS (no jank)
- [ ] No layout shift (CLS)
- [ ] Glassmorphism renders (desktop, not mobile)
- [ ] Keyboard navigation visible
- [ ] Reduced motion respected

## Common SCSS Patterns

### Color with Transparency
```scss
color: rgba(var(--color-primary-rgb), 0.8);
```

### Responsive Font Size
```scss
font-size: clamp(14px, 3vw, 24px);  // responsive scaling
```

### Truncate Multi-Line Text
```scss
display: -webkit-box;
-webkit-line-clamp: 2;
-webkit-box-orient: vertical;
overflow: hidden;
```

### Smooth Transitions
```scss
transition: all var(--transition-base) ease-in-out;

&:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-level-3);
}
```

## Compilation & Deployment

**Location**: Theme files compile via HumHub's theme system.

**Trigger**: 
- Manual: Admin Panel → Design → Save
- Automatic: On module enable via `Module::enable()`
- Manual in code: `ThemeHelper::buildCss()`

**Output**:
- Compiled to: `/var/www/humhub/assets/` (HumHub's public assets)
- Served as: `assets/[hash]/resources/css/theme.css`

**Debugging Compilation**:
```bash
# Check logs for CSS errors
tail -f /var/www/humhub/protected/runtime/logs/app.log
```

## Never Edit

❌ Don't modify:
- HumHub's Clean Theme SCSS
- Core theme in `/var/www/humhub/themes/`
- Third-party component styles outside this module

✅ Only modify:
- Files in `themes/ModernTheme2026/scss/`
- Add new .scss files as needed (import in build.scss)

---

**Key Principle**: All theme styles live in this module's SCSS directory. No modifications outside `themes/ModernTheme2026/scss/`.
