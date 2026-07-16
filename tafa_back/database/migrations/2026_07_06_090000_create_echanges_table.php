<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Table "echanges" = une salle de discussion ("message room") entre deux
     * utilisateurs. Elle centralise le dernier message envoyé (latest_message)
     * et sa date (latest_date) pour éviter de recalculer ces infos à chaque
     * chargement de la liste des conversations.
     */
    public function up(): void
    {
        Schema::create('echanges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sender')->constrained('users')->cascadeOnDelete();
            $table->foreignId('receiver')->constrained('users')->cascadeOnDelete();
            $table->text('latestmessage')->nullable();
            $table->timestamp('latestdate')->nullable();
            $table->timestamps();

            // Une seule "room" entre deux utilisateurs donnés
            $table->unique(['sender', 'receiver']);
            $table->index('latestdate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('echanges');
    }
};
