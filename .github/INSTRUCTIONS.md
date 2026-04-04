# AI Agent Instructions Overview - Modern Theme 2026

This document explains the instruction files created for AI agents working on the Modern Theme 2026 HumHub module.

## File Structure

```
modern-theme-2026/
├── AGENTS.md                                     ← Main workspace instructions
└── .github/instructions/
    ├── theme-scss.instructions.md               ← SCSS/Theme development
    ├── php-widgets-module.instructions.md       ← PHP widgets & components
    ├── javascript-modules.instructions.md       ← JavaScript modules
    └── module-lifecycle-installation.instructions.md ← Installation/uninstallation
```

## Which Instructions to Use

### AGENTS.md (Main Workspace Instructions)

**Always-on**: Applied to all work on this module.

**Contains**:
- Module overview and architecture
- Directory structure explanation
- Critical boundary rules (NEVER edit outside module)
- Component descriptions (Theme, Widgets, Events, Assets)
- Module lifecycle (install → enable → usage → disable → uninstall)
- Code standards (PHP, SCSS, JavaScript)
- Common development patterns
- Testing checklist
- Safe operations vs forbidden operations

**Start here** when working on any task in this module.

### theme-scss.instructions.md

**Auto-triggers**: When working on SCSS files (`themes/ModernTheme2026/scss/**/*.scss`)

**Contains**:
- Design system (4 color palettes, shadow levels, glassmorphism)
- SCSS file organization and purpose
- Design tokens in variables.scss
- CSS custom properties for dynamic theming
- Responsive breakpoints and mobile-first approach
- SCSS mixins and helpers
- BEM naming convention with mt2026 prefix
- Accessibility (WCAG 2.1 AA) helper classes
- Performance optimizations for mobile
- Compilation workflow
- Dark mode support
- Common SCSS patterns
- Testing checklist for CSS changes

**Use when**: Modifying theme colors, styles, responsive design, accessibility features, dark mode.

### php-widgets-module.instructions.md

**Auto-triggers**: When working on PHP files (`widgets/**/*.php`, `controllers/**/*.php`, `Events.php`, `Module.php`, `config.php`)

**Contains**:
- Namespace and PSR-4 autoloading rules
- Widget architecture and lifecycle
- ReactionPicker widget (5 emoji reactions)
- MobileBottomNav widget (mobile navigation)
- ContextSwitcher widget (space navigation)
- Event handlers (EVENT_BEGIN_BODY, EVENT_END_BODY, EVENT_RUN)
- Module bootstrap class (enable/disable lifecycle)
- Controller pattern for admin config
- View template rendering
- Database migrations (creating, rolling back)
- Asset registration
- Permissions and security checks
- Error handling and logging
- Code standards (PHP style, naming, docblocks)
- Testing checklist

**Use when**: Creating/modifying widgets, event handlers, controllers, database migrations, module configuration.

### javascript-modules.instructions.md

**Auto-triggers**: When working on JavaScript files (`resources/js/**/*.js`)

**Contains**:
- Module pattern (IIFE) for namespace isolation
- Data attributes convention (data-mt2026-*)
- Core modules:
  - reactionPicker.js (emoji reaction interactions)
  - contextSwitcher.js (Ctrl/Cmd+K keyboard shortcut)
  - paletteSwitcher.js (theme color switching)
  - notifications.js (badge updates)
  - peopleFocusGuard.js (accessibility focus trap)
  - modalFocusFix.js (modal focus management)
  - mobileKeyboardFix.js (iOS keyboard fixes)
- JavaScript best practices (event delegation, caching, error handling, accessibility)
- Common patterns (debouncing, custom events, CSRF tokens)
- Mobile detection
- Testing checklist

**Use when**: Creating/modifying JavaScript modules, adding interactivity, fixing accessibility issues.

### module-lifecycle-installation.instructions.md

**Triggers on-demand**: When working on installation, uninstallation, theme activation, database migrations, or testing.

**Contains**:
- Installation process step-by-step (discovery → migrations → theme activation → assets)
- Lifecycle events and their timing (EVENT_BEGIN_BODY, EVENT_END_BODY, EVENT_RUN)
- Disable process (theme revert)
- Uninstall process (migrations rollback)
- Clean installation checklist
- Clean uninstallation checklist
- CSS compilation process and troubleshooting
- Database migration workflow
- Testing before release (pre-installation, installation, uninstallation, performance, accessibility)
- File organization summary
- Forbidden vs allowed operations

**Use when**: Setting up module for testing, verifying installation works, debugging theme activation, testing uninstallation, creating migrations, troubleshooting CSS compilation.

## How Agents Should Use These Instructions

### Discovery Process

When an AI agent receives a task on this module:

1. **Read AGENTS.md first** - Understand overall architecture and boundaries
2. **Identify component** - Which part is affected (Theme/SCSS, PHP Widgets, JavaScript, Lifecycle)
3. **Load relevant instruction file** - The auto-triggered file will load, or load on-demand

### Task Examples

