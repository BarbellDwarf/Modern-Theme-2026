<?php

use humhub\components\Migration;

class uninstall extends Migration
{
    public function up()
    {
        // Revert reaction schema extension created by this module.
        $this->safeDropIndex('unique-object-user-reaction', '{{%like}}');
        $this->safeCreateIndex(
            'unique-object-user',
            '{{%like}}',
            ['object_model', 'object_id', 'created_by'],
            true
        );
        $this->safeDropColumn('{{%like}}', 'reaction_type');
    }

    public function down()
    {
        echo "uninstall does not support migration down.\n";
        return false;
    }
}
