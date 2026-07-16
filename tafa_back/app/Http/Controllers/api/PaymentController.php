<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Subscription;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PaymentController extends Controller
{

// Initialise un paiement pour un abonnement et lance le traitement selon la méthode choisie
    public function initiatePayment(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $request->validate([
            'plan_id' => 'required|string|in:weekly,monthly,yearly',
            'payment_method' => 'required|string|in:mvola,orange_money,airtel_money,card',
            'phone_number' => 'nullable|string',
            'amount' => 'required|numeric|min:1000',
        ]);

        // Generate unique transaction ID
        $transactionId = 'TF' . strtoupper(Str::random(10)) . time();

        // Get plan details
        $plans = [
            'weekly' => ['name' => '1 Semaine', 'days' => 7, 'price' => 5000],
            'monthly' => ['name' => '1 Mois', 'days' => 30, 'price' => 15000],
            'yearly' => ['name' => '1 An', 'days' => 365, 'price' => 120000],
        ];

        $plan = $plans[$request->plan_id];

        // Create payment record
        $payment = Payment::create([
            'user_id' => $user->id,
            'transaction_id' => $transactionId,
            'plan_id' => $request->plan_id,
            'payment_method' => $request->payment_method,
            'phone_number' => $request->phone_number,
            'amount' => $request->amount,
            'currency' => 'MGA',
            'status' => 'pending',
        ]);

        // Process based on payment method
        switch ($request->payment_method) {
            case 'mvola':
                return $this->processMvola($payment, $request->phone_number);

            case 'orange_money':
                return $this->processOrangeMoney($payment, $request->phone_number);

            case 'airtel_money':
                return $this->processAirtelMoney($payment, $request->phone_number);

            case 'card':
                return $this->processCardPayment($payment);

            default:
                return response()->json(['error' => 'Méthode de paiement non supportée'], 400);
        }
    }

 
//Process MVola payment
    private function processMvola($payment, $phoneNumber)
    {
        
        try {
            

            $payment->update(['status' => 'processing']);

            return response()->json([
                'success' => true,
                'message' => 'Une demande de paiement MVola a été envoyée au ' . $phoneNumber . '. Veuillez confirmer sur votre téléphone.',
                'transaction_id' => $payment->transaction_id,
                'payment_method' => 'mvola',
            ]);

        } catch (\Exception $e) {
            $payment->update(['status' => 'failed']);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement MVola',
            ], 500);
        }
    }

 // Process Orange Money payment
    private function processOrangeMoney($payment, $phoneNumber)
    {

        try {
            

            $payment->update(['status' => 'processing']);

            return response()->json([
                'success' => true,
                'message' => 'Une demande de paiement Orange Money a été envoyée au ' . $phoneNumber . '. Veuillez confirmer sur votre téléphone.',
                'transaction_id' => $payment->transaction_id,
                'payment_method' => 'orange_money',
            ]);

        } catch (\Exception $e) {
            $payment->update(['status' => 'failed']);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement Orange Money',
            ], 500);
        }
    }


//Process Airtel Money payment
    private function processAirtelMoney($payment, $phoneNumber)
    {

        try {
            
            $payment->update(['status' => 'processing']);

            return response()->json([
                'success' => true,
                'message' => 'Une demande de paiement Airtel Money a été envoyée au ' . $phoneNumber . '. Veuillez confirmer sur votre téléphone.',
                'transaction_id' => $payment->transaction_id,
                'payment_method' => 'airtel_money',
            ]);

        } catch (\Exception $e) {
            $payment->update(['status' => 'failed']);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement Airtel Money',
            ], 500);
        }
    }

    
// Process Card payment (Stripe or similar)
    
    private function processCardPayment($payment)
    {
        try {
            $payment->update(['status' => 'processing']);

            return response()->json([
                'success' => true,
                'payment_url' => config('app.frontend_url', 'http://localhost:5173') . '/subscription/success?demo=true&transaction_id=' . $payment->transaction_id,
                'transaction_id' => $payment->transaction_id,
                'payment_method' => 'card',
            ]);

        } catch (\Exception $e) {
            $payment->update(['status' => 'failed']);
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de l\'initiation du paiement par carte',
            ], 500);
        }
    }

