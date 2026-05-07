# Changelog

All notable changes to this project are documented in this file.

The format follows Keep a Changelog and this project uses Semantic Versioning.

## [1.0.0] - 2026-05-07

### Added
- Initial release of Modern Theme 2026 for HumHub 1.18+.
- Theme customization panel with preset palettes and configurable color tokens.
- Mobile navigation enhancements and context-switcher refinements.
- Mail interaction enhancements in `resources/js/mailLayout.js`, including desktop Enter-to-send and Ctrl/Cmd+Enter newline behavior.

### Changed
- Mail conversation layout improvements across desktop and mobile:
  - own messages align right, other users align left
  - improved bubble spacing and timestamp placement
  - edit button placement refined to remain adjacent to its message
  - conversation auto-scroll behavior improved after updates and sends
- Additional mobile UX and dropdown handling refinements.

### Removed
- Obsolete local infra files no longer required in this branch:
  - `docker-compose.yml`
  - `caddy/Caddyfile`
- Outdated Playwright helper scripts removed to streamline test coverage.

### Notes
- Current lightweight Playwright helpers are under `tests/playwright/`.
