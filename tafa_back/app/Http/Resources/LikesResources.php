<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LikesResources extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        
        return [
            'id' => $this->user_id,
            'name' => $this->user->name ?? 'Anonyme',
            'age' => $this->user->profile->calculateAge($this->user->profile->date_de_naissance) ,
            'distance' => 'À proximité',
        
            'photo' => $this->user->profile->images->where('is_primary', true)->first()?->url ?? null,
            
            'job' => $this->user->profile->profession,
        ];
    }
}
