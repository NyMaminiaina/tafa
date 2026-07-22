<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Requests\api\RegistrationRequest;
use App\Models\User;
use App\Models\Image;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;

class RegistrationController extends Controller
{

    //inscription 
    public function register(RegistrationRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $data = $request->validated();
            $data['password'] = Hash::make($data['password']);
            $newUser = User::create($data);
            $newUser->created_by_admin = $request->has('created_by_admin') ? 1 : 0;
            $newUser->save();
            $profile = $newUser->profile()->create($data);
            $profile->telephone = $request->phone;
            $profile->save();

            if ($request->has('interests')) {
                $profile->interests()->attach($request->input('interests'));
            }

            if ($request->hasFile('file')) {
                foreach ($request->file('file') as $index => $file) {
                    $filename = uniqid() . '_' . time() . '.' . $file->getClientOriginalExtension();
                    $destinationPath = public_path('profiles_images');
                    if (!file_exists($destinationPath)) {
                        mkdir($destinationPath, 0755, true);
                    }
                    $file->move($destinationPath, $filename);
                    Image::create([
                        'profile_id' => $profile->id,
                        'path' => '/profiles_images/' . $filename,
                        'is_primary' => $index === 0,
                    ]);
                }
            }

            $emailVerificationEnabled = config('app.email_verification_enabled', true);
            if ($emailVerificationEnabled) {
                $this->sendVerificationEmail($newUser);
                $message = 'Compte créé avec succès. Veuillez vérifier votre email.';
            } else {
                $newUser->update(['email_verified_at' => now()]);
                $message = 'Compte créé avec succès.';
            }

            $token = $newUser->createToken('auth_token')->plainTextToken;
            $primaryImage = $profile->images()->where('is_primary', true)->first();
            $profile->load('images');

            return response()->json([
                'message' => $message,
                'user'    => $newUser,
                'image'   => $primaryImage ? $primaryImage->path : null,
                'token'   => $token,
                'email_verification_required' => $emailVerificationEnabled,
            ], 201);
        });
    }

    // Générer et envoyer un code de vérification par email à l'utilisateur
    private function sendVerificationEmail(User $user)
    {
        // Générer un code de vérification à 6 chiffres
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Supprimer les anciens codes
        DB::table('email_verifications')->where('email', $user->email)->delete();

        // Stocker le nouveau code
        DB::table('email_verifications')->insert([
            'email' => $user->email,
            'code' => $code,
            'created_at' => Carbon::now(),
        ]);

        // Envoyer l'email
        try {
            Mail::send('emails.verify-email', [
                'user' => $user,
                'code' => $code,
            ], function ($message) use ($user) {
                $message->to($user->email);
                $message->subject('Vérifiez votre adresse email - Tafa');
            });
        } catch (\Exception $e) {
            Log::error('Email verification failed: ' . $e->getMessage());
        }
    }

    // Vérifier le code de confirmation email et activer le compte utilisateur
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|string|size:6',
        ]);

        $verification = DB::table('email_verifications')
            ->where('email', $request->email)
            ->where('code', $request->code)
            ->first();

        if (!$verification) {
            return response()->json([
                'success' => false,
                'message' => 'Code de vérification invalide',
            ], 400);
        }

        // Vérifier si le code n'a pas expiré (15 minutes)
        $createdAt = Carbon::parse($verification->created_at);
        if ($createdAt->addMinutes(15)->isPast()) {
            DB::table('email_verifications')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Le code a expiré. Veuillez demander un nouveau code.',
            ], 400);
        }

        // Marquer l'email comme vérifié
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->update(['email_verified_at' => now()]);
        }

        // Supprimer le code utilisé
        DB::table('email_verifications')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Email vérifié avec succès !',
        ]);
    }

    // Renvoyer un nouveau code de vérification email à l'utilisateur
    public function resendVerificationCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé',
            ], 404);
        }

        if ($user->email_verified_at) {
            return response()->json([
                'success' => false,
                'message' => 'Email déjà vérifié',
            ], 400);
        }

        $this->sendVerificationEmail($user);

        return response()->json([
            'success' => true,
            'message' => 'Un nouveau code a été envoyé à votre adresse email',
        ]);
    }
}
