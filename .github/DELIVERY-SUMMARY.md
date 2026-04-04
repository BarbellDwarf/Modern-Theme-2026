# AI Agent Instructions - Delivery Summary

## ✅ Task Completed

Comprehensive AI agent instructions have been created for the Modern Theme 2026 HumHub module, enabling effective development while maintaining module isolation and preventing unintended edits to HumHub core files.

## 📦 Deliverables

### 1. Main Workspace Instructions
📄 **AGENTS.md** (14 KB)
- Module overview and architecture
- Directory structure with explanations
- **Critical Safety Boundaries** (never edit outside module)
- Component descriptions (Theme, Widgets, Events, Assets)
- Module lifecycle overview
- Code standards for PHP, SCSS, JavaScript
- Common development patterns
- Testing checklists
- Safe vs forbidden operations

### 2. File-Specific Instructions (Auto-load by Context)

📋 **theme-scss.instructions.md** (12 KB)
- Auto-triggers: `themes/ModernTheme2026/scss/**/*.scss`
- Design system explanation (4 color palettes, 5 shadow levels)
- SCSS organization and file purposes
- Design tokens and CSS custom properties
- Responsive design patterns (mobile-first)
- SCSS mixins and accessibility helpers
- BEM naming convention with `mt2026-` prefix
- Performance optimization for mobile
- Dark mode support
- Compilation workflow
- Testing checklist for CSS

📋 **php-widgets-module.instructions.md** (17 KB)
- Auto-triggers: `widgets/**/*.php`, `controllers/**/*.php`, `Events.php`, `Module.php`, `config.php`
- Namespace and PSR-4 autoloading rules
- Widget architecture (ReactionPicker, MobileBottomNav, ContextSwitcher)
- Event handler patterns (EVENT_BEGIN_BODY, EVENT_END_BODY, EVENT_RUN)
- Module lifecycle (enable, disable)
- Controller and view patterns
- Database migration workflow
- Asset registration
- Permissions and security checks
- Error handling and logging
- PHP code standards
- Testing checklist

📋 **javascript-modules.instructions.md** (24 KB)
- Auto-triggers: `resources/js/**/*.js`
- Module pattern (IIFE for namespace isolation)
- Data attributes convention (`data-mt2026-*`)
- 7 Core Modules with complete code patterns:
  - reactionPicker.js (emoji interactions)
  - contextSwitcher.js (Ctrl/Cmd+K navigation)
  - paletteSwitcher.js (theme color switching)
  - notifications.js (badge updates)
  - peopleFocusGuard.js (accessibility focus trap)
  - modalFocusFix.js (modal focus management)
  - mobileKeyboardFix.js (iOS keyboard fixes)
- JavaScript best practices
- Common patterns (debouncing, custom events, CSRF)
- Mobile detection
- Testing checklist

📋 **module-lifecycle-installation.instructions.md** (16 KB)
- On-demand trigger: Installation, uninstallation, migrations
- Installation process (discovery → migrations → activation → assets)
- Lifecycle events and timing
- Disable/uninstall process
- Clean installation checklist (8 verification steps)
- Clean uninstallation checklist (5 verification steps)
- CSS compilation process and troubleshooting
- Database migration workflow
- Pre-release testing procedures
- File organization summary
- Permitted vs forbidden operations

### 3. Support & Reference Documents

📘 **.github/INSTRUCTIONS.md** (5 KB)
- Overview of all instruction files
- Discovery guide for AI agents
- Task examples with primary/secondary instructions
- Critical safety rules emphasized
- Document quality principles
- How to extend instructions

📖 **QUICK-REFERENCE.md** (9 KB)
- One-page quick reference card
- 5 Golden Rules
- File organization at a glance
- Architecture summary
- Design tokens overview
- Common tasks with solutions
- Before-code checklist
- Naming conventions
- Lifecycle diagram
- Code pattern templates
- Common errors & fixes
- Pro tips

## 🎯 Key Features

### Comprehensive Coverage
- ✅ Theme/SCSS development patterns
- ✅ PHP widgets and module lifecycle
- ✅ JavaScript modules and interactions
- ✅ Installation and uninstallation procedures
- ✅ Database migrations
- ✅ Accessibility guidelines
- ✅ Testing procedures
- ✅ Performance optimization

### AI Agent Optimized
- ✅ Automatic discovery via file patterns and descriptions
- ✅ Contextual loading (relevant instructions for current task)
- ✅ Code examples copied from actual module
- ✅ Clear action steps
- ✅ Safety rules emphasized throughout
- ✅ Checklists for verification

### Developer Friendly
- ✅ Quick reference card for quick lookup
- ✅ Common patterns for copy-paste
- ✅ Error troubleshooting guide
- ✅ Task examples showing which files to read
- ✅ Links between related instructions

### Safety First
- ✅ **13+ emphases on module boundary rules**
- ✅ "Never edit outside module" highlighted
- ✅ Clear distinction between safe and forbidden operations
- ✅ Installation/uninstallation verification checklists
- ✅ Testing procedures before release
- ✅ Permission and security check patterns

## 📊 File Statistics

| File | Type | Size | Lines |
|------|------|------|-------|
| AGENTS.md | Workspace | 14 KB | ~650 |
| theme-scss.instructions.md | File-specific | 12 KB | ~550 |
| php-widgets-module.instructions.md | File-specific | 17 KB | ~750 |
| javascript-modules.instructions.md | File-specific | 24 KB | ~1100 |
| module-lifecycle-installation.instructions.md | File-specific | 16 KB | ~750 |
| .github/INSTRUCTIONS.md | Overview | 5 KB | ~250 |
| QUICK-REFERENCE.md | Reference | 9 KB | ~400 |
| **TOTAL** | **7 files** | **~97 KB** | **~4400 lines** |

