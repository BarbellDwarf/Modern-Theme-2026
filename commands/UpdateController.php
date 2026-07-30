<?php

namespace humhub\modules\modernTheme2026\commands;

use humhub\modules\modernTheme2026\Module;
use Yii;
use yii\console\Controller;
use yii\console\ExitCode;
use yii\helpers\Console;

class UpdateController extends Controller
{
    public $defaultAction = 'run';

    public function actionRun()
    {
        $this->stdout("Modern Theme 2026 - Update\n", Console::BOLD);
        $this->stdout("===========================\n\n");

        // Step 1: Rebuild CSS
        $this->stdout("1/4 Rebuilding CSS...\n");
        ob_start();
        $cssOk = Module::rebuildThemeCss();
        $cssOutput = ob_get_clean();
        if ($cssOk) {
            $this->stdout("   CSS rebuilt.\n", Console::FG_GREEN);
        } else {
            $this->stdout("   CSS rebuild failed: " . $cssOutput . "\n", Console::FG_RED);
        }

        // Step 2: Run compile-css.php for all output locations
        $this->stdout("2/4 Compiling to dist/ and resources/css/...\n");
        $script = __DIR__ . '/../compile-css.php';
        if (file_exists($script)) {
            $output = shell_exec('php ' . escapeshellarg($script) . ' 2>&1');
            $this->stdout("   " . trim(str_replace("\n", "\n   ", $output)) . "\n");
        } else {
            $this->stdout("   compile-css.php not found, skipping.\n", Console::FG_YELLOW);
        }

        // Step 3: Flush cache
        $this->stdout("3/4 Flushing cache...\n");
        Yii::$app->cache->flush();
        $this->stdout("   Cache flushed.\n", Console::FG_GREEN);

        // Step 4: Republish theme assets
        $this->stdout("4/4 Republishing theme assets...\n");
        try {
            $theme = \humhub\helpers\ThemeHelper::getThemeByName(Module::THEME_NAME);
            if ($theme) {
                $theme->publishResources(true);
                // Force delete old published path so next request creates fresh
                $oldPath = $theme->publishedResourcesPath;
                $theme->publishResources(true);

                // Clear the web assets directory too
                $webroot = dirname(__DIR__, 3);
                foreach (glob($webroot . '/assets/*/resources/css/theme.css') as $f) {
                    $hashDir = dirname($f, 3);
                    $this->stdout("   Clearing published assets: {$hashDir}\n");
                    array_map('unlink', glob($hashDir . '/resources/css/*'));
                    array_map('unlink', glob($hashDir . '/resources/js/*'));
                }

                $this->stdout("   Theme assets republished.\n", Console::FG_GREEN);
            } else {
                $this->stdout("   Theme not found, skipping.\n", Console::FG_YELLOW);
            }
        } catch (\Throwable $e) {
            $this->stdout("   Error: " . $e->getMessage() . "\n", Console::FG_RED);
        }

        $this->stdout("\nUpdate complete.\n", Console::BOLD);
        return ExitCode::OK;
    }
}
