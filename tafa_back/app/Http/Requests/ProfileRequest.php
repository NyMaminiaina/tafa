<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
        // "user_id"=>"required",
        "genre_id"=>"required",
        "prenom"=>"required",
        "name"=>"required",
        "date_de_naissance"=>"required|date",
        "phone"=>"",
        "Situation_amoureuse"=>"required",
        "sexe"=>"required", 
        ];
    }
}
