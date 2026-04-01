# Theme Activation Guide

## Problem: Theme Not Persisting

If the Modern Theme 2026 reverts to the stock HumHub theme after cache flush or restart, use this guide to properly activate it.

## Quick Fix

Run this single command to activate the theme:

```bash
cd /var/www/humhub/protected && sudo -u www-data php yii theme/switch ModernTheme2026
```

Or use the helper script:

```bash
cd /var/www/humhub/protected/modules/modern-theme-2026
sudo ./activate-theme.sh
```

## Why This Happens

The Modern Theme 2026 module enables successfully, but the theme itself needs to be explicitly activated in HumHub's theme system. The module's `enableTheme()` method only activates if the theme is not already active, which can cause the initial activation to be skipped.

## Proper Activation Steps

### Method 1: CLI Command (Recommended)

```bash
# Navigate to HumHub protected directory
cd /var/www/humhub/protected

# Switch to Modern Theme 2026
sudo -u www-data php yii theme/switch ModernTheme2026

# Flush cache (optional, but recommended)
sudo -u www-data php yii cache/flush-all

# Verify activation
sudo -u www-data php yii theme/info
```

**Expected Output:**
```
Active theme: ModernTheme2026

Installed themes:
╔═════════════════╤════════════════╤════════════════════════════════════════════════════════════════════════════╗
║ Name:           │ Derived from:  │ Path:                                                                      ║
╟─────────────────┼────────────────┼────────────────────────────────────────────────────────────────────────────╢
║ ModernTheme2026 │ Clean > HumHub │ /var/www/humhub/protected/modules/modern-theme-2026/themes/ModernTheme2026 ║
╚═════════════════╧════════════════╧════════════════════════════════════════════════════════════════════════════╝
```

### Method 2: Helper Script

The module includes a helper script for easy theme activation:

```bash
cd /var/www/humhub/protected/modules/modern-theme-2026
sudo ./activate-theme.sh
```

This script will:
- Check current active theme
- Switch to Modern Theme 2026 if needed
- Flush cache
- Show theme information
- Provide interactive confirmation

### Method 3: Admin Panel (After Initial Activation)

Once the theme is activated via CLI, you can switch themes from the admin panel:

1. Log in as admin
2. Go to **Administration** → **Settings** → **Design**
3. Select **ModernTheme2026** from the dropdown
4. Click **Save**

**Note:** This only works after the theme has been activated at least once via CLI.

## Verification

### Check Database

Verify the theme is set in the database:

```bash
mysql -u humhub -p'aU9l6c2znGhqiMK7FID4Qiih' humhub -e "SELECT * FROM setting WHERE name='theme';"
```

**Expected Output:**
```
+----+-------+----------------------------------------------------------------------------+-----------+
| id | name  | value                                                                      | module_id |
+----+-------+----------------------------------------------------------------------------+-----------+
|  9 | theme | /var/www/humhub/protected/modules/modern-theme-2026/themes/ModernTheme2026 | base      |
+----+-------+----------------------------------------------------------------------------+-----------+
```

### Check Active Theme

```bash
cd /var/www/humhub/protected
sudo -u www-data php yii theme/info | grep "Active theme"
```

**Expected Output:**
```
Active theme: ModernTheme2026
```

### Check Module Status

```bash
cd /var/www/humhub/protected
sudo -u www-data php yii module/list | grep modern-theme
```

**Expected Output:**
```
| modern-theme-2026    |        Yes |               1.0.0 | Modern Theme 2026
```

## Troubleshooting

### Theme Keeps Reverting

**Cause:** The theme path is not properly set in the database.

**Solution:**
```bash
cd /var/www/humhub/protected
sudo -u www-data php yii theme/switch ModernTheme2026
sudo -u www-data php yii cache/flush-all
```

### "Theme Not Found" Error

**Cause:** Module is not enabled or theme files are missing.

**Solution:**
1. Verify module is enabled:
   ```bash
   sudo -u www-data php yii module/list | grep modern-theme
   ```

2. If not enabled, enable it:
   ```bash
   sudo -u www-data php yii module/enable modern-theme-2026
   ```

3. Then activate theme:
   ```bash
   sudo -u www-data php yii theme/switch ModernTheme2026
   ```

