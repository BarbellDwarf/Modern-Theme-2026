<?php
/**
 * Modern Theme 2026 - CSS Compiler
 * Run: php compile-css.php
 * 
 * Compiles SCSS to CSS and writes to the published assets directory.
 * Use this after modifying SCSS files if the web-based rebuild is not available.
 */

require __DIR__ . '/../../../vendor/autoload.php';

use ScssPhp\ScssPhp\Compiler;
use ScssPhp\ScssPhp\OutputStyle;

$themeBasePath = __DIR__ . '/themes/ModernTheme2026';
$parentThemeBasePath = dirname(__DIR__, 3) . '/themes/HumHub';
$webroot = dirname(__DIR__, 3);

// Find the published asset directory for this theme
$possibleHashes = array_filter(glob($webroot . '/assets/*/README.md'), function ($f) use ($themeBasePath) {
    return file_exists(dirname($f) . '/resources/css') || is_dir(dirname($f) . '/scss');
});

// Find by theme README
$assetDir = null;
foreach (glob($webroot . '/assets/*/QUICK-START.md') as $f) {
    $assetDir = dirname($f);
    break;
}
if (!$assetDir) {
    foreach (glob($webroot . '/assets/*/resources/css') as $d) {
        if (file_exists(dirname($d, 2) . '/README.md')) {
            $assetDir = dirname($d, 2);
            break;
        }
    }
}

if (!$assetDir) {
    echo "ERROR: Could not find published asset directory\n";
    exit(1);
}

$outputDir = $assetDir . '/resources/css';
if (!is_dir($outputDir)) {
    mkdir($outputDir, 0755, true);
}

echo "Theme: {$themeBasePath}\n";
echo "Output: {$outputDir}\n\n";

$compiler = new Compiler();
$compiler->setOutputStyle(OutputStyle::COMPRESSED);
$compiler->setImportPaths($webroot . '/protected/vendor/twbs/bootstrap/scss');
$compiler->addImportPath($webroot . '/static/scss');
$compiler->addImportPath($parentThemeBasePath . '/scss');
$compiler->addImportPath($themeBasePath . '/scss');

$scssContent = '';

// Try to read custom colors from DB using environment-provided connection settings
$dbDsn = getenv('HUMHUB_DB_DSN');
$dbHost = getenv('HUMHUB_DB_HOST');
$dbName = getenv('HUMHUB_DB_NAME');
$dbUser = getenv('HUMHUB_DB_USER');
$dbPassword = getenv('HUMHUB_DB_PASSWORD');

if (!$dbDsn && $dbHost && $dbName) {
    $dbDsn = 'mysql:host=' . $dbHost . ';dbname=' . $dbName;
}

if ($dbDsn && $dbUser !== false && $dbPassword !== false) {
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

try {
    $result = $compiler->compileString($scssContent);
    $css = $result->getCss();
    file_put_contents($outputDir . '/theme.css', $css);
    echo "SUCCESS: CSS compiled (" . number_format(strlen($css)) . " bytes → {$outputDir}/theme.css)\n";
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    exit(1);
}
