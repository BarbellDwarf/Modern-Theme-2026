#!/usr/bin/env php
<?php
/**
 * Modern Theme 2026 - One-Command Update
 * Run: php update.php
 *
 * Rebuilds CSS, compiles to all output locations, flushes cache,
 * and republishes theme assets. Use after any code change (git pull, etc.).
 */

echo "Modern Theme 2026 - Update\n";
echo "===========================\n\n";

// Step 1: Compile CSS
echo "1/2 Compiling CSS...\n";
$script = __DIR__ . '/compile-css.php';
$output = shell_exec(PHP_BINARY . ' ' . escapeshellarg($script) . ' 2>&1');
echo "   " . trim(str_replace("\n", "\n   ", $output ?? '')) . "\n";

// Step 2: Clear runtime cache and published assets
echo "2/2 Clearing caches and assets...\n";
$webroot = dirname(__DIR__, 3);
$cacheDir = $webroot . '/runtime/cache';
if (is_dir($cacheDir)) {
    $files = glob($cacheDir . '/*');
    if ($files) { array_map('unlink', $files); }
    echo "   Runtime cache cleared.\n";
}
foreach (glob($webroot . '/assets/*/resources/css/theme.css') as $f) {
    $hashDir = dirname($f, 3);
    foreach (['css', 'js'] as $type) {
        $files = glob($hashDir . '/resources/' . $type . '/*');
        if ($files) { array_map('unlink', $files); }
    }
    echo "   Published assets cleared: " . basename($hashDir) . "\n";
}
// Also clear published module JS assets. Yii2's AssetManager hash uses the
// resources/ directory mtime so the hash dir persists across file edits.
// We must delete the ENTIRE hash dir (not just individual files) because
// Yii2 checks dir existence, not file content, to decide whether to republish.
$moduleJsFiles = [
    'reactionPicker.js', 'contextSwitcher.js', 'peopleFocusGuard.js',
    'paletteSwitcher.js', 'notifications.js', 'modalFocusFix.js',
    'mobileKeyboardFix.js', 'mobileSwipeFix.js', 'mailLayout.js',
    'mobileCommentCompose.js', 'mobileContentToggle.js', 'dropdownManager.js',
];
$foundHashes = [];
foreach (glob($webroot . '/assets/*/js/*.js') as $jsFile) {
    if (in_array(basename($jsFile), $moduleJsFiles, true)) {
        $hashDir = dirname(dirname($jsFile));
        $foundHashes[$hashDir] = true;
    }
}
foreach (array_keys($foundHashes) as $hashDir) {
    $it = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($hashDir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST
    );
    foreach ($it as $f) {
        $f->isDir() ? rmdir($f->getPathname()) : unlink($f->getPathname());
    }
    rmdir($hashDir);
    echo "   Module JS assets cleared: " . basename($hashDir) . "\n";
}
// If Redis is available, flush it too (HumHub commonly uses Redis for cache).
$redis = @fsockopen('127.0.0.1', 6379, $errno, $errstr, 1);
if ($redis) {
    fwrite($redis, "*1\r\n\$8\r\nFLUSHALL\r\n");
    fread($redis, 1024);
    fclose($redis);
    echo "   Redis cache flushed.\n";
}

echo "\nUpdate complete. Reload the page in your browser.\n";
