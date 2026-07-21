<?php

use App\Http\Controllers\api\AuthController;
use App\Http\Controllers\api\ProfileController as ApiProfileController;
use App\Http\Controllers\api\RegistrationController;
use App\Http\Controllers\api\ImageController;
use App\Http\Controllers\api\MessageController;
use App\Http\Controllers\api\LikeController;
use App\Http\Controllers\api\UserActionsController;
use App\Http\Controllers\api\PaymentController;
use App\Http\Controllers\api\AdminController;
use App\Models\Conversation;
use App\Models\City;

// use Illuminate\Container\Attributes\DB;
use Illuminate\Support\Facades\Route;

// Route de test pour inserer une messages
Route::get("/test", function () {
    // dd("test");
    $conversation = Conversation::find(10);
    dd($conversation);
    $message = $conversation->messages()->create([
        'sender_id' => 289,
        'content' => 'Bien reçu, merci !',
    ]);
    $conversation->update([
        'last_message_at' => $message->created_at,
    ]);
    return response()->json($message);
});



// Route de test email
use Illuminate\Support\Facades\Mail;

Route::get('/test-mail', function () {
    Mail::raw('Test email', function ($message) {
        $message->to('test@example.com')->subject('Test Mailtrap');
    });

    return "Email envoyé";
});

// Route pour l'inscription
Route::post('/register', [RegistrationController::class, 'register'])->middleware('throttle:10,1');
// Route pour vérifier si un email existe déjà
Route::get('/check-email', function (Illuminate\Http\Request $request) {
    $exists = \App\Models\User::where('email', $request->email)->exists();
    return response()->json(['exists' => $exists]);
});

// Route pour vérifier si un téléphone existe déjà
Route::get('/check-phone', function (Illuminate\Http\Request $request) {
    $exists = \App\Models\Profile::where('telephone', $request->phone)->exists();
    return response()->json(['exists' => $exists]);
});

// Route pour la connexion
// throttle:6,1 → max 6 tentatives par minute et par IP, pour limiter le brute-force
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:6,1');

// Routes pour vérification email (publiques)
Route::post('/verify-email', [RegistrationController::class, 'verifyEmail']);
Route::post('/resend-verification', [RegistrationController::class, 'resendVerificationCode']);

// Routes pour réinitialisation de mot de passe (publiques)
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/verify-reset-token', [AuthController::class, 'verifyResetToken']);
//route pour vérifier le code OTP app
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);
Route::post('/password-reset', [AuthController::class, 'passwordResetByOtp']);





