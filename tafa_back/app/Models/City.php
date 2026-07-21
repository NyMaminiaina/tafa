<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class City extends Model
{
    protected $fillable = [
        'name',
        'country',
        'latitude',
        'longitude',
    ];

    public function profile(){
        return $this->hasMany(Profile::class);
    }
}