import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaPaperPlane } from "react-icons/fa";
import { sendMessage } from "../api/api";


interface Props {
  open: boolean;
  onClose: () => void;
  profile: {
    id?: number;
    name: string;
    photos: string[];
  } | null;
  onSend?: (msg: string) => void;
}

export default function MessageModal({ open, onClose, profile, onSend }: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!open || !profile) return null;

  const handleSend = async () => {
    if (!message.trim() || !profile.id) return;
  
    setSending(true);
    try {
      // 1. On garde votre envoi qui marche
      const response = await sendMessage({
        receiver_id: profile.id,
        content: message
      });
  
      if (response) {
        // 2. SOLUTION : On appelle onSend mais SANS refaire d'appel API 
        // pour éviter le conflit.
        if (onSend) {
          await onSend(message); 
        }
  
        // 3. IMPORTANT : Videz et fermez APRÈS l'exécution de onSend
        setMessage("");
        onClose();
      }
    } catch (error) {
      console.error("Erreur d'envoi via Modal:", error);
    } finally {
      setSending(false);
    }
  };

  const suggestions = [
    "Salut ! Comment vas-tu ? 👋",
    "Hey ! Ton profil m'a beaucoup plu 😊",
    "On se rencontre ? ☕",
  ];

  return (
    <div style={overlayStyle}>
      <div style={modalContainerStyle}>
        {/* HEADER */}
        <div style={headerStyle}>
          <img src={profile.photos[0]} style={avatarStyle} alt="avatar" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Message à {profile.name}</div>
            <div style={statusStyle}>
              <span style={onlineDotStyle} /> En ligne. Répond rapidement
            </div>
          </div>
          <IoClose size={26} color="white" style={{ cursor: "pointer" }} onClick={onClose} />
        </div>

        {/* CORPS */}
        <div style={{ padding: "16px" }}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Écris ton message à ${profile.name}`}
            style={textareaStyle}
            maxLength={500}
            disabled={sending}
          />

          <div style={charCountStyle}>
            <FaPaperPlane size={14} /> {message.length}/500
          </div>

          <div style={suggestionContainerStyle}>
            {suggestions.map((txt) => (
              <button
                key={txt}
                onClick={() => setMessage(txt)}
                style={suggestBtnStyle}
                disabled={sending}
              >
                {txt}
              </button>
            ))}
          </div>

          <button
            onClick={handleSend}
            disabled={!message || sending || !profile.id}
            style={sendBtnStyle(!!message && !sending && !!profile.id)}
          >
            <FaPaperPlane /> {sending ? "Envoi en cours..." : message ? "Envoyer le message" : "Écris ton message"}
          </button>
        </div>
      </div>
    </div>
  );
}

// STYLES
const overlayStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 };
const modalContainerStyle: React.CSSProperties = { width: "92%", maxWidth: 420, background: "white", borderRadius: 18, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.3)" };
const headerStyle: React.CSSProperties = { background: "#3A6DFF", padding: "14px 16px", color: "white", display: "flex", alignItems: "center", gap: 14 };
const avatarStyle: React.CSSProperties = { width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" };
const statusStyle: React.CSSProperties = { fontSize: 13, opacity: 0.9, display: "flex", alignItems: "center", gap: 6 };
const onlineDotStyle: React.CSSProperties = { width: 10, height: 10, borderRadius: "50%", backgroundColor: "#4ade80" };
const textareaStyle: React.CSSProperties = { width: "100%", minHeight: 120, padding: "14px 12px", fontSize: 15, borderRadius: 12, border: "1px solid #eee", outline: "none", backgroundColor: "#f9f9f9", color: "#333" };
const charCountStyle: React.CSSProperties = { display: "flex", justifyContent: "flex-end", marginTop: 6, fontSize: 12, color: "#999", gap: 6, alignItems: "center" };
const suggestionContainerStyle: React.CSSProperties = { display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" };
const suggestBtnStyle: React.CSSProperties = { background: "#f5f5f5", border: "1px solid #eee", padding: "8px 12px", borderRadius: 12, cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#333" };
const sendBtnStyle = (active: boolean): React.CSSProperties => ({ marginTop: 20, width: "100%", background: active ? "#3A6DFF" : "#e0e0e0", color: active ? "white" : "#999", padding: "14px", borderRadius: 14, border: "none", fontSize: 16, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: active ? "pointer" : "not-allowed", transition: "0.3s" });
