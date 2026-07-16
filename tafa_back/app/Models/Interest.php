<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interest extends Model
{
    protected $table = 'interests';
    protected $fillable = ['id','name'];
    protected $hidden = ['pivot'];

    public function profiles()
{
    return $this->belongsToMany(
        Profile::class,
        'profile_interests',
        'interest_id',
        'profile_id'
    );
}

}
