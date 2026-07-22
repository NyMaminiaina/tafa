import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  FaHeart, FaTimes, FaTelegramPlane, FaMapMarkerAlt, FaCheckCircle, FaInfoCircle, FaClock, FaLanguage, FaCommentDots, FaFilter, FaLocationArrow, FaBriefcase, FaStar, FaUser
} from "react-icons/fa";
import {
  Trophy, Music, Plane, Book, Film, Music2,
  Utensils, Gamepad2, Camera, Palette,
  Dumbbell, Flower2, Star, PawPrint,
  Laptop, Mountain, Leaf, FileText,
  Shirt, Sun, UserRound
} from "lucide-react";
import MessageModal from "../components/MessageModal";
import UpgradeModal from "../components/UpgradeModal";
import { Sparkles, X } from "lucide-react";

import axios from "axios";
import { API_URL } from "../utils/api_url";
import { likeProfile, dislikeProfile, getNearbyOnline, getUserLimits, startConversation } from "../api/api";
import useGeolocation from "../hooks/useGeolocation";
import ModalProfile from "../components/ModalProfile";
import Footer from "../components/Footer";

// --- TYPES ---
interface Profile {
  id: number;
  name: string;
  first_name?: string;
  age: number;
  job: string;
  situation_amoureuse: string;
  relations_rechercher?: string;
  email?: string;
  location: string;
  interests: any[];
  photos: string[];
  bio: string;
  langues: any[];
  lastActive: string | null;
  compatibility: number;
  distance?: number | null;
  Zodiac_sign?: string;
}

interface NearbyUser {
  id: number;
  name: string;
  photo: string;
  distance: number;
  lastActive: string | null;
}

const BASE_URL = API_URL?.replace("/api", "");
const INTEREST_ICONS: { [key: string]: React.ReactNode } = {
  "Sport": <Trophy className="w-4 h-4 text-red-500" />,
  "Musique": <Music className="w-4 h-4 text-purple-500" />,
  "Voyage": <Plane className="w-4 h-4 text-blue-400" />,
  "Lecture": <Book className="w-4 h-4 text-indigo-500" />,
  "Cinéma": <Film className="w-4 h-4 text-slate-500" />,
  "Danse": <Music2 className="w-4 h-4 text-pink-500" />,
  "Cuisine": <Utensils className="w-4 h-4 text-orange-500" />,
  "Jeux vidéo": <Gamepad2 className="w-4 h-4 text-cyan-500" />,
  "Photographie": <Camera className="w-4 h-4 text-pink-400" />,
  "Art": <Palette className="w-4 h-4 text-rose-500" />,
  "Fitness": <Dumbbell className="w-4 h-4 text-lime-600" />,
  "Yoga": <Flower2 className="w-4 h-4 text-emerald-500" />,
  "Théâtre": <Star className="w-4 h-4 text-yellow-500" />,
  "Animaux": <PawPrint className="w-4 h-4 text-amber-600" />,
  "Technologie": <Laptop className="w-4 h-4 text-blue-600" />,
  "Randonnée": <Mountain className="w-4 h-4 text-stone-500" />,
  "Nature": <Leaf className="w-4 h-4 text-green-500" />,
  "Écriture": <FileText className="w-4 h-4 text-gray-500" />,
  "Mode": <Shirt className="w-4 h-4 text-violet-500" />,
  "Plage": <Sun className="w-4 h-4 text-yellow-500" />,
};

const SITUATION_LABELS: { [key: string]: string } = {
  'Celibataire': 'Célibataire',
  'marie': 'Marié(e)',
  'Divorce': 'Divorcé(e)',
  'veuf': 'Veuf(ve)',
  'separe': 'Séparé(e)'
};

