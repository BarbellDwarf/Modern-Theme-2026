<?php

use humhub\components\Migration;

class m260401_000000_add_reaction_type_to_like extends Migration
{
    public function up()
    {
        // Add reaction_type column with default 'like' (idempotent)
        $tableSchema = $this->db->getTableSchema('{{%like}}');
        if ($tableSchema !== null && !isset($tableSchema->columns['reaction_type'])) {
            $this->addColumn('{{%like}}', 'reaction_type', $this->string(50)->notNull()->defaultValue('like'));
        }

        // Drop the existing unique index (object_model, object_id, created_by)
        // so we can replace it with one that includes reaction_type
        try {
            $this->dropIndex('unique-object-user', '{{%like}}');
        } catch (\Exception $e) {
            // Index may not exist or may have already been replaced
        }

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
        try {
            $this->dropIndex('unique-object-user-reaction', '{{%like}}');
        } catch (\Exception $e) {}

        // Restore original unique index (without reaction_type)
        $this->safeCreateIndex(
            'unique-object-user',
            '{{%like}}',
            ['object_model', 'object_id', 'created_by'],
            true
        );

        // Drop the column (idempotent)
        $tableSchema = $this->db->getTableSchema('{{%like}}');
        if ($tableSchema !== null && isset($tableSchema->columns['reaction_type'])) {
            $this->dropColumn('{{%like}}', 'reaction_type');
        }
    }
}
