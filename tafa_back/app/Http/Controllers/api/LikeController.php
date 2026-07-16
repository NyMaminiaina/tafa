<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Resources\LikesResources;
use App\Http\Resources\MatchResources;
use App\Models\Block;
use App\Models\Echange;
use App\Models\Like;
use App\Models\Message;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Http\Request;

class LikeController extends Controller
{
    // Doit être identique à MATCH_SYSTEM_MESSAGE côté frontend (front/src/api/api.ts)
    private const MATCH_SYSTEM_MESSAGE = "💬 Vous avez matché ! Dites bonjour pour commencer la conversation 👋";

    /**
     * Envoie une notification de match, via le compte système "Tafa", aux
     * DEUX utilisateurs concernés. Chaque notification vit dans l'échange
     * (room) entre l'utilisateur et Tafa, séparé de l'échange réel qui
     * sera créé entre les deux utilisateurs matchés dès qu'ils
     * commenceront à discuter.
     */
    private function notifyMatch(User $userA, User $userB): void
    {
        $tafa = User::tafaBot();

        foreach ([[$userA, $userB], [$userB, $userA]] as [$recipient, $matchedWith]) {
            $echange = Echange::findOrCreateBetween($recipient->id, $tafa->id);

            // Évite de renvoyer une notification en double pour le même match
            $alreadyNotified = Message::where('id_echange', $echange->id)
                ->where('related_user_id', $matchedWith->id)
                ->exists();

            if ($alreadyNotified) {
                continue;
            }

            $message = Message::create([
                'id_echange' => $echange->id,
                'sender_id' => $tafa->id,
                'receiver_id' => $recipient->id,
                'related_user_id' => $matchedWith->id,
                'content' => self::MATCH_SYSTEM_MESSAGE,
            ]);

            $echange->touchLatest($message->content, $message->created_at);
        }
    }

    // Permet de liker un utilisateur et vérifier s’il y a un match
    public function likeProfile(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $targetUser = User::with('profile.images')->find($id);
        if (!$targetUser) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        if ($user->id == $id) {
            return response()->json(['error' => 'Vous ne pouvez pas vous aimer vous-même'], 400);
        }

        // Check like limit for non-Gold users
        if (!$user->isTafaGold() && !$user->canLike()) {
            return response()->json([
                'error' => 'Limite de likes atteinte',
                'message' => 'Vous avez atteint votre limite de 10 likes par jour. Passez à Tafa Gold pour des likes illimités !',
                'remaining_likes' => 0,
                'is_gold' => false,
                'limit_reached' => true,
            ], 403);
        }

        // Create or update the like
        $like = Like::updateOrCreate(
            [
                'user_id' => $user->id,
                'liked_user_id' => $id
            ],
            [
                'type' => 'like'
            ]
        );

        // Increment like count for non-Gold users
        if (!$user->isTafaGold()) {
            $user->incrementLikeCount();
        }

        // Check for mutual like (match)
        $isMatch = Like::isMutualLike($user->id, $id);

        if ($isMatch) {
            $this->notifyMatch($user, $targetUser);
        }

        return response()->json([
            'message' => 'Profil aimé avec succès',
            'like' => $like,
            'is_match' => $isMatch,
            'match_profile' => $isMatch ? [
                'id' => $targetUser->id,
                'name' => $targetUser->profile?->prenom ?? $targetUser->name,
                'photo' => $targetUser->profile->images->where('is_primary', true)->first()?->url ?? $targetUser->profile->images->first()?->url ?? null,
                'photo_user_connected' => $user->profile->images->where('is_primary', true)->first()?->url ?? $user->profile->images->first()?->url ?? null,
            ] : null,
            'remaining_likes' => $user->getRemainingLikes(),
            'is_gold' => $user->isTafaGold(),
        ], 200);
    }

    //  Dislike a profile
    public function dislikeProfile(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $targetUser = User::find($id);
        if (!$targetUser) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        if ($user->id == $id) {
            return response()->json(['error' => 'Action non autorisée'], 400);
        }

        $like = Like::updateOrCreate(
            [
                'user_id' => $user->id,
                'liked_user_id' => $id
            ],
            [
                'type' => 'dislike'
            ]
        );

        return response()->json([
            'message' => 'Profil passé',
            'like' => $like
        ], 200);
    }