| Task | Primary Instructions | Secondary Instructions |
|------|----------------------|------------------------|
| "Add a new color palette" | theme-scss.instructions.md | AGENTS.md |
| "Create a new widget" | php-widgets-module.instructions.md | AGENTS.md |
| "Fix mobile keyboard on iOS" | javascript-modules.instructions.md | theme-scss.instructions.md |
| "Debug CSS not compiling" | module-lifecycle-installation.instructions.md | AGENTS.md |
| "Add theme palette switching" | javascript-modules.instructions.md + theme-scss.instructions.md | AGENTS.md |
| "Test clean installation" | module-lifecycle-installation.instructions.md | AGENTS.md |
| "Fix widget permissions" | php-widgets-module.instructions.md | AGENTS.md |

### Critical Safety Rules (from AGENTS.md)

These appear in EVERY instruction file because they're essential:

❌ **NEVER**:
- Edit any files outside `/var/www/humhub/protected/modules/modern-theme-2026/`
- Modify HumHub core files
- Edit other HumHub modules
- Add external dependencies
- Modify database schema without migrations
- Assume user permissions

✅ **ALWAYS**:
- Work only within the module directory
- Use module aliases: `@modern-theme-2026`
- Validate user input and permissions
- Log errors instead of throwing exceptions
- Cache expensive database queries
- Test on mobile and desktop
- Follow accessibility guidelines

## How Instructions Are Discovered

### Automatic Discovery (via `applyTo`)

When you modify a file matching a pattern, the instruction auto-loads:

```
File:  themes/ModernTheme2026/scss/_mixins.scss
Match: applyTo: "themes/ModernTheme2026/scss/**/*.scss"
→ Auto-loads: theme-scss.instructions.md
```

### Manual Discovery (via `description`)

When you ask about a topic, the agent scans descriptions:

```
Question: "How do I add a widget?"
Match: description contains "widget"
→ Relevant: php-widgets-module.instructions.md
```

### Required Reading: AGENTS.md

AGENTS.md always applies (it's workspace-level) - every task reads it first.

## Document Quality Principles

Each instruction file follows these principles:

1. **Actionable**: Every section explains what to do and why
2. **Code Examples**: Real patterns copied from this module
3. **Checklists**: Verify work before considering done
4. **Rules**: Clear ✅ DO vs ❌ DON'T sections
5. **Architecture**: Explains component design before code
6. **Safety**: Emphasizes module boundaries
7. **Context**: Links to related instructions

## Testing Instructions Before Using

### For Developers Creating PRs

Before submitting changes, verify:

- [ ] Changes only in `modern-theme-2026/` directory
- [ ] All instructions read and understood
- [ ] Code follows patterns from relevant instruction file
- [ ] Checklist completed (at end of each instruction)
- [ ] No errors in logs after testing

### For AI Agents Using Instructions

When working on a task:

- [ ] Load AGENTS.md first
- [ ] Read relevant instruction file(s)
- [ ] Follow code examples from instructions
- [ ] Run checklist at end of instruction
- [ ] Verify changes in the right directory
- [ ] Log all errors (don't throw exceptions)

## Extending Instructions

If you need to add new sections, follow the pattern:

1. **Identify the category** (SCSS, PHP, JavaScript, or Lifecycle)
2. **Check existing instructions** - Does it fit?
3. **Add to relevant file** - Follow formatting
4. **Update this overview** if creating new instruction file
5. **Include a checklist** at the end

## Relationship Between Instructions

```
AGENTS.md
├── Provides overall context
├── Defines boundaries
├── Lists all components
└── References to specific instructions

theme-scss.instructions.md
├── Depends on: AGENTS.md (for overall structure)
├── Covers: Design tokens, SCSS compilation, CSS variables
└── Used by: SCSS file auto-trigger

php-widgets-module.instructions.md
├── Depends on: AGENTS.md (for module boundaries)
├── Covers: Widget lifecycle, Events, DB migrations
└── Used by: PHP file auto-trigger

javascript-modules.instructions.md
├── Depends on: AGENTS.md (for module boundaries)
├── Covers: Module pattern, data attributes, interactions
└── Used by: JS file auto-trigger

module-lifecycle-installation.instructions.md
├── Depends on: AGENTS.md (for system overview)
├── Covers: Installation workflow, migrations, testing
└── Used on-demand for lifecycle tasks
```

## Summary

These instructions transform the Modern Theme 2026 module from possibly confusing to crystal-clear for AI agents. They provide:

1. ✅ **Clear Boundaries**: Never edit outside module
2. ✅ **Component Knowledge**: What each part does
3. ✅ **Code Patterns**: Copy-paste examples
4. ✅ **Safety Rules**: What to avoid
5. ✅ **Testing Guidance**: Verify work before closing
6. ✅ **Architecture Understanding**: Why things are organized this way

By following these instructions, AI agents can:
- Understand the full module architecture
- Make changes with confidence they won't break HumHub core
- Test installations and uninstallations properly
- Write code matching project conventions
- Debug issues systematically
- Maintain the module's "cleanly installable" design

---

**Created**: April 2026  
**Purpose**: Enable AI agents to work effectively on Modern Theme 2026  
**Maintainer**: Development team
