<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Langues extends Model
{
    protected $table = 'langues';
    protected $fillable = ['id','name', 'code'];

    public function profile(){

        return $this->belongsToMany(Profile::class, 'profile_langues', 'langue_id', 'profile_id');
    }
}
