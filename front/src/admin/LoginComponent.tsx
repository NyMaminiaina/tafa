import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fond from '../assets/images/fond.jpg';
import { useTheme } from '../context/ThemeContext';
import { FaEye, FaEyeSlash } from "react-icons/fa";

type LoginResponse = {
  token: string;
  user: any;
  error?: string;
};

const API_URL = import.meta.env.VITE_API_URL;

function LoginComponent() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('faniah@gmail.com');
  const [password, setPassword] = useState<string>('password');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  useTheme();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Veuillez entrer une adresse e-mail.');
      return;
    }

    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse e-mail valide.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await response.json();

      if (!response.ok) {
        setError(data.error || 'Erreur de connexion');
        return;
      }

      localStorage.setItem('adminToken', data.token || '');
      localStorage.setItem('adminUser', JSON.stringify(data.user));
      localStorage.setItem('isAuthenticated', 'true');

      if (data.user?.is_admin === false) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/welcome', { replace: true });
      } else {
        navigate('/admin/accueil', { replace: true });
      }
    } catch (err: any) {
      console.error('Erreur connexion:', err);
      setError('Une erreur réseau est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${fond})` }}
    >
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white/10 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
        <div className="hidden lg:flex flex-col justify-between p-10 text-white bg-gradient-to-br from-cyan-600/40 to-blue-900/40">
          <div>
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black mb-6" onClick={() => navigate('/')} >
              T
            </div>
            <h1 className="text-4xl font-black mb-4">Admin Tafa</h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Espace sécurisé pour gérer les utilisateurs, les statistiques,
              les conversations et la modération de la plateforme.
            </p>
          </div>

          <div className="text-sm text-white/60">
            © {new Date().getFullYear()} Tafa Administration
          </div>
        </div>

        <form
          onSubmit={handleLogin}
          className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center"
          style={{ backgroundColor: "var(--bg-primary)" }}
        >
          <div className="mb-8">
            <p className="text-sm font-semibold text-cyan-600 uppercase tracking-widest mb-2">
              Connexion administrateur
            </p>
            <h2 className="text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              Bienvenue
            </h2>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              Connectez-vous pour accéder au tableau de bord.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-400/30 text-red-400 rounded-2xl text-sm">
              {error}
            </div>
          )}

          <div className="mb-5">
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
              Adresse e-mail
            </label>
            <input
              type="email"
              placeholder="admin@tafa.mg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl text-base outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
              disabled={isLoading}
            />
          </div>

          <div className="mb-7">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl text-base outline-none focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition pr-12"
                style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3.5 rounded-2xl text-base font-bold text-white transition shadow-lg ${isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-cyan-500/30'
              }`}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginComponent;