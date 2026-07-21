import { useEffect, useState } from "react";

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

  const fetchPremiumUsers = async () => {
    setIsLoadingPremium(true);
    try {
      const res = await fetch(`${API_URL}/admin/subscriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
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

  const handleAccept = async (id: number): Promise<void> => {
    await fetch(`${API_URL}/admin/payments/${id}/accept`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPayments();
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      processing: { bg: "bg-amber-100", text: "text-amber-700", label: "En attente" },
      completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Accepté" },
      rejected: { bg: "bg-rose-100", text: "text-rose-700", label: "Refusé" },
    };
    const c = config[status] || config.processing;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
        {c.label}
      </span>
    );
  };

  return (
    <div className="p-3 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Paiements & Abonnements</h1>
          <p className="text-gray-600">Gérez les demandes et les utilisateurs premium</p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab("demandes")}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm ${activeTab === "demandes" ? "bg-sky-600 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
        >
          Demandes
        </button>
        <button
          onClick={() => { setActiveTab("premium"); fetchPremiumUsers(); }}
          className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm ${activeTab === "premium" ? "bg-amber-500 text-white" : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"}`}
        >
          Premium
        </button>
      </div>

      {/* DEMANDES */}
      {activeTab === "demandes" && (
        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Demandes d'abonnement</h3>
            <p className="text-gray-500 text-sm mt-1">Liste des paiements en attente de validation</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Utilisateur</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Montant</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Plan</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Téléphone</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-800">{p.user?.name || "N/A"}</div>
                      <div className="text-xs text-gray-500">ID: {p.id}</div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-emerald-600">{p.amount} Ar</td>
                    <td className="py-4 px-6">
                      <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-semibold">TAFA {p.plan_id}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{p.phone_number}</td>
                    <td className="py-4 px-6">{getStatusBadge(p.status)}</td>
                    <td className="py-4 px-6">
                      {p.status === "processing" ? (
                        <div className="flex gap-2">
                          <button onClick={() => setSelectedPayment(p)} className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 transition">Détails</button>
                          <button onClick={() => handleAccept(p.id)} className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition">Accepter</button>
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

      {/* PREMIUM */}
      {activeTab === "premium" && (
        <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800">Utilisateurs Premium</h3>
            <p className="text-gray-500 text-sm mt-1">Abonnements actifs</p>
          </div>
          {isLoadingPremium ? (
            <div className="p-6 text-center text-gray-500">Chargement...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Utilisateur</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Abonnement</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Paiement</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Début</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Expiration</th>
                  </tr>
                </thead>
                <tbody>
                  {premiumUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-400 flex items-center justify-center text-white font-bold overflow-hidden">
                            {u.avatar ? <img src={`${import.meta.env.VITE_STORAGE_URL}/${u.avatar}`} className="w-full h-full object-cover" alt="" /> : u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{u.name}</div>
                            <div className="text-xs text-gray-500">ID: {u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{u.email}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-semibold">{u.plan}</span>
                      </td>
                      <td className="py-4 px-6 text-sky-600 font-medium">{u.payment_method}</td>
                      <td className="py-4 px-6 text-gray-600">{u.starts_at ? new Date(u.starts_at).toLocaleDateString() : "N/A"}</td>
                      <td className="py-4 px-6 text-gray-600">{u.expires_at ? new Date(u.expires_at).toLocaleDateString() : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* MODAL DETAILS */}
      {selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Details du paiement</h2>
              <button onClick={() => setSelectedPayment(null)} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
            </div>
            <div className="bg-gray-50 p-5 rounded-xl text-gray-700 space-y-3">
              <p><span className="font-semibold">Utilisateur :</span> {selectedPayment.user?.name}</p>
              <p><span className="font-semibold">Telephone :</span> {selectedPayment.phone_number}</p>
              <p><span className="font-semibold">Montant :</span> <span className="text-emerald-600 font-bold">{selectedPayment.amount} Ar</span></p>
              <p><span className="font-semibold">Plan :</span> TAFA {selectedPayment.plan_id}</p>
              <p><span className="font-semibold">Methode :</span> {selectedPayment.payment_method || "Mobile Money"}</p>
              <p><span className="font-semibold">Statut :</span> {getStatusBadge(selectedPayment.status)}</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setSelectedPayment(null)} className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition">Fermer</button>
              {selectedPayment.status === "processing" && (
                <button onClick={() => { handleAccept(selectedPayment.id); setSelectedPayment(null); }} className="px-4 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition">Accepter</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}