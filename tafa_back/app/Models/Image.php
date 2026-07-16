<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Image extends Model
{
    use HasFactory;

    protected $fillable = ['profile_id','path','is_primary'];

    protected $appends = ['url'];

    public function profile()
    {
        return $this->belongsTo(Profile::class);
    }

    public function getUrlAttribute()
    {
        return asset($this->path);
    }
}
