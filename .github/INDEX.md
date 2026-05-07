# 📚 AI Agent Instructions Index

Quick navigation guide for all instruction files for Modern Theme 2026 HumHub module.

## 📍 Start Here

**New to this module?** → Read [`AGENTS.md`](AGENTS.md) first (10-15 minute read)

**Just need a quick answer?** → Check [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) (2-3 minute scan)

**How do I use these instructions?** → See [`.github/INSTRUCTIONS.md`](.github/INSTRUCTIONS.md)

## 📋 All Instruction Files

### Level 1: Always Required
```
AGENTS.md
├── Module overview
├── Architecture and directory structure
├── CRITICAL: Module boundaries & safety rules
├── Component descriptions
├── Development workflow
└── Testing & quality standards
👉 Read this first for every task
```

### Level 2: Auto-Triggered by File Type
```
.github/instructions/
│
├── theme-scss.instructions.md
│   ├── When: Editing `themes/ModernTheme2026/scss/**/*.scss`
│   ├── What: SCSS patterns, design tokens, CSS variables
│   └── Contains: 14 KB of styling guidance
│
├── php-widgets-module.instructions.md
│   ├── When: Editing PHP files (widgets, events, module, config)
│   ├── What: Widget patterns, events, module lifecycle, DB migrations
│   └── Contains: 17 KB of PHP architecture
│
├── javascript-modules.instructions.md
│   ├── When: Editing `resources/js/**/*.js`
│   ├── What: JS module patterns, interactivity, 7 core modules
│   └── Contains: 24 KB of JavaScript patterns
│
└── module-lifecycle-installation.instructions.md
    ├── When: Working on installation, uninstallation, or migrations
    ├── What: Installation process, lifecycle, testing procedures
    └── Contains: 16 KB of lifecycle guidance
```

### Level 3: Reference Documents
```
.github/
├── INSTRUCTIONS.md
│   ├── Explains all instruction files
│   ├── Shows discovery process
│   └── Lists task examples
│
└── DELIVERY-SUMMARY.md
    ├── What was delivered
    ├── File statistics
    └── Success criteria

QUICK-REFERENCE.md
├── One-page cheat sheet
├── Common tasks
├── Naming conventions
└── Common errors & fixes
```

## 🎯 Task-Based Navigation

### "I need to add a color palette"
1. Read: [`AGENTS.md`](AGENTS.md) - Architecture
2. Read: [`.github/instructions/theme-scss.instructions.md`](.github/instructions/theme-scss.instructions.md) - Design system
3. Code: Follow "Add a Color Palette" pattern in [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md)

### "I need to create a new widget"
1. Read: [`AGENTS.md`](AGENTS.md) - Architecture
2. Read: [`.github/instructions/php-widgets-module.instructions.md`](.github/instructions/php-widgets-module.instructions.md) - Widget pattern
3. Code: Follow "Create a Widget" pattern in [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md)

### "I need to add a JavaScript module"
1. Read: [`AGENTS.md`](AGENTS.md) - Architecture
2. Read: [`.github/instructions/javascript-modules.instructions.md`](.github/instructions/javascript-modules.instructions.md) - Module pattern
3. Code: Follow template in JavaScript instructions

### "I need to test installation/uninstallation"
1. Read: [`AGENTS.md`](AGENTS.md) - Architecture
2. Read: [`.github/instructions/module-lifecycle-installation.instructions.md`](.github/instructions/module-lifecycle-installation.instructions.md) - Full lifecycle
3. Verify: Follow checklists in "Clean Installation" and "Clean Uninstallation" sections

### "I'm getting an error"
1. Check: **"Error: X"** in [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) - Common Errors & Fixes
2. Read: Relevant section in detailed instruction file
3. Debug: Follow troubleshooting guidance

### "I need to remember the golden rules"
1. Scan: [`QUICK-REFERENCE.md`](QUICK-REFERENCE.md) - Top section
2. Read: "🚨 Golden Rules" table
3. Remember: ONLY edit in module, NEVER touch HumHub core

## 📊 File Organization

```
modern-theme-2026/
│
├── 📖 AGENTS.md ⭐ START HERE
├── 📕 QUICK-REFERENCE.md (one-page cheat sheet)
├── README.md (module documentation)
│
└── .github/
    ├── 📇 INSTRUCTIONS.md (how to use instructions)
    ├── 📊 DELIVERY-SUMMARY.md (what was delivered)
    │
    └── instructions/
        ├── 🎨 theme-scss.instructions.md (SCSS guide)
        ├── 🔧 php-widgets-module.instructions.md (PHP guide)
        ├── ⚙️ javascript-modules.instructions.md (JS guide)
        └── 🔄 module-lifecycle-installation.instructions.md (Lifecycle guide)
```

