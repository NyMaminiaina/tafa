<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Un "Echange" représente une salle de discussion (message room) entre
 * deux utilisateurs (sender / receiver). Chaque Message appartient à un
 * Echange via la colonne messages.id_echange.
 */
class Echange extends Model
{
    protected $table = 'echanges';

    protected $fillable = [
        'sender',
        'receiver',
        'latestmessage',
        'latestdate',
    ];

    protected $casts = [
        'latestdate' => 'datetime',
        'sender' => 'integer',
        'receiver' => 'integer',
    ];

    /**
     * L'utilisateur qui a initié l'échange.
     */
    public function senderUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender');
    }

    /**
     * L'utilisateur qui reçoit l'échange.
     */
    public function receiverUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver');
    }

    /**
     * Tous les messages de cette room, du plus ancien au plus récent.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'id_echange')->orderBy('created_at', 'asc');
    }

    /**
     * Le tout dernier message envoyé dans cette room (peu importe qui l'a créée).
     */
    public function latestMessageRecord(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Message::class, 'id_echange')->latestOfMany('created_at');
    }

    /**
     * Renvoie l'autre utilisateur par rapport à $userId.
     */
    public function getOtherUser(int $userId): ?User
    {
        return (int) $this->sender === $userId ? $this->receiverUser : $this->senderUser;
    }

    /**
     * true si $userId fait partie de cet échange.
     */
    public function hasUser(int $userId): bool
    {
        return (int) $this->sender === $userId || (int) $this->receiver === $userId;
    }

    /**
     * Met à jour l'aperçu du dernier message (contenu + date).
     */
    public function touchLatest(string $content, $date = null): void
    {
        $this->update([
            'latestmessage' => $content,
            'latestdate' => $date ?? now(),
        ]);
    }

    /**
     * Récupère (ou crée) l'échange/room entre deux utilisateurs.
     * L'ordre sender/receiver n'a pas d'importance pour la recherche :
     * la room est unique pour une paire d'utilisateurs donnée.
     */
    public static function findOrCreateBetween(int $userOneId, int $userTwoId): self
    {
        $existing = self::findBetween($userOneId, $userTwoId);

        if ($existing) {
            return $existing;
        }

        return self::create([
            'sender' => $userOneId,
            'receiver' => $userTwoId,
        ]);
    }

    /**
     * Recherche l'échange/room entre deux utilisateurs (peu importe l'ordre).
     */
    public static function findBetween(int $userOneId, int $userTwoId): ?self
    {
        return self::where(function ($q) use ($userOneId, $userTwoId) {
            $q->where('sender', $userOneId)->where('receiver', $userTwoId);
        })->orWhere(function ($q) use ($userOneId, $userTwoId) {
            $q->where('sender', $userTwoId)->where('receiver', $userOneId);
        })->first();
    }
}
