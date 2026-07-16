import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./../App.css";
import logo from "./../assets/images/logo.png";
import fond from "./../assets/images/fond.jpg";
import { FaEnvelope, FaCheck, FaRedo } from "react-icons/fa";
import { verifyEmail, resendVerificationCode } from "../api/api";

function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromParams = searchParams.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newCode.every((digit) => digit !== "")) {
      handleSubmit(newCode.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split("");
      setCode(newCode);
      inputRefs.current[5]?.focus();
      handleSubmit(pastedData);
    }
  };

  const handleSubmit = async (codeString?: string) => {
    const fullCode = codeString || code.join("");
    if (fullCode.length !== 6) {
      setMessage({ type: "error", text: "Veuillez entrer le code complet" });
      return;
    }

    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await verifyEmail(emailFromParams, fullCode);

      if (response.success) {
        setSuccess(true);
        setMessage({ type: "success", text: response.message });

        // Update local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.email_verified = true;
          localStorage.setItem("user", JSON.stringify(user));
        }

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/welcome");
        }, 2000);
      } else {
        setMessage({ type: "error", text: response.message || "Code invalide" });
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion" });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResending(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await resendVerificationCode(emailFromParams);

      if (response.success) {
        setMessage({ type: "success", text: "Nouveau code envoyé !" });
        setCountdown(60); // 60 seconds cooldown
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setMessage({ type: "error", text: response.message || "Erreur" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion" });
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="app-container" style={{ backgroundImage: `url(${fond})` }}>
        <div className="login-card" style={{ width: "450px", backgroundColor: "#ffffff", textAlign: "center" }}>
          <img src={logo} alt="Logo" className="logo" />

          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              backgroundColor: "#d1fae5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
            }}
          >
            <FaCheck size={50} color="#059669" />
          </div>

          <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "24px" }}>
            Email vérifié !
          </h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>
            Votre compte est maintenant actif. Redirection en cours...
          </p>

          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#1daeed",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          ></div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="app-container" style={{ backgroundImage: `url(${fond})` }}>
      <div className="login-card" style={{ width: "450px", backgroundColor: "#ffffff" }}>
        <img src={logo} alt="Logo" className="logo" />

        <div
          style={{
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            backgroundColor: "#e0f2fe",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <FaEnvelope size={30} color="#1daeed" />
        </div>

        <h2 style={{ color: "#333", marginBottom: "10px", fontSize: "22px", textAlign: "center" }}>
          Vérifiez votre email
        </h2>
        <p style={{ color: "#666", marginBottom: "5px", fontSize: "14px", textAlign: "center" }}>
          Un code à 6 chiffres a été envoyé à
        </p>
        <p style={{ color: "#1daeed", marginBottom: "25px", fontSize: "14px", textAlign: "center", fontWeight: "bold" }}>
          {emailFromParams}
        </p>

        {message.text && (
          <div
            style={{
              padding: "12px",
              borderRadius: "10px",
              marginBottom: "20px",
              backgroundColor: message.type === "error" ? "#fee2e2" : "#d1fae5",
              color: message.type === "error" ? "#dc2626" : "#059669",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {message.text}
          </div>
        )}

        {/* Code input */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "25px",
          }}
          onPaste={handlePaste}
        >
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={loading}
              style={{
                width: "50px",
                height: "60px",
                fontSize: "24px",
                fontWeight: "bold",
                textAlign: "center",
                border: "2px solid #e5e7eb",
                borderRadius: "12px",
                outline: "none",
                transition: "border-color 0.2s",
                backgroundColor: digit ? "#e0f2fe" : "#f9fafb",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1daeed")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          ))}
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={loading || code.some((d) => !d)}
          className="login-button"
          style={{ opacity: loading || code.some((d) => !d) ? 0.6 : 1 }}
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
              Vérification...
            </span>
          ) : (
            "Vérifier"
          )}
        </button>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "10px" }}>
            Vous n'avez pas reçu le code ?
          </p>
          <button
            onClick={handleResend}
            disabled={resending || countdown > 0}
            style={{
              background: "none",
              border: "none",
              color: countdown > 0 ? "#999" : "#1daeed",
              cursor: countdown > 0 ? "default" : "pointer",
              fontWeight: "bold",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              margin: "0 auto",
            }}
          >
            <FaRedo className={resending ? "spinning" : ""} />
            {countdown > 0 ? `Renvoyer dans ${countdown}s` : "Renvoyer le code"}
          </button>
        </div>
      </div>

      <style>
        {`
          @keyframes spin { to { transform: rotate(360deg); } }
          .spinning { animation: spin 1s linear infinite; }
        `}
      </style>
    </div>
  );
}

export default VerifyEmail;