function Home() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardOffset, setCardOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [cursorType, setCursorType] = useState<"left" | "right" | "grab">("grab");
  const [messageOpen, setMessageOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationType, setNotificationType] = useState<"success" | "match" | "location">("success");
  const [matchedProfile, setMatchedProfile] = useState<Profile | null>(null);
  const matchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [messageProfile, setMessageProfile] = useState<Profile | null>(null);
  const openedMessageFromMatchRef = useRef(false);
  const [, setIsMobile] = useState(window.innerWidth < 768);
  const [, setIsLargeScreen] = useState(window.innerWidth >= 2560);
  const [isLiking, setIsLiking] = useState(false);
  const [, setLoading] = useState(true);

  const { latitude, longitude } = useGeolocation();
  const [, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [remainingLikes, setRemainingLikes] = useState<number>(10);
  const [isGold, setIsGold] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showMobileProfileInfo, setShowMobileProfileInfo] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);

  const startX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const intentionLabel = searchParams.get("intentionLabel");
  const interestFilter = searchParams.get("interest");
  const filtered = searchParams.get("filtered") === "true";
  const ageMin = searchParams.get("ageMin");
  const ageMax = searchParams.get("ageMax");
  const situationAffiche = searchParams.get("situationLabel");
  const interestNames = searchParams.get("interestNames");
  const intentionAffichee = searchParams.get("intentionLabel");
  const distanceMax = searchParams.get("distance");

  const currentProfile = profiles[currentIndex] || null;
  const [initializedFromUrl, setInitializedFromUrl] = useState(false);

  const clearFilter = () => {
    const isFromFiltrerPage = searchParams.get("filtered") === "true";
    if (isFromFiltrerPage) {
      navigate("/filtres");
    } else {
      navigate("/recherche");
    }
  };

  const formatImageUrl = (path: string | null) => {
    if (!path) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    if (path.startsWith("http")) return path;
    const cleanPath = path.replace(/^\/storage\//, '/').replace(/^\//, '');
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
    return `${cleanBase}${cleanPath}`;
  };

  useEffect(() => {
    if (currentProfile && initializedFromUrl) {
      navigate(`/welcome?userId=${currentProfile.id}`, { replace: true });
    }
  }, [currentProfile, initializedFromUrl]);

  useEffect(() => {
    const userId = searchParams.get("userId");
    if (!userId || profiles.length === 0 || initializedFromUrl) return;

    const parsedId = parseInt(userId);
    if (isNaN(parsedId)) return;

    const index = profiles.findIndex(p => p.id === parsedId);

    if (index !== -1) {
      setCurrentIndex(index);
      setInitializedFromUrl(true);
    } else {
      const fetchUser = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`${API_URL}/profiles/${parsedId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const p = res.data.profile;
          const newProfile: Profile = {
            id: p.user_id || p.id,
            first_name: p.first_name || "",
            name: p.name || "Inconnu",
            age: p.age || 25,
            job: p.profession || "Non spécifié",
            email: p.email || "Email non défini",
            situation_amoureuse: p.situation_amoureuse || "Situation amoureuse non définie",
            Zodiac_sign: p.Zodiac_sign || "Signe Astro TSSSS",
            relations_rechercher: p.relations_rechercher || "Non spécifié",
            location: p.city?.name || "Non spécifié",
            distance: p.distance || null,
            interests: p.interests || [],
            photos: p.images && p.images.length > 0
              ? p.images.map((img: any) => formatImageUrl(img.url || img.path))
              : [],
            bio: p.bio || "",
            langues: p.langues || [],
            lastActive: p.last_active || null,
            compatibility: p.compatibility || 0,
          };
          setProfiles(prev => [newProfile, ...prev]);
          setCurrentIndex(0);
          setInitializedFromUrl(true);
        } catch (error) {
          console.error("Erreur chargement profil:", error);
        }
      };
      fetchUser();
    }
  }, [searchParams, profiles, initializedFromUrl]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLargeScreen(window.innerWidth >= 2560);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

      const params = Object.fromEntries(searchParams);
      delete params.userId;

      const resProfiles = await axios.get(`${API_URL}/profiles`, {
        headers: { Authorization: `Bearer ${token}` },
        params: params
      });

      const data = resProfiles.data.profiles || [];

      const formatted = data.map((p: any) => ({
        id: p.user_id || p.id,
        first_name: p.first_name || "",
        name: p.name || "Inconnu",
        age: p.age || 25,
        job: p.profession || "Non spécifié",
        email: p.email || "Email non défini",
        situation_amoureuse: p.situation_amoureuse || "Situation amoureuse non définie",
        Zodiac_sign: p.Zodiac_sign || "Signe Astro non défini",
        relations_rechercher: p.relations_rechercher || "Non spécifié",
        location: p.city?.name || "Non spécifié",
        distance: p.distance || null,
        interests: p.interests || [],
        photos: p.images && p.images.length > 0
          ? p.images.map((img: any) => formatImageUrl(img.url || img.path))
          : [],
        bio: p.bio || "",
        langues: p.langues || [],
        lastActive: p.last_active || null,
        compatibility: p.compatibility || 0,
      }));

      setProfiles(formatted);

      const userId = searchParams.get("userId");
      if (!userId) {
        setCurrentIndex(0);
      }
      // setCurrentPhotoIndex(0);
      setLoading(false);
    } catch (err) {
      console.error("Erreur de chargement des profils :", err);
      setLoading(false);
    }
  }, [searchParams, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const initData = async () => {
      try {
        const limits = await getUserLimits();
        setIsGold(limits.is_gold);
        setRemainingLikes(limits.remaining_likes);

        if (latitude && longitude) {
          const resNearby = await getNearbyOnline(50);
          setNearbyUsers(resNearby.profiles || []);
        }
      } catch (e) { console.error(e); }
    };
    initData();
  }, [latitude, longitude]);

  const nextProfile = () => {
    setCurrentIndex(prev => prev + 1);
    // setCurrentPhotoIndex(0);
    setCardOffset({ x: 0, y: 0 });
  };

  const handlePhotoNavigation = () => {
    // Plus de navigation de photo
  };

  const handleLike = async () => {
    if (isLiking || !currentProfile) return;

    setIsLiking(true);

    try {
      const res = await likeProfile(currentProfile.id);

      if (res.limit_reached) {
        setShowUpgradeModal(true);
      } else {
        setRemainingLikes(res.remaining_likes);

        if (res.is_match) {

          setMatchedProfile(currentProfile);
          setNotificationType("match");
          setNotificationMessage(
            `C'est un Match avec ${currentProfile.name} !`
          );
          setShowNotification(true);
          openedMessageFromMatchRef.current = false;

          // La notification de match (via Tafa) est désormais envoyée par
          // le backend, dans un échange séparé entre chaque utilisateur et
          // Tafa (voir LikeController::notifyMatch côté API).

        } else {
          nextProfile();
        }
      }

    } catch (e) {
      nextProfile();
    } finally {
      setIsLiking(false);
    }
  };

  const handleDislike = async () => {
    if (showNotification && notificationType === "match") {
      setShowNotification(false);
      setMatchedProfile(null);
      return;
    }
    if (isLiking || isDisliking || !currentProfile) return;

    setIsDisliking(true);
    try { await dislikeProfile(currentProfile.id); } catch (e) { }
    nextProfile();
    setIsDisliking(false);
  };

  const openMessageModalFor = async (profile: Profile | null) => {
    if (!profile) return;

    setMessageProfile(profile);
    setMessageOpen(true);

    try {
      const res = await startConversation(profile.id);
      if (res?.success) {
        console.log(
          res.is_new
            ? `Nouvel échange créé (id: ${res.echange_id})`
            : `Échange déjà existant (id: ${res.echange_id})`
        );
      }
    } catch (error) {
      console.error("Erreur lors de la vérification/création de l'échange:", error);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setCardOffset({ x: e.clientX - startX.current, y: 0 });
    } else if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setCursorType(e.clientX - rect.left < rect.width / 2 ? "left" : "right");
    }
  };

  const handleMouseUp = () => {
    if (dragging) {
      if (cardOffset.x > 150) handleLike();
      else if (cardOffset.x < -150) handleDislike();
    }
    setDragging(false);
    setCardOffset({ x: 0, y: 0 });
  };

  const hasProfiles = profiles.length > 0;
  const hasActiveFilter = intentionLabel || interestFilter;

  // ====== Blocs réutilisables (desktop aside + mobile stack) ======
  const SpecificationBlock = () => (
    <div className="p-5 sm:p-7 rounded-[24px] sm:rounded-[32px] shadow-sm border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
      <h2 className="text-xl sm:text-2xl font-black" style={{ color: "var(--color-primary)" }}>
        {[currentProfile?.first_name, currentProfile?.name].filter(Boolean).join(" ") || "Utilisateur"}, {currentProfile?.age || "0"}
      </h2>
      <div className="flex items-center gap-2 text-gray-500 mt-2 font-medium text-sm sm:text-base">
        <FaMapMarkerAlt className="text-red-400 shrink-0" /> {currentProfile?.location || "Ville non specifié"}
      </div>
      <div className="flex items-center gap-2 mt-2 font-bold text-sm sm:text-base">
        <FaBriefcase className="shrink-0" style={{ color: "var(--color-primary)" }} />
        <span style={{ color: "var(--text-primary)" }}>
          {currentProfile?.job || "Profession non spécifiée"}
        </span>
      </div>
    </div>
  );

  const CompatibiliteBlock = () => (
    <div className="p-5 sm:p-7 rounded-[24px] sm:rounded-[32px] shadow-sm border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
      <div className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3 flex items-center gap-2">
        <Sparkles size={14} className="text-red-500 fill-red-500" />
        Compatibilité
      </div>
      <div className="text-5xl sm:text-6xl font-black text-[#FF5A60] mb-2">
        {(currentProfile?.compatibility ?? 0)}%
      </div>
      <div
        className="text-sm font-bold mb-4"
        style={{
          color:
            (currentProfile?.compatibility ?? 0) >= 70
              ? "#22C55E"
              : (currentProfile?.compatibility ?? 0) >= 40
                ? "#F59E0B"
                : "#EF4444",
        }}
      >
        {(currentProfile?.compatibility ?? 0) >= 70
          ? "Excellente compatibilité ❤️"
          : (currentProfile?.compatibility ?? 0) >= 40
            ? "Compatibilité moyenne 🙂"
            : "Compatibilité faible 😕"}
      </div>
      <div className="w-full">
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-red-400 to-red-600 h-full transition-all duration-1000"
            style={{ width: `${(currentProfile?.compatibility ?? 0)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 px-1 text-[10px] font-bold text-gray-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );

  const InteretsBlock = () => (
    <div className="p-5 sm:p-7 rounded-[24px] sm:rounded-[32px] shadow-sm border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
      <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4 flex items-center gap-2">
        <FaHeart className="text-blue-400" /> Centres d'intérêts
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {currentProfile?.interests && currentProfile.interests.length > 0 ? (
          currentProfile.interests.map((it: any, i: number) => {
            const name = typeof it === "string" ? it : it.name;
            return (
              <span
                key={i}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-full text-[11px] sm:text-xs font-black"
                style={{ backgroundColor: "var(--color-primary-light)", color: "var(--color-primary)" }}
              >
                <span className="flex items-center justify-center">
                  {INTEREST_ICONS[name] || "❤️"}
                </span>
                {name}
              </span>
            );
          })
        ) : (
          <span className="text-xs italic" style={{ color: "var(--text-secondary)" }}>
            Aucun intérêt
          </span>
        )}
      </div>
    </div>
  );

  const AProposBlock = () => (
    <div className="p-8 rounded-[32px] shadow-sm border" style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}>
      <h3 className="text-base sm:text-[20px] font-black uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2" style={{ color: "var(--color-primary)" }}>
        <FaInfoCircle />
        À propos
      </h3>
      <div className="space-y-3 text-sm">
        <div className="pb-2">
          <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
            Bio
          </p>
          <p className="relative rounded-3xl px-4 sm:px-5 py-3 sm:py-4 text-sm leading-relaxed font-medium italic border" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-secondary)", borderColor: "var(--border-color)" }}>
            "{currentProfile?.bio || "Aucune description disponible"}"
          </p>
        </div>
        <InfoRow icon={<FaInfoCircle />} label="Email" value={currentProfile?.email || "Email non défini"} />
        <InfoRow icon={<FaLanguage />} label="Langues" value={currentProfile?.langues?.map((l: any) => l.name || l).join(", ") || "Non spécifié"} />
        <InfoRow icon={<FaHeart />} label="Situation Amoureuse" value={currentProfile?.situation_amoureuse
          ? (SITUATION_LABELS[currentProfile.situation_amoureuse] || currentProfile.situation_amoureuse)
          : "Non spécifié"} />
        <InfoRow icon={<FaUser />} label="Relation Recherchée" value={currentProfile?.relations_rechercher || "Relation non définie"} />
        <InfoRow icon={<FaStar />} label="Signe astro" value={currentProfile?.Zodiac_sign || "Signe Astro non défini"} />
      </div>
    </div>
  );
  // ================================================================

  return (
    <div className="w-full min-h-screen flex flex-col font-sans" style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}>
      <Navbar />

      <div className="w-full flex-1 pt-[90px] sm:pt-[100px] pb-10 px-4 sm:px-[4%] xl:px-8">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-[25%_1fr_25%] gap-6 md:gap-8 xl:gap-10 items-start">

          {/* ========== COLONNE GAUCHE (desktop uniquement) ========== */}
          <aside className="hidden xl:flex flex-col gap-6">
            {(intentionLabel || interestFilter || filtered) && (
              <div className="mb-6 flex flex-col gap-2 bg-blue-50 px-6 py-4 rounded-3xl shadow-sm border border-blue-200 w-full max-w-[480px]">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <FaFilter size={14} />
                  <span className="text-xs font-black uppercase tracking-wider">Résultats pour :</span>
                  <button
                    onClick={clearFilter}
                    className="ml-auto p-1 bg-white hover:bg-red-50 rounded-full transition-colors border border-blue-100"
                  >
                    <X size={14} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                <div className="flex flex-col gap-1 ml-6">
                  {!filtered && (intentionLabel || interestFilter) && (
                    <span className="text-sm font-bold text-blue-600">{intentionLabel || interestFilter}</span>
                  )}
                  {filtered && (
                    <>
                      {ageMin && <span className="text-sm font-medium text-gray-700">Âge Min : <span className="text-blue-600 font-bold">{ageMin}</span></span>}
                      {ageMax && <span className="text-sm font-medium text-gray-700">Âge Max : <span className="text-blue-600 font-bold">{ageMax}</span></span>}
                      {intentionAffichee && (<p className="text-sm font-medium text-gray-700">Intention : <span className="text-blue-600 font-bold">{intentionAffichee}</span></p>)}
                      {interestNames && (<span className="text-sm font-medium text-gray-700">Intérêts : <span className="text-blue-600 font-bold">{interestNames}</span></span>)}
                      {situationAffiche && (<p className="text-sm font-medium text-gray-700">Situation Amoureuse: <span className="text-blue-600 font-bold">{situationAffiche}</span></p>)}
                      {distanceMax && <span className="text-sm font-medium text-gray-700">Distance Max : <span className="text-blue-600 font-bold">{distanceMax} km</span></span>}
                    </>
                  )}
                </div>
              </div>
            )}

            <SpecificationBlock />
            <CompatibiliteBlock />
            <InteretsBlock />
          </aside>

          {/* ========== COLONNE CENTRALE (CARTE) ========== */}
          <main className="flex flex-col items-center justify-start flex-1">

            {hasProfiles && currentProfile && (initializedFromUrl || !searchParams.get("userId")) ? (
              <>
                <div className="w-full h-full min-h-0 relative flex flex-col xl:flex-row items-center justify-center gap-2 xl:gap-6">
                  {/* LA CARTE DE PROFIL ACTIVE */}
                  <div
                    ref={cardRef}
                    className="relative w-full max-w-[520px] aspect-[3/4.2] rounded-[32px] sm:rounded-[48px] overflow-hidden shadow-2xl border-[4px] sm:border-[6px] transition-all select-none"
                    style={{
                      transform: `translateX(${cardOffset.x}px) rotate(${cardOffset.x / 25}deg)`,
                      cursor: dragging ? "grabbing" : cursorType === "left" ? "w-resize" : "e-resize",
                      transition: dragging ? "none" : "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                      borderColor: 'var(--bg-primary)'
                    }}
                    onMouseDown={(e) => { setDragging(true); startX.current = e.clientX; }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    onClick={() => { if (Math.abs(cardOffset.x) < 5) handlePhotoNavigation(); }}
                  >
                    {currentProfile.photos?.[0] ? (
                      <img
                        src={currentProfile.photos[0]}
                        className="w-full h-full object-cover object-top pointer-events-none"
                        alt=""
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "var(--bg-secondary)" }}>
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>
                          <img
                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                            alt="Avatar"
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain"
                          />
                        </div>
                        <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                          Aucune photo
                        </span>
                      </div>
                    )}

                    {showNotification &&
                      notificationType === "match" &&
                      matchedProfile?.id === currentProfile?.id && (
                        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md px-4">
                          <div className="text-7xl sm:text-[120px] animate-bounce mb-4">
                            ❤️
                          </div>
                          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-white text-center drop-shadow-lg">
                            C'EST UN
                          </h1>
                          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent text-center drop-shadow-lg">
                            MATCH !
                          </h1>
                          <p className="mt-4 sm:mt-6 text-lg sm:text-2xl text-white font-bold text-center px-4 sm:px-8">
                            Vous et <span className="text-pink-400">{matchedProfile.name}</span>
                            <br />
                            vous êtes mutuellement likés ❤️
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openedMessageFromMatchRef.current = true;
                              if (matchTimerRef.current) {
                                clearTimeout(matchTimerRef.current);
                                matchTimerRef.current = null;
                              }
                              openMessageModalFor(matchedProfile);
                            }}
                            className="mt-6 sm:mt-10 px-6 sm:px-10 py-4 sm:py-5 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white text-base sm:text-xl font-black shadow-2xl hover:scale-105 transition-all"
                          >
                            💬 Envoyer un message
                          </button>
                        </div>
                      )}

                    {/* BOUTON INFO MOBILE (ouvre la modale rapide) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profil/${currentProfile.id}`);
                      }}
                      className="absolute top-16 sm:top-20 right-4 sm:right-6 z-30 xl:hidden w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-xl text-white flex items-center justify-center border border-white/20"
                    >
                      <UserRound size={20} className="sm:hidden" />
                      <UserRound size={22} className="hidden sm:block" />
                    </button>

                    {/* Overlay des informations (Nom, Age, Ville) + boutons d'action */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 bg-gradient-to-t from-black/70 via-black/50 to-transparent text-white">
                      <h1 className="text-2xl sm:text-4xl font-black flex items-center gap-2">
                        <span>{currentProfile.name}, {currentProfile.age}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profil/${currentProfile.id}`);
                          }}
                          className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-xs font-bold transition"
                          title="Voir le profil"
                        >
                          i
                        </button>
                      </h1>
                      <p className="flex items-center gap-2 mt-1 font-bold opacity-90 text-sm sm:text-lg">
                        <FaMapMarkerAlt className="text-red-500 shrink-0" /> {currentProfile.location}
                        {currentProfile.distance && (
                          <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-xs">
                            {currentProfile.distance} km
                          </span>
                        )}
                      </p>

                      {/* Boutons Discussion + Like */}
                      <div className="grid grid-cols-2 gap-2 sm:gap-3 mt-4 w-full">
                        <button
                          onClick={(e) => { e.stopPropagation(); openMessageModalFor(currentProfile); }}
                          className="bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center gap-2 border border-white/20 font-bold px-3 py-2.5 text-xs sm:text-sm"
                        >
                          <FaCommentDots className="text-blue-400 text-base sm:text-lg shrink-0" /> Discussion
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLike(); }}
                          disabled={isLiking}
                          className={`bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center gap-2 border border-white/20 font-bold px-3 py-2.5 text-xs sm:text-sm ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <FaHeart className="text-[#FF5A60] text-base sm:text-lg shrink-0" /> Like
                        </button>
                      </div>

                      {/* Boutons d'action ronds (mobile/tablette) */}
                      <div className="flex xl:hidden justify-center gap-5 mt-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDislike(); }}
                          disabled={isLiking || isDisliking}
                          className={`w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl flex items-center justify-center text-white active:scale-90 transition-all duration-200 hover:bg-red-500/80 hover:border-red-400 ${isDisliking ? 'opacity-50' : ''}`}
                        >
                          {isDisliking ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          ) : (
                            <FaTimes size={22} />
                          )}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); openMessageModalFor(currentProfile); }}
                          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 shadow-2xl shadow-purple-500/40 flex items-center justify-center text-white active:scale-90 transition-all duration-200 hover:scale-105"
                        >
                          <FaTelegramPlane size={24} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleLike(); }}
                          disabled={isLiking}
                          className={`w-14 h-14 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 shadow-xl flex items-center justify-center text-white active:scale-90 transition-all duration-200 hover:bg-green-500/80 hover:border-green-400 ${isLiking ? 'opacity-50' : ''}`}
                        >
                          {isLiking ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          ) : (
                            <FaHeart size={22} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Boutons d'action latéraux (desktop) */}
                  <div className="hidden xl:flex flex-col gap-6">
                    <ActionButton type="x" onClick={handleDislike} disabled={isLiking || isDisliking}>
                      {isDisliking ? (
                        <svg className="animate-spin h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      ) : (
                        <FaTimes size={25} />
                      )}
                    </ActionButton>
                    <ActionButton type="message" onClick={() => openMessageModalFor(currentProfile)}>
                      <FaTelegramPlane size={25} />
                    </ActionButton>
                    <ActionButton type="heart" onClick={handleLike} disabled={isLiking}>
                      {isLiking ? (
                        <svg className="animate-spin h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      ) : (
                        <FaHeart size={25} />
                      )}
                    </ActionButton>
                  </div>

                </div>

                {/* ========== BLOC INFOS MOBILE/TABLETTE (sous la carte) ========== */}
                <div className="flex xl:hidden flex-col gap-4 w-full max-w-[520px] mt-6">
                  <SpecificationBlock />
                  <CompatibiliteBlock />
                  <InteretsBlock />
                  <AProposBlock />
                </div>
              </>
            ) : (
              /* ========== ÉTAT VIDE : AUCUN PROFIL TROUVÉ ========== */
              <div className="w-full relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6">
                <div className="relative w-full max-w-[480px] aspect-[3/4.2] rounded-[32px] sm:rounded-[48px] bg-white shadow-2xl border-[4px] sm:border-[6px] border-white flex flex-col items-center justify-center p-6 sm:p-12 text-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 sm:mb-8">
                    {hasActiveFilter ? (
                      <FaFilter size={32} className="text-gray-300 sm:w-10 sm:h-10" />
                    ) : (
                      <FaClock size={32} className="text-gray-300 sm:w-10 sm:h-10" />
                    )}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-gray-800 mb-3 sm:mb-4">
                    {hasActiveFilter ? "Aucun résultat" : "C'est tout pour le moment"}
                  </h2>

                  <p className="text-gray-500 mb-8 sm:mb-10 font-medium text-base sm:text-lg leading-relaxed px-2 sm:px-4">
                    {hasActiveFilter
                      ? "Aucun profil ne correspond à vos filtres actuels. Essayez d'ajuster vos critères."
                      : "Vous avez vu tous les profils disponibles pour le moment. Revenez plus tard !"}
                  </p>

                  {hasActiveFilter ? (
                    <button
                      onClick={clearFilter}
                      className="w-full py-4 sm:py-5 bg-purple-400 text-white rounded-[20px] sm:rounded-[24px] font-bold text-base sm:text-lg hover:bg-purple-600 transition-all shadow-xl shadow-blue-100 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <FaFilter size={18} />
                      {searchParams.get("filtered") === "true"
                        ? "Modifier mes filtres"
                        : "Réinitialiser les filtres"}
                    </button>
                  ) : (
                    <div className="w-full py-4 sm:py-5 bg-gray-100 text-gray-500 rounded-[20px] sm:rounded-[24px] font-bold text-base sm:text-lg flex items-center justify-center gap-2 border border-gray-200">
                      <FaClock size={18} />
                      Revenez plus tard
                    </div>
                  )}
                </div>

                <div className="hidden md:flex flex-col gap-6 opacity-0 pointer-events-none">
                  <ActionButton type="x" onClick={() => { }}><FaTimes /></ActionButton>
                  <ActionButton type="message" onClick={() => { }}><FaTelegramPlane /></ActionButton>
                  <ActionButton type="heart" onClick={() => { }}><FaHeart /></ActionButton>
                </div>
              </div>
            )}
          </main>

          {/* ========== COLONNE DROITE (desktop uniquement) ========== */}
          <aside className="hidden xl:flex flex-col gap-6">
            <AProposBlock />
          </aside>

        </div>
      </div>

      {/* Modales & Notifications */}
      <MessageModal
        open={messageOpen}
        onClose={() => {
          setMessageOpen(false);
          if (openedMessageFromMatchRef.current) {
            openedMessageFromMatchRef.current = false;
            setShowNotification(false);
            setMatchedProfile(null);
            setMessageProfile(null);
            nextProfile();
          }
        }}
        profile={messageProfile || currentProfile}
        onSend={async () => {
          if (openedMessageFromMatchRef.current) {
            openedMessageFromMatchRef.current = false;
            setShowNotification(false);
            setMatchedProfile(null);
            setMessageProfile(null);
            setMessageOpen(false);
            nextProfile();
          }
          setNotificationType("success");
          setNotificationMessage("Message envoyé avec succès !");
          setShowNotification(true);
          setTimeout(() => {
            setShowNotification(false);
          }, 3000);
        }}
      />

      <ModalProfile
        open={showMobileProfileInfo}
        onClose={() => setShowMobileProfileInfo(false)}
        currentProfile={currentProfile}
        INTEREST_ICONS={INTEREST_ICONS}
        SITUATION_LABELS={SITUATION_LABELS}
      />

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} title="Limite atteinte" message="Passez à Tafa Gold pour des likes illimités !" feature="likes" />

      {showNotification && notificationType !== "match" && (
        <div
          className={`fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 ${notificationType === "location" ? "bg-green-600" : "bg-blue-600"
            } text-white px-5 sm:px-8 py-3 sm:py-4 rounded-2xl shadow-2xl z-[10000] flex items-center gap-2 sm:gap-3 animate-bounce font-bold text-sm sm:text-base max-w-[90vw]`}
        >
          {notificationType === "location" ? <FaLocationArrow /> : <FaCheckCircle />}
          {notificationMessage}
        </div>
      )}

      {!isGold && remainingLikes <= 5 && (
        <div className="fixed top-20 sm:top-24 right-3 sm:right-4 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500/90 text-white rounded-full shadow-lg z-50 flex items-center gap-2 text-[11px] sm:text-xs font-black">
          <FaHeart size={12} /> {remainingLikes} likes restants
        </div>
      )}

      <div className="hidden xl:block">
        <Footer />
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, type, disabled, mobile,
}: {
  children: React.ReactNode;
  onClick: () => void;
  type: "x" | "heart" | "message";
  disabled?: boolean;
  mobile?: boolean;
}) {
  const isMessage = type === "message";
  const sizeClass = mobile ? "w-14 h-14 sm:w-16 sm:h-16" : "w-22 h-22";

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        ${sizeClass} rounded-full flex items-center justify-center shadow-xl 
        transition-all hover:scale-110 active:scale-90 border shrink-0
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${isMessage ? "bg-gradient-to-br from-[#FF4DB8] to-[#4C6EF5] text-white border-transparent" : ""}
      `}
      style={
        !isMessage
          ? {
            backgroundColor: "var(--bg-primary)",
            color: type === "x" ? "#FF3B30" : "var(--color-primary)",
            borderColor: "var(--border-color)",
          }
          : {}
      }
    >
      {children}
    </button>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-4 py-3 border transition-all hover:scale-[1.02]"
      style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}
    >
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-sm shrink-0"
        style={{ backgroundColor: "var(--bg-primary)", color: "var(--color-primary)" }}
      >
        {icon}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-secondary)" }}>
          {label}
        </span>
        <span className="text-sm font-bold truncate" style={{ color: "var(--text-primary)" }}>
          {value}
        </span>
      </div>
    </div>
  );
}

export default Home;