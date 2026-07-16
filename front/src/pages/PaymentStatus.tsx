import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

import { API_URL } from "../utils/api_url";

const PaymentStatus: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "completed">("processing");

  const transactionId = localStorage.getItem("payment_transaction_id");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!transactionId) return;
  
    let interval: ReturnType<typeof setInterval>;
  
    const checkPaymentStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/payments/status/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
  
        const data = await res.json();
  
        console.log("PAYMENT STATUS =", data);
  
        const successStatus = ["completed", "success", "paid", "validated"];
  
        if (successStatus.includes(data.status)) {
          console.log("✅ Paiement confirmé !");
          setStatus("completed");
          clearInterval(interval); // 🔥 STOP polling
          localStorage.removeItem("payment_transaction_id");
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    // ✅ check immédiat
    checkPaymentStatus();
  
    // ✅ polling
    interval = setInterval(checkPaymentStatus, 1000);
  
    return () => clearInterval(interval);
  }, [transactionId, token]);

  // ⏳ EN ATTENTE
// ⏳ EN ATTENTE
if (status === "processing") {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Navbar />

      <div className="min-h-screen flex items-center justify-center px-4 pt-20 text-center">
        <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl rounded-[32px] shadow-2xl border border-white p-8 sm:p-10">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center shadow-inner">
            <div className="w-14 h-14 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
          </div>

          <h2 className="text-2xl font-black text-yellow-500 mb-4">
            ⏳ Paiement en attente
          </h2>

          <p className="text-gray-600 leading-relaxed">
            Votre demande de paiement a été envoyée 📱 <br />
            Vérifiez votre téléphone pour confirmer.
          </p>

          <p className="mt-5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-2xl px-4 py-3 font-semibold">
            En attente de validation par l'admin...
          </p>
        </div>
      </div>
    </div>
  );
}

  // 🎉 SUCCÈS
// 🎉 SUCCÈS
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 relative overflow-hidden">
    <Navbar />

    <div className="absolute top-24 left-10 w-40 h-40 bg-yellow-300/30 rounded-full blur-3xl" />
    <div className="absolute bottom-20 right-10 w-52 h-52 bg-cyan-400/30 rounded-full blur-3xl" />

    <div className="min-h-screen flex items-center justify-center px-4 pt-20 text-center relative z-10">
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-xl rounded-[36px] shadow-2xl border border-white/80 p-8 sm:p-10 overflow-hidden relative">
        
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500" />

        <div className="mx-auto mb-6 w-28 h-28 rounded-full bg-gradient-to-br from-emerald-100 to-green-200 flex items-center justify-center shadow-inner ring-8 ring-emerald-50">
          <span className="text-6xl">🎉</span>
        </div>

        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-50 text-yellow-600 text-xs font-black uppercase tracking-widest mb-4 border border-yellow-200">
          💎 Tafa Gold activé
        </span>

        <h2 className="text-4xl font-black text-gray-900 mb-4">
          Félicitations !
        </h2>

        <p className="text-gray-600 leading-relaxed max-w-md mx-auto">
          Votre abonnement est maintenant actif 💎 <br />
          Profitez des fonctionnalités premium.
        </p>

        <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4">
            <div className="text-xl mb-1">❤️</div>
            <p className="font-bold text-gray-800">Likes</p>
            <p className="text-gray-500 text-xs">illimités</p>
          </div>

          <div className="rounded-2xl bg-yellow-50 border border-yellow-100 p-4">
            <div className="text-xl mb-1">⭐</div>
            <p className="font-bold text-gray-800">Premium</p>
            <p className="text-gray-500 text-xs">activé</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/likes")}
          className="mt-8 w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-yellow-500/30 transition hover:scale-[1.02] active:scale-[0.98]"
        >
          Merci, continuer
        </button>
      </div>
    </div>
  </div>
);
};

export default PaymentStatus;