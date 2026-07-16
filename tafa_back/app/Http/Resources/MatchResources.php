<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MatchResources extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return 
        [
            'id'=>$this->id,
            'user_id' => $this->user_id, // 🔥 IMPORTANT
            'name'=>$this->user->name,
            'age'=>"18",
            'photo'=>$this->images->where('is_primary', true)->first()?->url ?? null,
            'isOnline'=>true,
            'isNew'=>true,
        ];
    }
}
