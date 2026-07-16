import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./../App.css";
import logo from "./../assets/images/logo.png";
import fond from "./../assets/images/fond.jpg";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { API_URL } from "../utils/api_url";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: { preventDefault: () => void; }) => {
    if (e) e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // On vide le mot de passe par sécurité en cas d'échec
        setPassword("");
        setError(data.message || "Erreur de connexion");
        setLoading(false);
        return;
      }

      // Vérification que data.user existe avant de déstructurer
      if (data.user && data.token) {
        const userWithImage = {
          ...data.user,
          image: data.image || null,
          sexe: data.user?.sexe || data.user?.gender || null
        };
        console.log("USER DATA:", data.user); // ← AJOUTE CECI
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(userWithImage));

        window.dispatchEvent(new Event("user-logged-in"));
        navigate("/welcome");
      } else {
        throw new Error("Données de réponse incomplètes");
      }

    } catch (err) {
      setError("Impossible de se connecter au serveur");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
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
        <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src={logo} alt="Tafa" className="w-24" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">
              Connexion
            </p>
            <h2 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              Accès sécurisé
            </h2>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              Entrez vos identifiants pour continuer.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-400/30 text-red-400 rounded-2xl text-sm font-medium">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>

            {/* Email */}
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Adresse e-mail
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)"
                  }}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-3">
              <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
                Mot de passe
              </label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                    border: "1px solid var(--border-color)"
                  }}
                  required
                  disabled={loading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition"
                  disabled={loading}
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div className="flex justify-end mb-7">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl text-base font-bold text-white transition shadow-lg ${loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/30"
                }`}
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center" style={{ color: "var(--text-secondary)" }}>
            <span>Pas encore de compte ? </span>
            <Link
              className="font-bold hover:underline"
              style={{ color: "var(--color-primary)" }}
              to="/inscription"
            >
              Inscrivez-vous
            </Link>
          </div>
        </div>
        {/* RIGHT PANEL */}
        <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">

          {/* BACKGROUND GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-900" />

          {/* GLOW EFFECT */}
          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-cyan-400/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-blue-500/40 rounded-full blur-3xl" />

          {/* CONTENT */}
          <div className="relative z-10">
            <img src={logo} alt="Tafa" className="mx-auto w-80 mb-12 drop-shadow-xl transition-transform duration-300 hover:scale-105" />

            <h1 className="text-5xl font-black leading-tight mb-6">
              Bienvenue sur <span className="text-cyan-200">Tafa</span>
            </h1>

            <p className="text-white/90 text-lg leading-relaxed max-w-md">
              Connectez-vous pour accéder à votre espace personnel, gérer vos interactions et découvrir de nouvelles opportunités.
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

export default Login;