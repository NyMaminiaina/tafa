<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;


class AuthController extends Controller
{


    // Login utilisateur
    public function login(Request $request)
    {
        // Validation des inputs
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required'
        ]);
        // Vérifie si une utilisateur avec l'email existe
        $user = User::where('email', $request->email)->first();
        logger($user);
        // Si email ou mdp incorrect → error 401
        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response([
                'message' => 'Adresse e-mail ou mot de passe invalide'
            ], 401);
        }
        // Récupère l'image principale du profil de l'utilisateur
        $primaryImage = $user->profile->images()->where('is_primary', true)->first();
        // Génère un token Sanctum
        $token = $user->createToken("mobile")->plainTextToken;
        return response()->json([
            'message' => 'Connexion réussie.',
            'user'    => [
                'id'         => $user->id,
                'name'       => $user->name,
                'firstname' => $user->firstname,
                'email'      => $user->email,
            ],
            'image' => $primaryImage ? asset($primaryImage->path) : null,
            'token'   => $token,
        ], 201);
    }


    // Deconnection
    public function logout(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var PersonalAccessToken|null $token */
        $token = $user?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Déconnexion réussie.'
        ]);
    }

    // Modifier Mot de passe 
    public function changePassword(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Le mot de passe actuel est incorrect'
            ], 400);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password)
        ]);
        return response()->json([
            'success' => true,
            'message' => 'Mot de passe modifié avec succès'
        ]);
    }

    // Modifier email d'un utilisateur
    public function changeEmail(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $request->validate([
            'new_email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'required',
        ]);

        // Verify password
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe incorrect'
            ], 400);
        }

        // Check if email is already taken
        $existingUser = User::where('email', $request->new_email)
            ->where('id', '!=', $user->id)
            ->first();

        if ($existingUser) {
            return response()->json([
                'success' => false,
                'message' => 'Cette adresse email est déjà utilisée'
            ], 400);
        }

        $emailVerificationEnabled = config('app.email_verification_enabled', true);

        $user->update([
            'email' => $request->new_email,
            'email_verified_at' => $emailVerificationEnabled ? null : now()
        ]);

        return response()->json([
            'success' => true,
            'message' => $emailVerificationEnabled
                ? 'Adresse email modifiée. Veuillez vérifier votre nouvel email.'
                : 'Adresse email modifiée avec succès',
            'email' => $request->new_email,
            'verification_required' => $emailVerificationEnabled
        ]);
    }

    // Récupère et retourne les informations de l’utilisateur actuellement connecté
    public function getUserInfo(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'firstname' => $user->firstname,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'is_admin' => $user->is_admin ?? false,
        ]);
    }

    // Génère un token et un code OTP pour réinitialiser le mot de passe puis envoie un email avec le lien de réinitialisation
    public function forgotPassword(Request $request)
    {
        logger('Received forgot password request for email: ' . $request->email);
        $request->validate([
            'email' => 'required|email',
        ]);


        $user = User::where('email', $request->email)->first();
        $resetUrl = null;
        if (!$user) {

            return response()->json([
                'success' => true,
                'message' => 'Si cette adresse email existe, vous recevrez un code de réinitialisation.',

            ]);
        }
        // Generate reset token and otp (6-digit code)
        $token = Str::random(64);
        $otp = rand(100000, 999999);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'otp' => $otp,
            'created_at' => Carbon::now()
        ]);

        // Create reset URL (frontend URL)
        $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $token . '&email=' . urlencode($request->email);
        try {

            // Mail::to($request->email)->send(new ResetPasswordMail(
            //     $resetUrl,
            //     $otp,
            //     $user
            // ));
            $response = Http::withHeaders([
                'accept' => 'application/json',
                'api-key' => env('BREVO_API_KEY'),
                'content-type' => 'application/json',
            ])->post('https://api.brevo.com/v3/smtp/email', [

                'sender' => [
                    'name' => 'TAFA',
                    'email' => 'franchmalalatina@gmail.com'
                ],

                'to' => [
                    [
                        'email' => $request->email
                    ]
                ],

                'subject' => 'Code de réinitialisation TAFA',

                'htmlContent' => "
                    <h2>TAFA</h2>
            
                    <p>Bonjour " . htmlspecialchars($user->firstname ?? '', ENT_QUOTES, 'UTF-8') . ",</p>
            
                    <p>Votre code de réinitialisation est :</p>
            
                    <h1 style='font-size:40px;color:#2563eb'>
                        {$otp}
                    </h1>
            
                    <p>
                        Ce code est valable pendant 1 heure.
                    </p>
            
                    <p>
                        Si vous n'avez pas demandé cette réinitialisation,
                        ignorez cet email.
                    </p>
                "
            ]);

            Log::info($response->body());
            if (!$response->successful()) {
                Log::error('Brevo Error: ' . $response->body());

                return response()->json([
                    'success' => false,
                    'message' => 'Erreur lors de l\'envoi de l\'email',
                    'brevo' => $response->body()
                ], 500);
            }
        } catch (\Exception $e) {
            // If mail fails, still return success but log the error
            Log::error('Password reset email failed: ' . $e->getMessage());

            if (config('app.debug')) {
                return response()->json([
                    'success' => true,
                    'message' => 'Lien de réinitialisation généré (mode debug)',
                    'debug_reset_url' => $resetUrl
                ]);
            }
        }
        logger('Password reset URL: ' . $resetUrl);

        return response()->json([
            'success' => true,
            'message' => 'Si cette adresse email existe, vous recevrez un lien de réinitialisation.',
            // 'debug_reset_url' => $resetUrl
        ]);
    }

    // Vérifie le token de réinitialisation puis met à jour le mot de passe de l’utilisateur
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|min:8|confirmed',
        ]);

        // Find the reset token
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Lien de réinitialisation invalide ou expiré'
            ], 400);
        }

        // Check if token is expired (1 hour)
        $createdAt = Carbon::parse($resetRecord->created_at);
        if ($createdAt->addHour()->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Le lien de réinitialisation a expiré'
            ], 400);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Lien de réinitialisation invalide'
            ], 400);
        }

        // Update user password
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Delete the reset token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès'
        ]);
    }

    // Vérifie si le token de réinitialisation est valide et non expiré
    public function verifyResetToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
        ]);

        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'valid' => false,
                'message' => 'Lien invalide ou expiré'
            ]);
        }

        // Check expiration
        $createdAt = Carbon::parse($resetRecord->created_at);
        if ($createdAt->addHour()->isPast()) {
            return response()->json([
                'valid' => false,
                'message' => 'Le lien a expiré'
            ]);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'valid' => false,
                'message' => 'Lien invalide'
            ]);
        }

        return response()->json([
            'valid' => true,
            'message' => 'Token valide'
        ]);
    }

    // Vérifie le code OTP puis génère un nouveau token pour permettre la réinitialisation du mot de passe
    public function verifyOtp(Request $request)
    {
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'valid' => false,
                'message' => 'Une erreur est survenue. Veuillez réessayer.'
            ]);
        }

        // Check expiration
        $createdAt = Carbon::parse($resetRecord->created_at);
        if ($createdAt->addHour()->isPast()) {
            return response()->json([
                'valid' => false,
                'message' => 'Le code OTP a expiré'
            ]);
        }

        // Verify OTP
        if ($request->code != $resetRecord->otp) {
            return response()->json([
                'valid' => false,
                'message' => 'Code OTP invalide'
            ]);
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->update([
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]);

        return response()->json([
            'valid' => true,
            'token' => $token,
            'message' => 'Code OTP valide'
        ]);
    }

    // Vérifie le token issu du code OTP puis met à jour le mot de passe de l’utilisateur
    public function passwordResetByOtp(Request $request)
    {
        // Find the reset token
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Lien de réinitialisation invalide ou expiré'
            ], 400);
        }

        // Check if token is expired (1 hour)
        $createdAt = Carbon::parse($resetRecord->created_at);
        if ($createdAt->addHour()->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json([
                'success' => false,
                'message' => 'Le lien de réinitialisation a expiré'
            ], 400);
        }

        // Verify token
        if (!Hash::check($request->token, $resetRecord->token)) {
            return response()->json([
                'success' => false,
                'message' => 'Lien de réinitialisation invalide'
            ], 400);
        }

        // Update user password

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non trouvé'
            ], 404);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        // Delete the reset token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès'
        ]);
    }
}