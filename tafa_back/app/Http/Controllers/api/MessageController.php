<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Echange;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\MessageResource;

class MessageController extends Controller
{

    // Récupère la liste des conversations (echanges) de l'utilisateur connecté
    public function getConversations(): JsonResponse
    {
        /** @var \App\Models\User|null $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Non autorisé'], 401);
        }

        $userId = $user->id;

        $echanges = Echange::where('sender', $userId)
            ->orWhere('receiver', $userId)
            ->with([
                'senderUser.profile.images',
                'senderUser.profile.interests',
                'receiverUser.profile.images',
                'receiverUser.profile.interests',
                'latestMessageRecord.relatedUser',
            ])
            ->orderByDesc('latestdate')
            ->get();

        $conversations = MessageResource::collection($echanges)->resolve();

        return response()->json([
            'conversations' => $conversations
        ]);
    }

    // Récupère les messages entre l'utilisateur connecté et un autre utilisateur et les marque comme lus
 public function getMessages(int $receiverId, Request $request): JsonResponse
{
    /** @var \App\Models\User|null $user */
    $user = Auth::user();
    $userId = $user->id;

    // Mettre à jour ma dernière activité
    if ($user) {
        $user->last_seen = now();
        $user->save();
    }

    $echange = Echange::findBetween($userId, $receiverId);

    if (!$echange) {
        return response()->json([
            'messages' => [],
            'id_echange' => null,
            'last_seen' => null,
            'has_more' => false,
            'oldest_id' => null,
        ]);
    }

    $query = Message::where('id_echange', $echange->id)
        ->with('relatedUser.profile.images');

    $beforeId = $request->query('before_id');

    if ($beforeId) {
        // Charger les messages plus anciens que l'ID donné
        $beforeMessage = Message::find($beforeId);
        if (!$beforeMessage) {
            return response()->json(['error' => 'Message non trouvé'], 404);
        }

        $query->where('created_at', '<', $beforeMessage->created_at)
              ->orderBy('created_at', 'desc')
              ->limit(20);
    } else {
        // Charger les 20 derniers messages (les plus récents)
        $query->orderBy('created_at', 'desc')
              ->limit(20);
    }

    $messages = $query->get()
        ->filter(function ($msg) use ($userId) {
            $deletedFor = json_decode($msg->deleted_for_users, true);
            return !is_array($deletedFor) || !in_array($userId, $deletedFor);
        })
        ->map(function ($msg) use ($userId) {
            return [
                'id' => $msg->id,
                'content' => $msg->content,
                'id_echange' => $msg->id_echange,
                'sender_id' => $msg->sender_id,
                'receiver_id' => $msg->receiver_id,
                'related_user_id' => $msg->related_user_id,
                'related_user' => $msg->relatedUser ? [
                    'id' => $msg->relatedUser->id,
                    'name' => $msg->relatedUser->name,
                    'firstname' => $msg->relatedUser->firstname,
                    'avatar' => $msg->relatedUser->profile?->images->where('is_primary', true)->first()?->path,
                ] : null,
                'is_mine' => $msg->sender_id == $userId,
                'created_at' => $msg->created_at,
                'read_at' => $msg->read_at
            ];
        })
        ->values();

    // Pour le rendu, on veut l'ordre ascendant
    if ($beforeId) {
        // On a récupéré en DESC, on inverse
        $messages = $messages->reverse()->values();
    } else {
        // On a récupéré les derniers en DESC, on les remet en ASC pour l'affichage
        $messages = $messages->sortBy('created_at')->values();
    }

    // Déterminer s'il y a encore plus de messages anciens
    $hasMore = false;
    $oldestId = null;
    if ($messages->isNotEmpty()) {
        $oldestId = $messages->first()['id']; // le plus ancien du lot (après remise en ordre)
        $oldestCreatedAt = $messages->first()['created_at'];

        $hasMore = Message::where('id_echange', $echange->id)
            ->where('created_at', '<', $oldestCreatedAt)
            ->exists();
    }

    // Marquer les messages entrants comme lus (inchangé)
    Message::where('id_echange', $echange->id)
        ->where('sender_id', $receiverId)
        ->where('receiver_id', $userId)
        ->whereNull('read_at')
        ->update(['read_at' => now()]);

    $otherUser = User::find($receiverId);

    return response()->json([
        'messages' => $messages,
        'id_echange' => $echange->id,
        'last_seen' => $otherUser?->last_seen,
        'has_more' => $hasMore,
        'oldest_id' => $oldestId,
    ]);
}

