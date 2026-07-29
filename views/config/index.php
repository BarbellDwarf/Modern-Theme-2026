<?php

/**
 * Modern Theme 2026 — Color Palette Configuration
 *
 * @var \humhub\components\View $this
 * @var array $palettes
 * @var array $currentColors
 * @var string $peopleNavLabel
 * @var array $mobileNavLabels
 * @var bool $mobileMoreAutoModules
 * @var string $mobileMoreHiddenModuleIds
 */

use humhub\modules\modernTheme2026\controllers\ConfigController;
use yii\helpers\Html;
use yii\helpers\Url;

$this->title = 'Modern Theme 2026 — Color Palettes';

$swatch = function (string $color, string $title = '') {
    return Html::tag('span', '', [
        'title' => $title ?: $color,
        'class' => 'mt2026-config-swatch',
        'style' => "background:{$color};",
    ]);
};

$previewKeys = ['primary', 'accent', 'secondary', 'success', 'danger'];
?>

<div class="panel panel-default">
    <div class="panel-heading">
        <strong><i class="fa fa-paint-brush"></i> <?= Yii::t('ModernTheme2026.config', 'Modern Theme 2026 — Color Palettes') ?></strong>
        <div class="text-muted mt2026-config-meta-text">
            Select a predefined color palette to apply to the theme. Changes are applied immediately and rebuild the theme CSS.
        </div>
    </div>

    <div class="panel-body">

        <!-- Current colors indicator -->
        <div class="well well-sm mt2026-config-current-well">
            <strong><?= Yii::t('ModernTheme2026.config', 'Current active colors:') ?></strong>
            <span class="mt2026-config-current-colors">
                <?php foreach ($currentColors as $key => $hex): ?>
                    <?= $swatch($hex, ucfirst($key) . ': ' . $hex) ?>
                <?php endforeach; ?>
            </span>
            <small class="text-muted mt2026-config-current-colors"><?= Yii::t('ModernTheme2026.config', 'Primary · Accent · Secondary · Success · Danger') ?></small>
        </div>

        <!-- Palette grid -->
        <div class="mt2026-config-palette-grid">
            <?php foreach ($palettes as $key => $palette): ?>
                <?php
                    $colors = $palette['colors'];
                    $isActive = ($colors['primary'] === $currentColors['primary']
                        && $colors['accent'] === ($currentColors['accent'] ?? '')
                        && $colors['secondary'] === ($currentColors['secondary'] ?? ''));
                ?>
                <div class="panel panel-default mt2026-config-palette-card <?= $isActive ? 'active' : '' ?>">
                    <div class="panel-body mt2026-config-palette-body">
                        <div class="mt2026-config-palette-header">
                            <strong class="mt2026-config-palette-header-title"><?= Html::encode($palette['label']) ?></strong>
                            <?php if ($isActive): ?>
                                <span class="label label-primary" style="font-size:10px;"><?= Yii::t('ModernTheme2026.config', 'Active') ?></span>
                            <?php endif; ?>
                        </div>

                        <!-- Color swatches row -->
                        <div class="mt2026-config-swatches-row">
                            <?php foreach ($previewKeys as $colorKey): ?>
                                <?php if (isset($colors[$colorKey])): ?>
                                    <?= $swatch($colors[$colorKey], ucfirst($colorKey) . ': ' . $colors[$colorKey]) ?>
                                <?php endif; ?>
                            <?php endforeach; ?>
                            <!-- light/dark preview strips -->
                            <span title="Light: <?= Html::encode($colors['light'] ?? '') ?>"
                                  class="mt2026-config-swatch--square"
                                  style="background:<?= Html::encode($colors['light'] ?? '#fff') ?>;"></span>
                            <span title="Dark: <?= Html::encode($colors['dark'] ?? '') ?>"
                                  class="mt2026-config-swatch--square"
                                  style="background:<?= Html::encode($colors['dark'] ?? '#000') ?>;"></span>
                        </div>

                        <!-- Color hex labels -->
                        <div class="mt2026-config-hex-labels">
                            <span title="Primary">P:</span> <code><?= Html::encode($colors['primary']) ?></code> &nbsp;
                            <span title="Accent">A:</span> <code><?= Html::encode($colors['accent'] ?? '') ?></code>
                        </div>

                        <!-- Apply form -->
                        <?php if (!$isActive): ?>
                            <form method="post" action="<?= Url::to(['/modern-theme-2026/config']) ?>">
                                <input type="hidden" name="<?= Yii::$app->request->csrfParam ?>" value="<?= Yii::$app->request->csrfToken ?>">
                                <input type="hidden" name="palette" value="<?= Html::encode($key) ?>">
                                <button type="submit" class="btn btn-primary btn-sm" style="width:100%;">
                                    <i class="fa fa-check"></i> <?= Yii::t('ModernTheme2026.config', 'Apply Palette') ?>
                                </button>
                            </form>
                        <?php else: ?>
                            <button class="btn btn-default btn-sm" style="width:100%;" disabled>
                                <i class="fa fa-check-circle"></i> <?= Yii::t('ModernTheme2026.config', 'Currently Active') ?>
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

