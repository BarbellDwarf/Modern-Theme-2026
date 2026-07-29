# Modern Theme 2026

This is a HumHub theme module. All AI agent context is in `.github/AGENTS.md`.

## Quick Links

- **Full context**: [`.github/AGENTS.md`](.github/AGENTS.md) — architecture, components, boundaries, recent work
- **Instructions index**: [`.github/INDEX.md`](.github/INDEX.md) — navigation guide for all instruction files
- **Post-change checklist**: [`.github/HUMHUB-POST-CHANGE-CHECKLIST.md`](.github/HUMHUB-POST-CHANGE-CHECKLIST.md) — cache flush, asset refresh, verification
- **Branch version rules**: [`.github/BRANCH-VERSION-UPDATE-RULES.md`](.github/BRANCH-VERSION-UPDATE-RULES.md) — release branch metadata updates
- **SCSS guide**: [`.github/instructions/theme-scss.instructions.md`](.github/instructions/theme-scss.instructions.md)
- **PHP guide**: [`.github/instructions/php-widgets-module.instructions.md`](.github/instructions/php-widgets-module.instructions.md)
- **JS guide**: [`.github/instructions/javascript-modules.instructions.md`](.github/instructions/javascript-modules.instructions.md)
- **Lifecycle guide**: [`.github/instructions/module-lifecycle-installation.instructions.md`](.github/instructions/module-lifecycle-installation.instructions.md)
- **OpenCode config**: [`.opencode/opencode.json`](.opencode/opencode.json) — tool configuration

## Golden Rules

- **All changes stay inside this module** — never edit HumHub core
- SCSS compiles via `php compile-css.php` — writes to `resources/css/theme.css` and published assets
- After SCSS changes: recompile, delete assets dir, flush cache
- Mail conversation content is loaded via AJAX into `#mail-conversation-root` — `.col-lg-8.messages > .panel` does NOT match
- Clean Theme uses `!important` extensively — our module must match specificity
