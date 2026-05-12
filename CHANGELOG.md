# Changelog

All notable changes to this project are documented in this file.

The format follows Keep a Changelog and this project uses Semantic Versioning.

## [1.0.2] - 2026-05-07

### Added
- Development branch initialized for Stream UI and Messages UI issue fixes.

### Changed
- Space Stream desktop layout fixes: keep Upcoming Events in the right sidebar and correct three-column width allocation so the right rail does not wrap below the stream.
- Calendar event modal fixes: normalize checkbox/toggle field layout to prevent stretched controls and simplify the dark-mode form chrome.
- Context switcher recent list fixes: dedupe repeated entries per context/space and auto-remove stale items not visited for a few days.
- Messages conversation picker dark-mode fix: sidebar styling now follows the in-app light/dark toggle instead of OS color-scheme preference.
- Messages sidebar state fix: unselected conversation cards no longer stay dark when viewing the picker in light mode.
- Messages sidebar active-card fix: Bootstrap list-group active state is now explicitly overridden so selected conversation cards keep light-mode colors.
- Pending targeted layout and interaction improvements for Messages UI.

## [1.0.1] - 2026-05-07

### Added
- Theme customization panel with preset palettes and configurable color tokens.
- Mobile navigation enhancements and context-switcher refinements.
- Mail interaction enhancements in `resources/js/mailLayout.js`, including desktop Enter-to-send and Ctrl/Cmd+Enter newline behavior.

### Changed
- Mail conversation layout improvements across desktop and mobile:
  - own messages align right, other users align left
  - improved bubble spacing and timestamp placement
  - edit button placement refined to remain adjacent to its message
  - fixed z-index clipping issues with compose overlay and message interactions
  - refined spacing between messages and improved layout constraints
  - conversation auto-scroll behavior improved after updates and sends
- Additional mobile UX and dropdown handling refinements.

### Removed
- Entire `tests/` folder containing outdated Playwright debug and MCP server testing scripts (local development only, not part of release).
- Obsolete local infra files no longer required in this branch:
  - `docker-compose.yml`
  - `caddy/Caddyfile`
