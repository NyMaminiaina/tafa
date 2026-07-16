<?php
namespace App\Http\Resources;

use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
    //   dd($this->images);
        return [
           
            'id' => $this->id,//id profile
            'user_id' => $this->user_id,
            'name' => $this->user?->name,
            'first_name' => $this->user?->firstname,
            'email' => $this->user?->email,
            'sexe' => $this->sexe,
            'situation_amoureuse'=>$this->Situation_amoureuse,
            'relationship_type_id' => $this->relationship_type_id,
            'relations_rechercher' => $this->relationshipType?->name,
            'bio' => $this->bio,
            'city_id' => $this->city_id,
            'city' => $this->city ? [
                'id' => $this->city->id,
                'name' => $this->city->name,
                'latitude' => $this->city->latitude,
                'longitude' => $this->city->longitude,
            ] : null,
            'distance' => $this->distance ?? null,
            'taille'=>"1.60 m",
            'profession' => $this->profession,
            'date_de_naissance' => $this->date_de_naissance ? $this->date_de_naissance->format('d/m/Y') : null,
            'age' => $this->date_de_naissance 
                ? $this->date_de_naissance->age 
                : null,
            'last_active' => $this->last_active,
            'is_boosted' => (bool) $this->is_boosted,
            'interests' => $this->interests,
            'langues' => $this->langues ,
            'Zodiac_sign' => $this->zodiac_sign ?? null,
            'compatibility' => $this->compatibility ?? null,
            'images'=>ImageResource::collection($this->images)
        ];
    }
}
