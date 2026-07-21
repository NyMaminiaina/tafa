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
     * Nettoyage des champs texte AVANT la validation.
     *
     * Protection XSS en profondeur : même si React échappe déjà l'affichage
     * côté front, on retire ici toute balise HTML/JS que quelqu'un pourrait
     * essayer d'enregistrer dans son prénom/nom (ex: "<script>...</script>"),
     * au cas où cette donnée soit un jour affichée ailleurs (email, PDF,
     * panel admin...) sans passer par l'échappement automatique de React.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'firstname' => $this->firstname ? strip_tags(trim($this->firstname)) : $this->firstname,
            'name' => $this->name ? strip_tags(trim($this->name)) : $this->name,
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "firstname" => "required",
            "name" => "required",
            "date_de_naissance" => "required|date|before_or_equal:" . now()->subYears(18)->format('Y-m-d'),
            "phone" => "",
            "Situation_amoureuse" => "required",
            "relationship_type_id" => "required|exists:relationship_types,id", //
            "sexe" => "required",
            "genre_id" => "required",
            "email" => "required|email|unique:users,email",
            "password" => "required|min:6|confirmed",
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
