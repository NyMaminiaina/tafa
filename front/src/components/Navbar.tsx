import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import logo from "./../assets/images/logo.png";
import { FaHome, FaCompass, FaComments, FaHeart } from "react-icons/fa";
import { API_URL } from "../utils/api_url";
import { getConversations } from "../api/api";
import { useTheme } from "../context/ThemeContext";

const BASE_URL = API_URL?.replace("/api", "");

function Navbar() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [unreadConversations, setUnreadConversations] = useState(0);
  const { theme, setTheme } = useTheme();
  const [_userGender, setUserGender] = useState<string | null>(null);

  // Ajouter un état de chargement
  const [isNavPhotoLoading, setIsNavPhotoLoading] = useState(true);

  // 🔹 Fonction pour récupérer l'image correctement
  const getProfileImage = (photo: string | null) => {
    if (!photo) return null;
    if (photo.startsWith("http")) return photo;

    // Remplacer /storage/ par / pour les images
    const cleanPath = photo.startsWith('/') ? photo.substring(1) : photo;
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
    const finalUrl = `${cleanBase}${cleanPath.startsWith('/') ? cleanPath.substring(1) : cleanPath}`;

    console.log("URL de la Navbar :", finalUrl);
    return finalUrl;
  };

  // pour notification du nombre de message
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

    // 1er appel immédiat au chargement
    fetchUnreadConversations();

    // Boucle légère : on revérifie toutes les 8 secondes
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

  // 🔹 Charger l'utilisateur et écouter l'événement login/inscription
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUserId(user.id);
          setUserGender(user.sexe || user.gender || null);
        } catch (e) {
          console.error("Erreur parsing localStorage", e);
        }
      }

      if (!token) {
        setIsNavPhotoLoading(false); // ← important
        return;
      }

      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await response.json();
        const userSexe = data.profile?.sexe || data.sexe || null;
        setUserGender(userSexe);

        const images = data.profile?.images || data.images || [];
        const primary = images.find((img: any) => Number(img.is_primary) === 1);
        const imagePath =
          primary?.url || primary?.path ||
          images[0]?.url || images[0]?.path || null;

        setUserPhoto(imagePath);
      } catch (err) {
        console.error("Erreur chargement photo navbar:", err);
      } finally {
        setIsNavPhotoLoading(false); // ← toujours exécuté
      }
    };

    // 🔥 Chargement initial
    loadUser();

    // 🔥 Mise à jour instant après changement
    window.addEventListener("profile-photo-updated", loadUser);

    return () => {
      window.removeEventListener("profile-photo-updated", loadUser);
    };
  }, []);

  useEffect(() => {
    const handleProfilePhotoUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      setUserPhoto(customEvent.detail);
    };

    window.addEventListener("profile-photo-updated", handleProfilePhotoUpdated);

    return () => {
      window.removeEventListener("profile-photo-updated", handleProfilePhotoUpdated);
    };
  }, []);



  // 🔹 Écouter le redimensionnement de la fenêtre
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const getDefaultAvatar = () => {
    return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  };

  const profileImage = (
    <Link to={userId ? `/profil/${userId}` : "/profil"}>
      {isNavPhotoLoading ? (
        <div
          className="animate-pulse bg-gray-200 rounded-full"
          style={{
            height: isMobile ? 40 : 48,
            width: isMobile ? 40 : 48,
          }}
        />
      ) : (
        <img
          src={getProfileImage(userPhoto) || getDefaultAvatar()}
          alt="user"
          style={{
            height: isMobile ? 40 : 48,
            width: isMobile ? 40 : 48,
            borderRadius: "50%",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onError={(e) => {
            e.currentTarget.src = getDefaultAvatar();
          }}
        />
      )}
    </Link>
  );

  const navIcons = (
    <>
      <Link to="/welcome" style={{ textDecoration: "none" }}>
        <div
          style={iconStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--icon-color)")}
        >
          <FaHome size={isMobile ? 22 : 26} />
          <div style={{ marginTop: 4 }}>Accueil</div>
        </div>
      </Link>

      <Link to="/recherche" style={{ textDecoration: "none" }}>
        <div
          style={iconStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--icon-color)")}
        >
          <FaCompass size={isMobile ? 22 : 26} />
          <div style={{ marginTop: 4 }}>Explorer</div>
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
        <div
          style={iconStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--icon-color)")}
        >
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
          <div style={{ marginTop: 4 }}>Messages</div>
        </div>
      </Link>

      <Link to="/likes" style={{ textDecoration: "none" }}>
        <div
          style={iconStyle}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--icon-color)")}
        >
          <FaHeart size={isMobile ? 22 : 26} />
          <div style={{ marginTop: 4 }}>Likes</div>
        </div>
      </Link>
    </>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <>
        {/* Top Bar - Logo & Profile */}
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
          <img src={logo} alt="logo" style={{ height: 35 }} />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(theme.color, theme.mode === 'clair' ? 'sombre' : 'clair')}
              className="w-10 h-10 rounded-full flex items-center justify-center transition border"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)"
              }}
              title={theme.mode === 'clair' ? 'Mode sombre' : 'Mode clair'}
            >
              {theme.mode === 'clair' ? (
                <svg className="w-5 h-5" style={{ color: "var(--text-primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
            {profileImage}
          </div>
        </div>

        {/* Bottom Navigation Bar */}
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
    );
  }

  // Desktop Layout
  return (
    <div
      style={{
        width: "100%",
        height: 70,
        backgroundColor: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 3%",
        borderBottom: "1px solid var(--border-color)",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
      }}
    >
      {/* LEFT: LOGO */}
      <img src={logo} alt="logo" style={{ height: 40 }} />

      {/* CENTER ICONS */}
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

      {/* RIGHT: BOUTON THÈME + PHOTO DE PROFIL */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setTheme(theme.color, theme.mode === 'clair' ? 'sombre' : 'clair')}
          className="w-11 h-11 rounded-full flex items-center justify-center transition border"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)"
          }}
          title={theme.mode === 'clair' ? 'Mode sombre' : 'Mode clair'}
        >
          {theme.mode === 'clair' ? (
            <svg className="w-6 h-6" style={{ color: "var(--text-primary)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )}
        </button>
        {profileImage}
      </div>
    </div>
  );
}

export default Navbar;