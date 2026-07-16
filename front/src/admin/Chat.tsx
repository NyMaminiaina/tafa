import React, { useState, useEffect } from 'react';
import {
  Search, MessageSquare, Users,  Download, RefreshCw,
  Clock, AlertCircle, Calendar, Mail, 
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Conversation {
  id: number;
  user_one: User;
  user_two: User;
  last_message_at: string | null;
  created_at: string;
}

const API_URL = import.meta.env.VITE_API_URL;

const Chat = () => {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalConversations, setTotalConversations] = useState(0);
 
  

  const [conversations, setConversations] = useState<Conversation[]>([]);
const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
const [error, setError] = useState<string | null>(null);
const [, setSelectedConversation] = useState<Conversation | null>(null);
const [, setMessages] = useState<any[]>([]);

  // Fetch conversations from API
  const fetchConversations = async (page: number = 1): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/admin/conversations?page=${page}&per_page=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des conversations');
      }

      const data = await response.json();

      const mappedConversations: Conversation[] = data.data.map((conv: any) => ({
        id: conv.id,
        user_one: {
          id: conv.user_one_id,
          name: conv.user_one_name,
          email: conv.user_one_email
        },
        user_two: {
          id: conv.user_two_id,
          name: conv.user_two_name,
          email: conv.user_two_email
        },
        last_message_at: conv.last_message_at,
        created_at: conv.created_at
      }));

      setConversations(mappedConversations);
      setFilteredConversations(mappedConversations);
      setTotalPages(data.last_page || 1);
      setTotalConversations(data.total || 0);
      setCurrentPage(data.current_page || 1);

    } catch (err: unknown) {
      console.error('Error fetching conversations:', err);
    
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Une erreur inconnue");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const fetchMessages = async (userId: number): Promise<void> => {
    const token = localStorage.getItem('adminToken');
  
    const res = await fetch(`${API_URL}/messages/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  
    const data = await res.json();
    setMessages(data);
  };

  // Initial fetch
  useEffect(() => {
    fetchConversations(1);
  }, []);

  // Filter conversations locally
  useEffect(() => {
    if (!searchTerm) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conv =>
      conv.user_one.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user_one.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user_two.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.user_two.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);

  // Format date
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string | null): string => {
    if (!dateStr) return 'Jamais';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return formatDate(dateStr);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Utilisateur 1', 'Email 1', 'Utilisateur 2', 'Email 2', 'Dernier message', 'Créé le'];
    const csvContent = [
      headers.join(','),
      ...filteredConversations.map(conv => [
        conv.id,
        `"${conv.user_one.name || 'N/A'}"`,
        conv.user_one.email,
        `"${conv.user_two.name || 'N/A'}"`,
        conv.user_two.email,
        conv.last_message_at || 'N/A',
        conv.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversations_tafa_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (isLoading && conversations.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-sky-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Chargement des conversations...</p>
        </div>
      </div>
    );
  }

  if (error && conversations.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <p className="text-gray-800 font-semibold mb-2">Erreur de chargement</p>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchConversations(1)}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <MessageSquare className="text-sky-600" size={32} />
            Conversations
          </h1>
          <p className="text-gray-600">
            {totalConversations} conversations au total
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => fetchConversations(currentPage)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition"
          >
            <Download size={18} />
            Exporter
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Conversations</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalConversations}</p>
            </div>
            <div className="p-3 rounded-xl bg-sky-100 text-sky-600">
              <MessageSquare size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Utilisateurs impliqués</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {new Set([
                  ...conversations.map(c => c.user_one.id),
                  ...conversations.map(c => c.user_two.id)
                ]).size}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Actives aujourd'hui</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {conversations.filter(c => {
                  if (!c.last_message_at) return false;
                  const date = new Date(c.last_message_at);
                  const today = new Date();
                  return date.toDateString() === today.toDateString();
                }).length}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>
      </div>

      {/* Conversations Table */}
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
              </tr>
            </thead>
            <tbody>
              {filteredConversations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    Aucune conversation trouvée
                  </td>
                </tr>
              ) : (
                filteredConversations.map((conv) => (
                  <tr
                    key={conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);

                      const otherUserId = conv.user_two.id;
                      fetchMessages(otherUserId);
                    }}
                    className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm text-gray-600">#{conv.id}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                          {(conv.user_one.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{conv.user_one.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={10} />
                            {conv.user_one.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-400 flex items-center justify-center text-white font-bold">
                          {(conv.user_two.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{conv.user_two.name || 'N/A'}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail size={10} />
                            {conv.user_two.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatRelativeTime(conv.last_message_at)}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDate(conv.created_at)}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages} ({totalConversations} conversations)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchConversations(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              onClick={() => fetchConversations(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
