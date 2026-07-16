import  { useEffect, useState } from "react";


type User = {
  name?: string;
  email?: string;
};

type Payment = {
  id: number;
  amount: number;
  plan_id: number | string;
  phone_number: string;
  status: "processing" | "completed" | "rejected";
  payment_method?: string;
  user?: User;
};

type PremiumUser = {
  id: number;
  name: string;
  email: string;
  plan: number | string;
  payment_method: string;
  starts_at: string | null;
  expires_at: string | null;
  avatar?: string;
};
const API_URL = import.meta.env.VITE_API_URL;

export default function Paiement() {
  
const [activeTab, setActiveTab] = useState<"demandes" | "premium">("demandes");
  
  const [isLoadingPremium, setIsLoadingPremium] = useState(false);
  

  const [payments, setPayments] = useState<Payment[]>([]);
const [premiumUsers, setPremiumUsers] = useState<PremiumUser[]>([]);
const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

const token: string | null = localStorage.getItem("token");

  // 🔥 FETCH PAYMENTS
  const fetchPayments = async (): Promise<void> => {
    try {
      const res = await fetch(`${API_URL}/admin/payments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setPayments(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 FETCH PREMIUM USERS
  const fetchPremiumUsers = async () => {
    setIsLoadingPremium(true);
  
    try {
      const res = await fetch(`${API_URL}/admin/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      const data = await res.json();
  
      console.log("SUBSCRIPTIONS =", data); // 🔥 DEBUG
  
      const users: PremiumUser[] = (Array.isArray(data) ? data : data?.data || []).map((sub: any) => ({
        id: sub.id,
  
        name: sub.user?.name || "Inconnu",
        email: sub.user?.email || "N/A",
  
        plan: sub.plan_id,
        payment_method: sub.payment?.payment_method || "N/A",
  
        starts_at: sub.starts_at,
        expires_at: sub.expires_at,
      }));
  
      setPremiumUsers(users);
  
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingPremium(false);
    }
  };

  useEffect(() => {
    fetchPayments();

    const interval = setInterval(fetchPayments, 5000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 ACTIONS
  const handleAccept = async (id: number): Promise<void> => {
    await fetch(`${API_URL}/admin/payments/${id}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchPayments();
  };


  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h2 className="text-2xl font-bold mb-6">💰 Gestion Paiements</h2>

      {/* 🔘 TABS */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("demandes")}
          className={`px-5 py-2 rounded-xl ${
            activeTab === "demandes"
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          📩 Demandes
        </button>

        <button
          onClick={() => {
            setActiveTab("premium");
            fetchPremiumUsers();
          }}
          className={`px-5 py-2 rounded-xl ${
            activeTab === "premium"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200"
          }`}
        >
          👑 Premium
        </button>
      </div>

      {/* 🟡 DEMANDES */}
      {activeTab === "demandes" && (
  <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">

    {/* HEADER */}
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        📩 Demandes d'abonnement
      </h3>
      <p className="text-gray-500 text-sm">
        Liste des paiements en attente
      </p>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">

        {/* HEADER TABLE */}
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
              Utilisateur
            </th>
            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
              Montant
            </th>
            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
              Plan
            </th>
            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
              Téléphone
            </th>
            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
              Statut
            </th>
            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {payments.map((p) => (
            <tr
              key={p.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition"
            >

              {/* USER */}
              <td className="py-4 px-6">
                <div className="font-medium text-gray-800">
                  {p.user?.name}
                </div>
                <div className="text-xs text-gray-500">
                  ID: {p.id}
                </div>
              </td>

              {/* AMOUNT */}
              <td className="py-4 px-6 font-semibold text-green-600">
                {p.amount} Ar
              </td>

              {/* PLAN */}
              <td className="py-4 px-6">
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-sm">
                  {p.plan_id}
                </span>
              </td>

              {/* PHONE */}
              <td className="py-4 px-6 text-gray-600">
                {p.phone_number}
              </td>

              {/* STATUS */}
              <td className="py-4 px-6">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    p.status === "processing"
                      ? "bg-yellow-100 text-yellow-700"
                      : p.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {p.status}
                </span>
              </td>

              {/* ACTIONS */}
              <td className="py-4 px-6">
                {p.status === "processing" ? (
                  <div className="flex gap-2">

                  {/* 👁 VOIR */}
                  <button
                    onClick={() => setSelectedPayment(p)}
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                  >
                    👁 Voir details
                  </button>
                
                  {/* ✅ */}
                  <button
                    onClick={() => handleAccept(p.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                  >
                    ✅ Accepter
                  </button>
                
                  
                
                </div>
                ) : (
                  <span className="text-gray-400 text-sm">—</span>
                )}
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  </div>
)}
      {/* 🟢 PREMIUM USERS (STYLE PRO) */}
      {activeTab === "premium" && (
  <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">

    {/* HEADER */}
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        👑 Utilisateurs Premium
      </h3>
      <p className="text-gray-500 text-sm">
        Liste des abonnements (table subscriptions)
      </p>
    </div>

    {/* LOADING */}
    {isLoadingPremium ? (
      <div className="p-6 text-center text-gray-500">Chargement...</div>
    ) : (
      <div className="overflow-x-auto">

        <table className="w-full">

          {/* HEADER TABLE */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Utilisateur
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Email
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Type d'abonnement
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Paiement
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Début
              </th>
              <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                Expiration
              </th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {premiumUsers.map((u) => (
              <tr
                key={u.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >

                {/* USER */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold overflow-hidden">
                      {u.avatar ? (
                        <img
                          src={`http://127.0.0.1:8000/${u.avatar}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        u.name?.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="font-medium text-gray-800">
                        {u.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {u.id}
                      </div>
                    </div>
                  </div>
                </td>

                {/* EMAIL */}
                <td className="py-4 px-6 text-gray-600">
                  {u.email}
                </td>

                {/* PLAN */}
                <td className="py-4 px-6">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm">
                    👑 {u.plan}
                  </span>
                </td>

                {/* PAYMENT */}
                <td className="py-4 px-6 text-blue-600 font-medium">
                  {u.payment_method}
                </td>

                {/* START */}
                <td className="py-4 px-6 text-gray-600">
                  {u.starts_at
                    ? new Date(u.starts_at).toLocaleDateString()
                    : "N/A"}
                </td>

                {/* EXPIRE */}
                <td className="py-4 px-6 text-gray-600">
                  {u.expires_at
                    ? new Date(u.expires_at).toLocaleDateString()
                    : "N/A"}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    )}


  </div>
)}

{/* Modals pour la demande  */}

{selectedPayment && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">

    {/* CONTAINER */}
    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-8 animate-fadeIn">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            📄 Détails du paiement
          </h2>
          <p className="text-gray-500 text-sm">
            Vérifiez les informations avant validation
          </p>
        </div>

        <button
          onClick={() => setSelectedPayment(null)}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>
      </div>

      {/* CONTENT */}
      <div className="bg-gray-50 p-5 rounded-xl  text-gray-700 leading-relaxed ">

        <p>
          📌 L’utilisateur{" "}
          <span className="font-semibold text-gray-900">
            {selectedPayment.user?.name}
          </span>{" "}
          (📱{" "}
          <span className="font-medium">
            {selectedPayment.phone_number}
          </span>
          ) a effectué un paiement de{" "}
          <span className="font-semibold text-green-600 text-lg">
            {selectedPayment.amount} Ar
          </span>{" "}
          pour l’abonnement{" "}
          <span className="font-semibold text-blue-600">
            TAFA {selectedPayment.plan_id}
          </span>{" "}
          via{" "}
          <span className="font-semibold text-yellow-600">
            {selectedPayment.payment_method || "Mobile Money"}
          </span>.
        </p>

        <p className="mt-3">
          📊 Le statut actuel est{" "}
          <span
            className={`px-3 py-1 rounded-full text-sm ${
              selectedPayment.status === "processing"
                ? "bg-yellow-100 text-yellow-700"
                : selectedPayment.status === "completed"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {selectedPayment.status}
          </span>
        </p>

      </div>

      {/* ACTIONS */}
      <div className="flex justify-between items-center mt-8">

        <button
          onClick={() => setSelectedPayment(null)}
          className="px-5 py-2.5 bg-gray-200 hover:bg-gray-300 rounded-xl transition"
        >
          Fermer
        </button>

        {selectedPayment.status === "processing" && (
          <div className="flex gap-3">

            <button
              onClick={() => {
                handleAccept(selectedPayment.id);
                setSelectedPayment(null);
              }}
              className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition shadow"
            >
              ✅ Accepter
            </button>

            

          </div>
        )}

      </div>

    </div>
  </div>
)}

    </div>
  );
}