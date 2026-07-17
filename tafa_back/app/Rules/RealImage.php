<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class RealImage implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Vérifier que c'est bien une image
        $image = @getimagesize($value->getPathname());

        if (!$image) {
            $fail('Le fichier n\'est pas une image valide.');
            return;
        }

        $width = $image[0];
        $height = $image[1];

        // Vérifier les dimensions minimales (200x200)
        if ($width < 200 || $height < 200) {
            $fail('L\'image doit faire au moins 200x200 pixels.');
            return;
        }

        // Vérifier le ratio (pas trop extrême)
        $ratio = $width / $height;
        if ($ratio < 0.3 || $ratio > 3) {
            $fail('Le ratio de l\'image n\'est pas valide.');
            return;
        }
    }
}