<!-- Mobile Navigation Settings -->
<div class="panel panel-default mt2026-config-section">
    <div class="panel-heading">
        <strong><i class="fa fa-mobile"></i> <?= Yii::t('ModernTheme2026.config', 'Mobile Navigation Settings') ?></strong>
        <div class="text-muted mt2026-config-meta-text">
            Customize mobile nav labels and control which module links are auto-added under More.
        </div>
    </div>
    <div class="panel-body">
        <form method="post" action="<?= Url::to(['/modern-theme-2026/config']) ?>">
            <input type="hidden" name="<?= Yii::$app->request->csrfParam ?>" value="<?= Yii::$app->request->csrfToken ?>">
            <input type="hidden" name="mobileNavSettingsSubmit" value="1">

            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="mobileNavLabel_home"><?= Yii::t('ModernTheme2026.config', 'Home label') ?></label>
                        <input type="text" id="mobileNavLabel_home" name="mobileNavLabel_home" class="form-control"
                               value="<?= Html::encode($mobileNavLabels['home'] ?? 'Home') ?>" maxlength="24">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="mobileNavLabel_spaces"><?= Yii::t('ModernTheme2026.config', 'Spaces label') ?></label>
                        <input type="text" id="mobileNavLabel_spaces" name="mobileNavLabel_spaces" class="form-control"
                               value="<?= Html::encode($mobileNavLabels['spaces'] ?? 'Spaces') ?>" maxlength="24">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="mobileNavLabel_people"><?= Yii::t('ModernTheme2026.config', 'People label') ?></label>
                        <input type="text" id="mobileNavLabel_people" name="mobileNavLabel_people" class="form-control"
                               value="<?= Html::encode($mobileNavLabels['people'] ?? $peopleNavLabel) ?>" maxlength="24">
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="mobileNavLabel_notifications"><?= Yii::t('ModernTheme2026.config', 'Notifications label') ?></label>
                        <input type="text" id="mobileNavLabel_notifications" name="mobileNavLabel_notifications" class="form-control"
                               value="<?= Html::encode($mobileNavLabels['notifications'] ?? 'Notifications') ?>" maxlength="24">
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="form-group">
                        <label for="mobileNavLabel_more"><?= Yii::t('ModernTheme2026.config', 'More label') ?></label>
                        <input type="text" id="mobileNavLabel_more" name="mobileNavLabel_more" class="form-control"
                               value="<?= Html::encode($mobileNavLabels['more'] ?? 'More') ?>" maxlength="24">
                    </div>
                </div>
            </div>

            <hr>

            <div class="checkbox">
                <label>
                    <input type="checkbox" name="mobileMoreAutoModules" value="1" <?= $mobileMoreAutoModules ? 'checked' : '' ?>>
                    <?= Yii::t('ModernTheme2026.config', 'Auto-add enabled top-menu modules to') ?> <strong><?= Yii::t('ModernTheme2026.config', 'More') ?></strong>
                </label>
            </div>

            <div class="form-group" style="max-width:520px;">
                <label for="mobileMoreHiddenModuleIds"><?= Yii::t('ModernTheme2026.config', 'Hide module IDs from auto-add') ?></label>
                <input type="text" id="mobileMoreHiddenModuleIds" name="mobileMoreHiddenModuleIds" class="form-control"
                       value="<?= Html::encode($mobileMoreHiddenModuleIds) ?>" placeholder="calendar, usermap, wiki">
                <p class="help-block">
                    Comma-separated module IDs to exclude from auto-added More links.
                </p>
            </div>

            <button type="submit" class="btn btn-primary btn-sm">
                <i class="fa fa-save"></i> <?= Yii::t('ModernTheme2026.config', 'Save Mobile Navigation Settings') ?>
            </button>
        </form>
    </div>
