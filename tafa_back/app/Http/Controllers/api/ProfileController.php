<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\ImageResource;
use App\Models\Block;
use App\Models\City;
use App\Models\Interest;
use App\Models\Like;
use App\Models\Profile;
use App\Models\Relationship_type;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ProfileController extends Controller
{


//Afficher le profil de l'utilisateur connecté
    public function show(Request $request)
    {
        $user = $request->user();

        $profile = Profile::with([
            'user',
            'relationshipType',
            'city',
            'interests',
            'langues',
            'images',  

        ])->where('user_id', $user->id)->firstOrFail();

        $profile->zodiac_sign = $this->getZodiacSign($profile->date_de_naissance); 

        return response()->json([
            'profile' => new ProfileResource($profile),
            'images'  => ImageResource::collection($profile->images),
        ]);
    }

// Calculer la distance entre deux coordonnées GPS (formule de Haversine)
    private function calculateDistanceHaversine(?float $lat1, ?float $lon1, ?float $lat2, ?float $lon2): ?float
    {
        if ($lat1 === null || $lon1 === null || $lat2 === null || $lon2 === null) {
            return null;
        }

        $earthRadius = 6371; // Earth's radius in km

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }


// Chercher une ville via l'API de géocodage Nominatim (OpenStreetMap, gratuite)
// et la créer en base avec son pays et ses coordonnées GPS.
// Retourne null si la ville est introuvable ou si le service est indisponible.
    private function geocodeAndCreateCity(string $cityName): ?City
    {
        try {
            $response = Http::withHeaders([
                    // Nominatim exige un User-Agent identifiable (politique d'usage)
                    'User-Agent' => 'TafaApp/1.0 (contact@tafa.example)',
                ])
                ->timeout(5)
                ->get('https://nominatim.openstreetmap.org/search', [
                    'q' => $cityName,
                    'format' => 'json',
                    'addressdetails' => 1,
                    'limit' => 1,
                ]);

            if (!$response->successful()) {
                Log::warning('Géocodage échoué (requête non réussie)', ['city' => $cityName]);
                return null;
            }

            $results = $response->json();

            if (empty($results)) {
                return null;
            }

            $result = $results[0];

            return City::create([
                'name' => $cityName,
                'country' => $result['address']['country'] ?? 'Inconnu',
                'latitude' => $result['lat'],
                'longitude' => $result['lon'],
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur de géocodage', ['city' => $cityName, 'error' => $e->getMessage()]);
            return null;
        }
    }

// Mettre à jour le profil de l'utilisateur connecté
    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $profile = $user->profile;

        if (!$profile) {
            return response()->json(['error' => 'Profil non trouvé'], 404);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'firstname' => 'sometimes|string|max:255', 
            'date_de_naissance' => 'sometimes|date',
            'Situation_amoureuse' => 'sometimes|string|max:255',
            'relationship_type_id' => 'sometimes|integer',
            'bio' => 'sometimes|string',
            'profession' => 'sometimes|string|max:255',
            'city_id' => 'sometimes|nullable|integer|exists:cities,id',
            'city_name' => 'sometimes|nullable|string|max:255',
            'interests' => 'sometimes|array', 
            'interests.*' => 'integer|exists:interests,id',
            'langue_ids' => 'sometimes|array', 
            'langue_ids.*' => 'integer|exists:langues,id',
        ]);

        // Résolution de la ville à partir du nom saisi (city_name)
        // L'utilisateur peut taper n'importe quelle ville, où qu'il soit dans le monde.
        // On cherche d'abord si elle existe déjà en base, sinon on la géocode
        // (récupération automatique de country/latitude/longitude) avant de la créer.
        if ($request->has('city_name')) {
            $cityName = trim((string) $request->input('city_name'));

            if ($cityName === '') {
                $validated['city_id'] = null;
            } else {
                // Recherche insensible à la casse pour éviter les doublons
                // (ex: "manakambahiny" et "Manakambahiny" ne doivent créer qu'une seule ville)
                $city = City::whereRaw('LOWER(name) = ?', [mb_strtolower($cityName)])->first();

                if (!$city) {
                    $city = $this->geocodeAndCreateCity($cityName);

                    if (!$city) {
                        return response()->json([
                            'error' => "Ville introuvable. Vérifiez l'orthographe et réessayez.",
                        ], 422);
                    }
                }

                $validated['city_id'] = $city->id;
            }
        }

        // On ne garde pas city_name dans les données envoyées à Profile::update()
        // car ce n'est pas une colonne de la table profiles.
        unset($validated['city_name']);

        // Mise à jour du Nom et Prénom dans la table USERS
        $user->update($request->only(['name', 'firstname']));
        $profile->update($validated);
        $profile->load(['images', 'city']);

       
        if ($request->has('interests')) {
            // sync() supprime les anciens intérêts et met les nouveaux IDs
            $profile->interests()->sync($request->input('interests'));
        }
        
        // Synchronisation des LANGUES
        if ($request->has('langue_ids')) {
            $profile->langues()->sync($request->input('langue_ids'));
        }

        return response()->json([
            'message' => 'Profil mis à jour avec succès',
            'profile' => $profile->load('langues', 'interests', 'city')
        ]);
    }

// Mettre à jour la localisation (latitude et longitude) 
    // public function updateLocation(Request $request)
    // {
    //     $user = $request->user();

    //     if (!$user) {
    //         return response()->json(['error' => 'Non authentifié'], 401);
    //     }

    //     $profile = $user->profile;

    //     if (!$profile) {
    //         return response()->json(['error' => 'Profil non trouvé'], 404);
    //     }

    //     $validated = $request->validate([
    //         'latitude' => 'required|numeric|between:-90,90',
    //         'longitude' => 'required|numeric|between:-180,180',
    //     ]);

    //     $profile->update($validated);

    //     return response()->json([
    //         'message' => 'Localisation mise à jour avec succès',
    //         $profile->city?->latitude
    //         $profile->city?->longitude
    //     ]);
    // }

// Récupérer les profils en ligne à proximité de l'utilisateur connecté (filtrés par distance, blocage et genre)
    public function getNearbyOnline(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $currentUserProfile = $user->profile;

        if (!$currentUserProfile) {
            return response()->json(['error' => 'Profil non trouvé'], 404);
        }

        // Check if user has location set
        if (!$currentUserProfile->latitude || !$currentUserProfile->longitude) {
            return response()->json([
                'error' => 'Localisation non définie',
                'need_location' => true,
                'profiles' => []
            ]);
        }

        $maxDistance = $request->get('distance', 50); // Default 50km
        $oppositeGender = $currentUserProfile->sexe === 'Homme' ? 'Femme' : 'Homme';

        // Get blocked users
        $blockedByMe = Block::where('user_id', $user->id)->pluck('blocked_user_id')->toArray();
        $blockedMe = Block::where('blocked_user_id', $user->id)->pluck('user_id')->toArray();
        $blockedUserIds = array_unique(array_merge($blockedByMe, $blockedMe));

        // Get profiles that are online (active in last 5 minutes) and have location
        $fiveMinutesAgo = now()->subMinutes(5);

        $profiles = Profile::where('user_id', '!=', $user->id)
            ->where('sexe', $oppositeGender)
            ->whereNotIn('user_id', $blockedUserIds)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->where('last_active', '>=', $fiveMinutesAgo)
            ->with('images')
            ->get();

        // Filter by distance and calculate distance for each
        $nearbyProfiles = [];

        foreach ($profiles as $profile) {
            $distance = $this->calculateDistanceHaversine(
                $currentUserProfile->latitude,
                $currentUserProfile->longitude,
                $profile->latitude,
                $profile->longitude
            );

            if ($distance !== null && $distance <= $maxDistance) {
                $profile->distance = round($distance, 1);
                $profile->compatibility = $this->calculateCompatibility($currentUserProfile, $profile);
                $nearbyProfiles[] = $profile;
            }
        }

        // Sort by distance (closest first)
        usort($nearbyProfiles, function ($a, $b) {
            return $a->distance <=> $b->distance;
        });

        // Limit to 10 nearest
        $nearbyProfiles = array_slice($nearbyProfiles, 0, 10);

        return response()->json([
            'profiles' => $nearbyProfiles
        ]);
    }


//Récupérer les profils pour le matching (exclut l'utilisateur connecté)
     
    public function getProfiles(Request $request)
    {
        
       
        $user = $request->user();
        // $user = User::find(296); // --- IGNORE ---
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Récupérer le profil de l'utilisateur connecté pour connaître son genre
        $currentUserProfile = $user->profile;

        if (!$currentUserProfile) {
            return response()->json(['error' => 'Profil non trouvé'], 404);
        }

        // Déterminer le genre opposé à afficher
        $oppositeGender = $currentUserProfile->sexe === 'Homme' ? 'Femme' : 'Homme';
    
        $myLikes = Like::where('user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->pluck('liked_user_id')
            ->toArray();
        $myDislikes = Like::where('user_id', $user->id)
            ->where('type', 'dislike')
            ->pluck('liked_user_id')
            ->toArray();

        
        $theyLikedMe = Like::whereIn('user_id', $myLikes)
            ->where('liked_user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->pluck('user_id')
            ->toArray();

        // These are matches - always exclude
        $matchedUserIds = $theyLikedMe;

        // Get profiles I've already liked - exclude these from suggestions
        $alreadyLikedUserIds = Like::where('user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->pluck('liked_user_id')
            ->toArray();
        // Get blocked users (both directions) - always exclude
        $blockedByMe = Block::where('user_id', $user->id)->pluck('blocked_user_id')->toArray();
        $blockedMe = Block::where('blocked_user_id', $user->id)->pluck('user_id')->toArray();
        $blockedUserIds = array_unique(array_merge($blockedByMe, $blockedMe));

        // Exclude matches, already liked profiles, and blocked users
        $excludeUserIds = array_unique(array_merge($matchedUserIds, $alreadyLikedUserIds, $blockedUserIds, $myDislikes));

        $query = Profile::where('user_id', '!=', $user->id)
            ->where('sexe', $oppositeGender)
            ->whereNotIn('user_id', $excludeUserIds)
            ->with('images','user', 'relationshipType', 'city', 'interests', 'langues');
            
        // Filtre par intention (si le champ existe)
       if ($request->has('intention')) {
                $intentionId = Relationship_type::where('name', $request->intention)->value('id');

                if (!$intentionId) {
                    return response()->json([
                        'message' => 'Intention invalide'
                    ], 400);
                }

                $query->where('relationship_type_id', $intentionId);
        }
       

        // Filtre par centre d'intérêt unique
       if ($request->has('interest')) {
        $interestId = Interest::where('name', $request->interest)->value('id');
    
        if (!$interestId) {
            return response()->json([
                'message' => 'Centre d\'intérêt invalide'
            ], 400);
        }

        $query->whereHas('interests', function ($q) use ($interestId) {
        $q->where('interests.id', $interestId);
        });

    }
       

        $profiles = $query->get();
        // dd($profiles);

        // Get distance filter parameters
        $maxDistance = $request->get('distance');
        


        // Calculate compatibility and distance for each profile
        $profilesWithData = $profiles->map(function ($profile) use ($currentUserProfile) {
            // Calculate compatibility
            $compatibility = $this->calculateCompatibility($currentUserProfile, $profile);
            $profile->compatibility = $compatibility;
            $profile->zodiac_sign = $this->getZodiacSign($profile->date_de_naissance);
            

            // Calculate distance via cities
            $distance = null;
            
            if (
                $currentUserProfile->city?->latitude &&
                $currentUserProfile->city?->longitude &&
                $profile->city?->latitude &&
                $profile->city?->longitude
            ) {
                $distance = $this->calculateDistanceHaversine(
                    (float) $currentUserProfile->city->latitude,
                    (float) $currentUserProfile->city->longitude,
                    (float) $profile->city->latitude,
                    (float) $profile->city->longitude
                );
            }
            
            $profile->distance = $distance !== null ? round($distance, 1) : null;
            
                
            return $profile;
        });
       

        // Check if user is Tafa Gold member
        $isTafaGold = $user->isTafaGold();

       
        if (!$isTafaGold) {
            $profilesWithData = $profilesWithData->filter(function ($profile) {
                return $profile->compatibility <= 75;
            });
        }

        // Sort by compatibility (higher first)
        $sortedProfiles = $profilesWithData->sortByDesc('compatibility')->values();//->take(8)
        // dd($sortedProfiles);

        return response()->json([
        //    'profiles' => []// ProfileResource::collection($sortedProfiles)
          'profiles' =>ProfileResource::collection($sortedProfiles)
        ]);
    }


//Récupérer un profil par son ID

    public function getProfileById(Request $request, $id)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Check if there's a block between the users
        if (Block::hasBlockBetween($user->id, $id)) {
            return response()->json([
                'error' => 'Profil non disponible',
                'blocked' => true
            ], 403);
        }

        $profile = Profile::with([
            'images',
            'user',
            'relationshipType',
            'city',
            'interests',
            'langues'
        ])->where('user_id', $id)->first();

        if (!$profile) {
            return response()->json(['error' => 'Profil non trouvé'], 404);
        }

        // Calculate compatibility with the current user
        $currentUserProfile = $user->profile;
        if ($currentUserProfile) {
            $profile->compatibility = $this->calculateCompatibility($currentUserProfile, $profile);
        }
        
        $profile->zodiac_sign = $this->getZodiacSign($profile->date_de_naissance);

        return response()->json([
            'profile' => new ProfileResource($profile)
        ]);
    }

// Récupérer les statistiques du profil (likes, matchs et vues)
    public function getStats(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Count likes received (people who liked me)
        $likesReceived = Like::where('liked_user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->count();

        // Count matches (mutual likes)
        $myLikes = Like::where('user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->pluck('liked_user_id')
            ->toArray();

        $matchesCount = Like::whereIn('user_id', $myLikes)
            ->where('liked_user_id', $user->id)
            ->whereIn('type', ['like', 'superlike'])
            ->count();

        // Count profile views (from profile_views table if exists, otherwise estimate)
        $viewsCount = 0;
        try {
            $viewsCount = DB::table('profile_views')
                ->where('profile_user_id', $user->id)
                ->count();
        } catch (\Exception $e) {
            // If table doesn't exist, estimate based on likes + random factor
            $viewsCount = $likesReceived * 3 + rand(10, 50);
        }

        return response()->json([
            'likes' => $likesReceived,
            'matches' => $matchesCount,
            'views' => $viewsCount,
        ]);
    }

// Enregistrer une vue de profil (une seule fois par jour par utilisateur)
    public function recordView(Request $request, $profileUserId)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Don't record views of own profile
        if ($user->id == $profileUserId) {
            return response()->json(['message' => 'OK']);
        }

        try {
            // Check if view already exists today
            $existingView = DB::table('profile_views')
                ->where('viewer_user_id', $user->id)
                ->where('profile_user_id', $profileUserId)
                ->whereDate('created_at', today())
                ->first();

            if (!$existingView) {
                DB::table('profile_views')->insert([
                    'viewer_user_id' => $user->id,
                    'profile_user_id' => $profileUserId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } catch (\Exception $e) {
            // Table might not exist, that's OK
        }

        return response()->json(['message' => 'OK']);
    }

// Calculer compatibilité entre 2 profiles
    private function calculateCompatibility(Profile $userProfile, Profile $otherProfile): int
    {
    $score = 0;
    $maxScore = 0;

    // 1. Relationship intention match - 25 points
    $maxScore += 10;
    if ($userProfile->relationship_type_id && $otherProfile->relationship_type_id) {
        if ($userProfile->relationship_type_id === $otherProfile->relationship_type_id) {
            $score += 10;
        }
    }

    // 2. Situation amoureuse compatibility - 20 points
    $maxScore += 20;
    if ($userProfile->Situation_amoureuse && $otherProfile->Situation_amoureuse) {
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
    $userInterests = $userProfile->interests->pluck('name')->toArray();
    $otherInterests = $otherProfile->interests->pluck('name')->toArray();

    if (!empty($userInterests) && !empty($otherInterests)) {
        $commonInterests = array_intersect($userInterests, $otherInterests);
        $totalInterests = count(array_unique(array_merge($userInterests, $otherInterests)));

        if ($totalInterests > 0) {
            $score += (count($commonInterests) / $totalInterests) * 35;
        }
    }

    // 4. Zodiac compatibility - 5 points
    $maxScore += 5;
    if ($userProfile->date_de_naissance && $otherProfile->date_de_naissance) {
        $compatibleSigns = [
            'Bélier' => ['Lion', 'Sagittaire', 'Gémeaux', 'Verseau'],
            'Taureau' => ['Vierge', 'Capricorne', 'Cancer', 'Poissons'],
            'Gémeaux' => ['Balance', 'Verseau', 'Lion', 'Bélier'],
            'Cancer' => ['Scorpion', 'Poissons', 'Taureau', 'Vierge'],
            'Lion' => ['Bélier', 'Sagittaire', 'Gémeaux', 'Balance'],
            'Vierge' => ['Taureau', 'Capricorne', 'Cancer', 'Scorpion'],
            'Balance' => ['Gémeaux', 'Verseau', 'Lion', 'Sagittaire'],
            'Scorpion' => ['Cancer', 'Poissons', 'Vierge', 'Capricorne'],
            'Sagittaire' => ['Bélier', 'Lion', 'Balance', 'Gémeaux'],
            'Capricorne' => ['Taureau', 'Vierge', 'Scorpion', 'Poissons'],
            'Verseau' => ['Gémeaux', 'Balance', 'Bélier', 'Sagittaire'],
            'Poissons' => ['Cancer', 'Scorpion', 'Taureau', 'Capricorne'],
        ];

        $userSign = $this->getZodiacSign($userProfile->date_de_naissance);
        $otherSign = $this->getZodiacSign($otherProfile->date_de_naissance);

        if (isset($compatibleSigns[$userSign]) && in_array($otherSign, $compatibleSigns[$userSign])) {
            $score += 5;
        }
    }

    // 5. Location proximity bonus - 30 points
    $maxScore += 30;
    
    if (
        $userProfile->city?->latitude &&
        $userProfile->city?->longitude &&
        $otherProfile->city?->latitude &&
        $otherProfile->city?->longitude
    ) {
        $distance = $this->calculateDistanceHaversine(
            (float) $userProfile->city->latitude,
            (float) $userProfile->city->longitude,
            (float) $otherProfile->city->latitude,
            (float) $otherProfile->city->longitude
        );
    
        if ($distance !== null) {
            if ($distance < 5) {
                $score += 30;
            } elseif ($distance < 10) {
                $score += 20;
            } elseif ($distance < 25) {
                $score += 12;
            } elseif ($distance < 50) {
                $score += 8;
            } elseif ($distance < 100) {
                $score += 4;
            }
        }
    }
    // 6. Language compatibility - 5 points
    $maxScore += 5;
    if ($userProfile->langues && $otherProfile->langues) {
        $userLangs = $userProfile->langues->pluck('name')->toArray();
        $otherLangs = $otherProfile->langues->pluck('name')->toArray();
        if (!empty(array_intersect($userLangs, $otherLangs))) {
            $score += 5;
        }
    }

    // Calculer le pourcentage final
    if ($maxScore === 0) {
        return 50;
    }

    return (int) round(($score / $maxScore) * 100);
    }



// Sign qtro
    private function getZodiacSign($date)
    {
        $date = new \DateTime($date);
        $day = (int) $date->format('d');
        $month = (int) $date->format('m');

        if (($month == 1 && $day >= 20) || ($month == 2 && $day <= 18)) return 'Verseau';
        if (($month == 2 && $day >= 19) || ($month == 3 && $day <= 20)) return 'Poissons';
        if (($month == 3 && $day >= 21) || ($month == 4 && $day <= 19)) return 'Bélier';
        if (($month == 4 && $day >= 20) || ($month == 5 && $day <= 20)) return 'Taureau';
        if (($month == 5 && $day >= 21) || ($month == 6 && $day <= 20)) return 'Gémeaux';
        if (($month == 6 && $day >= 21) || ($month == 7 && $day <= 22)) return 'Cancer';
        if (($month == 7 && $day >= 23) || ($month == 8 && $day <= 22)) return 'Lion';
        if (($month == 8 && $day >= 23) || ($month == 9 && $day <= 22)) return 'Vierge';
        if (($month == 9 && $day >= 23) || ($month == 10 && $day <= 22)) return 'Balance';
        if (($month == 10 && $day >= 23) || ($month == 11 && $day <= 21)) return 'Scorpion';
        if (($month == 11 && $day >= 22) || ($month == 12 && $day <= 21)) return 'Sagittaire';
        if (($month == 12 && $day >= 22) || ($month == 1 && $day <= 19)) return 'Capricorne';
    }

}