## ⚡ Quick Access

| Need | File | Time |
|------|------|------|
| Full context | `AGENTS.md` | 15 min |
| Quick lookup | `QUICK-REFERENCE.md` | 2 min |
| How to use | `.github/INSTRUCTIONS.md` | 5 min |
| SCSS help | `.github/instructions/theme-scss.instructions.md` | 10 min |
| PHP help | `.github/instructions/php-widgets-module.instructions.md` | 12 min |
| JS help | `.github/instructions/javascript-modules.instructions.md` | 12 min |
| Installation help | `.github/instructions/module-lifecycle-installation.instructions.md` | 10 min |
| Error fix | `QUICK-REFERENCE.md` (Common Errors) | 2 min |

## 🔍 Finding What You Need

### By Component
- **Theme/Styling**: `theme-scss.instructions.md`
- **Widgets/PHP**: `php-widgets-module.instructions.md`
- **Interactivity/JS**: `javascript-modules.instructions.md`
- **Installation/Setup**: `module-lifecycle-installation.instructions.md`
- **Overview**: `AGENTS.md`

### By Task
- **Creating something**: Read relevant instruction, check QUICK-REFERENCE pattern
- **Modifying something**: Read AGENTS.md first, then relevant instruction
- **Fixing something**: Check QUICK-REFERENCE Common Errors, then instruction
- **Testing something**: Read module-lifecycle-installation.instructions.md checklists
- **Understanding something**: Read AGENTS.md architecture section

### By Audience
- **AI Agents**: All files, especially `AGENTS.md` and auto-triggered files
- **Developers**: Start with `QUICK-REFERENCE.md`, then dive into details
- **Code Reviewers**: Use checklists from relevant instruction files
- **New Team Members**: Read `AGENTS.md` + `QUICK-REFERENCE.md`

## 🚀 Getting Started Checklist

- [ ] Read `AGENTS.md` (module overview)
- [ ] Scan `QUICK-REFERENCE.md` (get familiar)
- [ ] Identify your task type
- [ ] Load relevant instruction from `.github/instructions/`
- [ ] Follow code patterns provided
- [ ] Run checklist at end of instruction
- [ ] Verify: only edited in `modern-theme-2026/`
- [ ] Test; don't break HumHub core

## 💡 Pro Tips

1. **Bookmark**: Keep `QUICK-REFERENCE.md` and `AGENTS.md` bookmarked
2. **Skim First**: Don't read word-for-word, skim relevant sections
3. **Copy-Paste**: All code examples are tested patterns
4. **Search**: Use Ctrl+F to find section headings
5. **Checklists**: Always run the checklist at end of instruction
6. **Errors**: Check QUICK-REFERENCE before spending time debugging
7. **Safety**: Remember: **NEVER edit outside `/modern-theme-2026/`**

## 📞 If You're Stuck

1. **For quick answer**: `QUICK-REFERENCE.md` (2 min scan)
2. **For conceptual help**: `AGENTS.md` (architecture overview)
3. **For how-to**: Relevant `.github/instructions/` file
4. **For errors**: `QUICK-REFERENCE.md` → Common Errors & Fixes
5. **For testing**: `module-lifecycle-installation.instructions.md` (checklists)

## ✅ Before You Code

- [ ] Read `AGENTS.md`
- [ ] Know which component you're editing
- [ ] Load relevant instruction
- [ ] Verify you're in `/modern-theme-2026/` (not touching HumHub)
- [ ] Find code pattern in instruction
- [ ] Copy pattern + customize

## 🎯 Key Principles (from instructions)

1. **Module Only**: All changes in `/var/www/humhub/protected/modules/modern-theme-2026/`
2. **Never HumHub Core**: Don't edit outside module
3. **Safety First**: Catch errors, don't throw
4. **Cache Queries**: DB performance
5. **Test Mobile**: 50% of users are mobile
6. **Accessibility**: WCAG 2.1 AA compliance
7. **Clean Install/Uninstall**: Leave no remnants
8. **Follow Patterns**: Copy examples from instructions

---

**Navigation Guide Version**: 1.0  
**Last Updated**: April 4, 2026  
**Module**: Modern Theme 2026  
**Status**: ✅ Complete & Ready to Use

**👉 Start with [`AGENTS.md`](AGENTS.md)**
