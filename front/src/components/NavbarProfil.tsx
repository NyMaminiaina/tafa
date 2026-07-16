import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "./../assets/images/logo.png";
import { FaHome, FaCompass, FaComments, FaHeart } from "react-icons/fa";
import { LogOut } from "lucide-react";
import { getConversations } from "../api/api";

function NavbarProfil() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [unreadConversations, setUnreadConversations] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {

    const fetchUnreadConversations = async () => {
      try {
        const data = await getConversations();

        const lastVisit = localStorage.getItem("last_messages_visit");

        const count =
          data.conversations?.filter((conv: any) => {
            if (!conv.has_unread || !conv.last_message) {
              return false;
            }
            if (!lastVisit) {
              return true;
            }
            return (
              new Date(conv.last_message.created_at) > new Date(lastVisit)
            );
          }).length || 0;

        setUnreadConversations(count);
      } catch (error) {
        console.error("Erreur notification messages:", error);
      }
    };

    fetchUnreadConversations();

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (intervalId) return;
      intervalId = setInterval(fetchUnreadConversations, 30000);
    };

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    if (document.visibilityState === "visible") {
      startPolling();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadConversations();
        startPolling();
      } else {
        stopPolling();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    window.addEventListener("navbar-message-update", fetchUnreadConversations);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("navbar-message-update", fetchUnreadConversations);
    };

  }, []);

  const iconStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: 12,
    cursor: "pointer",
    transition: "color 0.2s",
    color: "var(--icon-color)",
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const navIcons = (
    <>
      <Link to="/welcome" style={{ textDecoration: "none" }}>
        <div style={iconStyle}>
          <FaHome size={isMobile ? 22 : 26} />
          <div style={{ marginTop: 4 }}>Accueil</div>
        </div>
      </Link>

      <Link to="/recherche" style={{ textDecoration: "none" }}>
        <div style={iconStyle}>
          <FaCompass size={isMobile ? 22 : 26} />
          <div style={{ marginTop: 4 }}>Rechercher</div>
        </div>
      </Link>

      <Link
        to="/messages"
        style={{ textDecoration: "none" }}
        onClick={() => {

          localStorage.setItem(
            "last_messages_visit",
            new Date().toISOString()
          );

          setUnreadConversations(0);

        }}
      >
        <div style={iconStyle}>

          <div style={{ position: "relative" }}>

            <FaComments size={isMobile ? 22 : 26} />

            {unreadConversations > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  border: "2px solid white",
                }}
              />
            )}

          </div>

          <div style={{ marginTop: 4 }}>
            Messages
          </div>

        </div>
      </Link>

      <Link to="/likes" style={{ textDecoration: "none" }}>
        <div style={iconStyle}>
          <FaHeart size={isMobile ? 22 : 26} />
          <div style={{ marginTop: 4 }}>Likes</div>
        </div>
      </Link>
    </>
  );

  return (
    <>
      {isMobile ? (
        <>
          {/* TOP BAR MOBILE */}
          <div
            style={{
              width: "100%",
              height: 60,
              backgroundColor: "var(--bg-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 4%",
              borderBottom: "1px solid var(--border-color)",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 1000,
            }}
          >
            <Link to="/welcome">
              <img src={logo} alt="logo" style={{ height: 35, cursor: "pointer" }} />
            </Link>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
            >
              <LogOut size={18} />
              <span className="text-xs font-medium">Sortir</span>
            </button>
          </div>

          {/* BOTTOM NAV MOBILE */}
          <div
            style={{
              width: "100%",
              height: 70,
              backgroundColor: "var(--bg-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              padding: "0 2%",
              borderTop: "1px solid var(--border-color)",
              position: "fixed",
              bottom: 0,
              left: 0,
              zIndex: 1000,
            }}
          >
            {navIcons}
          </div>
        </>
      ) : (
        <div
          style={{
            width: "100%",
            height: 70,
            backgroundColor: "var(--bg-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            borderBottom: "1px solid var(--border-color)",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 1000,
          }}
        >
          <Link to="/welcome">
            <img src={logo} alt="logo" style={{ height: 40, cursor: "pointer" }} />
          </Link>

          <div
            style={{
              display: "flex",
              gap: 55,
              textAlign: "center",
              flex: 1,
              justifyContent: "center",
            }}
          >
            {navIcons}
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 transition"
          >
            <LogOut size={18} />
            <span className="text-xs font-medium">Sortir</span>
          </button>
        </div>
      )}

      {/* MODAL LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[2000]">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-sm shadow-2xl">

            {/* Icône */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <LogOut size={28} className="text-red-500" />
              </div>
            </div>

            <h2 className="text-lg font-bold mb-2 text-center text-gray-800">
              Déconnexion
            </h2>

            <p className="text-sm text-center mb-6 text-gray-500">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                Annuler
              </button>

              <button
                onClick={handleLogout}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default NavbarProfil;