import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { deleteMessageForAll, deleteMessageForMe } from "../api/api";
import Navbar from "../components/Navbar";

import { FaInfoCircle, FaArrowLeft, FaSmile, FaCommentDots, FaPaperPlane, FaBan, FaSearch } from "react-icons/fa";

import {
  getConversations, getMessages, sendMessage as sendMessageApi, getUserLimits, blockUser, unblockUser, reportUser, startConversation, MATCH_SYSTEM_MESSAGE,
} from "../api/api";

import { API_URL } from "../utils/api_url";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

const BASE_URL = API_URL?.replace("/api", "");

/* =======================
   INTERFACES (inchangées)
======================= */
interface RelatedUser {
  id: number;
  name: string;
  firstname: string | null;
  avatar: string | null;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  is_mine: boolean;
  read_at: string | null;
  created_at: string;
  id_echange?: number;
  related_user_id?: number | null;
  related_user?: RelatedUser | null;
}

interface OtherUser {
  id: number;
  name: string;
  firstname: string | null;
  avatar: string | null;
  profession: string | null;
  bio: string | null;
  interests: string[];
  is_blocked?: boolean;
  is_system?: boolean;
}

interface Conversation {
  id: number;
  echange_id?: number;
  other_user: OtherUser;
  last_message: {
    content: string;
    created_at: string;
    is_mine: boolean;
    related_user?: RelatedUser | null;
  };
  unread_count: number;
  is_match: boolean;
}

