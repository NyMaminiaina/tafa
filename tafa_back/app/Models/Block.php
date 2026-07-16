<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Block extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'blocked_user_id',
    ];


    public function blocker()
{
    return $this->belongsTo(User::class, 'user_id');
}

public function blocked()
{
    return $this->belongsTo(User::class, 'blocked_user_id');
}

    /**
     * Check if a user has blocked another user
     */
    public static function isBlocked($userId, $blockedUserId): bool
    {
        return self::where('user_id', $userId)
            ->where('blocked_user_id', $blockedUserId)
            ->exists();
    }

    /**
     * Check if either user has blocked the other
     */
    public static function hasBlockBetween($userId1, $userId2): bool
    {
        return self::where(function ($query) use ($userId1, $userId2) {
            $query->where('user_id', $userId1)->where('blocked_user_id', $userId2);
        })->orWhere(function ($query) use ($userId1, $userId2) {
            $query->where('user_id', $userId2)->where('blocked_user_id', $userId1);
        })->exists();
    }
}
