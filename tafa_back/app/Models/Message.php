<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    protected $fillable = [
        'id_echange',
        'sender_id',
        'receiver_id',
        'related_user_id',
        'content',
        'read_at',
        'deleted_for_users',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * L'expéditeur du message
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    /**
     * Le destinataire du message
     */
    public function receiver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }

    /**
     * Pour les messages envoyés par Tafa (notification de match) : le
     * VRAI utilisateur concerné, permettant d'ouvrir la conversation
     * réelle en cliquant sur son nom.
     */
    public function relatedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'related_user_id');
    }

    /**
     * La "room" (echange) à laquelle appartient ce message
     */
    public function echange(): BelongsTo
    {
        return $this->belongsTo(Echange::class, 'id_echange');
    }
}