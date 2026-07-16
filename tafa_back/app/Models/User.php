<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Freemium limits for non-Gold users
     */
    const FREE_DAILY_MESSAGES = 10;
    const FREE_DAILY_LIKES = 10;
    const FREE_VISIBLE_LIKES_RECEIVED = 3;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'firstname',
        'email',
        'password',
        'is_admin',
        'is_system',
        'last_seen',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_system' => 'boolean',
        ];
    }

    /**
     * Check if user is an admin
     */
    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    /**
     * Récupère (ou crée si besoin) le compte système "Tafa", utilisé pour
     * envoyer les notifications de match. Il n'y a qu'un seul compte Tafa
     * dans toute l'application.
     */
    public static function tafaBot(): self
    {
        return static::firstOrCreate(
            ['is_system' => true],
            [
                'name' => 'Tafa',
                'firstname' => null,
                'email' => 'tafa@system.tafa.local',
                'password' => bcrypt(\Illuminate\Support\Str::random(40)),
                'is_admin' => false,
                'is_system' => true,
            ]
        );
    }

    // Un utilisateur possède un seul profil
    public function profile()
    {
        return $this->hasOne(Profile::class);
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class);
    }

    /**
     * Get all conversations where user is participant
     */
    public function conversations()
    {
        return Conversation::where('user_one_id', $this->id)
            ->orWhere('user_two_id', $this->id)
            ->orderBy('last_message_at', 'desc');
    }

    /**
     * Get all messages sent by this user
     */
    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Get likes made by this user
     */
    public function likes()
    {
        return $this->hasMany(Like::class, 'user_id');
    }

    /**
     * Get likes received by this user
     */
    public function receivedLikes()
    {
        return $this->hasMany(Like::class, 'liked_user_id');
    }

    /**
     * Get user's subscriptions
     */
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get user's active subscription
     */
    public function activeSubscription()
    {
        // On précise 'is_active', 1 pour être sûr de matcher le tinyint de MariaDB
        return $this->hasOne(Subscription::class, 'user_id')
            ->where('is_active', 1)
            ->where('expires_at', '>', now());
    }

    /**
     * Check if user has an active Tafa Gold subscription
     */
    public function isTafaGold(): bool
    {
        return $this->activeSubscription()->exists();
    }

    public function test()
    {
        return true;
    }

    /**
     * Get daily usage record for today
     */
    public function dailyUsage()
    {
        return $this->hasOne(DailyUsage::class)
            ->whereDate('usage_date', now()->toDateString());
    }

    /**
     * Get remaining messages for today
     */
    public function getRemainingMessages(): int
    {
        if ($this->isTafaGold()) {
            return PHP_INT_MAX;
        }
        $usage = DailyUsage::getOrCreateForToday($this->id);
        return max(0, self::FREE_DAILY_MESSAGES - $usage->messages_count);
    }

    /**
     * Get remaining likes for today
     */
    public function getRemainingLikes(): int
    {
        if ($this->isTafaGold()) {
            return PHP_INT_MAX;
        }
        $usage = DailyUsage::getOrCreateForToday($this->id);
        return max(0, self::FREE_DAILY_LIKES - $usage->likes_count);
    }

    /**
     * Check if user can send a message
     */
    public function canSendMessage(): bool
    {
        return $this->isTafaGold() || $this->getRemainingMessages() > 0;
    }

    /**
     * Check if user can like a profile
     */
    public function canLike(): bool
    {
        return $this->isTafaGold() || $this->getRemainingLikes() > 0;
    }

    /**
     * Increment message count for today
     */
    public function incrementMessageCount(): void
    {
        $usage = DailyUsage::getOrCreateForToday($this->id);
        $usage->increment('messages_count');
    }

    /**
     * Increment like count for today
     */
    public function incrementLikeCount(): void
    {
        $usage = DailyUsage::getOrCreateForToday($this->id);
        $usage->increment('likes_count');
    }
}
