<?php

/**
 * Modern Theme 2026 — Color Palette Configuration
 *
 * @var \humhub\components\View $this
 * @var array $palettes
 * @var array $currentColors
 */

use humhub\modules\modernTheme2026\controllers\ConfigController;
use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'Modern Theme 2026 — Color Palettes';

$swatch = function (string $color, string $title = '') {
    return Html::tag('span', '', [
        'title' => $title ?: $color,
        'style' => "display:inline-block;width:22px;height:22px;border-radius:50%;background:{$color};border:2px solid rgba(0,0,0,.12);",
    ]);
};

$previewKeys = ['primary', 'accent', 'secondary', 'success', 'danger'];
?>

<div class="panel panel-default">
    <div class="panel-heading">
        <strong><i class="fa fa-paint-brush"></i> Modern Theme 2026 &mdash; Color Palettes</strong>
        <div class="text-muted" style="margin-top:4px;font-size:13px;">
            Select a predefined color palette to apply to the theme. Changes are applied immediately and rebuild the theme CSS.
        </div>
    </div>

    <div class="panel-body">

        <!-- Current colors indicator -->
        <div class="well well-sm" style="margin-bottom:20px;">
            <strong>Current active colors:</strong>
            <span style="margin-left:8px;">
                <?php foreach ($currentColors as $key => $hex): ?>
                    <?= $swatch($hex, ucfirst($key) . ': ' . $hex) ?>
                <?php endforeach; ?>
            </span>
            <small class="text-muted" style="margin-left:8px;">Primary · Accent · Secondary · Success · Danger</small>
        </div>

        <!-- Palette grid -->
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;">
            <?php foreach ($palettes as $key => $palette): ?>
                <?php
                    $colors = $palette['colors'];
                    $isActive = ($colors['primary'] === $currentColors['primary']
                        && $colors['accent'] === ($currentColors['accent'] ?? '')
                        && $colors['secondary'] === ($currentColors['secondary'] ?? ''));
                ?>
                <div class="panel panel-default" style="margin:0;<?= $isActive ? 'border:2px solid #1e6ad6;' : '' ?>">
                    <div class="panel-body" style="padding:14px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                            <strong style="font-size:14px;"><?= Html::encode($palette['label']) ?></strong>
                            <?php if ($isActive): ?>
                                <span class="label label-primary" style="font-size:10px;">Active</span>
                            <?php endif; ?>
                        </div>

                        <!-- Color swatches row -->
                        <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">
                            <?php foreach ($previewKeys as $colorKey): ?>
                                <?php if (isset($colors[$colorKey])): ?>
                                    <?= $swatch($colors[$colorKey], ucfirst($colorKey) . ': ' . $colors[$colorKey]) ?>
                                <?php endif; ?>
                            <?php endforeach; ?>
                            <!-- light/dark preview strips -->
                            <span title="Light: <?= Html::encode($colors['light'] ?? '') ?>"
                                  style="display:inline-block;width:22px;height:22px;border-radius:4px;background:<?= Html::encode($colors['light'] ?? '#fff') ?>;border:2px solid rgba(0,0,0,.12);"></span>
                            <span title="Dark: <?= Html::encode($colors['dark'] ?? '') ?>"
                                  style="display:inline-block;width:22px;height:22px;border-radius:4px;background:<?= Html::encode($colors['dark'] ?? '#000') ?>;border:2px solid rgba(0,0,0,.12);"></span>
                        </div>

                        <!-- Color hex labels -->
                        <div style="font-size:11px;color:#888;margin-bottom:12px;line-height:1.6;">
                            <span title="Primary">P:</span> <code style="font-size:10px;"><?= Html::encode($colors['primary']) ?></code> &nbsp;
                            <span title="Accent">A:</span> <code style="font-size:10px;"><?= Html::encode($colors['accent'] ?? '') ?></code>
                        </div>

                        <!-- Apply form -->
                        <?php if (!$isActive): ?>
                            <form method="post" action="<?= Url::to(['/modern-theme-2026/config']) ?>">
                                <input type="hidden" name="<?= Yii::$app->request->csrfParam ?>" value="<?= Yii::$app->request->csrfToken ?>">
                                <input type="hidden" name="palette" value="<?= Html::encode($key) ?>">
                                <button type="submit" class="btn btn-primary btn-sm" style="width:100%;">
                                    <i class="fa fa-check"></i> Apply Palette
                                </button>
                            </form>
                        <?php else: ?>
                            <button class="btn btn-default btn-sm" style="width:100%;" disabled>
                                <i class="fa fa-check-circle"></i> Currently Active
                            </button>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="alert alert-info" style="margin-top:20px;">
            <i class="fa fa-info-circle"></i>
            After applying a palette, you can fine-tune individual colors in
            <a href="<?= Url::to(['/admin/setting/design']) ?>">Admin &rsaquo; Settings &rsaquo; Design</a>.
        </div>

    </div>
</div>
