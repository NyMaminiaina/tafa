import { useState } from "react";
import { Link } from "react-router-dom";
import "./../App.css";
import logo from "./../assets/images/logo.png";
import fond from "./../assets/images/fond.jpg";
import { FaEnvelope, FaArrowLeft, FaCheck } from "react-icons/fa";
import { API_URL } from "../utils/api_url";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [submitted, setSubmitted] = useState(false);
  const [, setDebugUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!email) {
      setMessage({ type: "error", text: "Veuillez entrer votre adresse email" });
      setLoading(false);
      return;
    }

    try {
      // const response = await forgotPassword(email);

      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    
      //
      const data = await res.json();
      console.log(data)

      if (res.ok) {
        setSubmitted(true);
        // setMessage({ type: "success", text: res.message });

        // For development - show debug URL if available
        if (data.debug_reset_url) {
          setDebugUrl(data.debug_reset_url);
        }
      } else {
        // setMessage({ type: "error", text: res.me "Une erreur est survenue" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${fond})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />
  
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
  
        {/* LEFT PANEL */}
        <div className="bg-white/95 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
  
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src={logo} alt="Tafa" className="w-24" />
          </div>
  
          {!submitted ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">
                  Récupération
                </p>
                <h2 className="text-3xl font-black text-gray-900">
                  Mot de passe oublié ?
                </h2>
                <p className="text-gray-500 mt-2 leading-relaxed">
                  Entrez votre adresse e-mail et nous vous enverrons un lien pour
                  réinitialiser votre mot de passe.
                </p>
              </div>
  
              {/* Message */}
              {message.text && (
                <div
                  className={`mb-5 p-4 rounded-2xl text-sm font-medium border ${
                    message.type === "error"
                      ? "bg-red-50 border-red-200 text-red-700"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  {message.text}
                </div>
              )}
  
              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse e-mail
                  </label>
  
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="exemple@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 border border-gray-200 rounded-2xl bg-gray-50 text-gray-800 focus:bg-white focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                      disabled={loading}
                    />
                  </div>
                </div>
  
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3.5 rounded-2xl text-base font-bold text-white transition shadow-lg ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/30"
                  }`}
                >
                  {loading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-sm">
                <FaCheck size={34} className="text-emerald-600" />
              </div>
  
              <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-2">
                Email envoyé
              </p>
  
              <h2 className="text-3xl font-black text-gray-900 mb-3">
                Vérifiez votre boîte mail
              </h2>
  
              <p className="text-gray-500 leading-relaxed mb-3">
                Si un compte existe avec l'adresse{" "}
                <strong className="text-gray-800">{email}</strong>, vous recevrez
                un email avec les instructions pour réinitialiser votre mot de passe.
              </p>
  
              <p className="text-gray-400 text-sm mb-7">
                Le lien expire dans 1 heure.
              </p>
  
              <button
                onClick={() => {
                  setSubmitted(false);
                  setEmail("");
                  setDebugUrl("");
                }}
                className="w-full py-3.5 rounded-2xl text-base font-bold border-2 border-blue-500 text-blue-600 hover:bg-blue-50 transition"
              >
                Renvoyer l'email
              </button>
            </div>
          )}
  
          {/* Retour */}
          <Link
            to="/"
            className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-blue-600 transition"
          >
            <FaArrowLeft /> Retour à la connexion
          </Link>
        </div>
  
        {/* RIGHT PANEL */}
        <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
  
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-900" />
  
          {/* Glow Effects */}
          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-cyan-400/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-blue-500/40 rounded-full blur-3xl" />
  
          {/* Content */}
          <div className="relative z-10">
            <img
              src={logo}
              alt="Tafa"
              className="mx-auto w-80 mb-12 drop-shadow-xl transition-transform duration-300 hover:scale-105"
            />
  
            <h1 className="text-5xl font-black leading-tight mb-6">
              Récupérez votre <span className="text-cyan-200">accès</span>
            </h1>
  
            <p className="text-white/90 text-lg leading-relaxed max-w-md">
              Réinitialisez votre mot de passe rapidement et continuez à utiliser
              votre espace personnel en toute sécurité.
            </p>
          </div>
  
          <div className="relative z-10 text-sm text-white/70">
            © {new Date().getFullYear()} Tafa — Tous droits réservés
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
