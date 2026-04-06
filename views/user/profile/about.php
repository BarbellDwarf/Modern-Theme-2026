<?php
/**
 * Modern Theme 2026 — Profile About override
 *
 * Extends the core view to render phone fields as tel: links
 * and email fields as mailto: links wherever a user's profile is displayed.
 */

use humhub\components\View;
use humhub\helpers\Html;
use humhub\modules\content\widgets\richtext\RichText;
use humhub\modules\user\models\fieldtype\MarkdownEditor;
use humhub\modules\user\models\fieldtype\UserEmail;

/**
 * @var $this View
 * @var $user \humhub\modules\user\models\User
 */

$categories = $user->profile->getProfileFieldCategories();

// Phone internal names used by HumHub's default profile fields
$phoneFields = ['phone_private', 'phone_work'];
?>
<div id="user-profile-about" class="panel panel-default">
    <div class="panel-heading">
        <?= Yii::t('UserModule.profile', '<strong>About</strong> this user') ?>
    </div>

    <div class="panel-body">
        <?php $isFirst = true; ?>
        <?php if (count($categories) > 1): ?>
            <ul id="tabs" class="nav nav-tabs" data-tabs="tabs">
                <?php foreach ($categories as $category): ?>
                    <li class="nav-item">
                        <a href="#profile-category-<?= $category->id ?>"
                             class="nav-link<?= $isFirst ? ' active' : '' ?>"
                             data-bs-toggle="tab"><?= Html::encode(Yii::t($category->getTranslationCategory(), $category->title)) ?></a>
                    </li>
                    <?php $isFirst = false; ?>
                <?php endforeach; ?>
            </ul>
        <?php endif; ?>

        <div class="tab-content">
            <?php $isFirst = true; ?>
            <?php foreach ($categories as $category): ?>
                <div class="tab-pane <?= $isFirst ? ' active' : '' ?> container gx-0 overflow-x-hidden" id="profile-category-<?= $category->id ?>">
                    <?php foreach ($user->profile->getProfileFields($category) as $field) : ?>
                        <div class="profile-item row mt-3" data-profile-field-internal-name="<?= $field->internal_name ?>">
                            <label class="col-md-3 field-title text-lg-end">
                                <?= Html::encode(Yii::t($field->getTranslationCategory(), $field->title)) ?>
                            </label>
                            <div class="col-md-9 field-value">
                                <?php
                                    if ($field->field_type_class === MarkdownEditor::class) {
                                        echo RichText::output($field->getUserValue($user, true, false));
                                    } elseif ($field->field_type_class === UserEmail::class) {
                                        // UserEmail: getUserValue($user, false) returns a mailto: anchor
                                        echo $field->getUserValue($user, false);
                                    } elseif (in_array($field->internal_name, $phoneFields)) {
                                        // Phone fields: wrap plain value in a tel: link
                                        $phone = trim($field->getUserValue($user, true, false) ?? '');
                                        if ($phone !== '') {
                                            $telHref = 'tel:' . preg_replace('/[^\d+\-\(\)\s]/', '', $phone);
                                            echo Html::a(Html::encode($phone), $telHref, ['class' => 'mt2026-tel-link']);
                                        }
                                    } else {
                                        echo $field->getUserValue($user, false);
                                    }
                                ?>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php $isFirst = false; ?>
            <?php endforeach; ?>
        </div>
    </div>
</div>
