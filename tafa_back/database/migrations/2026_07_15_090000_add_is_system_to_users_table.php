<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * "is_system" identifie les comptes système (ex: l'assistant "Tafa"
     * qui envoie les notifications de match). Ces comptes ne sont pas
     * des vrais utilisateurs et ne doivent jamais apparaître dans le
     * matching / la recherche de profils.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_system')->default(false)->after('is_admin');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('is_system');
        });
    }
};
