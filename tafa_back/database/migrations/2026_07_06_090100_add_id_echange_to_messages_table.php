<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->foreignId('id_echange')
                ->nullable()
                ->after('id')
                ->constrained('echanges')
                ->nullOnDelete();
        });

        // Backfill : on crée un "echange" (room) pour chaque paire
        // sender/receiver déjà existante dans messages, puis on relie
        // chaque message à sa room via id_echange.
        $pairs = DB::table('messages')
            ->select(
                DB::raw('LEAST(sender_id, receiver_id) as user_a'),
                DB::raw('GREATEST(sender_id, receiver_id) as user_b')
            )
            ->distinct()
            ->get();

        foreach ($pairs as $pair) {
            $lastMessage = DB::table('messages')
                ->where(function ($q) use ($pair) {
                    $q->where('sender_id', $pair->user_a)->where('receiver_id', $pair->user_b);
                })
                ->orWhere(function ($q) use ($pair) {
                    $q->where('sender_id', $pair->user_b)->where('receiver_id', $pair->user_a);
                })
                ->orderByDesc('created_at')
                ->first();

            $echangeId = DB::table('echanges')->insertGetId([
                'sender' => $pair->user_a,
                'receiver' => $pair->user_b,
                'latestmessage' => $lastMessage->content ?? null,
                'latestdate' => $lastMessage->created_at ?? null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('messages')
                ->where(function ($q) use ($pair) {
                    $q->where('sender_id', $pair->user_a)->where('receiver_id', $pair->user_b);
                })
                ->orWhere(function ($q) use ($pair) {
                    $q->where('sender_id', $pair->user_b)->where('receiver_id', $pair->user_a);
                })
                ->update(['id_echange' => $echangeId]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropForeign(['id_echange']);
            $table->dropColumn('id_echange');
        });
    }
};