    // Permet d’envoyer un super like à un profil et vérifier s’il y a un match
    public function superLikeProfile(Request $request, $id)
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

        // Can't super like yourself
        if ($user->id == $id) {
            return response()->json(['error' => 'Action non autorisée'], 400);
        }

        // Check like limit for non-Gold users (super likes count toward daily limit)
        if (!$user->isTafaGold() && !$user->canLike()) {
            return response()->json([
                'error' => 'Limite de likes atteinte',
                'message' => 'Vous avez atteint votre limite de 10 likes par jour. Passez à Tafa Gold pour des likes illimités !',
                'remaining_likes' => 0,
                'is_gold' => false,
                'limit_reached' => true,
            ], 403);
        }

        // Create or update the super like
        $like = Like::updateOrCreate(
            [
                'user_id' => $user->id,
                'liked_user_id' => $id
            ],
            [
                'type' => 'superlike'
            ]
        );

        // Increment like count for non-Gold users
        if (!$user->isTafaGold()) {
            $user->incrementLikeCount();
        }

        // Check for mutual like (match)
        $isMatch = Like::isMutualLike($user->id, $id);

        if ($isMatch) {
            $this->notifyMatch($user, $targetUser);
        }

        return response()->json([
            'message' => 'Super Like envoyé !',
            'like' => $like,
            'is_match' => $isMatch,
            'remaining_likes' => $user->getRemainingLikes(),
            'is_gold' => $user->isTafaGold(),
        ], 200);
    }

    // Récupère les utilisateurs qui ont liké l’utilisateur connecté ainsi que ses matchs
    public function getLikes(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Get users who liked the current user (and current user hasn't responded yet)
        $likes = Like::where('liked_user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->whereNotExists(function ($query) use ($user) {
                $query->select('id')
                    ->from('likes as l2')
                    ->whereColumn('l2.liked_user_id', 'likes.user_id')
                    ->where('l2.user_id', $user->id)
                    ->whereIn('l2.type', ['like', 'superlike']);
            })
            ->with(['user.profile.images'])
            ->orderBy('created_at', 'desc')
            ->get();

        // Get all users that the current user liked
        $likedUserIds = Like::where('user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->pluck('liked_user_id');

        // Find mutual likes (matches) - users who also liked us back
        $matchedUserIds = Like::whereIn('user_id', $likedUserIds)
            ->where('liked_user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->pluck('user_id');

        // Get profiles of matched users
        $profiles = Profile::whereIn('user_id', $matchedUserIds)
            ->with('images')
            ->get();

        $formattedLikes = $likes->map(function ($like) {
            $profile = $like->user->profile;
            $primaryImage = $profile->images->where('is_primary', true)->first();
            $firstImage = $profile->images->first();
            $avatar = $primaryImage ? $primaryImage->path : ($firstImage ? $firstImage->path : null);

            return [
                'id' => $like->user->id,
                'name' => $profile->prenom ?? $profile->name ?? 'Anonyme',
                'age' => $this->calculateAge($profile->date_de_naissance),
                'distance' => 'À proximité',
                // 'time' => $like->created_at?->diffForHumans() : null,
                'photo' => $avatar,
                'hasSuperLiked' => $like->type === 'superlike',
                'mutualInterests' => $profile->interests ?? [],
                'location' => $profile->localisation,
                'job' => $profile->profession,
            ];
        });

        $isGold = $user->isTafaGold();
        $totalCount = $formattedLikes->count();

        // For non-Gold users, only show first 3 profiles
        if (!$isGold && $totalCount > User::FREE_VISIBLE_LIKES_RECEIVED) {
            $visibleLikes = $formattedLikes->take(User::FREE_VISIBLE_LIKES_RECEIVED)->values();
            $hiddenCount = $totalCount - User::FREE_VISIBLE_LIKES_RECEIVED;

            return response()->json([
                'likes' => $visibleLikes,
                'count' => $totalCount,
                'visible_count' => User::FREE_VISIBLE_LIKES_RECEIVED,
                'hidden_count' => $hiddenCount,
                'is_gold' => false,
                'is_limited' => true,
                'message' => "Vous avez {$hiddenCount} autres personnes qui vous ont liké ! Passez à Tafa Gold pour les voir.",
            ]);
        }

        return response()->json([
            'likes' => LikesResources::collection($likes),
            'matches' => MatchResources::collection($profiles), // LikesResources::collection($profiles),
            'count' => $totalCount,
            'is_gold' => $isGold,
            'is_limited' => false,
        ]);
    }




    //Calcul compatibilité entre 2 profiles
    private function calculateCompatibility(Profile $userProfile, Profile $otherProfile): int
    {
        $score = 0;
        $maxScore = 0;

        // 1. Relationship intention match (genre_id) - 30 points
        $maxScore += 30;
        if ($userProfile->genre_id && $otherProfile->genre_id) {
            if ($userProfile->genre_id === $otherProfile->genre_id) {
                $score += 30;
            }
        }

        // 2. Situation amoureuse compatibility - 20 points
        $maxScore += 20;
        if ($userProfile->Situation_amoureuse && $otherProfile->Situation_amoureuse) {
            // Both single is ideal
            $singleStatuses = ['Celibataire', 'Divorce', 'veuf', 'separe'];
            $userIsSingle = in_array($userProfile->Situation_amoureuse, $singleStatuses);
            $otherIsSingle = in_array($otherProfile->Situation_amoureuse, $singleStatuses);

            if ($userIsSingle && $otherIsSingle) {
                $score += 20;
            } elseif ($userProfile->Situation_amoureuse === $otherProfile->Situation_amoureuse) {
                $score += 15;
            }
        }

        // 3. Common interests - 35 points
        $maxScore += 35;
        $userInterests = $userProfile->interests ?? [];
        $otherInterests = $otherProfile->interests ?? [];

        if (!empty($userInterests) && !empty($otherInterests)) {
            $commonInterests = array_intersect($userInterests, $otherInterests);
            $totalInterests = count(array_unique(array_merge($userInterests, $otherInterests)));

            if ($totalInterests > 0) {
                $interestScore = (count($commonInterests) / $totalInterests) * 35;
                $score += $interestScore;
            }
        }

        // 4. Same location bonus - 10 points
        $maxScore += 10;
        if ($userProfile->localisation && $otherProfile->localisation) {
            if (strtolower($userProfile->localisation) === strtolower($otherProfile->localisation)) {
                $score += 10;
            }
        }

        // 5. Language compatibility - 5 points
        $maxScore += 5;
        if ($userProfile->langues && $otherProfile->langues) {
            $userLangs = array_map('trim', explode(',', strtolower($userProfile->langues)));
            $otherLangs = array_map('trim', explode(',', strtolower($otherProfile->langues)));

            if (!empty(array_intersect($userLangs, $otherLangs))) {
                $score += 5;
            }
        }

        // Calculate percentage
        if ($maxScore === 0) {
            return 50; // Default if no data to compare
        }

        return (int) round(($score / $maxScore) * 100);
    }

    // Calculer Age
    private function calculateAge($dateOfBirth): ?int
    {
        if (!$dateOfBirth) {
            return null;
        }

        try {
            $birthDate = \Carbon\Carbon::parse($dateOfBirth);
            $age = now()->diffInYears($birthDate);
            // Only return age if it's reasonable (between 18 and 120)
            if ($age >= 18 && $age <= 120) {
                return $age;
            }
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    // Permet de supprimer un like d’un utilisateur
    public function unlikeProfile(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $deleted = Like::where('user_id', $user->id)
            ->where('liked_user_id', $id)
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Like supprimé']);
        }

        return response()->json(['message' => 'Aucun like trouvé'], 404);
    }

    // Récupère les matchs (likes mutuels) de l’utilisateur connecté
    public function getMatches(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Get all users that the current user liked
        $likedUserIds = Like::where('user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->pluck('liked_user_id');

        // Find mutual likes (matches)
        $matches = Like::whereIn('user_id', $likedUserIds)
            ->where('liked_user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->with(['user.profile.images'])
            ->get();

        $formattedMatches = $matches->map(function ($like) {
            $profile = $like->user->profile;
            $primaryImage = $profile->images->where('is_primary', true)->first();
            $firstImage = $profile->images->first();
            $avatar = $primaryImage ? $primaryImage->path : ($firstImage ? $firstImage->path : null);

            return [
                'id' => $like->user->id,
                'name' => $profile->prenom ?? $profile->name ?? 'Anonyme',
                'age' => $this->calculateAge($profile->date_de_naissance),
                'photo' => $avatar,
                'location' => $profile->localisation,
                'matchedAt' => $like->created_at->diffForHumans(),
            ];
        });

        return response()->json([
            'matches' => $formattedMatches,
            'count' => $formattedMatches->count()
        ]);
    }

    // Récupère les profils recommandés selon la compatibilité pour l’utilisateur connecté
    public function getRecommended(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $currentUserProfile = $user->profile;

        if (!$currentUserProfile) {
            return response()->json(['error' => 'Profil non trouvé'], 404);
        }

        // Check if user is Tafa Gold member
        $isTafaGold = $user->isTafaGold();

        // Determine the opposite gender to show
        $oppositeGender = $currentUserProfile->sexe === 'Homme' ? 'Femme' : 'Homme';

        // Get matches (mutual likes) - always exclude these
        $myLikes = Like::where('user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->pluck('liked_user_id')
            ->toArray();

        $theyLikedMe = Like::whereIn('user_id', $myLikes)
            ->where('liked_user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->pluck('user_id')
            ->toArray();

        $matchedUserIds = $theyLikedMe;

        // Get profiles already liked - exclude these
        $alreadyLikedUserIds = Like::where('user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->pluck('liked_user_id')
            ->toArray();

        // Get blocked users (both directions)
        $blockedByMe = Block::where('user_id', $user->id)->pluck('blocked_user_id')->toArray();
        $blockedMe = Block::where('blocked_user_id', $user->id)->pluck('user_id')->toArray();
        $blockedUserIds = array_unique(array_merge($blockedByMe, $blockedMe));

        // Combine all users to exclude
        $excludeUserIds = array_unique(array_merge($matchedUserIds, $alreadyLikedUserIds, $blockedUserIds));

        $profiles = Profile::where('user_id', '!=', $user->id)
            ->where('sexe', $oppositeGender)
            ->whereNotIn('user_id', $excludeUserIds)
            ->with('images')
            ->get();

        // Calculate compatibility and filter high compatibility ones (>75% = green)
        $recommended = $profiles->map(function ($profile) use ($currentUserProfile) {
            $compatibility = $this->calculateCompatibility($currentUserProfile, $profile);

            $primaryImage = $profile->images->where('is_primary', true)->first();
            $firstImage = $profile->images->first();
            $avatar = $primaryImage ? $primaryImage->path : ($firstImage ? $firstImage->path : null);

            return [
                'id' => $profile->user_id,
                'name' => $profile->prenom ?? $profile->name ?? 'Anonyme',
                'age' => $this->calculateAge($profile->date_de_naissance),
                'distance' => 'À proximité',
                'photo' => $avatar,
                'compatibility' => $compatibility,
                'location' => $profile->localisation,
                'job' => $profile->profession,
                'interests' => $profile->interests ?? [],
            ];
        })
            ->filter(function ($profile) {
                // Only show profiles with compatibility > 75% (green profiles)
                return $profile['compatibility'] > 75;
            })
            ->sortByDesc('compatibility')
            ->take(10)
            ->values();

        // For non-Gold users, return blurred preview data
        if (!$isTafaGold) {
            $blurredProfiles = $recommended->map(function ($profile) {
                return [
                    'id' => $profile['id'],
                    'name' => mb_substr($profile['name'], 0, 1) . '***',
                    'age' => $profile['age'],
                    'distance' => $profile['distance'],
                    'photo' => $profile['photo'],
                    'compatibility' => $profile['compatibility'],
                    'is_blurred' => true,
                ];
            })->take(6);

            return response()->json([
                'recommended' => $blurredProfiles,
                'count' => $recommended->count(),
                'is_locked' => true,
                'is_blurred' => true,
                'message' => 'Top Picks est réservé aux membres Tafa Gold. Abonnez-vous pour voir les profils les plus compatibles avec vous !',
            ]);
        }

        return response()->json([
            'recommended' => $recommended,
            'count' => $recommended->count(),
            'is_locked' => false,
        ]);
    }
}