    // Permet d'envoyer un message à un autre utilisateur (crée l'échange/room si besoin)
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'content' => 'required|string'
        ]);

        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        $userId = $user->id;
        $receiverId = (int) $request->receiver_id;

        $echange = Echange::findOrCreateBetween($userId, $receiverId);

        $message = Message::create([
            'id_echange' => $echange->id,
            'sender_id' => $userId,
            'receiver_id' => $receiverId,
            'content' => $request->content,
        ]);

        $echange->touchLatest($message->content, $message->created_at);

        return response()->json([
            'message' => [
                'id' => $message->id,
                'content' => $message->content,
                'id_echange' => $message->id_echange,
                'is_mine' => true,
                'created_at' => $message->created_at
            ]
        ]);
    }

    // Récupère les informations de l'utilisateur pour démarrer une conversation
    // et s'assure que la "room" (Echange) existe déjà entre les deux utilisateurs,
    // sans quoi elle est créée.
    public function startConversation(Request $request)
    {
        $request->validate(['receiver_id' => 'required|exists:users,id']);

        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        $receiverId = (int) $request->receiver_id;

        $otherUser = User::with(['profile.images', 'profile.interests'])->find($receiverId);

        // On vérifie si un échange existe déjà avant de le créer
        $existingEchange = Echange::findBetween($user->id, $receiverId);
        $isNew = $existingEchange === null;

        $echange = $existingEchange ?? Echange::findOrCreateBetween($user->id, $receiverId);

        // On récupère le chemin de l'image (colonne 'path' dans votre base)
        $avatarPath = null;

        if ($otherUser->profile && $otherUser->profile->images->isNotEmpty()) {
            $avatarPath = $otherUser->profile->images->first()->path;
        }

        return response()->json([
            'success' => true,
            'echange_id' => $echange->id,
            'is_new' => $isNew,
            'user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'firstname' => $otherUser->firstname,
                'avatar' => $avatarPath, // "storage/profiles_images/..."
                'profession' => $otherUser->profile->profession ?? null,
                'bio' => $otherUser->profile->bio ?? null,
                'interests' => $otherUser->profile->interests->pluck('name') ?? []
            ]
        ]);
    }

    // Supprimer Message pour moi
    public function deleteForMe($id)
    {
        $userId = Auth::id();

        $message = Message::findOrFail($id);

        // récupérer les ids existants
        $deletedFor = json_decode($message->deleted_for_users ?? '[]', true);

        // ajouter l'utilisateur si pas déjà présent
        if (!in_array($userId, $deletedFor)) {
            $deletedFor[] = $userId;
        }

        // sauvegarder
        $message->deleted_for_users = json_encode($deletedFor);
        $message->save();

        return response()->json([
            'success' => true
        ]);
    }

    // Supprimer Message pour tout le monde
    public function deleteForAll($id)
    {
        $userId = Auth::id();

        $message = Message::findOrFail($id);

        if ($message->sender_id != $userId) {
            return response()->json(['error' => 'Non autorisé'], 403);
        }

        $message->content = "Ce message a été supprimé";
        $message->save();

        // Si c'était le dernier message de la room, on met à jour l'aperçu
        if ($message->id_echange) {
            $echange = Echange::find($message->id_echange);
            $lastMessage = Message::where('id_echange', $message->id_echange)
                ->orderByDesc('created_at')
                ->first();

            if ($echange && $lastMessage) {
                $echange->touchLatest($lastMessage->content, $lastMessage->created_at);
            }
        }

        return response()->json([
            'success' => true,
            'message' => $message
        ]);
    }
}
