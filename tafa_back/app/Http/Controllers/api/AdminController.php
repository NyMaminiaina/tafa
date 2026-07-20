<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Subscription;
use App\Models\Message;
use App\Models\Like;
use App\Models\Block;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Auth;



class AdminController extends Controller
{

    // LOGIN ADMIN
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'nullable',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Si compte créé par l'admin ET pas de mot de passe saisi → connexion directe
        if (empty($request->password) && $user->created_by_admin) {
            $token = $user->createToken('auth_token')->plainTextToken; // Token normal, pas admin
            return response()->json([
                'message' => 'Connexion utilisateur réussie',
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'firstname' => $user->firstname ?? '',
                    'email' => $user->email,
                    'is_admin' => false, // Important : pas admin
                    'image' => $user->profile?->images?->where('is_primary', true)->first()?->path ?? null,
                    'sexe' => $user->profile?->sexe ?? null,
                ]
            ]);
        }

        // Sinon, vérification normale admin
        if (!Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Identifiants invalides'], 401);
        }

        if (!$user->isAdmin()) {
            return response()->json(['error' => 'Accès non autorisé.'], 403);
        }

        $token = $user->createToken('admin-token', ['admin'])->plainTextToken;
        return response()->json([
            'message' => 'Connexion admin réussie',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'firstname' => $user->firstname ?? '',
                'email' => $user->email,
                'is_admin' => $user->is_admin,
            ]
        ]);
    }

    // DECONNECTION
    public function logout(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        /** @var PersonalAccessToken|null $token */
        $token = $user?->currentAccessToken();

        if ($token) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Déconnexion réussie'
        ]);
    }

    //  Retourne toutes les statistiques globales de l’application (utilisateurs, abonnements, admins, messages, likes, reports, blocks) sous forme JSON
    public function getStatistics(): JsonResponse
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'today' => User::whereDate('created_at', today())->count(),
                'this_week' => User::whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])->count(),
                'this_month' => User::whereMonth('created_at', now()->month)->count(),
            ],
            'subscriptions' => [
                'active' => Subscription::where('is_active', true)->where('expires_at', '>', now())->count(),
                'total' => Subscription::count(),
                'revenue_this_month' => Subscription::whereMonth('created_at', now()->month)->count() * 10000, // Approximate
            ],
            // 🔥 AJOUT ICI
            'admins' => [
                'total' => User::where('is_admin', true)->count()
            ],
            'messages' => [
                'total' => Message::count(),
                'today' => Message::whereDate('created_at', today())->count(),
            ],
            'likes' => [
                'total' => Like::count(),
                'matches' => DB::table('likes as l1')
                    ->join('likes as l2', function ($join) {
                        $join->on('l1.user_id', '=', 'l2.liked_user_id')
                            ->on('l1.liked_user_id', '=', 'l2.user_id');
                    })
                    ->where('l1.type', 'like')
                    ->where('l2.type', 'like')
                    ->count() / 2,
            ],
            'reports' => [
                'pending' => Report::where('status', 'pending')->count(),
                'total' => Report::count(),
            ],
            'blocks' => [
                'total' => Block::count(),
            ],
        ];

        return response()->json($stats);
    }

    // Récupère la liste paginée des utilisateurs avec recherche et filtres (admin ou premium), en incluant leurs profils et abonnements actifs
    public function getUsers(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 20);
        $search = $request->get('search', '');

        $query = User::with('profile')
            ->with(['subscriptions' => function ($q) {
                $q->where('is_active', true)
                    ->where('expires_at', '>', now())
                    ->with('payment'); // 🔥 IMPORTANT
            }]);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->orderBy('created_at', 'desc')->paginate($perPage);

        // 🔥 AJOUT ICI
        $users->getCollection()->transform(function ($user) {
            $user->is_premium = $user->subscriptions->isNotEmpty();
            return $user;
        });

        $filter = $request->get('filter', 'all');

        if ($filter === 'admin') {
            $query->where('is_admin', true);
        }

        if ($filter === 'premium') {
            $query->whereHas('subscriptions', function ($q) {
                $q->where('is_active', true)
                    ->where('expires_at', '>', now());
            });
        }

        return response()->json($users);
    }

    // Récupère les détails d’un utilisateur avec son profil, ses abonnements et ses statistiques
    public function getUser(int $id): JsonResponse
    {
        $user = User::with(['profile', 'subscriptions'])
            ->withCount(['likes', 'receivedLikes', 'sentMessages'])
            ->findOrFail($id);

        return response()->json($user);
    }

    // Modifie les données d’un utilisateur (ex: admin, ban) et enregistre les changements
    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($request->has('is_admin')) {
            $user->is_admin = $request->is_admin;
        }

        if ($request->has('is_banned')) {
            // You could add a is_banned field later
        }

        $user->save();

        return response()->json([
            'message' => 'Utilisateur mis à jour',
            'user' => $user
        ]);
    }


    // Supprimer users   
    public function deleteUser(int $id): JsonResponse
    {
        /** @var User $user */
        $user = User::findOrFail($id);
        if ($user->id === Auth::id()) {
            return response()->json([
                'error' => 'Vous ne pouvez pas supprimer votre propre compte'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé'
        ]);
    }

    // Récupère la liste paginée des signalements
    public function getReports(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 20);
        $status = $request->get('status', 'all');

        $query = Report::with(['reporter', 'reported']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json($reports);
    }

    // Change le statut d’un signalement et enregistre la modification
    public function updateReport(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:pending,reviewed,resolved,dismissed'
        ]);

        $report = Report::findOrFail($id);
        $report->status = $request->status;
        $report->save();

        return response()->json([
            'message' => 'Signalement mis à jour',
            'report' => $report
        ]);
    }

    // Récupère la liste paginée des utilisateurs bloqués avec leurs informations
    public function getBlocks(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 20);

        $blocks = Block::with(['blocker', 'blocked'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($blocks);
    }

    // Récupère la liste paginée des conversations (echanges/rooms) entre utilisateurs avec les infos des deux participants et la date du dernier message
    public function getConversations(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 20);
        $userId = $request->get('user_id');

        $query = DB::table('echanges as e')
            ->join('users as u1', 'e.sender', '=', 'u1.id')
            ->join('users as u2', 'e.receiver', '=', 'u2.id')
            ->select(
                'e.id as id',
                'e.sender as user_one_id',
                'e.receiver as user_two_id',
                'u1.name as user_one_name',
                'u1.email as user_one_email',
                'u2.name as user_two_name',
                'u2.email as user_two_email',
                'e.latestmessage as last_message',
                'e.latestdate as last_message_at'
            );

        if ($userId) {
            $query->where(function ($q) use ($userId) {
                $q->where('e.sender', $userId)
                    ->orWhere('e.receiver', $userId);
            });
        }

        $conversations = $query->orderByDesc('e.latestdate')->paginate($perPage);

        return response()->json($conversations);
    }


    // Récupère tous les utilisateurs Premiem
    public function getSubscriptions()
    {
        return \App\Models\Subscription::with([
            'user',
            'payment'
        ])->get();
    }

    public function getCreatedAccounts()
    {
        $users = User::where('created_by_admin', 1)
            ->with(['profile.images'])
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'firstname' => $user->firstname,
                    'avatar' => $user->profile?->images->where('is_primary', true)->first()?->path ?? null,
                    'email' => $user->email,
                ];
            });

        return response()->json(['users' => $users]);
    }
}