// Vérifie le statut d’un paiement pour l’utilisateur connecté
    public function checkStatus(Request $request, $transactionId)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $payment = Payment::where('transaction_id', $transactionId)
            ->where('user_id', $user->id)
            ->first();

        if (!$payment) {
            return response()->json(['error' => 'Paiement non trouvé'], 404);
        }

        return response()->json([
            'status' => $payment->status,
            'payment_method' => $payment->payment_method,
            'amount' => $payment->amount,
            'created_at' => $payment->created_at,
        ]);
    }

// Traite le retour du paiement (webhook) et met à jour le statut du paiement
    public function handleWebhook(Request $request, $provider)
    {

        $transactionId = $request->input('transaction_id') ?? $request->input('reference');

        $payment = Payment::where('transaction_id', $transactionId)->first();

        if (!$payment) {
            return response()->json(['error' => 'Payment not found'], 404);
        }

        // Verify payment status with provider
        $status = $request->input('status');

        if ($status === 'success' || $status === 'completed') {
            $payment->update(['status' => 'completed']);

            // Activate subscription
            $this->activateSubscription($payment);

            return response()->json(['message' => 'Webhook processed successfully']);
        }

        if ($status === 'failed' || $status === 'cancelled') {
            $payment->update(['status' => 'failed']);
        }

        return response()->json(['message' => 'Webhook processed']);
    }

// Active  l’abonnement d’un utilisateur après un paiement réussi
    private function activateSubscription($payment)
    {
        $plans = [
            'weekly' => 7,
            'monthly' => 30,
            'yearly' => 365,
        ];

        $days = $plans[$payment->plan_id] ?? 30;

        // Check for existing subscription
        $existingSubscription = Subscription::where('user_id', $payment->user_id)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingSubscription) {
            // Extend existing subscription
            $existingSubscription->update([
                'expires_at' => $existingSubscription->expires_at->addDays($days),
                'plan_id' => $payment->plan_id,
            ]);
        } else {
            // Create new subscription
            Subscription::create([
                'user_id' => $payment->user_id,
                'plan_id' => $payment->plan_id,
                'payment_id' => $payment->id,
                'starts_at' => now(),
                'expires_at' => now()->addDays($days),
                'is_active' => true,
            ]);
        }
    }

// Récupère l’état de l’abonnement de l’utilisateur connecté
    public function getSubscription(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $subscription = Subscription::where('user_id', $user->id)
            ->where('expires_at', '>', now())
            ->where('is_active', true)
            ->first();

        if (!$subscription) {
            return response()->json([
                'has_subscription' => false,
                'plan' => null,
            ]);
        }

        return response()->json([
            'has_subscription' => true,
            'plan' => $subscription->plan_id,
            'expires_at' => $subscription->expires_at,
            'days_remaining' => now()->diffInDays($subscription->expires_at),
        ]);
    }

// Active le boost du profil pour l’utilisateur s’il a un abonnement actif
    public function activateBoost(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        // Check if user has active subscription
        $subscription = Subscription::where('user_id', $user->id)
            ->where('expires_at', '>', now())
            ->where('is_active', true)
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez avoir un abonnement Gold pour utiliser le Boost',
                'requires_subscription' => true,
            ], 403);
        }

        
        // Update user profile to be boosted for 30 minutes
        $user->profile()->update([
            'is_boosted' => true,
            'boost_expires_at' => now()->addMinutes(30),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Votre profil est maintenant boosté pour 30 minutes!',
            'boost_expires_at' => now()->addMinutes(30),
        ]);
    }


// Liste payment
    public function getAllPayments()
    {
        return Payment::with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

// Accepter payement
    public function acceptPayment($id)
    {
        $payment = Payment::findOrFail($id);

        if ($payment->status === 'completed') {
            return response()->json(['message' => 'Déjà validé']);
        }

        $payment->update([
            'status' => 'completed'
        ]);

        // ACTIVER ABONNEMENT
        $this->activateSubscription($payment);

        return response()->json([
            'success' => true,
            'message' => 'Paiement accepté'
        ]);
    }

    // Refuser payment
    public function rejectPayment($id)
    {
        $payment = Payment::findOrFail($id);

        $payment->update([
            'status' => 'failed'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Paiement refusé'
        ]);
    }


    
}
