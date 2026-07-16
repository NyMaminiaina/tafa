<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    use HasFactory;
    protected $fillable = [
        'user_id',
        'date_de_naissance',
        'Situation_amoureuse',
        'relationship_type_id',
        'sexe',
        'bio',
        'profession',
        'last_active',
        'localisation',
        'city_id',
        'latitude',
        'longitude',
        'location_enabled',
        'is_boosted',
        'boost_expires_at',
        'telephone',
    ];

    protected $casts = [
        // 'interests' => 'array',
        'last_active' => 'datetime',
        'date_de_naissance' => 'date',
    ];


    public function calculateAge($dateOfBirth): ?int
    {
        if (!$dateOfBirth) {
            return null;
        }

        try {
            $birthDate = \Carbon\Carbon::parse($dateOfBirth);
            $age = now()->diffInYears($birthDate);
            // Only return age if it's reasonable (between 18 and 120)
            if ($age >= 18 && $age <= 120) {
                return $age;
            }
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }


    public function city()
    {
        return $this->belongsTo(City::class, 'city_id');
    }

    public function images()
    {
        return $this->hasMany(Image::class);
    }

    /**
     * Get the genre (relationship intention) for this profile
     */
    public function relationshipType()
    {
        return $this->belongsTo(Relationship_type::class);
    }

    public function langues()
    {
        return $this->belongsToMany(Langues::class, 'profile_langues', 'profile_id', 'langue_id');
    }
    public function interests()
    {
        return $this->belongsToMany(
            Interest::class,
            'profile_interests',   //table pivot
            'profile_id',         // FK profile
            'interest_id'         // FK interest
        );
    }
}
