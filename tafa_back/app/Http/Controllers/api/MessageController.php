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
    public function getMessages(int $receiverId): JsonResponse
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

        $messages = collect();

        if ($echange) {
            $perPage = (int) request()->get('per_page', 20);

            // Filtrer AVANT la pagination
            $messagesQuery = Message::where('id_echange', $echange->id)
                ->with('relatedUser.profile.images')
                ->orderBy('created_at', 'desc');

            $messages = $messagesQuery->paginate($perPage);

            // Formater les messages APRÈS pagination
            $formattedMessages = $messages->getCollection()
                ->filter(function ($msg) use ($userId) {
                    $deletedFor = json_decode($msg->deleted_for_users, true);
                    if (!is_array($deletedFor)) {
                        $deletedFor = [];
                    }
                    return !in_array($userId, $deletedFor);
                })
                ->values()
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
                });

            // Remplacer la collection dans le paginateur
            $messages->setCollection($formattedMessages);

            // Marquer les messages entrants comme lus
            Message::where('id_echange', $echange->id)
                ->where('sender_id', $receiverId)
                ->where('receiver_id', $userId)
                ->whereNull('read_at')
                ->update(['read_at' => now()]);
        }

        $otherUser = User::find($receiverId);

        return response()->json([
            'messages' => $messages->items(),
            'id_echange' => $echange?->id,
            'last_seen' => $otherUser?->last_seen,
            'has_more' => $messages->hasMorePages(),
            'current_page' => $messages->currentPage(),
            'total' => $messages->total(),
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
