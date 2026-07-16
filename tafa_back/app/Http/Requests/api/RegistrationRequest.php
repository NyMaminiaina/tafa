<?php

namespace App\Http\Requests\api;

use Illuminate\Foundation\Http\FormRequest;

class RegistrationRequest extends FormRequest
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
        "firstname"=>"required",
        "name"=>"required",
        "date_de_naissance"=>"required|date|before_or_equal:" . now()->subYears(18)->format('Y-m-d'),
        "phone"=>"",
        "Situation_amoureuse"=>"required",
        "relationship_type_id" => "required|exists:relationship_types,id", //
        "sexe"=>"required",
        "genre_id"=>"required",
        "email"=>"required|email|unique:users,email",
        "password"=>"required|min:6|confirmed",
        'file.*' => 'nullable|image|max:5120',
        'interests' => 'nullable|array|min:3|max:6',
        'interests.*' => 'integer|exists:interests,id', // Vérifie que l'ID est un nombre et existe en BDD
        'langue_id' => 'nullable|integer|exists:langues,id',
        ];
    }

    /**
     * Get custom error messages for validation rules.
     */
    public function messages(): array
    {
        return [
            'date_de_naissance.before_or_equal' => 'Vous devez avoir au moins 18 ans pour vous inscrire.',
        ];
    }
}