</div>

<!-- Mail Settings -->
<div class="panel panel-default mt2026-config-section">
    <div class="panel-heading">
        <strong><i class="fa fa-envelope"></i> <?= Yii::t('ModernTheme2026.config', 'Mail Settings') ?></strong>
        <div class="text-muted mt2026-config-meta-text">
            Configure the messaging experience in the mail module.
        </div>
    </div>
    <div class="panel-body">
        <form method="post" action="<?= Url::to(['/modern-theme-2026/config']) ?>">
            <input type="hidden" name="<?= Yii::$app->request->csrfParam ?>" value="<?= Yii::$app->request->csrfToken ?>">
            <input type="hidden" name="mailSettingsSubmit" value="1">

            <div class="checkbox">
                <label>
                    <input type="checkbox" name="mailEnterToSend" value="1" <?= ConfigController::isMailEnterToSendEnabled() ? 'checked' : '' ?>>
                    <strong><?= Yii::t('ModernTheme2026.config', 'Enter to send') ?></strong>
                    <p class="help-block mt2026-config-help-block">
                        Press Enter to send a message (Ctrl+Enter for new line). Disable to use Enter for new lines.
                    </p>
                </label>
            </div>

            <div class="form-group" style="margin-top:16px;">
                <label for="mailFontScale"><strong><?= Yii::t('ModernTheme2026.config', 'Font size') ?></strong></label>
                <select id="mailFontScale" name="mailFontScale" class="form-control" style="max-width:200px;">
                    <option value="100" <?= ConfigController::getMailFontScale() === 100 ? 'selected' : '' ?>>100%</option>
                    <option value="115" <?= ConfigController::getMailFontScale() === 115 ? 'selected' : '' ?>>115%</option>
                    <option value="130" <?= ConfigController::getMailFontScale() === 130 ? 'selected' : '' ?>>130%</option>
                    <option value="150" <?= ConfigController::getMailFontScale() === 150 ? 'selected' : '' ?>>150%</option>
                </select>
                <p class="help-block mt2026-config-sub-text">
                    Scale the message text size for better readability.
                </p>
            </div>

            <div class="checkbox">
                <label>
                    <input type="checkbox" name="mailFormattingBar" value="1" <?= ConfigController::isMailFormattingBarEnabled() ? 'checked' : '' ?>>
                    <strong><?= Yii::t('ModernTheme2026.config', 'Formatting toolbar') ?></strong>
                    <p class="help-block mt2026-config-help-block">
                        Show the bold/italic/link formatting toolbar in the message composer.
                    </p>
                </label>
            </div>

            <button type="submit" class="btn btn-primary btn-sm" style="margin-top:8px;">
                <i class="fa fa-save"></i> <?= Yii::t('ModernTheme2026.config', 'Save Mail Settings') ?>
            </button>
        </form>
    </div>
</div>

<!-- Navigation Labels Settings -->
<div class="panel panel-default mt2026-config-section">
    <div class="panel-heading">
        <strong><i class="fa fa-tag"></i> <?= Yii::t('ModernTheme2026.config', 'Navigation Labels') ?></strong>
        <div class="text-muted mt2026-config-meta-text">
            Customize the label for the People/Directory navigation item in the topbar and mobile nav.
        </div>
    </div>
    <div class="panel-body">
        <form method="post" action="<?= Url::to(['/modern-theme-2026/config']) ?>">
            <input type="hidden" name="<?= Yii::$app->request->csrfParam ?>" value="<?= Yii::$app->request->csrfToken ?>">
            <div class="form-group">
                <label for="peopleNavLabel" class="control-label">
                    <?= Yii::t('ModernTheme2026.config', '"People" tab label') ?>
                </label>
                <input type="text"
                       id="peopleNavLabel"
                       name="peopleNavLabel"
                       class="form-control"
                       style="max-width:320px;"
                       value="<?= Html::encode($peopleNavLabel) ?>"
                       placeholder="People"
                       maxlength="40">
                <p class="help-block">
                    Leave blank or set to <strong>People</strong> to use the default. Example: <em>Directory</em>.
                </p>
            </div>
            <button type="submit" class="btn btn-primary btn-sm">
                <i class="fa fa-save"></i> <?= Yii::t('ModernTheme2026.config', 'Save Label') ?>
            </button>
        </form>
    </div>
</div>
