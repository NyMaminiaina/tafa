import { useState, useEffect, useRef } from 'react';
import {
  Search, MessageSquare, RefreshCw,
  Clock, Calendar, Users, X
} from 'lucide-react';
import { FaPaperPlane, FaSmile } from 'react-icons/fa';
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

interface CreatedAccount {
  id: number;
  name: string;
  firstname: string | null;
  avatar: string | null;
  email: string;
}

interface Conversation {
  id: number;
  user_one_id: number;
  user_two_id: number;
  user_one_name: string;
  user_two_name: string;
  user_one_email: string;
  user_two_email: string;
  last_message_at: string | null;
  last_message?: string;
  created_at: string;
}

interface Message {
  id: number;
  content: string;
  sender_id: number;
  is_mine: boolean;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Chat = () => {
  // États existants
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalConversations, setTotalConversations] = useState(0);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);

  // NOUVEAUX ÉTATS
  const [accounts, setAccounts] = useState<CreatedAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<CreatedAccount | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatReceiver, setChatReceiver] = useState<{ id: number; name: string } | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [showAccountSelector, setShowAccountSelector] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messagesPage, setMessagesPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const previousScrollHeight = useRef<number>(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  const [selectedFakeAccount, setSelectedFakeAccount] = useState<CreatedAccount | null>(null);
  const [selectedRealUser, setSelectedRealUser] = useState<any | null>(null);
  const [firstMessage, setFirstMessage] = useState('👋 Bonjour !');

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewMessage(prev => prev + emojiData.emoji);
  };

  // Charger les comptes créés par l'admin
  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/created-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setAccounts(data.users || []);
    } catch (err) {
      console.error('Erreur chargement comptes:', err);
    }
  };

  // Fetch conversations (original)
  const fetchConversations = async (page: number = 1): Promise<void> => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      let url = `${API_URL}/admin/conversations?page=${page}&per_page=20`;
      // 🔥 Filtrer par compte sélectionné
      if (selectedAccount) {
        url += `&user_id=${selectedAccount.id}`;
      }

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des conversations');

      const data = await response.json();

      const mappedConversations: Conversation[] = (data.data || []).map((conv: any) => ({
        id: conv.id,
        user_one_id: conv.user_one_id,
        user_two_id: conv.user_two_id,
        user_one_name: conv.user_one_name,
        user_two_name: conv.user_two_name,
        user_one_email: conv.user_one_email,
        user_two_email: conv.user_two_email,
        last_message_at: conv.last_message_at,
        last_message: conv.last_message,
        created_at: conv.created_at || conv.last_message_at || new Date().toISOString(),
      }));

      setConversations(mappedConversations);
      setFilteredConversations(mappedConversations);
      setTotalPages(data.last_page || 1);
      setTotalConversations(data.total || 0);
      setCurrentPage(data.current_page || 1);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (contactId: number, page: number = 1) => {
    if (page === 1) setIsLoadingMessages(true);
    else setLoadingMoreMessages(true);

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/messages/${contactId}?admin_user_id=${selectedAccount?.id}&page=${page}&per_page=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const msgs = (data.messages || []).map((m: any) => ({
        ...m,
        is_mine: m.sender_id === selectedAccount?.id
      }));

      if (page === 1) {
        setMessages(msgs.reverse());
        setMessagesPage(1);
        setHasMoreMessages(data.has_more || msgs.length >= 20);
      } else {
        const container = document.querySelector('.chat-messages-container');
        if (container) previousScrollHeight.current = container.scrollHeight;
        setMessages(prev => [...msgs.reverse(), ...prev]);
        setMessagesPage(page);
        setHasMoreMessages(data.has_more || msgs.length >= 20);
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - previousScrollHeight.current;
          }
        });
      }
    } catch (err) {
      console.error('Erreur chargement messages:', err);
    } finally {
      setIsLoadingMessages(false);
      setLoadingMoreMessages(false);
    }
  };

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedAccount || !chatReceiver || isSending) return;
    setIsSending(true);
    const tempContent = newMessage;
    setNewMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/send-message-as`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sender_id: selectedAccount.id,
          receiver_id: chatReceiver.id,
          content: tempContent
        })
      });
      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, {
          id: data.message.id,
          content: data.message.content,
          sender_id: selectedAccount.id,
          is_mine: true,
          created_at: data.message.created_at
        }]);
      }
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setNewMessage(tempContent);
    } finally {
      setIsSending(false);
    }
  };

  // 🔥 Ouvrir le chat avec un utilisateur
  const openChat = (conv: Conversation) => {
    const receiverId = selectedAccount?.id === conv.user_one_id ? conv.user_two_id : conv.user_one_id;
    const receiverName = selectedAccount?.id === conv.user_one_id ? conv.user_two_name : conv.user_one_name;
    setChatReceiver({ id: receiverId, name: receiverName });
    fetchMessages(receiverId);
    setShowChatModal(true);
  };

  // Initialisation
  useEffect(() => {
    fetchAccounts();
    fetchConversations(1);
  }, []);

  // Recharger quand le compte change
  useEffect(() => {
    if (selectedAccount) {
      fetchConversations(1);
    }
  }, [selectedAccount]);

  // Scroll en bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Filtre local
  useEffect(() => {
    if (!searchTerm) {
      setFilteredConversations(conversations);
      return;
    }
    const filtered = conversations.filter(conv =>
      conv.user_one_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user_one_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user_two_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user_two_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    const date = new Date(dateStr + 'Z');
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatRelativeTime = (dateStr: string | null): string => {
    if (!dateStr) return 'Jamais';
    const date = new Date(dateStr + 'Z');
    if (isNaN(date.getTime())) return 'N/A';
    const now = new Date();
    const diffMins = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return new Date(dateStr + 'Z').toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDisplayName = (account: CreatedAccount) => {
    return [account.firstname, account.name].filter(Boolean).join(' ') || 'Sans nom';
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-sky-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  const searchUsers = async (search: string) => {
    if (!search || search.length < 2) {
      setUserSearchResults([]);
      return;
    }
    setIsSearchingUsers(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${API_URL}/admin/users?search=${encodeURIComponent(search)}&per_page=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setUserSearchResults(data.data || []);
    } catch (err) {
      console.error('Erreur recherche utilisateurs:', err);
    } finally {
      setIsSearchingUsers(false);
    }
  };

  const startNewConversation = async (fakeAccount: CreatedAccount, realUser: any, message: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/admin/send-message-as`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          sender_id: fakeAccount.id,
          receiver_id: realUser.id,
          content: message
        })
      });

      // Sélectionner le compte fake et ouvrir le chat
      setSelectedAccount(fakeAccount);
      setChatReceiver({ id: realUser.id, name: realUser.name || realUser.email });
      setShowNewChatModal(false);
      fetchMessages(realUser.id);
      setShowChatModal(true);
      fetchConversations(1);
    } catch (err) {
      console.error('Erreur création conversation:', err);
    }
  };

  return (
    <div className="p-3 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <MessageSquare className="text-sky-600" size={32} />
            Conversations
          </h1>
          <p className="text-gray-600">{totalConversations} conversations au total</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* SÉLECTEUR DE COMPTE */}
          <button
            onClick={() => setShowNewChatModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl hover:from-sky-700 transition shadow-lg"
          >
            <MessageSquare size={18} />
            Nouvelle discussion
          </button>

          <button onClick={() => fetchConversations(currentPage)} disabled={isLoading} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition">
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Actualiser
          </button>

          {selectedAccount && (
            <button
              onClick={() => setShowNewChatModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-xl hover:from-sky-700 transition shadow-lg"
            >
              <MessageSquare size={18} />
              Nouvelle discussion
            </button>
          )}

        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Total Conversations</p><p className="text-2xl font-bold text-gray-800 mt-1">{totalConversations}</p></div>
            <div className="p-3 rounded-xl bg-sky-100 text-sky-600"><MessageSquare size={24} /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Utilisateurs impliqués</p><p className="text-2xl font-bold text-gray-800 mt-1">{new Set([...conversations.map(c => c.user_one_id), ...conversations.map(c => c.user_two_id)]).size}</p></div>
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600"><Users size={24} /></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-600">Actives aujourd'hui</p><p className="text-2xl font-bold text-gray-800 mt-1">{conversations.filter(c => c.last_message_at && new Date(c.last_message_at).toDateString() === new Date().toDateString()).length}</p></div>
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600"><Clock size={24} /></div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
      </div>

      {/* Tableau des conversations */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">ID</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Utilisateur 1</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Utilisateur 2</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Dernier message</th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Créé le</th>
                {selectedAccount && <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredConversations.length === 0 ? (
                <tr><td colSpan={selectedAccount ? 6 : 5} className="py-12 text-center text-gray-500">Aucune conversation trouvée</td></tr>
              ) : (
                filteredConversations.map((conv) => (
                  <tr key={conv.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-6"><span className="font-mono text-sm text-gray-600">#{conv.id}</span></td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                          {(conv.user_one_name || 'U').charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="font-medium text-gray-800">{conv.user_one_name || 'N/A'}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[150px]">{conv.last_message || 'Nouveau'}</div>
                        </div>

                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-400 flex items-center justify-center text-white font-bold">
                          {(conv.user_two_name || 'U').charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <div className="font-medium text-gray-800">{conv.user_two_name || 'N/A'}</div>
                          <div className="text-xs text-gray-400 truncate max-w-[150px]">{conv.last_message || 'Nouveau'}</div>
                        </div>

                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{formatRelativeTime(conv.last_message_at)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{formatDate(conv.created_at)}</span>
                      </div>
                    </td>
                    {selectedAccount && (
                      <td className="py-4 px-6">
                        <button
                          onClick={() => openChat(conv)}
                          className="px-3 py-1.5 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600 transition"
                        >
                          Discuter
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600">Page {currentPage} sur {totalPages} ({totalConversations} conversations)</div>
          <div className="flex gap-2">
            <button onClick={() => fetchConversations(currentPage - 1)} disabled={currentPage === 1 || isLoading} className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">Précédent</button>
            <button onClick={() => fetchConversations(currentPage + 1)} disabled={currentPage === totalPages || isLoading} className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50">Suivant</button>
          </div>
        </div>
      </div>

      {/* 🔥 MODALE DE CHAT */}
      {showChatModal && chatReceiver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-gradient-to-r from-sky-600 to-cyan-500 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                  {chatReceiver.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold">{chatReceiver.name}</div>
                  <div className="text-xs text-sky-100">En tant que : {getDisplayName(selectedAccount!)}</div>
                </div>
              </div>
              <button onClick={() => setShowChatModal(false)} className="text-white/80 hover:text-white transition">
                <X size={24} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages-container" style={{ backgroundColor: '#f3f4f6' }}>
              {loadingMoreMessages && (
                <div className="flex justify-center py-2">
                  <RefreshCw className="animate-spin text-gray-400" size={20} />
                </div>
              )}

              {hasMoreMessages && !loadingMoreMessages && messages.length > 0 && (
                <div className="flex justify-center py-2">
                  <button
                    onClick={() => fetchMessages(chatReceiver.id, messagesPage + 1)}
                    className="px-4 py-1.5 text-xs font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full transition"
                  >
                    ↑ Voir plus
                  </button>
                </div>
              )}

              {isLoadingMessages ? (
                <div className="text-center py-8">
                  <RefreshCw className="animate-spin mx-auto text-gray-400" size={24} />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Aucun message. Commencez la conversation !
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${msg.is_mine ? 'bg-sky-500 text-white rounded-br-md' : 'bg-white text-gray-800 rounded-bl-md shadow-sm'}`}>
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <span className={`text-[10px] block text-right mt-1 ${msg.is_mine ? 'text-sky-100' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-gray-200 shrink-0">
              <div className="relative flex items-center gap-2">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition shrink-0"
                >
                  <FaSmile size={20} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute bottom-full left-0 mb-2 z-50">
                    <EmojiPicker onEmojiClick={onEmojiClick} theme={"light" as any} />
                  </div>
                )}
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Écrivez votre message..."
                  className="flex-1 min-w-0 px-4 py-2.5 rounded-full border-none text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  style={{ backgroundColor: '#f3f4f6', color: '#1f2937' }}
                  disabled={isSending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="p-2.5 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition disabled:opacity-50 shadow-lg shrink-0"
                >
                  <FaPaperPlane size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE NOUVELLE DISCUSSION */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-t-2xl shrink-0">
              <h3 className="font-bold">Nouvelle discussion</h3>
              <button onClick={() => {
                setShowNewChatModal(false);
                setSelectedFakeAccount(null);
                setSelectedRealUser(null);
                setUserSearchTerm('');
                setUserSearchResults([]);
                setFirstMessage('👋 Bonjour !');
              }} className="text-white/80 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {/* Étape 1 : Choisir le compte fake */}
              <p className="text-sm font-semibold text-gray-700 mb-2">1. Choisir le compte fake</p>
              {selectedFakeAccount ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                      {getDisplayName(selectedFakeAccount).charAt(0)}
                    </span>
                    <span className="font-medium text-sm">{getDisplayName(selectedFakeAccount)}</span>
                  </div>
                  <button onClick={() => setSelectedFakeAccount(null)} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto mb-4 space-y-1">
                  {accounts.map(account => (
                    <button
                      key={account.id}
                      onClick={() => setSelectedFakeAccount(account)}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition flex items-center gap-3"
                    >
                      <span className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold text-sm">
                        {(account.firstname || account.name || '?').charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div className="text-sm font-medium">{getDisplayName(account)}</div>
                        <div className="text-xs text-gray-500">{account.email}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Étape 2 : Choisir le compte réel */}
              <p className="text-sm font-semibold text-gray-700 mb-2">2. Choisir le compte réel</p>
              {selectedRealUser ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {(selectedRealUser.name || 'U').charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <span className="font-medium text-sm">{selectedRealUser.name || 'Sans nom'}</span>
                      <span className="text-xs text-gray-500 ml-2">{selectedRealUser.email}</span>
                    </div>
                  </div>
                  <button onClick={() => {
                    setSelectedRealUser(null);
                    setUserSearchTerm('');
                    setUserSearchResults([]);
                  }} className="text-red-400 hover:text-red-600">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    />
                  </div>
                  <div className="max-h-40 overflow-y-auto mb-4">
                    {isSearchingUsers ? (
                      <div className="text-center py-4">
                        <RefreshCw className="animate-spin mx-auto" size={20} />
                      </div>
                    ) : userSearchResults.length === 0 && userSearchTerm.length >= 2 ? (
                      <p className="text-center text-gray-500 py-4 text-sm">Aucun utilisateur trouvé</p>
                    ) : (
                      userSearchResults
                        .filter((u: any) => u.id !== selectedFakeAccount?.id)
                        .map((user: any) => (
                          <button
                            key={user.id}
                            onClick={() => {
                              setSelectedRealUser(user);
                              setUserSearchTerm('');
                              setUserSearchResults([]);
                            }}
                            className="w-full text-left p-3 hover:bg-gray-50 rounded-xl transition flex items-center gap-3"
                          >
                            <span className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                              {(user.name || 'U').charAt(0).toUpperCase()}
                            </span>
                            <div>
                              <div className="text-sm font-medium">{user.name || 'Sans nom'}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </button>
                        ))
                    )}
                  </div>
                </>
              )}

              {/* Étape 3 : Message */}
              <p className="text-sm font-semibold text-gray-700 mb-2">3. Premier message</p>
              <input
                type="text"
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                placeholder="Votre premier message..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>
            <div className="p-4 bg-gray-50 shrink-0 rounded-b-2xl">
              <button
                onClick={async () => {
                  if (!selectedFakeAccount || !selectedRealUser || !firstMessage.trim()) return;
                  await startNewConversation(selectedFakeAccount, selectedRealUser, firstMessage);
                  setShowNewChatModal(false);
                  setSelectedFakeAccount(null);
                  setSelectedRealUser(null);
                  setUserSearchTerm('');
                  setUserSearchResults([]);
                  setFirstMessage('👋 Bonjour !');
                }}
                disabled={!selectedFakeAccount || !selectedRealUser || !firstMessage.trim()}
                className="w-full py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition disabled:opacity-50 font-semibold"
              >
                Démarrer la discussion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;