const Messages: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- responsive ---
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // States
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [remainingMessages, setRemainingMessages] = useState<number | null>(null);
  const [showProfileInfo, setShowProfileInfo] = useState(false);

  // action 
  const [actionLoading, setActionLoading] = useState(false);
  const isBlocked = activeConversation?.other_user.is_blocked ?? false;
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: "", visible: false });
  const [isNewConversation, setIsNewConversation] = useState(false);

  const [search, setSearch] = useState("");
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [lastActivity, setLastActivity] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });

  const getDisplayName = (user: { firstname: string | null; name: string }) => {
    return [user.firstname, user.name]
      .filter(Boolean)
      .join(" ");
  };

  const getAvatarUrl = (avatar: string | null): string => {
    if (!avatar) return "/default-avatar.png";
    if (avatar.startsWith("http")) return avatar;
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
    const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
    return `${cleanBase}${cleanPath}`;
  };

  // Initialisation
  useEffect(() => {
    fetchConversations();
    fetchLimits();
  }, []);

  // On garde une référence toujours à jour de "conversations",
  // pour ne PAS avoir à mettre "conversations" dans les dépendances
  // du useEffect ci-dessous (sinon le polling le redéclencherait sans arrêt)
  const conversationsRef = useRef(conversations);
  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    const userIdParam = searchParams.get("userId");
    if (!userIdParam || loading) return;
    const userId = parseInt(userIdParam);
    const existing = conversationsRef.current.find(
      (c) => Number(c.other_user.id) === Number(userId)
    );
    if (existing) {
      handleSelectConversation(existing);
    } else {
      handleStartConversation(userId);
    }
  }, [searchParams, loading]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchConversations();
    };

    window.addEventListener("navbar-message-update", handleRefresh);

    return () => {
      window.removeEventListener("navbar-message-update", handleRefresh);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartConversation = async (userId: number) => {
    try {
      const res = await startConversation(userId);
      if (res.user) {
        const tempConv: Conversation = {
          id: res.user.id,
          other_user: {
            id: res.user.id,
            name: res.user.name,
            firstname: res.user.firstname,
            avatar: res.user.avatar,
            profession: res.user.profession,
            bio: res.user.bio,
            interests: res.user.interests,
          },
          last_message: { content: "", created_at: new Date().toISOString(), is_mine: true },
          unread_count: 0,
          is_match: false,
        };
        setActiveConversation(tempConv);
        setMessages([]);
        setIsNewConversation(true);
        navigate(`/messages?userId=${res.user.id}`, { replace: true });
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Erreur conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLimits = async () => {
    try {
      const data = await getUserLimits();
      if (data.success) {
        setRemainingMessages(data.remaining_messages);
      }
    } catch (error) {
      console.error("Erreur limites:", error);
    }
  };

  const handleSelectConversation = async (conv: Conversation) => {
    setActiveConversation(conv);
    setShowProfileInfo(true);
    navigate(`/messages?userId=${conv.other_user.id}`, { replace: true });

    try {
      const data = await getMessages(conv.id);
      setMessages(data.messages || []);
      setLastActivity(data.last_seen || null);
      if (!data.messages || data.messages.length === 0) {
        setIsNewConversation(true);
      } else {
        setIsNewConversation(false);
      }
    } catch (error) {
      console.error("Erreur messages:", error);
    }
  };

  const handleSendMessage = async () => {
    if (isBlocked) {
      alert("Vous avez bloqué cet utilisateur.");
      return;
    }
    if (!newMessage.trim() || !activeConversation || isSending) return;

    const tempMessage: Message = {
      id: Date.now(),
      content: newMessage,
      sender_id: 0,
      is_mine: true,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");
    setIsNewConversation(false);
    setIsSending(true);
    try {
      const response = await sendMessageApi({
        receiver_id: activeConversation.other_user.id,
        content: newMessage,
      });
      if (response.message) {
        setMessages(prev => prev.map(msg =>
          msg.id === tempMessage.id ? { ...response.message, is_mine: true } : msg
        ));
        fetchConversations();
        fetchLimits();
      }
    } catch (error) {
      console.error("Erreur envoi:", error);
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      setNewMessage(tempMessage.content);
    } finally {
      setIsSending(false);
    }
  };

  const formatLastSeen = (dateString: string | null) => {
    if (!dateString) return "";
    const now = new Date();
    const last = new Date(dateString);
    const diff = Math.floor((now.getTime() - last.getTime()) / 1000);
    if (diff < 60) return "En ligne";
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)} h`;
    return `il y a ${Math.floor(diff / 86400)} j`;
  };

  const formatMessageDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Hier, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return `${date.toLocaleDateString("fr-FR", { weekday: "short" })}, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    return date.toLocaleDateString("fr-FR");
  };

  const shouldShowSeparator = (current: Message, previous?: Message) => {
    if (!previous) return true;
    return new Date(current.created_at).toDateString() !== new Date(previous.created_at).toDateString();
  };

  const formatSeparatorDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    if (date.toDateString() === now.toDateString()) return "Aujourd'hui";
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Hier";
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
      return date.toLocaleDateString("fr-FR", { weekday: "long" });
    }
    return date.toLocaleDateString("fr-FR");
  };

  const handleBlockUser = async () => {
    if (!activeConversation) return;
    setActionLoading(true);
    try {
      const res = await blockUser(activeConversation.other_user.id);
      if (res.message || res.success) {
        setShowBlockModal(false);
        await fetchConversations();
      }
    } catch (error) {
      console.error("Erreur blocage:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!activeConversation) return;
    setActionLoading(true);
    try {
      const res = await unblockUser(activeConversation.other_user.id);
      if (res.message || res.success) {
        await fetchConversations();
      }
    } catch (error) {
      console.error("Erreur déblocage:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: "", visible: false }), 3000);
  };

  const handleReportUser = async () => {
    if (!activeConversation || !reportReason.trim()) return;
    setActionLoading(true);
    try {
      const res = await reportUser(activeConversation.other_user.id, reportReason);
      if (res.message || res.success) {
        setShowReportModal(false);
        setReportReason("");
        showNotification("Signalement envoyé avec succès");
      }
    } catch (error) {
      console.error("Erreur signalement:", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewProfile = () => {
    if (!activeConversation) return;
    navigate(`/welcome?userId=${activeConversation.other_user.id}`);
  };

  const handleDeleteForMe = async (id: number) => {
    try {
      await deleteMessageForMe(id);
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handleDeleteForAll = async (id: number) => {
    await deleteMessageForAll(id);
    setMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, content: "Ce message a été supprimé" } : msg
      )
    );
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // Rafraîchissement intelligent des messages (uniquement si conversation active)
  useEffect(() => {
    if (!activeConversation) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const pollMessages = async () => {
      try {
        const data = await getMessages(activeConversation.id);
        setMessages(data.messages || []);
        setLastActivity(data.last_seen || null);
      } catch (error) {
        console.error("Erreur refresh messages:", error);
      }
    };

    const startPolling = () => {
      if (intervalId) return;
      intervalId = setInterval(pollMessages, 5000);
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
        pollMessages();
        startPolling();
      } else {
        stopPolling();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeConversation]);

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  const filteredConversations = conversations.filter((conv) =>
    `${conv.other_user.firstname ?? ""} ${conv.other_user.name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="w-screen h-screen overflow-hidden theme-bg-primary">
      <Navbar />

      <main className="flex-1 overflow-hidden theme-bg-primary h-[calc(100vh-80px)] w-full pt-20">
        <div className="h-full w-full max-w-[1800px] mx-auto flex gap-4 md:gap-6 px-3 md:px-6">

          {/* ============= LISTE DES CONVERSATIONS ============= */}
          <div
            className={`
              ${isMobile && activeConversation ? 'hidden' : 'w-full md:w-[380px] lg:w-[420px] xl:w-[450px]'}
              theme-bg-primary rounded-none md:rounded-3xl
              shadow-sm border theme-border
              overflow-hidden flex flex-col h-full
            `}
          >
            <div className="p-5 border-b theme-border">
              <h2 className="text-xl font-bold theme-text-primary">Messages</h2>
              <div className="relative mt-3">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl theme-bg-secondary theme-text-primary text-sm outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-6 text-center text-gray-400">Chargement...</div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400">Aucune discussion.</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-gray-400">
                  🔍 Aucun résultat pour "{search}"
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-4 flex items-center gap-4 cursor-pointer transition-colors ${activeConversation?.id === conv.id
                      ? "theme-bg-secondary"
                      : "hover:bg-[var(--bg-secondary)]"
                      }`}
                  >
                    <div className="relative">
                      <img
                        src={conv.other_user.is_system
                          ? "/tafa-bot.png"
                          : getAvatarUrl(conv.other_user.avatar)
                        }
                        alt={conv.other_user.name}
                        className="w-12 h-12 rounded-full object-cover object-top"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png"; }}
                      />
                      {conv.unread_count > 0 && (
                        <span className="absolute -top-1 -right-1 theme-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {(() => {
                        const isTafa = !!conv.other_user.is_system;
                        const isMatchNotification =
                          isTafa && conv.last_message?.content === MATCH_SYSTEM_MESSAGE;
                        const matchedUserName = conv.last_message?.related_user
                          ? getDisplayName(conv.last_message.related_user)
                          : null;

                        return (
                          <>
                            <div className="flex justify-between items-baseline">
                              <h3
                                className={`truncate ${isMatchNotification
                                  ? "inline-flex items-center px-2 py-1 rounded-full bg-pink-100 text-pink-600 text-xs font-bold uppercase tracking-wider"
                                  : "font-semibold theme-text-primary"
                                  }`}
                              >
                                {isTafa ? "Tafa" : getDisplayName(conv.other_user)}
                              </h3>
                              <span className="text-[10px] text-gray-400">
                                {conv.last_message?.created_at &&
                                  formatMessageDate(conv.last_message.created_at)}
                              </span>
                            </div>
                            {isMatchNotification && matchedUserName ? (
                              <div className="mb-1">
                                <p className="text-pink-500 text-xs font-semibold">
                                  Vous avez matché avec {matchedUserName}.
                                </p>
                                <p className="text-pink-400 text-xs">
                                  Cliquez ici pour le contacter.
                                </p>
                              </div>
                            ) : (
                              <p className="text-sm theme-text-secondary truncate">
                                {conv.last_message?.is_mine ? "Vous : " : isTafa ? "" : "Lui : "}
                                {conv.last_message?.content}
                              </p>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ============= ZONE DE CHAT ============= */}
          <div
            className={`
              ${isMobile && !activeConversation ? 'hidden' : 'flex-1 w-full'}
              theme-bg-primary rounded-none md:rounded-3xl
              shadow-sm border theme-border
              overflow-hidden flex flex-col h-full
            `}
          >
            {activeConversation ? (
              <>
                {/* Header Chat */}
                <div className="p-4 border-b theme-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button
                        onClick={() => setActiveConversation(null)}
                        className="text-gray-500 mr-1"
                      >
                        <FaArrowLeft />
                      </button>
                    )}
                    {(() => {
                      const isTafa = !!activeConversation.other_user.is_system;

                      return (
                        <>
                          <img
                            src={isTafa ? "/tafa-bot.png" : getAvatarUrl(activeConversation.other_user.avatar)}
                            className="w-10 h-10 rounded-full object-cover object-top"
                            alt=""
                          />
                          <div>
                            <h3 className="font-bold theme-text-primary leading-tight">
                              {isTafa ? "Tafa" : getDisplayName(activeConversation.other_user)}
                            </h3>
                            {isTafa ? (
                              <span className="text-xs font-medium text-gray-400">
                                Assistant TAFA
                              </span>
                            ) : (
                              <span
                                className={`text-xs font-medium ${formatLastSeen(lastActivity) === "En ligne"
                                  ? "text-green-500"
                                  : "text-gray-400"
                                  }`}
                              >
                                {formatLastSeen(lastActivity)}
                              </span>
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  {!activeConversation.other_user.is_system && (
                    <button
                      onClick={() => {
                        if (isMobile) {
                          handleViewProfile();
                        } else {
                          setShowProfileInfo(!showProfileInfo);
                        }
                      }}
                      className={`${
                        showProfileInfo ? "theme-primary-text" : "theme-text-secondary"
                      } transition-colors cursor-pointer`}
                    >
                      <FaInfoCircle size={isMobile ? 18 : 20}/>
                    </button>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 theme-bg-secondary custom-scrollbar">
                  {isNewConversation ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <img
                        src={getAvatarUrl(activeConversation?.other_user.avatar)}
                        className="w-28 h-28 md:w-35 md:h-35 rounded-full object-cover mb-4 border-4 border-blue-100"
                      />
                      <h3 className="text-lg font-bold theme-text-primary">
                        Nouvelle conversation avec{" "}
                        {activeConversation?.other_user.firstname}{" "}
                        {activeConversation?.other_user.name}
                      </h3>
                      <p className="theme-text-secondary text-sm mb-4">
                        Envoie le premier message pour briser la glace !
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          "Salut ! Comment vas-tu ? 👋",
                          "Hey ! Ton profil m'a beaucoup plu 😊",
                          "On a des intérêts en commun 😄",
                          "Hello ! Content(e) qu'on ait matché ! 😊",
                          "Ta photo de profil est super, elle a été prise où ? 📸",
                          "Hey ! Ravi(e) de te parler, j'espère que tu passes une bonne journée. ☀️"
                        ].map((text, i) => (
                          <button
                            key={i}
                            onClick={() => setNewMessage(text)}
                            className="px-3 py-2 theme-bg-secondary theme-text-primary rounded-full text-xs md:text-sm border theme-border"
                          >
                            {text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <React.Fragment key={msg.id}>
                        {shouldShowSeparator(msg, messages[index - 1]) && (
                          <div className="flex justify-center my-3">
                            <span className="text-[12px] text-gray-400">
                              {formatSeparatorDate(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div
                          className={`flex ${msg.content === MATCH_SYSTEM_MESSAGE ? "justify-center" : msg.is_mine ? "justify-end" : "justify-start"} w-full mb-2`}
                        >
                          <div
                            className={`flex items-start gap-2 group ${msg.is_mine ? "flex-row" : "flex-row-reverse"
                              } max-w-[90%] sm:max-w-[80%] md:max-w-[65%]`}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                const menuWidth = 176;
                                const menuHeight = msg.is_mine ? 130 : 90;
                                const openUp = rect.bottom + menuHeight > window.innerHeight;
                                setMenuCoords({
                                  top: openUp ? rect.top - menuHeight - 6 : rect.bottom + 6,
                                  left: msg.is_mine
                                    ? rect.right - menuWidth
                                    : rect.left,
                                });
                                setOpenMenuId(openMenuId === msg.id ? null : msg.id);
                              }}
                              className="flex-shrink-0 opacity-0 group-hover:opacity-100 
                                          theme-text-secondary hover:theme-primary-text
                                          transition mt-1 text-lg px-2 py-1 rounded-lg 
                                          hover:bg-[var(--bg-secondary)]"
                            >
                              ⋮
                            </button>
                            <div
                              className={`relative order-2 px-4 py-2 rounded-2xl text-sm shadow-sm w-fit
                                ${msg.content.includes("supprimé")
                                  ? "theme-bg-secondary theme-text-secondary italic rounded-2xl"
                                  : msg.is_mine
                                    ? "theme-primary text-white rounded-tr-none"
                                    : "theme-bg-primary theme-text-primary rounded-tl-none border theme-border"
                                }
                              `}
                            >
                              <p className={`break-words whitespace-pre-wrap ${msg.content.includes("supprimé") ? "text-gray-400 italic text-center" : ""}`}>
                                {msg.content === MATCH_SYSTEM_MESSAGE && msg.related_user ? (
                                  <div className="flex flex-col items-center justify-center gap-6 py-8 w-full">
                                    <img
                                      src={getAvatarUrl(msg.related_user.avatar)}
                                      alt={getDisplayName(msg.related_user)}
                                      className="w-36 h-36 rounded-full object-cover border-[3px] border-pink-400 shadow-xl"
                                      onError={(e) => { (e.target as HTMLImageElement).src = "/default-avatar.png"; }}
                                    />
                                    <p className="text-center text-lg font-medium px-4">
                                      🎉 Vous avez matché avec{" "}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/messages?userId=${msg.related_user!.id}`);
                                        }}
                                        className="text-pink-400 font-bold underline hover:text-pink-300"
                                      >
                                        {getDisplayName(msg.related_user)}
                                      </button>
                                      {" "}! Cliquez pour discuter.
                                    </p>
                                  </div>
                                ) : (
                                  msg.content
                                )}
                              </p>
                              {openMenuId === msg.id && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  style={{
                                    position: "fixed",
                                    top: `${menuCoords.top}px`,
                                    left: `${menuCoords.left}px`,
                                    zIndex: 99999,
                                  }}
                                  className="w-44 theme-bg-primary border theme-border rounded-xl shadow-lg overflow-hidden"
                                >
                                  <button
                                    onClick={() => { handleDeleteForMe(msg.id); setOpenMenuId(null); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-zinc-800"
                                  >
                                    Supprimer pour moi
                                  </button>
                                  {msg.is_mine && (
                                    <button
                                      onClick={() => { handleDeleteForAll(msg.id); setOpenMenuId(null); }}
                                      className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                    >
                                      Supprimer pour tout le monde
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setOpenMenuId(null)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800"
                                  >
                                    Annuler
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    ))
                  )}
                  <div ref={scrollRef} />
                </div>

                {/* Input Zone */}
                {activeConversation && activeConversation.other_user.is_system ? (
                  <div className="p-4 border-t theme-border text-center py-6">
                    <p className="text-sm text-gray-500">
                      💬 Tafa est un assistant automatique : cliquez sur le nom de votre match
                      dans ses messages pour ouvrir une vraie conversation avec cette personne.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 border-t theme-border">
                    {isBlocked && (
                      <div className="mb-2 text-red-500 text-sm font-semibold">
                        🚫 Vous avez bloqué cet utilisateur. Vous ne pouvez plus envoyer de messages.
                      </div>
                    )}
                    <div className="relative flex items-end gap-2">
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-500 hover:theme-primary transition-colors self-center"
                      >
                        <FaSmile size={isMobile ? 20 : 22} />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 z-50">
                          <EmojiPicker onEmojiClick={onEmojiClick} theme={"light" as any} />
                        </div>
                      )}
                      <textarea
                        value={newMessage}
                        disabled={isBlocked}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        placeholder={
                          isBlocked
                            ? "Utilisateur bloqué"
                            : "Écrivez votre message..."
                        }
                        rows={1}
                        className="flex-1 theme-bg-secondary theme-text-primary border-none rounded-2xl px-4 py-3 text-sm md:text-base focus:ring-2 focus:ring-gray-500 outline-none resize-none"
                        style={{ maxHeight: '120px', overflowY: 'auto' }}
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={isBlocked || isSending || !newMessage.trim()}
                        className="p-3 theme-primary hover:theme-primary text-white rounded-2xl transition-all disabled:opacity-50 shadow-md shadow-gray-500/20 self-end"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <FaCommentDots size={isMobile ? 32 : 40} className="text-gray-200 dark:text-zinc-700" />
                </div>
                <h3 className="text-lg font-medium text-gray-600 dark:text-zinc-400">
                  Sélectionnez une discussion
                </h3>
                <p className="text-sm max-w-xs">
                  Commencez à discuter avec vos matchs pour faire connaissance !
                </p>
              </div>
            )}
          </div>

          {/* ============= BLOC PROFIL (desktop) ============= */}
          {showProfileInfo && activeConversation && !isMobile && !activeConversation.other_user.is_system && (
            <div className="hidden xl:flex xl:w-[420px] theme-bg-primary rounded-3xl shadow-sm border theme-border overflow-hidden flex-col h-full">
              {/* contenu inchangé */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="flex flex-col items-center text-center mb-6">
                  <img
                    src={getAvatarUrl(activeConversation.other_user.avatar)}
                    className="w-40 h-40 rounded-full object-cover object-top mb-4 border-4 border-blue-100"
                    alt=""
                  />
                  <h3 className="text-xl font-bold theme-text-primary">
                    {getDisplayName(activeConversation.other_user)}
                  </h3>
                </div>
                <h4 className="theme-text-primary text-lg font-bold mb-4">À propos</h4>
                <div className="space-y-5">
                  <div className="rounded-2xl p-4 border theme-border" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <p className="text-sm font-bold theme-text-primary mb-1">Profession</p>
                    <p className="text-sm theme-text-secondary">
                      💼 {activeConversation.other_user.profession || "Non spécifié"}
                    </p>
                  </div>
                  <div className="rounded-2xl p-4 border theme-border" style={{ backgroundColor: "var(--bg-secondary)" }}>
                    <p className="text-sm font-bold theme-text-primary mb-1">Bio</p>
                    <p className="text-sm theme-text-secondary leading-relaxed">
                      ✨ {activeConversation.other_user.bio || "Non spécifié"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="shrink-0 p-5 border-t theme-border" style={{ backgroundColor: "var(--bg-primary)" }}>
                <h4 className="theme-text-primary text-sm font-black uppercase tracking-wider mb-3">
                  Confidentialité & Support
                </h4>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => isBlocked ? handleUnblockUser() : setShowBlockModal(true)}
                    disabled={actionLoading}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all"
                    style={{
                      backgroundColor: isBlocked ? "#22c55e" : "var(--bg-secondary)",
                      color: isBlocked ? "#fff" : "#e74c3c",
                      opacity: actionLoading ? 0.7 : 1,
                    }}
                  >
                    <span>{isBlocked ? "✓" : "🚫"}</span>
                    {isBlocked ? "Débloquer" : "Bloquer"}
                  </button>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all"
                    style={{ backgroundColor: "var(--bg-secondary)", color: "#e74c3c" }}
                  >
                    <span>🚩</span>
                    Signaler l'utilisateur
                  </button>
                  <button
                    onClick={handleViewProfile}
                    disabled={isBlocked}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-bold transition-all"
                    style={{
                      backgroundColor: isBlocked ? "#9ca3af" : "var(--color-primary)",
                      color: "#ffffff",
                      opacity: isBlocked ? 0.6 : 1,
                      cursor: isBlocked ? "not-allowed" : "pointer",
                    }}
                  >
                    Voir le profil
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ... (le reste du code reste inchangé : badge, modales, toast) ... */}
      {remainingMessages !== null && (
        <div
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2 text-white font-semibold text-sm"
          style={{ backgroundColor: remainingMessages <= 2 ? "#ef4444" : "#f97316" }}
        >
          <FaCommentDots size={14} />
          <span>{remainingMessages} messages restants</span>
        </div>
      )}

      {showBlockModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="theme-bg-primary rounded-2xl p-6 max-w-sm w-full shadow-2xl border theme-border">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBan size={24} />
              </div>
              <h3 className="text-xl font-bold theme-text-primary mb-2">
                Bloquer {activeConversation?.other_user.name} ?
              </h3>
              <p className="theme-text-secondary mb-6 text-sm">
                Cette personne ne pourra plus vous envoyer de messages et vous ne pouvez plus voir son profil.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBlockModal(false)}
                className="flex-1 px-4 py-3 rounded-xl theme-bg-secondary text-gray-700 dark:text-zinc-300 font-semibold hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleBlockUser}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {actionLoading ? "Blocage..." : "Bloquer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="theme-bg-primary border theme-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold theme-text-primary mb-4">
              Signaler {activeConversation?.other_user.name}
            </h3>
            <p className="text-sm theme-text-secondary mb-4">
              Veuillez indiquer la raison de votre signalement pour aider notre équipe de modération.
            </p>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Expliquez le problème ici..."
              className="w-full h-32 p-3 rounded-xl theme-bg-secondary theme-text-primary border theme-border outline-none focus:ring-2 mb-4"
              style={{ "--tw-ring-color": "var(--color-primary)" } as React.CSSProperties}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 px-4 py-3 rounded-xl theme-bg-secondary theme-text-primary font-semibold border theme-border transition-all hover:opacity-80"
              >
                Annuler
              </button>
              <button
                onClick={handleReportUser}
                disabled={actionLoading || !reportReason.trim()}
                className="flex-1 px-4 py-3 rounded-xl text-white font-semibold disabled:opacity-50 transition-all hover:opacity-90"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                {actionLoading ? "Envoi..." : "Envoyer le signalement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] animate-bounce">
          <div className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-zinc-800 dark:border-gray-200">
            <span className="bg-green-500 rounded-full p-1">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;