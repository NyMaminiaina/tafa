<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyUsage extends Model
{
    protected $table = 'daily_usage';

    protected $fillable = [
        'user_id',
        'usage_date',
        'messages_count',
        'likes_count',
    ];

    protected $casts = [
        'usage_date' => 'date',
    ];

    /**
     * Get the user that owns this usage record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get or create a usage record for today for the given user.
     */
    public static function getOrCreateForToday(int $userId): self
    {
        return self::firstOrCreate(
            [
                'user_id' => $userId,
                'usage_date' => now()->toDateString(),
            ],
            [
                'messages_count' => 0,
                'likes_count' => 0,
            ]
        );
    }
}
