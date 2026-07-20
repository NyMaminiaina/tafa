import { API_URL } from "../utils/api_url";
// const API_URL = "http://127.0.0.1:8000/api";
// const API_URL = "http://192.168.1.211:8090/api";
/*
|--------------------------------------------------------------------------
| Test
|--------------------------------------------------------------------------
*/
export async function testApi() {
  const res = await fetch(`${API_URL}/test`);
  return res.json();
}

/*
|--------------------------------------------------------------------------
| Auth
|--------------------------------------------------------------------------
*/
export async function register(data: FormData) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    body: data,
  });
  return res.json();
}

export async function verifyEmail(email: string, code: string) {
  const res = await fetch(`${API_URL}/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return res.json();
}

export async function resendVerificationCode(email: string) {
  const res = await fetch(`${API_URL}/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return res.json();
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${API_URL}/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  return res.json();
}

export async function resetPassword(data: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}) {
  const res = await fetch(`${API_URL}/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function verifyResetToken(email: string, token: string) {
  const res = await fetch(`${API_URL}/verify-reset-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, token }),
  });

  return res.json();
}

export async function logout() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/logout`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function changePassword(data: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function changeEmail(data: {
  new_email: string;
  password: string;
}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/change-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function getUserInfo() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/user-info`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

/*
|--------------------------------------------------------------------------
| Profiles
|--------------------------------------------------------------------------
*/
export async function getProfiles() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/profiles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function getProfile(id: string | number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/profiles/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function getProfileStats() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/profile/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function recordProfileView(userId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/profiles/${userId}/view`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.json();
}

export async function getMyProfile() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

export async function updateProfile(data: any) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

/*
|--------------------------------------------------------------------------
| Messages & Conversations
|--------------------------------------------------------------------------
*/

// Get all conversations for the current user
export async function getConversations() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/conversations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Récupérer les messages par ID d'utilisateur
export async function getMessages(contactId: number, page: number = 1, perPage: number = 15) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/messages/${contactId}?page=${page}&per_page=${perPage}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export const MATCH_SYSTEM_MESSAGE = "💬 Vous avez matché ! Dites bonjour pour commencer la conversation 👋";

// Envoyer un message direct
export async function sendMessage(data: { receiver_id: number; content: string }) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/messages/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}


// // Start or get a conversation with a user
// export async function startConversation(userId: number) {
//   const token = localStorage.getItem("token");

//   const res = await fetch(`${API_URL}/conversations/start/${userId}`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   return res.json();
// }
// api.ts
// api.ts
export async function startConversation(receiver_id: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/conversations/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ receiver_id }),
  });

  return res.json();
}
// export async function startConversation(userId: number, data: { message: string }) {
//   const token = localStorage.getItem("token");

//   const res = await fetch(`${API_URL}/conversations/start/${userId}`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json", // CRITIQUE : Permet à MariaDB de recevoir le texte
//       "Authorization": `Bearer ${token}`,
//     },
//     body: JSON.stringify(data), // Envoie le contenu réel du message
//   });

//   return res.json();
// }

// Mark all messages in a conversation as read
export async function markConversationAsRead(conversationId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/conversations/${conversationId}/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Delete a conversation
export async function deleteConversation(conversationId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Get message suggestions for starting a conversation
export async function getMessageSuggestions() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/messages/suggestions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Delete a message for me only
export async function deleteMessageForMe(messageId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/messages/${messageId}/for-me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Delete a message for everyone
export async function deleteMessageForAll(messageId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/messages/${messageId}/for-all`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

/*
|--------------------------------------------------------------------------
| Likes & Matching
|--------------------------------------------------------------------------
*/

// Like a profile
export async function likeProfile(userId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/likes/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Dislike a profile
export async function dislikeProfile(userId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/dislikes/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Super like a profile
export async function superLikeProfile(userId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/superlikes/${userId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Unlike a profile (remove like)
export async function unlikeProfile(userId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/likes/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Get users who liked the current user
export async function getLikes() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/likes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Get top picks (high compatibility profiles)
export async function getTopPicks() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/top-picks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Get matches (mutual likes)
export async function getMatches() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/matches`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Get recommended profiles (high compatibility - Top Picks)
export async function getRecommended() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/recommended`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

/*
|--------------------------------------------------------------------------
| User Actions (Block, Report, Notifications)
|--------------------------------------------------------------------------
*/

// Block a user
export async function blockUser(userId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/${userId}/block`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Unblock a user
export async function unblockUser(userId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/${userId}/block`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Get blocked users
export async function getBlockedUsers() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/blocked`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Report a user
export async function reportUser(userId: number, reason: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/users/${userId}/report`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ reason }),
  });

  return res.json();
}

// Toggle notifications for a conversation
export async function toggleConversationNotifications(conversationId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/conversations/${conversationId}/notifications`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Get notification status for a conversation
export async function getConversationNotificationStatus(conversationId: number) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/conversations/${conversationId}/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Delete user account
export async function deleteAccount(password: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/account`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ password }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Erreur serveur ${res.status}`);
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| Payments & Subscriptions
|--------------------------------------------------------------------------
*/

// Initiate a payment
export async function initiatePayment(data: {
  plan_id: string;
  payment_method: string;
  phone_number?: string;
  amount: number;
}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/payments/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

// Check payment status
export async function checkPaymentStatus(transactionId: string) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/payments/status/${transactionId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Get subscription status
export async function getSubscriptionStatus() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/subscription`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Get user limits (freemium)
export async function getUserLimits() {
  const token = localStorage.getItem("token");

  // 1. Vérification préventive du token
  if (!token) {
    throw new Error("Aucun jeton d'authentification trouvé");
  }

  try {
    const res = await fetch(`${API_URL}/user/limits`, {
      method: "GET", // Optionnel mais plus clair
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    // 2. Vérification du statut HTTP (200-299)
    if (!res.ok) {
      // Optionnel : extraire le message d'erreur du backend
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || `Erreur serveur: ${res.status}`);
    }

    // 3. Retour des données
    return await res.json();

  } catch (error) {
    console.error("Erreur lors de la récupération des limites :");
    throw error; // On propage l'erreur pour que le composant appelant puisse l'afficher
  }
}

// Activate boost
export async function activateBoost() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/boost/activate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

/*
|--------------------------------------------------------------------------
| Geolocation
|--------------------------------------------------------------------------
*/

// Update user location (latitude/longitude)
export async function updateLocation(data: { latitude: number; longitude: number }) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/profile/location`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

// Get online nearby users
export async function getNearbyOnline(maxDistance: number = 50) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/profiles/nearby-online?distance=${maxDistance}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}

// Get profiles with distance filter
export async function getProfilesWithDistance(params: {
  distance?: number;
  latitude?: number;
  longitude?: number;
  ageMin?: number;
  ageMax?: number;
  intention?: string;
  interests?: string;
}) {
  const token = localStorage.getItem("token");

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });

  const res = await fetch(`${API_URL}/profiles?${queryParams.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
}