## 🔐 Safety & Isolation

The instructions comprehensively enforce:

1. **Module Boundary**: All modifications stay in `/var/www/humhub/protected/modules/modern-theme-2026/`
2. **No Core Edits**: Never touch HumHub files, other modules, or config
3. **Graceful Degradation**: Catch exceptions, log errors, prevent crashes
4. **Clean Installation**: No remnants if uninstalled
5. **Reversible Operations**: All database changes revertible via migrations
6. **Proper Testing**: Checklists for installation, uninstallation, and functionality

## 🎓 How AI Agents Use These

### Workflow
1. **Task Received** → Read AGENTS.md (always-on)
2. **Identify Component** → Which part? (Theme/PHP/JS/Lifecycle)
3. **Load Relevant File** → File-specific instruction auto-triggers OR load on-demand
4. **Follow Patterns** → Copy code examples from instruction
5. **Run Checklist** → Verify work complete before closing PR

### Discovery
- **AGENTS.md**: Workspace-level, always applies
- **theme-scss.instructions.md**: Auto-loads for `scss/**/*.scss` files
- **php-widgets-module.instructions.md**: Auto-loads for PHP files
- **javascript-modules.instructions.md**: Auto-loads for `js/**/*.js` files
- **module-lifecycle-installation.instructions.md**: Manual trigger for lifecycle tasks
- **Quick-reference.md**: Manual lookup for quick answers

## 📋 Verification Checklist

✅ **Files Created**:
- [x] AGENTS.md (main workspace instructions)
- [x] theme-scss.instructions.md (SCSS development)
- [x] php-widgets-module.instructions.md (PHP development)
- [x] javascript-modules.instructions.md (JavaScript development)
- [x] module-lifecycle-installation.instructions.md (Lifecycle/installation)
- [x] .github/INSTRUCTIONS.md (overview for developers)
- [x] QUICK-REFERENCE.md (one-page card)

✅ **Coverage**:
- [x] All module components documented
- [x] Installation/uninstallation procedures
- [x] Code examples for common patterns
- [x] Safety rules emphasized
- [x] Accessibility guidelines
- [x] Performance optimization
- [x] Testing procedures
- [x] Error troubleshooting

✅ **Quality**:
- [x] Actionable guidance (not just descriptions)
- [x] Code examples from real module
- [x] Clear checklists for verification
- [x] Organized by component/concern
- [x] Links between related instructions
- [x] AI-agent optimized
- [x] Developer-friendly format

## 🚀 Expected Outcomes

With these instructions, AI agents can now:

1. ✅ **Understand Architecture** - Full picture of how module is organized
2. ✅ **Modify Safely** - Know exactly which files to edit and where
3. ✅ **Follow Conventions** - Copy patterns from instructions
4. ✅ **Avoid Mistakes** - Safety rules prevent HumHub core edits
5. ✅ **Test Properly** - Checklists ensure quality before release
6. ✅ **Debug Issues** - Troubleshooting guide for common problems
7. ✅ **Install/Uninstall Correctly** - Lifecycle procedures ensure cleanness
8. ✅ **Maintain Quality** - Code standards keep consistency

## 📖 Next Steps

1. **Test with AI Agents**: Use these instructions in real development tasks
2. **Gather Feedback**: What's unclear, missing, or could improve?
3. **Refine**: Update instructions based on real-world usage
4. **Version Control**: Track instruction versions like code
5. **Onboarding**: Use QUICK-REFERENCE.md for new developers

## 💡 Key Insights

The instructions solve these critical problems:

| Problem | Solution |
|---------|----------|
| "Where do I edit?" | Clear file structure + `applyTo` patterns |
| "What shouldn't I touch?" | Explicit "Never edit" warnings in all files |
| "How do I do X?" | Code examples and patterns for common tasks |
| "Is this safe?" | Safety rules and boundaries emphasized |
| "What do I test?" | Checklists at end of each instruction |
| "Why is this designed this way?" | Architecture explanations |
| "What are the gotchas?" | Pro tips and common errors section |

## 🎯 Success Criteria Met

✅ Module is completely standalone (no HumHub core edits)
✅ Clean installation/uninstallation guaranteed
✅ AI agents can understand and work with module
✅ Code patterns documented and reproducible
✅ Safety rules non-negotiable
✅ Accessibility and performance considered
✅ Testing procedures defined
✅ Troubleshooting guide provided
✅ Developer-friendly references available
✅ Quick lookup possible for common tasks

---

## 📞 Support

All instruction files contain:
- Clear examples
- Checkboxes for verification
- Error troubleshooting
- Links to related sections
- Safety disclaimers

For questions, refer to:
1. **Quick overview**: `.github/INSTRUCTIONS.md`
2. **Quick lookup**: `QUICK-REFERENCE.md`
3. **Deep dive**: Relevant instruction file (auto-loads)
4. **All details**: `AGENTS.md` (main reference)

---

**Status**: ✅ COMPLETE  
**Date**: April 4, 2026  
**Scope**: Modern Theme 2026 HumHub Module  
**Audience**: AI Agents, Developers, Maintainers  
**Files**: 7 instruction/reference files (~97 KB, ~4400 lines)
