<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * "related_user_id" est utilisé pour les messages envoyés par Tafa
     * (le compte système) afin de savoir quel VRAI utilisateur est
     * concerné par la notification (ex: "Vous avez matché avec X").
     * Cela permet au frontend d'ouvrir la vraie conversation avec X en
     * cliquant sur son nom dans le message de Tafa.
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('related_user_id')
                ->nullable()
                ->after('receiver_id')
                ->constrained('users')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropConstrainedForeignId('related_user_id');
        });
    }
};
