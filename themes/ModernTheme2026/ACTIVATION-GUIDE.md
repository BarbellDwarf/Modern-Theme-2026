# Modern Theme 2026 - Activation & Testing Guide

## Pre-Activation Checklist

✅ Theme files installed in `/var/www/humhub/themes/ModernTheme2026/`
✅ All SCSS files present (17 files)
✅ Proper file ownership (www-data:www-data)
✅ Proper permissions (755)

## Activation Steps

### 1. Access Admin Panel
- Log into HumHub as an administrator
- Navigate to: **Administration** → **Settings** → **Design & Appearance**

### 2. Select Theme
- In the theme dropdown, select **"ModernTheme2026"**
- Click **"Save"**

### 3. Flush Cache (IMPORTANT!)
- Navigate to: **Administration** → **Settings** → **Advanced** → **Caching**
- Click **"Flush caches"** button
- This compiles the SCSS files to CSS

### 4. Verify Compilation
After flushing cache, check:
- No error messages appear
- Page loads correctly
- Styles are applied

## Post-Activation Testing

### Visual Testing Checklist

#### 1. Homepage/Dashboard
- [ ] Clean, modern appearance
- [ ] Cards have subtle shadows
- [ ] Smooth animations on hover
- [ ] Readable typography
- [ ] Proper spacing and layout

#### 2. Navigation
- [ ] Top navigation bar is clean and modern
- [ ] Sidebar has improved styling
- [ ] Hover effects work smoothly
- [ ] Active states are clear
- [ ] No layout shifts

#### 3. Buttons
- [ ] All buttons have subtle shadows
- [ ] Hover effects show elevation change
- [ ] Loading states work (if present)
- [ ] Different button variants styled correctly

#### 4. Forms
- [ ] Input fields have focus states
- [ ] Proper border colors on focus
- [ ] Validation states visible (error/success)
- [ ] Form spacing is comfortable

#### 5. Cards/Panels
- [ ] Cards have proper shadows
- [ ] Hover effects on interactive cards
- [ ] Headers and footers styled correctly
- [ ] Content is readable

#### 6. Modals/Dropdowns
- [ ] Modals have backdrop blur effect
- [ ] Dropdowns have modern styling
- [ ] Smooth animations on open/close
- [ ] Proper shadows and depth

#### 7. Mobile Responsiveness
- [ ] Open on mobile device or resize browser
- [ ] Navigation adapts properly
- [ ] Touch targets are adequate (44x44px minimum)
- [ ] Content is readable on small screens
- [ ] No horizontal scrolling

### Browser Testing

Test in these browsers:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Accessibility Testing

- [ ] Tab through interface with keyboard
- [ ] Focus indicators are visible
- [ ] Color contrast is sufficient
- [ ] Screen reader compatibility (if available)

## Checking for Errors

### 1. Check Application Log
```bash
tail -100 /var/www/humhub/protected/runtime/logs/app.log | grep -i "error\|warning"
```

Look for any theme-related errors, especially SCSS compilation errors.

### 2. Check Browser Console
- Open browser Developer Tools (F12)
- Check Console tab for JavaScript errors
- Check Network tab for 404 errors on CSS files

### 3. Common Issues & Solutions

#### SCSS Compilation Errors
**Symptom:** Theme doesn't apply, or page looks broken
**Solution:**
1. Check `/var/www/humhub/protected/runtime/logs/app.log`
2. Look for SCSS syntax errors
3. Flush cache again
4. If errors persist, check file permissions

#### Missing Styles
**Symptom:** Some elements not styled correctly
**Solution:**
1. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Clear browser cache
3. Flush HumHub cache again

#### Performance Issues
**Symptom:** Page loads slowly
**Solution:**
1. Check CSS file size (should be < 150KB)
2. Ensure caching is enabled
3. Check network tab in browser dev tools

## Reverting to Previous Theme

If you need to revert:
1. Go to Administration → Settings → Design & Appearance
2. Select previous theme (e.g., "Clean" or "HumHub")
3. Click "Save"
4. Flush cache

## Advanced Configuration

### Changing Color Palette

The theme includes 4 preset color palettes. To switch (requires code edit):

1. Edit `/var/www/humhub/themes/ModernTheme2026/scss/variables.scss`
2. Change the primary/secondary color variables
3. Flush cache to recompile

Available palettes:
- **Professional Blue** (default): `$primary: #1e6ad6`
- **Creative Purple**: `$primary: #7c3aed`
- **Fresh Green**: `$primary: #10b981`
- **Neutral Gray**: `$primary: #6b7280`

### Customizing Shadows

To adjust shadow intensity, edit `/var/www/humhub/themes/ModernTheme2026/scss/variables.scss`:

```scss
// Make shadows more prominent
$shadow-sm: 0 2px 4px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.08);
$shadow-md: 0 6px 12px -2px rgba(0, 0, 0, 0.12), 0 3px 6px -2px rgba(0, 0, 0, 0.08);

// Make shadows more subtle
$shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.04);
$shadow-md: 0 2px 4px -1px rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02);
```

Then flush cache to apply changes.

### Customizing Border Radius

To make corners more/less rounded, edit `variables.scss`:

```scss
// More rounded
$border-radius: 0.75rem;      // 12px
$border-radius-lg: 1rem;      // 16px

// Less rounded
$border-radius: 0.25rem;      // 4px
$border-radius-lg: 0.375rem;  // 6px
```

## Performance Optimization

### Enable Production Caching

In `/var/www/humhub/protected/config/common.php`, ensure:
```php
'components' => [
    'assetManager' => [
        'class' => 'humhub\components\AssetManager',
        'bundles' => [
            'yii\web\JqueryAsset' => ['js' => []],
        ],
        'forceCopy' => false,  // Set to false in production
    ],
],
```

### Enable GZIP Compression

In your web server configuration (Apache/Nginx), ensure GZIP is enabled for CSS files.

## Troubleshooting Commands

```bash
# Check theme files
ls -la /var/www/humhub/themes/ModernTheme2026/

# Check SCSS files
find /var/www/humhub/themes/ModernTheme2026 -name "*.scss"

# Check file ownership
ls -la /var/www/humhub/themes/ModernTheme2026/ | head

# Flush cache via CLI
cd /var/www/humhub/protected
sudo -u www-data php yii cache/flush-all

# Check recent logs
tail -50 /var/www/humhub/protected/runtime/logs/app.log

# Search for errors
grep -i "error\|exception" /var/www/humhub/protected/runtime/logs/app.log | tail -20
```

## Support

If you encounter issues:

1. **Check logs first** - Most issues are logged
2. **Verify file permissions** - Should be www-data:www-data
3. **Try cache flush** - Solves 90% of issues
4. **Check browser console** - For client-side errors
5. **Revert if necessary** - You can always switch back

## Success Indicators

The theme is working correctly if you see:
✅ Modern, clean interface with subtle shadows
✅ Smooth hover animations throughout
✅ Improved typography and spacing
✅ Better visual hierarchy
✅ No console errors
✅ Fast page load times
✅ Good mobile responsiveness

## Next Steps

Once the theme is activated and working:
1. Review visual appearance across different pages
2. Test on mobile devices
3. Gather user feedback
4. Consider implementing future enhancements (Context Switcher, Emoji Reactions)
5. Customize colors/shadows to match your brand (optional)

---

**Theme Version:** 1.0.0  
**Compatible with:** HumHub 1.18.0+  
**Parent Theme:** Clean Theme  
**Last Updated:** 2026-04-01
