<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ImageResource;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use App\Rules\RealImage;


class ImageController extends Controller
{

    // Récupère toutes les images du profil de l’utilisateur connecté
    public function getAllImages(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([
                "error" => "non authentifier"
            ]);
        };
        $allimages = $user->profile->images;
        return [
            "images" => ImageResource::collection($allimages)
        ];
    }

    // upload image pour l’utilisateur connecté en respectant la limite et en l’enregistrant dans le profil
    public function upload(Request $request)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp,jfif', 'max:5120', new RealImage],
        ]);

        $user = Auth::user();
        $profile = $user->profile;

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $imageCount = $profile->images()->count();
        $makePrimary = $request->boolean('make_primary');

        // Si changement de PDP ET qu'on a déjà une photo principale → remplacer
        if ($makePrimary) {
            $existingPrimary = $profile->images()->where('is_primary', 1)->first();

            if ($existingPrimary) {
                // Supprimer l'ancien fichier
                $oldPath = public_path($existingPrimary->path);
                if (file_exists($oldPath)) {
                    unlink($oldPath);
                }

                // Upload nouvelle image
                $file = $request->file('image');
                $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
                $destinationPath = public_path('profiles_images');

                if (!file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }

                $file->move($destinationPath, $filename);

                // Mettre à jour l'image existante
                $existingPrimary->update([
                    'path' => '/profiles_images/' . $filename,
                ]);

                return response()->json([
                    'message' => 'Photo de profil mise à jour',
                    'image' => $existingPrimary->fresh(),
                ], 201);
            }
        }

        // Sinon, comportement normal (ajout nouvelle photo)
        if ($imageCount >= 6) {
            return response()->json(['message' => 'Maximum 6 images allowed'], 400);
        }

        $file = $request->file('image');
        $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
        $destinationPath = public_path('profiles_images');

        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        $file->move($destinationPath, $filename);
        $isFirst = $imageCount === 0;

        if ($makePrimary) {
            $profile->images()->update(['is_primary' => 0]);
        }

        $image = Image::create([
            'profile_id' => $profile->id,
            'path' => '/profiles_images/' . $filename,
            'is_primary' => ($isFirst || $makePrimary) ? 1 : 0,
        ]);

        return response()->json([
            'message' => 'Image uploaded successfully',
            'image' => $image,
        ], 201);
    }

    // Supprimer une image
    public function delete($id)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $profile = $user->profile;

        $image = Image::where('id', $id)
            ->where('profile_id', $profile->id)
            ->first();

        if (!$image) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        // Delete the file from storage
        $storagePath = str_replace('/storage/', '', $image->path);
        if (Storage::disk('public')->exists($storagePath)) {
            Storage::disk('public')->delete($storagePath);
        }

        $wasPrimary = $image->is_primary;
        $image->delete();

        if ($wasPrimary) {
            $newPrimary = $profile->images()->first();
            if ($newPrimary) {
                $newPrimary->update(['is_primary' => 1]);
            }
        }

        return response()->json(['message' => 'Image deleted successfully']);
    }

    // Définit une image du profil comme image principale pour l’utilisateur connecté
    public function setPrimary($id)
    {


        /** @var \App\Models\User $user */
        $user = Auth::user();
        $profile = $user->profile;
        $oldPrimaryImage = $profile->images()->where('is_primary', 1)->first();

        $image = Image::where('id', $id)
            ->where('profile_id', $profile->id)
            ->first();

        if (!$image) {
            return response()->json(['message' => 'Image not found'], 404);
        }
        if ($oldPrimaryImage && $oldPrimaryImage->id === $image->id) {
            return response()->json(['message' => 'This image is already primary'], 400);
        }
        // Remove primary from all images
        $profile->images()->update(['is_primary' => 0]);

        // Set this image as primary
        $image->update(['is_primary' => 1]);

        return response()->json([
            'message' => 'Primary image updated',
            'image' => $image,
        ]);
    }

    // Remplace une image existante du profil par une nouvelle image pour l’utilisateur connecté
    public function replace(Request $request, $id)
    {
        $request->validate([
            'image' => ['required', 'image', 'mimes:jpeg,png,jpg,gif,webp,jfif', 'max:5120', new RealImage],
        ]);

        $user = Auth::user();
        $profile = $user->profile;

        $image = Image::where('id', $id)
            ->where('profile_id', $profile->id)
            ->first();

        if (!$image) {
            return response()->json(['message' => 'Image not found'], 404);
        }

        // 🔥 supprimer ancienne image
        $oldPath = public_path($image->path);
        if (file_exists($oldPath)) {
            unlink($oldPath);
        }

        $file = $request->file('image');

        $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();

        $destinationPath = public_path('storage/profiles_images');

        if (!file_exists($destinationPath)) {
            mkdir($destinationPath, 0755, true);
        }

        $file->move($destinationPath, $filename);

        $image->update([
            'path' => 'storage/profiles_images/' . $filename
        ]);

        return response()->json([
            'message' => 'Image replaced successfully',
            'image' => $image,
        ]);
    }
}
