<?php

use humhub\components\Migration;

class m260401_000000_add_reaction_type_to_like extends Migration
{
    public function up()
    {
        // Add reaction_type column with default 'like' (idempotent)
        $this->safeAddColumn('{{%like}}', 'reaction_type', $this->string(50)->notNull()->defaultValue('like'));

        // Replace existing unique index with reaction-aware index
        $this->safeDropIndex('unique-object-user', '{{%like}}');

        // New unique index allows one reaction of each type per user per content
        $this->safeCreateIndex(
            'unique-object-user-reaction',
            '{{%like}}',
            ['object_model', 'object_id', 'created_by', 'reaction_type'],
            true
        );
    }

    public function down()
    {
        // Drop the new index
        $this->safeDropIndex('unique-object-user-reaction', '{{%like}}');

        // Restore original unique index (without reaction_type)
        $this->safeCreateIndex(
            'unique-object-user',
            '{{%like}}',
            ['object_model', 'object_id', 'created_by'],
            true
        );

        // Drop the column (idempotent)
        $this->safeDropColumn('{{%like}}', 'reaction_type');
    }
}