### CSS Not Loading

**Cause:** CSS needs to be rebuilt.

**Solution:**
```bash
cd /var/www/humhub/protected
sudo -u www-data php yii theme/switch ModernTheme2026
sudo -u www-data php yii cache/flush-all
```

HumHub automatically rebuilds CSS when switching themes.

### Permission Errors

**Cause:** Files don't have correct ownership.

**Solution:**
```bash
cd /var/www/humhub/protected/modules/modern-theme-2026
sudo chown -R www-data:www-data .
sudo chmod -R 755 .
```

## Understanding Theme Activation

### Database Setting

HumHub stores the active theme in the `setting` table:

- **name:** `theme`
- **value:** Full path to theme directory
- **module_id:** `base`

### Theme Hierarchy

Modern Theme 2026 inherits from Clean Theme, which inherits from HumHub:

```
HumHub (base theme)
  └── Clean Theme (modern improvements)
      └── ModernTheme2026 (our custom theme)
```

This is set in `themes/ModernTheme2026/scss/variables.scss`:
```scss
$baseTheme: "Clean";
```

### Activation Process

1. **Module Enable:** Registers the theme with HumHub
2. **Theme Switch:** Sets the theme path in database
3. **CSS Build:** Compiles SCSS to CSS
4. **Cache Flush:** Clears cached theme data

## Automated Activation

### On Module Install

The module attempts to auto-activate on enable in `Module.php`:

```php
public function enable()
{
    if (parent::enable() !== false) {
        $this->enableTheme();
        ThemeHelper::buildCss();
        return true;
    }
    return false;
}

private function enableTheme()
{
    if (!static::isThemeBasedActive()) {
        $modernTheme = ThemeHelper::getThemeByName(self::THEME_NAME);
        $modernTheme?->activate();
    }
}
```

However, this only activates if no theme is currently active, so manual activation is sometimes needed.

### Future Improvement

To make activation more reliable, the `enableTheme()` method could be modified to force activation:

```php
private function enableTheme()
{
    $modernTheme = ThemeHelper::getThemeByName(self::THEME_NAME);
    if ($modernTheme) {
        $modernTheme->activate();
    }
}
```

But this would override any custom child themes, so the current conservative approach is safer.

## Post-Activation Checklist

After activating the theme, verify:

- [ ] Theme shows in admin panel: **Administration** → **Settings** → **Design**
- [ ] CSS loads correctly (check browser inspector for theme.css)
- [ ] Mobile bottom navigation appears on mobile (< 768px)
- [ ] Dark mode works (if dark mode module enabled)
- [ ] All pages render correctly
- [ ] No errors in `/var/www/humhub/protected/runtime/logs/app.log`

## Command Reference

### Essential Commands

```bash
# Activate theme
sudo -u www-data php yii theme/switch ModernTheme2026

# Check theme status
sudo -u www-data php yii theme/info

# Flush cache
sudo -u www-data php yii cache/flush-all

# Check module status
sudo -u www-data php yii module/list | grep modern-theme

# Enable module
sudo -u www-data php yii module/enable modern-theme-2026

# Disable module (reverts to HumHub theme)
sudo -u www-data php yii module/disable modern-theme-2026
```

### One-Liner Activation

```bash
cd /var/www/humhub/protected && sudo -u www-data php yii theme/switch ModernTheme2026 && sudo -u www-data php yii cache/flush-all && sudo -u www-data php yii theme/info
```

## Need Help?

If theme activation issues persist:

1. Check logs: `sudo tail -n 50 /var/www/humhub/protected/runtime/logs/app.log`
2. Verify file ownership: `ls -la /var/www/humhub/protected/modules/modern-theme-2026`
3. Check database setting: `mysql -u humhub -p'...' humhub -e "SELECT * FROM setting WHERE name='theme';"`
4. Try the helper script: `sudo ./activate-theme.sh`

## Summary

✅ **Always use CLI to initially activate the theme**  
✅ **Use `theme/switch` command, not just module enable**  
✅ **Theme persists across cache flushes once properly activated**  
✅ **Helper script available for easy reactivation**  

---

**Last Updated:** April 1, 2026  
**Theme Version:** 1.0.0  
**HumHub Version:** 1.16.x
