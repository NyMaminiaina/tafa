<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Like extends Model
{
    protected $table = 'likes';

    protected $fillable = [
        'user_id',
        'liked_user_id',
        'type'
    ];

    /**
     * Get the user who made the like
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who was liked
     */
    public function likedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'liked_user_id');
    }

    /**
     * Check if there's a mutual like (match)
     */
    public static function isMutualLike(int $userId, int $otherUserId): bool
    {
        $userLikedOther = self::where('user_id', $userId)
            ->where('liked_user_id', $otherUserId)
            ->whereIn('type', ['like', 'superlike'])
            ->exists();

        $otherLikedUser = self::where('user_id', $otherUserId)
            ->where('liked_user_id', $userId)
            ->whereIn('type', ['like', 'superlike'])
            ->exists();

        return $userLikedOther && $otherLikedUser;
    }
}
