import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UpgradeModal from '../components/UpgradeModal';
import {
  FaHeart,
  FaTimes,
  FaBolt,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
  FaGem,
  FaCrown,
  FaLock,
  FaCommentDots
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import { getLikes, likeProfile, dislikeProfile, getSubscriptionStatus } from "../api/api";
import { API_URL } from "../utils/api_url";

const BASE_URL = API_URL?.replace("/api", "");

/* =======================
   TYPES
======================= */
interface Like {
  id: number;
  name: string;
  age: number | null;
  distance: string;
  time: string;
  photo: string | null;
  hasSuperLiked: boolean;
  mutualInterests: string[];
  location?: string;
  job?: string;
}

interface Match {
  id: number;
  user_id: number;
  name: string;
  age: number | null;
  distance: string;
  photo: string | null;
  compatibility: number;
  location?: string;
  job?: string;
  interests?: string[];
}

interface Recommended {
  id: number;
  name: string;
  age: number | null;
  distance: string;
  photo: string | null;
  compatibility: number;
  location?: string;
  job?: string;
  interests?: string[];
  is_blurred?: boolean;
}

/* =======================
   COMPONENT
======================= */
const Likes: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"likes" | "matches" | "topPicks">("likes");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [likes, setLikes] = useState<Like[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [recommended] = useState<Recommended[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Freemium states
  const [isGold, setIsGold] = useState<boolean>(false);
  const [hiddenLikesCount, setHiddenLikesCount] = useState<number>(0);
  const [, setTotalLikesCount] = useState<number>(0);
  const [matchToast, setMatchToast] = useState(false);


  //Modal tafa gold
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Fonction unique pour gérer le clic sur "Regarder"
  const handleWatchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUpgradeModal(true);
  };




  // Fonction pour ajouter un ID à la liste des profils dévoilés

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch all data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {

      // ✅ GOLD STATUS CORRECT
      try {
        const subRes = await getSubscriptionStatus();
        console.log("Gold status:", subRes);
        setIsGold(subRes?.has_subscription || false);
      } catch (e) {
        console.warn("Erreur subscription:", e);
        setIsGold(false);
      }

      // Likes & Matches
      const likesRes = await getLikes();

      const likesData = likesRes?.likes?.data || likesRes?.likes || [];
      const matchesData = likesRes?.matches?.data || likesRes?.matches || [];

      setLikes(Array.isArray(likesData) ? likesData : []);
      setMatches(Array.isArray(matchesData) ? matchesData : []);

      setTotalLikesCount(likesRes?.count ?? likesData.length);
      setHiddenLikesCount(likesRes?.hidden_count || 0);

    } catch (error) {
      console.error("❌ Erreur:", error);
      setLikes([]);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const getPhotoUrl = (photo: string | null): string => {
    if (!photo) return "https://via.placeholder.com/400x500";
    if (photo.startsWith("http")) return photo;

    // Nettoyage identique pour garantir la structure : https://domaine.com/storage/...
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = photo.startsWith('/') ? photo : `/${photo}`;

    return `${cleanBase}${cleanPath}`;
  };

  const handleLikeBack = async (userId: number) => {
    if (actionLoading) return;
    setActionLoading(userId);
    try {
      const response = await likeProfile(userId);
      setLikes(prev => prev.filter(like => like.id !== userId));

      if (response.is_match) {
        setMatchToast(true);

        setTimeout(() => {
          setMatchToast(false);
        }, 4000);

        // La notification de match (via Tafa) est désormais envoyée par le
        // backend, dans un échange séparé entre chaque utilisateur et Tafa.

        fetchData();
      }

    } catch (error) {
      console.error("Error liking back:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: number) => {
    if (actionLoading) return;
    setActionLoading(userId);
    try {
      await dislikeProfile(userId);
      setLikes(prev => prev.filter(like => like.id !== userId));
    } catch (error) {
      console.error("Error rejecting:", error);
    } finally {
      setActionLoading(null);
    }
  };


  const handleViewProfile = (userId: number) => {
    navigate(`/welcome?viewProfile=${userId}`);
  };

  /* =======================
      SCROLL
  ======================= */
  const containerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const cardWidth = containerRef.current.clientWidth / 2;
      containerRef.current.scrollBy({
        left: direction === "left" ? -cardWidth : cardWidth,
        behavior: "smooth",
      });
    }
  };

  const hasContent =
    (activeTab === "likes" && likes.length > 0) ||
    (activeTab === "matches" && matches.length > 0) ||
    (activeTab === "topPicks" && recommended.length > 0);

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: "var(--bg-secondary)", padding: isMobile ? "90px 3% 5rem" : "100px 3% 20px" }}>
      <Navbar />

      {/* HEADER */}
      <div className="w-full flex justify-between items-center mb-8 pt-6">
        <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>Likes</h1>
        {isGold ? (
          <div
            className="flex items-center gap-2 border px-6 py-2.5 rounded-full opacity-50 cursor-not-allowed"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}
          >
            <FaCrown size={14} style={{ color: "var(--text-secondary)" }} />
            <span className="font-bold tracking-wide text-sm" style={{ color: "var(--text-secondary)" }}>Déjà Gold</span>
          </div>
        ) : (
          <button
            onClick={() => navigate("/subscription")}
            className="group flex items-center gap-2 border shadow-sm hover:shadow-md px-6 py-2.5 rounded-full transition-all"
            style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)" }}
          >
            <FaBolt style={{ color: "var(--color-primary)" }} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold tracking-wide" style={{ color: "var(--color-primary)" }}>BOOST</span>
          </button>
        )}
      </div>

      {/* TABS SELECTOR - 3 tabs */}
      <div className="w-full max-w-xl mx-auto flex p-1 rounded-2xl mb-10" style={{ backgroundColor: "var(--bg-primary)" }}>
        <button
          className="flex-1 py-3 text-sm font-bold rounded-xl transition-all"
          style={{
            backgroundColor: activeTab === "likes" ? "var(--color-primary)" : "transparent",
            color: activeTab === "likes" ? "white" : "var(--text-secondary)"
          }}
          onClick={() => setActiveTab("likes")}
        >
          Likes ({likes.length})
        </button>
        <button
          className="flex-1 py-3 text-sm font-bold rounded-xl transition-all"
          style={{
            backgroundColor: activeTab === "matches" ? "var(--color-primary)" : "transparent",
            color: activeTab === "matches" ? "white" : "var(--text-secondary)"
          }}
          onClick={() => setActiveTab("matches")}
        >
          Matches ({matches.length})
        </button>

      </div>

      {/* CONTENT AREA */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "var(--color-primary)" }}></div>
            <p style={{ color: "var(--text-secondary)" }}>Chargement...</p>
          </div>
        </div>
      ) : (
        <div className="w-full relative group">

          {/* Navigation Arrows */}
          {hasContent && (
            <>
              <button
                onClick={() => scroll("left")}
                className="absolute left-[1%] top-1/2 -translate-y-1/2 z-20 backdrop-blur-sm p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", borderWidth: 1 }}
              >
                <FaChevronLeft style={{ color: "var(--text-secondary)" }} />
              </button>

              <button
                onClick={() => scroll("right")}
                className="absolute right-[1%] top-1/2 -translate-y-1/2 z-20 backdrop-blur-sm p-4 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "var(--bg-primary)", borderColor: "var(--border-color)", borderWidth: 1 }}
              >
                <FaChevronRight style={{ color: "var(--text-secondary)" }} />
              </button>
            </>
          )}

          <div
            ref={containerRef}
            className="flex gap-[2%] overflow-x-auto scroll-smooth no-scrollbar px-[1%] pb-12 snap-x snap-mandatory"
          >
            {/* LIKES VIEW */}
            {activeTab === "likes" && (
              likes.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center py-20">
                  <div className="rounded-full p-6 mb-4" style={{ backgroundColor: "var(--bg-primary)" }}>
                    <FaHeart size={48} style={{ color: "var(--text-secondary)" }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    Aucun like pour le moment
                  </h3>
                  <p style={{ color: "var(--text-secondary)" }}>
                    Continuez à explorer pour recevoir des likes !
                  </p>
                </div>
              ) : (
                <>
                  {likes.map((like) => (
                    <div
                      key={like.id}
                      className="relative w-[22%] min-w-[280px] flex-shrink-0 rounded-[2rem] overflow-hidden aspect-[3/4.2] shadow-2xl snap-center group/card transition-transform duration-500 hover:scale-[1.02]"
                      style={{ backgroundColor: "var(--bg-secondary)" }}
                    >
                      {like.hasSuperLiked && (
                        <div className="absolute top-5 left-5 z-10 bg-blue-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg border border-white/20">
                          <FaStar className="animate-pulse" /> Super Like
                        </div>
                      )}

                      {/* <img
                      src={getPhotoUrl(like.photo)}
                      alt={like.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 cursor-pointer"
                      onClick={() => handleViewProfile(like.id)}
                    /> */}
                      <div className="relative w-full h-full overflow-hidden">
                        <img
                          src={getPhotoUrl(like.photo)}
                          alt={like.name}
                          className={`w-full h-full object-cover transition-all duration-700 ${!isGold ? "blur-2xl scale-110" : "cursor-pointer hover:scale-110"
                            }`}
                          onClick={() => isGold && handleViewProfile(like.id)}
                        />

                        {!isGold && (
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            <button
                              onClick={handleWatchClick} // Utilisation de la fonction unique
                              className="bg-gradient-to-r from-yellow-400 to-amber-600 px-6 py-3 rounded-full font-black text-black shadow-xl hover:scale-110 transition-transform flex items-center gap-2"
                            >
                              <FaLock size={12} /> REGARDER
                            </button>
                          </div>
                        )}
                      </div>





                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      <div className="absolute bottom-0 w-full p-8 text-white">
                        <div className="flex items-baseline gap-2">
                          <h2 className="text-3xl font-bold">{like.name}</h2>
                          {like.age && <span className="text-xl font-light opacity-80">{like.age}</span>}

                        </div>

                        <div className="flex items-center gap-2 text-xs font-medium opacity-60 mt-1 uppercase tracking-wider">
                          <span>{like.time}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1"><FaMapMarkerAlt size={10} /> {like.distance}</div>
                        </div>

                        {like.mutualInterests && like.mutualInterests.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {like.mutualInterests.slice(0, 3).map((interest, idx) => (
                              <span key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">{interest}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-4 mt-8">
                          <button
                            onClick={() => handleReject(like.id)}
                            disabled={actionLoading === like.id}
                            className="flex-1 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-red-500/80 transition-all py-3.5 rounded-2xl flex justify-center items-center group/btn disabled:opacity-50"
                          >
                            <FaTimes size={20} className="group-hover/btn:rotate-90 transition-transform" />
                          </button>
                          <button
                            onClick={() => handleLikeBack(like.id)}
                            disabled={actionLoading === like.id}
                            className={`
                            flex-[2] py-3.5 rounded-2xl flex justify-center items-center gap-2
                            font-black text-sm uppercase transition-all disabled:opacity-50
                            ${isGold
                                ? "bg-gradient-to-r from-emerald-400 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/40 text-white"
                                : "bg-gray-500 text-white"
                              }
                          `}
                          >
                            <FaHeart /> Like
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Hidden Likes Banner for non-Gold users */}
                  {!isGold && hiddenLikesCount > 0 && (
                    <div
                      className="relative w-[22%] min-w-[280px] flex-shrink-0 rounded-[2rem] overflow-hidden aspect-[3/4.2] shadow-2xl snap-center flex flex-col items-center justify-center p-6"
                      style={{ backgroundColor: "var(--bg-primary)", border: "2px dashed var(--border-color)" }}
                    >
                      <div
                        className="rounded-full p-4 mb-4"
                        style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                      >
                        <FaCrown className="text-white text-3xl" />
                      </div>
                      <h3 className="text-2xl font-bold mb-2 text-center" style={{ color: "var(--text-primary)" }}>
                        +{hiddenLikesCount} personnes
                      </h3>
                      <p className="text-center mb-4" style={{ color: "var(--text-secondary)" }}>
                        vous ont like ! Passez a Tafa Gold pour les decouvrir.
                      </p>
                      <button
                        onClick={() => navigate('/subscription')}
                        className="px-6 py-3 rounded-xl font-bold text-black transition-opacity hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                      >
                        Voir qui vous aime
                      </button>
                    </div>
                  )}
                </>
              )
            )}

            {/* MATCHES VIEW */}
            {activeTab === "matches" && (
              matches.length === 0 ? (
                <div className="w-full flex flex-col items-center justify-center py-20">
                  <div className="rounded-full p-6 mb-4" style={{ backgroundColor: "var(--bg-primary)" }}>
                    <FaHeart size={48} style={{ color: "var(--text-secondary)" }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                    Aucun match pour le moment
                  </h3>
                  <p className="text-center max-w-md" style={{ color: "var(--text-secondary)" }}>
                    Quand vous et une autre personne vous aimez mutuellement, vous apparaîtrez ici !
                  </p>
                </div>
              ) : (
                matches.map((match) => (
                  <>
                    {console.log("MATCH =", match)} {/* 👈 AJOUT ICI */}

                    <div
                      key={match.id}
                      className="relative w-[22%] min-w-[280px] flex-shrink-0 rounded-[2rem] overflow-hidden aspect-[3/4.2] shadow-2xl snap-center group/card transition-transform duration-500 hover:scale-[1.02]"
                      style={{ backgroundColor: "var(--bg-secondary)" }}

                    >
                      {/* <img
                      src={getPhotoUrl(match.photo)}
                      alt={match.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110 cursor-pointer"
                      onClick={() => handleViewProfile(match.id)}
                    /> */}

                      <div className="relative w-full h-full overflow-hidden">
                        <img
                          src={getPhotoUrl(match.photo)}
                          alt={match.name}
                          className={`w-full h-full object-cover transition-all duration-700 ${!isGold ? "blur-2xl scale-110" : "cursor-pointer hover:scale-110"
                            }`}
                          onClick={() => isGold && handleViewProfile(match.id)}
                        />

                        {!isGold && (
                          <div className="absolute inset-0 flex items-center justify-center z-20">
                            <button
                              onClick={handleWatchClick} // Même fonction unique ici aussi
                              className="bg-gradient-to-r from-yellow-400 to-amber-600 px-6 py-3 rounded-full font-black text-black shadow-xl hover:scale-110 transition-transform flex items-center gap-2"
                            >
                              <FaLock size={12} /> REGARDER
                            </button>
                          </div>
                        )}
                      </div>


                      <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-600 backdrop-blur-xl border border-white/30 text-white px-4 py-2 rounded-full text-xs font-black w-fit flex items-center gap-2">
                          <FaHeart /> MATCH
                        </div>
                        {/* <div className="backdrop-blur-xl border border-white/30 text-white px-3 py-1.5 rounded-full text-[10px] font-black w-fit bg-white/20">
                        {match.compatibility}% compatibilité
                      </div> */}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

                      <div className="absolute bottom-0 w-full p-8 text-white">
                        <div className="flex items-baseline gap-2 mb-2">
                          <h3 className="text-3xl font-bold">{match.name} </h3>
                          <h3 className="text-3xl font-bold">{match.job} </h3>
                          {match.age && <span className="text-xl font-light opacity-80">{match.age}</span>}
                        </div>

                        {match.interests && match.interests.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {match.interests.slice(0, 3).map((interest, idx) => (
                              <span key={idx} className="bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight">{interest}</span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1 text-xs opacity-60 uppercase font-bold tracking-widest">
                            <FaMapMarkerAlt size={10} /> {match.distance}
                          </div>

                          <button
                            onClick={() => navigate(`/messages?userId=${match.user_id}`)}
                            className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
                            style={{
                              backgroundColor: isGold ? "var(--color-primary)" : "#6b7280",
                              color: "white",
                              boxShadow: isGold
                                ? "0 4px 12px rgba(255, 68, 104, 0.3)"
                                : "none",
                            }}
                          >
                            <FaCommentDots />
                            Message
                          </button>

                        </div>
                      </div>
                    </div>
                  </>
                ))
              )
            )}


          </div>

          {/* Passer a tafa gold DECOUVRIR */}
          {activeTab === "topPicks" && !isGold && (
            <div
              className="mt-16 mb-8 mx-auto max-w-2xl rounded-2xl p-5 flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(147, 197, 253, 0.4) 100%)",
                backdropFilter: "blur(10px)"
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
                >
                  <FaGem size={20} style={{ color: "var(--text-primary)" }} />
                </div>
                <div>
                  <h4 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                    Plus de Top Picks
                  </h4>
                  <p className="text-sm opacity-70" style={{ color: "var(--text-secondary)" }}>
                    Passez à Tafa Gold pour voir tout le monde
                  </p>
                </div>
              </div>
              <button
                className="px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:opacity-80"
                style={{
                  backgroundColor: "rgba(30, 41, 59, 0.8)",
                  color: "white"
                }}
                onClick={() => navigate("/subscription")}
              >
                DÉCOUVRIR
              </button>
            </div>
          )}
        </div>
      )}


      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Découvrez qui vous aime"
        message="Passez à Tafa Gold pour lever le flou sur les profils qui ont flashé sur vous et commencer à discuter immédiatement !"
        feature="likesReceived"
      />
      {matchToast && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]">
          <div className="bg-green-600 text-white px-10 py-6 rounded-3xl shadow-2xl flex items-center gap-4">
            <span className="text-4xl">💕</span>

            <div>
              <p className="font-bold text-2xl">
                C'est un Match !
              </p>

              <p className="text-base opacity-90">
                Vous pouvez maintenant discuter.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>


  );
};

export default Likes;
