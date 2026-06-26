<?php
/**
 * Modern Theme 2026 - CSS Compiler
 * Run: php compile-css.php
 * 
 * Compiles SCSS to CSS and writes to the published assets directory.
 * Use this after modifying SCSS files if the web-based rebuild is not available.
 */

// Attempt to locate Composer autoload in several common locations so this script
// can be run inside a full HumHub project or as a standalone theme repository.
$autoloadCandidates = [
    __DIR__ . '/../../../vendor/autoload.php', // HumHub project layout
    __DIR__ . '/vendor/autoload.php',         // theme root composer
    __DIR__ . '/../vendor/autoload.php',      // alternate layouts
];
$autoload = null;
foreach ($autoloadCandidates as $p) {
    if (file_exists($p)) { $autoload = $p; break; }
}
$hasScssPhp = false;
if ($autoload) {
    require $autoload;
    if (class_exists('\\ScssPhp\\ScssPhp\\Compiler')) {
        $hasScssPhp = true;
    }
}

$themeBasePath = __DIR__ . '/themes/ModernTheme2026';
$parentThemeBasePath = dirname(__DIR__, 3) . '/themes/HumHub';
$webroot = dirname(__DIR__, 3);

// Find the published asset directory for this theme by looking for our theme's
// compiled CSS (theme.css) inside any assets hash directory.
$assetDir = null;
foreach (glob($webroot . '/assets/*/resources/css/theme.css') as $f) {
    // theme.css → css/ → resources/ → {hash} (3 levels up)
    $hashDir = dirname($f, 3);
    // Confirm this belongs to our theme by checking the dist/ directory also
    if (file_exists($hashDir . '/dist/theme.css')) {
        $assetDir = $hashDir;
        break;
    }
}

if (!$assetDir) {
    // Fall back to writing into the theme folder for standalone development.
    $outputDir = $themeBasePath . '/dist';
    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0755, true);
    }
    echo "NOTICE: Published asset directory not found. Falling back to: {$outputDir}\n\n";
} else {
    $outputDir = $assetDir . '/resources/css';
    if (!is_dir($outputDir)) {
        mkdir($outputDir, 0755, true);
    }
    echo "Theme: {$themeBasePath}\n";
    echo "Output: {$outputDir}\n\n";
}

if ($hasScssPhp) {
    $compiler = new \ScssPhp\ScssPhp\Compiler();
    $compiler->setOutputStyle(\ScssPhp\ScssPhp\OutputStyle::COMPRESSED);
    $compiler->setImportPaths($webroot . '/protected/vendor/twbs/bootstrap/scss');
    $compiler->addImportPath($webroot . '/static/scss');
    $compiler->addImportPath($parentThemeBasePath . '/scss');
    $compiler->addImportPath($themeBasePath . '/scss');
} else {
    echo "NOTICE: scssphp library not available via Composer autoload. This script will write aggregated SCSS to '{$outputDir}/theme.scss' for manual compilation.\n\n";
}

$scssContent = '';

// Try to read custom colors from DB using environment-provided connection settings
$dbDsn = getenv('HUMHUB_DB_DSN');
$dbHost = getenv('HUMHUB_DB_HOST');
$dbName = getenv('HUMHUB_DB_NAME');
$dbUser = getenv('HUMHUB_DB_USER');
$dbPassword = getenv('HUMHUB_DB_PASSWORD');

if (!$dbDsn && $dbHost && $dbName) {
    // Validate that host/dbname don't contain DSN-injection characters (semicolons).
    if (strpos($dbHost, ';') !== false || strpos($dbName, ';') !== false) {
        echo "Warning: Invalid HUMHUB_DB_HOST or HUMHUB_DB_NAME value (contains ';') - skipping DB connection\n";
    } else {
        $dbDsn = 'mysql:host=' . $dbHost . ';dbname=' . $dbName;
    }
}

if ($dbDsn && is_string($dbUser) && is_string($dbPassword)) {
    try {
        $pdo = new PDO($dbDsn, $dbUser, $dbPassword);
        $colorMap = [
            'themePrimaryColor' => 'primary', 'themeAccentColor' => 'accent',
            'themeSecondaryColor' => 'secondary', 'themeSuccessColor' => 'success',
            'themeDangerColor' => 'danger', 'themeWarningColor' => 'warning',
            'themeInfoColor' => 'info', 'themeLightColor' => 'light', 'themeDarkColor' => 'dark',
        ];
        $stmt = $pdo->query("SELECT name, value FROM setting WHERE module_id='core' AND name LIKE 'theme%Color'");
        $colors = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $colors[$row['name']] = $row['value'];
        }
        foreach ($colorMap as $key => $var) {
            if (!empty($colors[$key])) {
                $scssContent .= "\${$var}: {$colors[$key]} !default;\n";
            }
        }
        echo "Applied " . count($colors) . " custom colors from DB\n";
    } catch (Exception $e) {
        echo "Warning: Could not read colors from DB - using defaults\n";
    }
} else {
    echo "Warning: Database connection settings not provided - using defaults\n";
}

$scssContent .= '@import "functions";' . "\n";
$scssContent .= '@import "' . $themeBasePath . '/scss/variables";' . "\n";
$scssContent .= '@import "' . $webroot . '/static/scss/variables";' . "\n";
$scssContent .= '@import "variables";' . "\n";
$scssContent .= '@import "maps";' . "\n";
$scssContent .= '@import "' . $webroot . '/static/scss/maps";' . "\n";
$scssContent .= '@import "bootstrap";' . "\n";
$scssContent .= '@import "' . $webroot . '/static/scss/build";' . "\n";
$scssContent .= '@import "' . $themeBasePath . '/scss/build";' . "\n";

if ($hasScssPhp) {
    try {
        $result = $compiler->compileString($scssContent);
        $css = $result->getCss();
        file_put_contents($outputDir . '/theme.css', $css);
        echo "SUCCESS: CSS compiled (" . number_format(strlen($css)) . " bytes → {$outputDir}/theme.css)\n";
        // Also write to resources/css/theme.css so HumHub's theme manager picks it up
        // even when the published asset directory is not available.
        $resourcesDir = $themeBasePath . '/resources/css';
        if (!is_dir($resourcesDir)) {
            mkdir($resourcesDir, 0755, true);
        }
        file_put_contents($resourcesDir . '/theme.css', $css);
        echo "  Also wrote to: {$resourcesDir}/theme.css\n";
    } catch (Exception $e) {
        echo "ERROR: " . $e->getMessage() . "\n";
        exit(1);
    }
} else {
    // Write aggregated SCSS for manual compilation using `sass`/`dart-sass` or `npx sass`.
    file_put_contents($outputDir . '/theme.scss', $scssContent);
    echo "WROTE: Aggregated SCSS to {$outputDir}/theme.scss\n\n";
    echo "To compile locally:\n";
    echo "  # Install dart-sass (preferred):\n";
    echo "  npx sass {$outputDir}/theme.scss {$outputDir}/theme.css --style=compressed\n\n";
    echo "Or use Composer to install scssphp and re-run this script:\n";
    echo "  composer require scssphp/scssphp --no-interaction\n";
    echo "  php compile-css.php\n\n";
    echo "After compilation, measure gzipped size:\n";
    echo "  php -r \"echo strlen(gzencode(file_get_contents('{$outputDir}/theme.css'))).PHP_EOL;\"\n";
}
