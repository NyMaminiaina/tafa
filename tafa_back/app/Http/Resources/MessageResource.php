<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use App\Models\Like;
use App\Models\Block;
use App\Models\Message;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userId = Auth::id();

        // SI C'EST UN ECHANGE (une "room" / conversation, pour la liste à gauche)
        if ($this->resource instanceof \App\Models\Echange) {
            /** @var \App\Models\Echange $echange */
            $echange = $this->resource;
            $otherUser = $echange->getOtherUser($userId);

            $isMatch = $otherUser && Like::where('user_id', $userId)
                ->where('liked_user_id', $otherUser->id)
                ->where('type', 'like')
                ->exists()
                &&
                Like::where('user_id', $otherUser->id)
                ->where('liked_user_id', $userId)
                ->where('type', 'like')
                ->exists();

            return [
                // NB: 'id' reste l'ID de l'autre utilisateur pour rester compatible
                // avec les routes existantes (/messages/{receiverId}). Utilisez
                // 'echange_id' pour l'identifiant réel de la room de discussion.
                'id' => $otherUser?->id,
                'echange_id' => $echange->id,
                'other_user' => $otherUser ? [
                    'id' => $otherUser->id,
                    'name' => $otherUser->name,
                    'firstname' => $otherUser->firstname,
                    'avatar' => $otherUser->profile?->images->where('is_primary', true)->first()?->path,
                    'profession' => $otherUser->profile?->profession,
                    'bio' => $otherUser->profile?->bio,
                    'interests' => $otherUser->profile?->interests->pluck('name') ?? [],
                    'is_blocked' => Block::where('user_id', $userId)
                        ->where('blocked_user_id', $otherUser->id)
                        ->exists(),
                    'is_system' => (bool) $otherUser->is_system,
                ] : null,
                'last_message' => [
                    'content' => $echange->latestmessage,
                    'created_at' => $echange->latestdate,
                    'is_mine' => $echange->latestMessageRecord
                        ? (int) $echange->latestMessageRecord->sender_id === (int) $userId
                        : (int) $echange->sender === (int) $userId,
                    'related_user' => $echange->latestMessageRecord?->relatedUser ? [
                        'id' => $echange->latestMessageRecord->relatedUser->id,
                        'name' => $echange->latestMessageRecord->relatedUser->name,
                        'firstname' => $echange->latestMessageRecord->relatedUser->firstname,
                    ] : null,
                ],
                'unread_count' => $otherUser ? Message::where('id_echange', $echange->id)
                    ->where('sender_id', $otherUser->id)
                    ->whereNull('read_at')
                    ->count() : 0,

                'has_unread' => $otherUser ? Message::where('id_echange', $echange->id)
                    ->where('sender_id', $otherUser->id)
                    ->whereNull('read_at')
                    ->exists() : false,

                'is_match' => $isMatch,
            ];
        }

        // SI C'EST UN MESSAGE (Bulles de discussion au centre)
        return [
            'id' => $this->id,
            'content' => $this->content,
            'id_echange' => $this->id_echange,
            'is_mine' => (int) $this->sender_id === (int) $userId,
            'created_at' => $this->created_at,
            'read_at' => $this->read_at,
        ];
    }
}
