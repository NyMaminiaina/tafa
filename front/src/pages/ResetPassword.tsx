import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./../App.css";
import logo from "./../assets/images/logo.png";
import fond from "./../assets/images/fond.jpg";
import { FaLock, FaArrowLeft, FaCheck, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { resetPassword, verifyResetToken } from "../api/api";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        setTokenValid(false);
        setVerifying(false);
        return;
      }

      try {
        const response = await verifyResetToken(email, token);
        setTokenValid(response.valid);
      } catch (error) {
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (!password || !confirmPassword) {
      setMessage({ type: "error", text: "Veuillez remplir tous les champs" });
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setMessage({ type: "error", text: "Le mot de passe doit contenir au moins 8 caractères" });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      setLoading(false);
      return;
    }

    try {
      const response = await resetPassword({
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      });

      if (response.success) {
        setSuccess(true);
        setMessage({ type: "success", text: response.message });
      } else {
        setMessage({ type: "error", text: response.message || "Une erreur est survenue" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (verifying) {
    return (
      <div className="app-container" style={{ backgroundImage: `url(${fond})` }}>
        <div className="login-card" style={{ width: "450px", backgroundColor: "#ffffff", textAlign: "center" }}>
          <img src={logo} alt="Logo" className="logo" />
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#1daeed",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "30px auto",
            }}
          ></div>
          <p style={{ color: "#666" }}>Vérification du lien...</p>
        </div>
        <style>
          {`@keyframes spin { to { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  // Invalid token
  if (!tokenValid) {
    return (
      <div className="app-container" style={{ backgroundImage: `url(${fond})` }}>
        <div className="login-card" style={{ width: "450px", backgroundColor: "#ffffff", textAlign: "center" }}>
          <img src={logo} alt="Logo" className="logo" />

          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <FaTimes size={40} color="#dc2626" />
          </div>

          <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "22px" }}>
            Lien invalide ou expiré
          </h2>
          <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
            Ce lien de réinitialisation n'est plus valide. Il a peut-être expiré ou a déjà été utilisé.
          </p>

          <Link
            to="/forgot-password"
            className="login-button"
            style={{ display: "block", textDecoration: "none", textAlign: "center" }}
          >
            Demander un nouveau lien
          </Link>

          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "#666",
              textDecoration: "none",
              marginTop: "20px",
              fontSize: "14px",
            }}
          >
            <FaArrowLeft /> Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="app-container" style={{ backgroundImage: `url(${fond})` }}>
        <div className="login-card" style={{ width: "450px", backgroundColor: "#ffffff", textAlign: "center" }}>
          <img src={logo} alt="Logo" className="logo" />

          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <FaCheck size={40} color="#059669" />
          </div>

          <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "22px" }}>
            Mot de passe modifié !
          </h2>
          <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
            Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
          </p>

          <button
            onClick={() => navigate("/")}
            className="login-button"
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="app-container" style={{ backgroundImage: `url(${fond})` }}>
      <div className="login-card" style={{ width: "450px", backgroundColor: "#ffffff" }}>
        <img src={logo} alt="Logo" className="logo" />

        <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "22px" }}>
          Nouveau mot de passe
        </h2>
        <p style={{ color: "#666", marginBottom: "20px", fontSize: "14px" }}>
          Entrez votre nouveau mot de passe ci-dessous.
        </p>

        {message.text && (
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "15px",
              backgroundColor: message.type === "error" ? "#fee2e2" : "#d1fae5",
              color: message.type === "error" ? "#dc2626" : "#059669",
              fontSize: "14px",
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-wrapper" style={{ position: "relative" }}>
            <FaLock className="input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "40px", paddingRight: "45px", backgroundColor: "#e6f7ff", color: "#333" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#999",
                cursor: "pointer",
              }}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          <p style={{ color: "#999", fontSize: "12px", marginTop: "-10px", marginBottom: "15px", paddingLeft: "5px" }}>
            Minimum 8 caractères
          </p>

          <div className="input-wrapper" style={{ position: "relative" }}>
            <FaLock className="input-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              style={{ paddingLeft: "40px", paddingRight: "45px", backgroundColor: "#e6f7ff", color: "#333" }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#999",
                cursor: "pointer",
              }}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1, marginTop: "10px" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid white",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                  }}
                ></div>
                Réinitialisation...
              </span>
            ) : (
              "Réinitialiser le mot de passe"
            )}
          </button>
        </form>

        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            color: "#666",
            textDecoration: "none",
            marginTop: "20px",
            fontSize: "14px",
          }}
        >
          <FaArrowLeft /> Retour à la connexion
        </Link>
      </div>

      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}

export default ResetPassword;
