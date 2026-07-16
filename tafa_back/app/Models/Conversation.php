<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $fillable = [
        'user_one_id',
        'user_two_id',
        'last_message_at',
        'user_one_muted',
        'user_two_muted',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    /**
     * Get the first user in the conversation
     */
    public function userOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_one_id');
    }

    /**
     * Get the second user in the conversation
     */
    public function userTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_two_id');
    }

    /**
     * Get all messages in this conversation
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    /**
     * Get the latest message in the conversation
     */
    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    /**
     * Get the other user in the conversation
     */
    public function getOtherUser(int $currentUserId): User
    {
        return $this->user_one_id === $currentUserId ? $this->userTwo : $this->userOne;
    }

    /**
     * Check if a user is part of this conversation
     */
    public function hasUser(int $userId): bool
    {
        return $this->user_one_id === $userId || $this->user_two_id === $userId;
    }

    /**
     * Get unread messages count for a user
     */
    public function unreadCount(int $userId): int
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }

    /**
     * Find or create a conversation between two users
     */
    public static function findOrCreateBetween(int $userOneId, int $userTwoId): self
    {
        // Always store the smaller ID first to ensure uniqueness
        $ids = [$userOneId, $userTwoId];
        sort($ids);

        return self::firstOrCreate(
            ['user_one_id' => $ids[0], 'user_two_id' => $ids[1]],
            ['last_message_at' => now()]
        );
    }

    /**
     * Find a conversation between two users
     */
    public static function findBetween(int $userOneId, int $userTwoId): ?self
    {
        $ids = [$userOneId, $userTwoId];
        sort($ids);

        return self::where('user_one_id', $ids[0])
            ->where('user_two_id', $ids[1])
            ->first();
    }
}
