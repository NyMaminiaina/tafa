<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Relationship_type extends Model
{
    protected $fillable = ['name'];

    public function profiles()
    {
        return $this->hasMany(Profile::class);
    }
}
