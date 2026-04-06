<?php

/**
 * Modern Theme 2026
 */

namespace humhub\modules\modernTheme2026\controllers;

use humhub\modules\admin\components\Controller;
use humhub\modules\modernTheme2026\Module;
use Yii;

class ConfigController extends Controller
{
    /**
     * Returns the configured "People" nav label, falling back to "People".
     */
    public static function getPeopleNavLabel(): string
    {
        $label = Yii::$app->settings->get('peopleNavLabel');
        return ($label !== null && trim($label) !== '') ? trim($label) : 'People';
    }

    public function actionIndex()
    {
        $settings = Yii::$app->settings;

        if (Yii::$app->request->isPost) {
            // Save the People nav label if submitted
            $peopleLabel = Yii::$app->request->post('peopleNavLabel');
            if ($peopleLabel !== null) {
                $settings->set('peopleNavLabel', trim($peopleLabel));
                Yii::$app->cache->flush();
                $this->view->saved();
                return $this->redirect(['/modern-theme-2026/config']);
            }

            $palette = Yii::$app->request->post('palette');
            $palettes = self::getPalettes();

            if ($palette && isset($palettes[$palette])) {
                $colors = $palettes[$palette]['colors'];

                // Map color keys to their HumHub settings names
                $colorKeys = [
                    'primary'   => 'Primary',
                    'accent'    => 'Accent',
                    'secondary' => 'Secondary',
                    'success'   => 'Success',
                    'danger'    => 'Danger',
                    'warning'   => 'Warning',
                    'info'      => 'Info',
                    'light'     => 'Light',
                    'dark'      => 'Dark',
                ];

                foreach ($colorKeys as $lcKey => $titleKey) {
                    if (isset($colors[$lcKey])) {
                        $settings->set('theme' . $titleKey . 'Color', $colors[$lcKey]);
                        $settings->set('useDefaultTheme' . $titleKey . 'Color', false);
                    }
                }

                Module::rebuildThemeCss();

                Yii::$app->cache->flush();

                $this->view->saved();
                return $this->redirect(['/modern-theme-2026/config']);
            }
        }

        return $this->render('index', [
            'palettes'        => self::getPalettes(),
            'currentColors'   => self::getCurrentColors(),
            'peopleNavLabel'  => self::getPeopleNavLabel(),
        ]);
    }

    public function actionRebuildCss()
    {
        $ok = Module::rebuildThemeCss();
        Yii::$app->cache->flush();
        return $ok ? 'ok' : 'error: css rebuild failed';
    }

    public static function getPalettes(): array
    {
        return [
            'ocean-blue'    => ['label' => 'Ocean Blue',    'colors' => ['primary' => '#1e6ad6', 'accent' => '#5a8eeb', 'secondary' => '#7c3aed', 'success' => '#10b981', 'danger' => '#ef4444', 'warning' => '#f59e0b', 'info' => '#3b82f6', 'light' => '#f8fafc', 'dark' => '#1e293b']],
            'royal-purple'  => ['label' => 'Royal Purple',  'colors' => ['primary' => '#7c3aed', 'accent' => '#a78bfa', 'secondary' => '#ec4899', 'success' => '#10b981', 'danger' => '#ef4444', 'warning' => '#f59e0b', 'info' => '#8b5cf6', 'light' => '#faf5ff', 'dark' => '#1e1b4b']],
            'forest-green'  => ['label' => 'Forest Green',  'colors' => ['primary' => '#059669', 'accent' => '#34d399', 'secondary' => '#10b981', 'success' => '#16a34a', 'danger' => '#dc2626', 'warning' => '#d97706', 'info' => '#0891b2', 'light' => '#f0fdf4', 'dark' => '#14532d']],
            'slate-gray'    => ['label' => 'Slate Gray',    'colors' => ['primary' => '#475569', 'accent' => '#94a3b8', 'secondary' => '#334155', 'success' => '#16a34a', 'danger' => '#dc2626', 'warning' => '#d97706', 'info' => '#0284c7', 'light' => '#f8fafc', 'dark' => '#0f172a']],
            'sunset-orange' => ['label' => 'Sunset Orange', 'colors' => ['primary' => '#ea580c', 'accent' => '#fb923c', 'secondary' => '#dc2626', 'success' => '#16a34a', 'danger' => '#b91c1c', 'warning' => '#f59e0b', 'info' => '#0284c7', 'light' => '#fff7ed', 'dark' => '#431407']],
            'rose-pink'     => ['label' => 'Rose Pink',     'colors' => ['primary' => '#db2777', 'accent' => '#f472b6', 'secondary' => '#ec4899', 'success' => '#16a34a', 'danger' => '#dc2626', 'warning' => '#d97706', 'info' => '#0284c7', 'light' => '#fdf2f8', 'dark' => '#500724']],
            'teal-cyan'     => ['label' => 'Teal Cyan',     'colors' => ['primary' => '#0891b2', 'accent' => '#22d3ee', 'secondary' => '#0e7490', 'success' => '#059669', 'danger' => '#dc2626', 'warning' => '#d97706', 'info' => '#06b6d4', 'light' => '#ecfeff', 'dark' => '#164e63']],
            'midnight-dark' => ['label' => 'Midnight Dark', 'colors' => ['primary' => '#6366f1', 'accent' => '#818cf8', 'secondary' => '#4f46e5', 'success' => '#10b981', 'danger' => '#f43f5e', 'warning' => '#fbbf24', 'info' => '#38bdf8', 'light' => '#1e1b4b', 'dark' => '#0f0a1e']],
            'warm-amber'    => ['label' => 'Warm Amber',    'colors' => ['primary' => '#d97706', 'accent' => '#fbbf24', 'secondary' => '#b45309', 'success' => '#16a34a', 'danger' => '#dc2626', 'warning' => '#ca8a04', 'info' => '#0284c7', 'light' => '#fffbeb', 'dark' => '#451a03']],
            'cobalt-navy'   => ['label' => 'Cobalt Navy',   'colors' => ['primary' => '#1d4ed8', 'accent' => '#3b82f6', 'secondary' => '#1e40af', 'success' => '#16a34a', 'danger' => '#dc2626', 'warning' => '#d97706', 'info' => '#2563eb', 'light' => '#eff6ff', 'dark' => '#1e3a5f']],
            'ruby-red'      => ['label' => 'Ruby Red',      'colors' => ['primary' => '#b91c1c', 'accent' => '#ef4444', 'secondary' => '#991b1b', 'success' => '#16a34a', 'danger' => '#7f1d1d', 'warning' => '#d97706', 'info' => '#0284c7', 'light' => '#fff5f5', 'dark' => '#450a0a']],
            'lavender'      => ['label' => 'Soft Lavender', 'colors' => ['primary' => '#8b5cf6', 'accent' => '#c4b5fd', 'secondary' => '#a78bfa', 'success' => '#16a34a', 'danger' => '#dc2626', 'warning' => '#d97706', 'info' => '#6d28d9', 'light' => '#f5f3ff', 'dark' => '#2e1065']],
        ];
    }

    private static function getCurrentColors(): array
    {
        $settings = Yii::$app->settings;
        return [
            'primary'   => $settings->get('themePrimaryColor') ?: '#1e6ad6',
            'accent'    => $settings->get('themeAccentColor') ?: '#5a8eeb',
            'secondary' => $settings->get('themeSecondaryColor') ?: '#7c3aed',
            'success'   => $settings->get('themeSuccessColor') ?: '#10b981',
            'danger'    => $settings->get('themeDangerColor') ?: '#ef4444',
        ];
    }
}
