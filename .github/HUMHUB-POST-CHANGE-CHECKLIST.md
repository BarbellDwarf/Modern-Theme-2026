# HumHub Post-Change Checklist (Module Files)

Purpose: Ensure changes in this module actually take effect in a HumHub installation.

Scope: Use this after editing files in /protected/modules/modern-theme-2026.

## 1) Fast Rule of Thumb

If you changed module code by git pull or manual edits and behavior did not update:
1. Flush HumHub cache.
2. Refresh asset files.
3. Re-run module migrations if schema changed.
4. Re-test with browser cache disabled.

This is the most common missing step in HumHub updates.

## 2) Required Actions by Change Type

### A) PHP changes (controllers, widgets, module classes, events)
1. Run cache flush.
2. Reload page and test.

### B) JS or CSS asset changes
1. Run cache flush-all.
2. If still stale, clear published asset directory content.
3. Hard refresh browser.

### C) DB migration changes
1. Run migrate/up with includeModuleMigrations.
2. Run integrity check.
3. Flush cache.

### D) Theme or view override changes
1. Flush cache and assets.
2. Confirm active theme is correct.
3. Hard refresh browser.

## 3) CLI Commands (from HumHub docs)

Run from HumHub protected directory:

php yii
php yii cache/index
php yii cache/flush
php yii cache/flush-all
php yii migrate/up --includeModuleMigrations=1
php yii integrity/run

If admin backend is available, you can also use:
Administration -> Settings -> Advanced -> Caching -> Save and Flush

## 4) Asset Refresh Fallback

When backend is unavailable or assets still stale:
1. Delete content of the HumHub assets folder as documented.
2. Reload page to force republish.

Important: Delete contents only, not the directory itself.

## 5) Verification Checklist (Goal-Driven)

Success criteria after changes:
1. Target UI/behavior changed as expected.
2. No stale JS/CSS (new file behavior visible).
3. No PHP errors in logs.
4. Migration status clean.
5. Repro steps pass on mobile and desktop when relevant.

If not successful, do this order:
1. cache/flush-all
2. clear assets folder contents
3. browser hard refresh
4. verify module is enabled
5. verify theme is active
6. rerun migrate/up --includeModuleMigrations=1

## 6) Common Failure Patterns

1. Module updated by git, but old assets still served.
Cause: assets not republished.
Fix: cache flush + clear assets contents.

2. Module settings or defaults appear unchanged after enable/disable.
Cause: cached settings state.
Fix: flush cache.

3. Theme switch done but UI still old.
Cause: cache/asset stale.
Fix: flush cache and reload.

## 7) Practical Workflow for This Repository

After editing this module:
1. If SCSS changed, compile module CSS as this repo expects.
2. Run HumHub cache/flush-all.
3. If behavior still stale, clear HumHub assets contents.
4. Hard refresh browser and retest.

## 8) Authoritative References

- HumHub Troubleshooting (Clear cache, asset reset guidance):
  https://docs.humhub.org/docs/admin/troubleshooting/

- HumHub CLI commands (cache, migrate, integrity, module):
  https://docs.humhub.org/docs/admin/console/

- Related asset staleness issue discussion:
  https://github.com/humhub/humhub-modules-updater/issues/21
  https://github.com/humhub/humhub/issues/6189

## 9) Notes

- Keep changes surgical: only run the minimum required steps first, then escalate.
- Prefer documented HumHub commands over ad-hoc cache deletion.
- Always keep a backup before update/migration in production.
