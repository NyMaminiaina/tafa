<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Block;
use App\Models\Like;
use App\Models\Report;
use App\Models\User;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserActionsController extends Controller
{

// Bloquer un utilisateur
    public function blockUser(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Check if target user exists
        $targetUser = User::find($id);
        if (!$targetUser) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Can't block yourself
        if ($user->id == $id) {
            return response()->json(['error' => 'Vous ne pouvez pas vous bloquer vous-même'], 400);
        }

        // Check if already blocked
        if (Block::isBlocked($user->id, $id)) {
            return response()->json(['error' => 'Utilisateur déjà bloqué'], 400);
        }

        // Create block
        $block = Block::create([
            'user_id' => $user->id,
            'blocked_user_id' => $id,
        ]);

        return response()->json([
            'message' => 'Utilisateur bloqué avec succès',
            'block' => $block
        ], 200);
    }

// Debloquer un utilisateur
    public function unblockUser(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $deleted = Block::where('user_id', $user->id)
            ->where('blocked_user_id', $id)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Utilisateur débloqué']);
        }

        return response()->json(['error' => 'Blocage non trouvé'], 404);
    }

// Récupérer la liste des utilisateurs bloqués par l'utilisateur connecté
    public function getBlockedUsers(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $blocks = Block::where('user_id', $user->id)
            ->with('blockedUser.profile')
            ->get();

        $blockedUsers = $blocks->map(function ($block) {
            $profile = $block->blockedUser->profile;
            return [
                'id' => $block->blockedUser->id,
                'name' => $profile ? ($profile->prenom ?? $profile->name ?? 'Anonyme') : 'Anonyme',
                'blocked_at' => $block->created_at->diffForHumans(),
            ];
        });

        return response()->json([
            'blocked_users' => $blockedUsers,
            'count' => $blockedUsers->count()
        ]);
    }

// Signaler un utilisateur
    public function reportUser(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Validate reason
        $validated = $request->validate([
            'reason' => 'required|string|min:10|max:1000',
        ]);

        // Check if target user exists
        $targetUser = User::find($id);
        if (!$targetUser) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Can't report yourself
        if ($user->id == $id) {
            return response()->json(['error' => 'Vous ne pouvez pas vous signaler vous-même'], 400);
        }

        // Create report
        $report = Report::create([
            'reporter_id' => $user->id,
            'reported_user_id' => $id,
            'reason' => $validated['reason'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Signalement envoyé avec succès. Notre équipe va examiner ce compte.',
            'report' => $report
        ], 200);
    }

// Activer ou désactiver les notifications d'une conversation
    public function toggleNotifications(Request $request, $conversationId)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return response()->json(['error' => 'Conversation non trouvée'], 404);
        }

        // Check if user is part of the conversation
        if ($conversation->user_one_id !== $user->id && $conversation->user_two_id !== $user->id) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        // Determine which muted field to update
        if ($conversation->user_one_id === $user->id) {
            $conversation->user_one_muted = !$conversation->user_one_muted;
            $isMuted = $conversation->user_one_muted;
        } else {
            $conversation->user_two_muted = !$conversation->user_two_muted;
            $isMuted = $conversation->user_two_muted;
        }

        $conversation->save();

        return response()->json([
            'message' => $isMuted ? 'Notifications désactivées' : 'Notifications activées',
            'is_muted' => $isMuted
        ]);
    }

// Récupérer l'état des notifications d'une conversation
    public function getNotificationStatus(Request $request, $conversationId)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $conversation = Conversation::find($conversationId);

        if (!$conversation) {
            return response()->json(['error' => 'Conversation non trouvée'], 404);
        }

        // Check if user is part of the conversation
        if ($conversation->user_one_id !== $user->id && $conversation->user_two_id !== $user->id) {
            return response()->json(['error' => 'Accès non autorisé'], 403);
        }

        $isMuted = $conversation->user_one_id === $user->id
            ? $conversation->user_one_muted
            : $conversation->user_two_muted;

        return response()->json([
            'is_muted' => $isMuted
        ]);
    }

// Supprimer le compte utilisateur ainsi que toutes ses données associées
public function deleteAccount(Request $request)
{
    $user = $request->user();

    if (!$user) {
        return response()->json(['error' => 'Non authentifié'], 401);
    }

    $validated = $request->validate([
        'password' => 'required|string',
    ]);

    if (!Hash::check($validated['password'], $user->password)) {
        return response()->json(['error' => 'Mot de passe incorrect'], 401);
    }

    try {
        DB::beginTransaction();

        if ($user->profile) {
            $user->profile->images()->delete();
            $user->profile->delete();
        }

        Like::where('user_id', $user->id)
            ->orWhere('liked_user_id', $user->id)
            ->delete();

        Block::where('user_id', $user->id)
            ->orWhere('blocked_user_id', $user->id)
            ->delete();

        Report::where('reporter_id', $user->id)
            ->orWhere('reported_user_id', $user->id)
            ->delete();

        // ✅ supprimer tous les messages liés à l'utilisateur
        Message::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->delete();

        if (method_exists($user, 'subscriptions')) {
            $user->subscriptions()->delete();
        }

        $user->tokens()->delete();
        $user->delete();

        DB::commit();

        return response()->json([
            'success' => true,
            'message' => 'Votre compte a été supprimé avec succès.'
        ]);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'error' => 'Erreur lors de la suppression du compte: ' . $e->getMessage()
        ], 500);
    }
}
}