// Routes protégées
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [ApiProfileController::class, 'show']);
    Route::get('/profiles', [ApiProfileController::class, 'getProfiles']);

    Route::get('/profile', [ApiProfileController::class, 'show']); // Route pour afficher le profil de l'utilisateur connecté
    Route::put('/profile', [ApiProfileController::class, 'update']); // Route pour mettre à jour le profil
    Route::put('/profile/location', [ApiProfileController::class, 'updateLocation']); // Route pour mettre à jour la localisation GPS



    Route::get('/profiles/nearby-online', [ApiProfileController::class, 'getNearbyOnline']); // Route pour les utilisateurs en ligne à proximité
    Route::get('/profiles/{id}', [ApiProfileController::class, 'getProfileById']); // Route pour récupérer un profil par ID
    Route::get('/profile/stats', [ApiProfileController::class, 'getStats']); // Route pour les statistiques du profil
    Route::post('/profiles/{id}/view', [ApiProfileController::class, 'recordView']); // Route pour enregistrer une vue de profil
    Route::post('/logout', [AuthController::class, 'logout']); // Route pour la déconnexion

    // Routes pour les paramètres de compte
    Route::post('/change-password', [AuthController::class, 'changePassword']);
    Route::post('/change-email', [AuthController::class, 'changeEmail']);
    Route::get('/user-info', [AuthController::class, 'getUserInfo']);

    // Routes pour les images
    Route::post('/images/upload', [ImageController::class, 'upload']);
    Route::delete('/images/{id}', [ImageController::class, 'delete']);
    Route::put('/images/{id}/primary', [ImageController::class, 'setPrimary']);
    Route::post('/images/{id}/replace', [ImageController::class, 'replace']);
    Route::get('/images', [ImageController::class, 'getAllImages']);






    // Routes pour les messages
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/conversations', [MessageController::class, 'getConversations']); // 1. Récupérer la liste des personnes avec qui on discute
        Route::get('/messages/{receiverId}', [MessageController::class, 'getMessages']); // 2. Récupérer les messages avec un utilisateur spécifique (:receiverId)
        Route::post('/messages/send', [MessageController::class, 'sendMessage']); // 3. Envoyer un message (POST)
        Route::delete('/messages/{messageId}', [MessageController::class, 'deleteMessageForMe']); // 4. Supprimer un message (Optionnel)
    });

    Route::post('/conversations/start', [MessageController::class, 'startConversation']);
    Route::delete('/messages/{id}/for-me', [MessageController::class, 'deleteForMe']);
    Route::delete('/messages/{id}/for-all', [MessageController::class, 'deleteForAll']);



    // Routes pour les likes
    Route::post('/likes/{id}', [LikeController::class, 'likeProfile']);
    Route::post('/dislikes/{id}', [LikeController::class, 'dislikeProfile']);
    Route::post('/superlikes/{id}', [LikeController::class, 'superLikeProfile']);
    Route::delete('/likes/{id}', [LikeController::class, 'unlikeProfile']);
    Route::get('/likes', [LikeController::class, 'getLikes']);
    Route::get('/top-picks', [LikeController::class, 'getTopPicks']);
    Route::get('/matches', [LikeController::class, 'getMatches']);
    Route::get('/recommended', [LikeController::class, 'getRecommended']);

    // Routes pour les actions utilisateur (block, report, notifications)
    Route::post('/users/{id}/block', [UserActionsController::class, 'blockUser']);
    Route::delete('/users/{id}/block', [UserActionsController::class, 'unblockUser']);
    Route::get('/users/blocked', [UserActionsController::class, 'getBlockedUsers']);
    Route::post('/users/{id}/report', [UserActionsController::class, 'reportUser']);
    Route::put('/conversations/{id}/notifications', [UserActionsController::class, 'toggleNotifications']);
    Route::get('/conversations/{id}/notifications', [UserActionsController::class, 'getNotificationStatus']);
    Route::delete('/account', [UserActionsController::class, 'deleteAccount']);

    // Routes pour les paiements et abonnements
    Route::post('/payments/initiate', [PaymentController::class, 'initiatePayment']);
    Route::get('/payments/status/{transactionId}', [PaymentController::class, 'checkStatus']);
    Route::get('/subscription', [PaymentController::class, 'getSubscription']);
    Route::post('/boost/activate', [PaymentController::class, 'activateBoost']);

    Route::get('/admin/payments', [PaymentController::class, 'getAllPayments']);
    Route::post('/admin/payments/{id}/accept', [PaymentController::class, 'acceptPayment']);
    Route::post('/admin/payments/{id}/reject', [PaymentController::class, 'rejectPayment']);

    Route::get('/cities', function () {
        return response()->json([
            'cities' => City::select('id', 'name')->orderBy('name')->get()
        ]);
    });
});

Route::get('/admin/subscriptions', [AdminController::class, 'getSubscriptions']);
// Webhook routes (no auth required - verified by signature)
Route::post('/payments/webhook/{provider}', [PaymentController::class, 'handleWebhook']);

// Admin routes
Route::prefix('admin')->group(function () {
    // Admin login (public)
    Route::post('/login', [AdminController::class, 'login']);

    // Protected admin routes
    Route::middleware(['auth:sanctum'])->group(function () {
        Route::post('/logout', [AdminController::class, 'logout']);
        Route::get('/statistics', [AdminController::class, 'getStatistics']);
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::get('/users/{id}', [AdminController::class, 'getUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/reports', [AdminController::class, 'getReports']);
        Route::put('/reports/{id}', [AdminController::class, 'updateReport']);
        Route::get('/blocks', [AdminController::class, 'getBlocks']);
        Route::get('/conversations', [AdminController::class, 'getConversations']);

        Route::get('/created-accounts', [AdminController::class, 'getCreatedAccounts']);
        Route::post('/send-message-as', [MessageController::class, 'sendMessageAsUser']);
    });
});
