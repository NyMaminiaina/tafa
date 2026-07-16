import React, { useState, useEffect } from 'react';
import {
  Search, Ban, UserCheck, AlertCircle, Shield, Clock,
  Calendar, Download, RefreshCw, Users,
 CheckCircle, XCircle, Mail, Eye
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
}

interface Block {
  id: number;
  blocker: User;
  blocked: User;
  created_at: string;
}

interface Report {
  id: number;
  reporter: User;
  reported: User;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
}
const API_URL = import.meta.env.VITE_API_URL;

const Blocage = () => {
  // States for blocks




  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'blocks' | 'reports'>('blocks');
  const [filterStatus, setFilterStatus] = useState<
  'all' | 'pending' | 'reviewed' | 'resolved' | 'dismissed'
>('all');
  const [isLoading, setIsLoading] = useState(true);
 

  const [blocks, setBlocks] = useState<Block[]>([]);
const [filteredBlocks, setFilteredBlocks] = useState<Block[]>([]);
const [reports, setReports] = useState<Report[]>([]);
const [filteredReports, setFilteredReports] = useState<Report[]>([]);
const [, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch blocks from API
  const fetchBlocks = async (page: number = 1): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken') ?? '';
      const response = await fetch(`${API_URL}/admin/blocks?page=${page}&per_page=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des blocages');
      }

      const data = await response.json();

      const mappedBlocks: Block[] = data.data.map((block: any) => ({
        id: block.id,
        blocker: {
          id: block.blocker?.id ?? 0,
          name: block.blocker?.name || 'N/A',
          email: block.blocker?.email || 'N/A'
        },
        blocked: {
          id: block.blocked?.id ?? 0,
          name: block.blocked?.name || 'N/A',
          email: block.blocked?.email || 'N/A'
        },
        created_at: block.created_at
      }));

      setBlocks(mappedBlocks);
      setFilteredBlocks(mappedBlocks);
      setTotalPages(data.last_page || 1);
      setTotalItems(data.total || 0);
      setCurrentPage(data.current_page || 1);

    } catch (err: unknown) {
      console.error('Error:', err);
    
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur inconnue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch reports from API
  const fetchReports = async (page: number = 1,status: typeof filterStatus = 'all'): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('adminToken') ?? '';
      const statusParam = status !== 'all' ? `&status=${status}` : '';
      const response = await fetch(`${API_URL}/admin/reports?page=${page}&per_page=20${statusParam}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des signalements');
      }

      const data = await response.json();

      const mappedReports: Report[] = data.data.map((report: any) => ({

        id: report.id,
        reporter: {
          id: report.reporter?.id,
          name: report.reporter?.name || 'N/A',
          email: report.reporter?.email || 'N/A'
        },
        reported: {
          id: report.reported?.id,
          name: report.reported?.name || 'N/A',
          email: report.reported?.email || 'N/A'
        },
        reason: report.reason,
        status: report.status || 'pending',
        created_at: report.created_at
      }));

      setReports(mappedReports);
      setFilteredReports(mappedReports);
      setTotalPages(data.last_page || 1);
      setTotalItems(data.total || 0);
      setCurrentPage(data.current_page || 1);

    } catch (err: unknown) {
      console.error('Error:', err);
    
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur inconnue");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (activeTab === 'blocks') {
      fetchBlocks(1);
    } else {
      fetchReports(1, filterStatus);
    }
  }, [activeTab]);

  // Filter locally
  useEffect(() => {
    if (activeTab === 'blocks') {
      if (!searchTerm) {
        setFilteredBlocks(blocks);
        return;
      }
      const filtered = blocks.filter(block =>
        block.blocker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.blocker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.blocked.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        block.blocked.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBlocks(filtered);
    } else {
      if (!searchTerm) {
        setFilteredReports(reports);
        return;
      }
      const filtered = reports.filter(report =>
        report.reporter.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reporter.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reported.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reported.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.reason?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredReports(filtered);
    }
  }, [searchTerm, blocks, reports, activeTab]);

  // Update report status
  const handleUpdateReportStatus = async (reportId: number,newStatus: Report['status']): Promise<void> => {
    try {
      const token = localStorage.getItem('adminToken') ?? '';
  
      const response = await fetch(`${API_URL}/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
  
      const data = await response.json();
  
      console.log("STATUS HTTP =", response.status);
      console.log("RESPONSE =", data);
  
      if (!response.ok) {
        throw new Error(data.message || "Erreur API");
      }
  
      // 🔥 LA VRAIE SOLUTION
      fetchReports(currentPage, filterStatus);
  
    } catch (err) {
      console.error('Error updating report:', err);
    }
  };

  // Format date
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge for reports
  const getStatusBadge = (status: Report['status']) => {
    const config = {
      pending: { color: 'bg-amber-100 text-amber-800', icon: <Clock size={12} />, label: 'En attente' },
      reviewed: { color: 'bg-blue-100 text-blue-800', icon: <Eye size={12} />, label: 'Examiné' },
      resolved: { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle size={12} />, label: 'Résolu' },
      dismissed: { color: 'bg-gray-100 text-gray-800', icon: <XCircle size={12} />, label: 'Rejeté' }
    };

    const statusConfig = config[status] || config.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.icon}
        {statusConfig.label}
      </span>
    );
  };

  // Export to CSV
  const exportToCSV = () => {
    if (activeTab === 'blocks') {
      const headers = ['ID', 'Bloqueur', 'Email Bloqueur', 'Bloqué', 'Email Bloqué', 'Date'];
      const csvContent = [
        headers.join(','),
        ...filteredBlocks.map(block => [
          block.id,
          `"${block.blocker.name}"`,
          block.blocker.email,
          `"${block.blocked.name}"`,
          block.blocked.email,
          block.created_at
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `blocages_tafa_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } else {
      const headers = ['ID', 'Signaleur', 'Email Signaleur', 'Signalé', 'Email Signalé', 'Raison', 'Statut', 'Date'];
      const csvContent = [
        headers.join(','),
        ...filteredReports.map(report => [
          report.id,
          `"${report.reporter.name}"`,
          report.reporter.email,
          `"${report.reported.name}"`,
          report.reported.email,
          `"${report.reason}"`,
          report.status,
          report.created_at
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `signalements_tafa_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
  };

  const handleRefresh = (): void => {
    if (activeTab === 'blocks') {
      fetchBlocks(currentPage);
    } else {
      fetchReports(currentPage, filterStatus);
    }
  };

  const handlePageChange = (newPage: number): void => {
    if (activeTab === 'blocks') {
      fetchBlocks(newPage);
    } else {
      fetchReports(newPage, filterStatus);
    }
  };

  if (isLoading && blocks.length === 0 && reports.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-sky-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Chargement...</p>
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
            <Shield className="text-rose-600" size={32} />
            Modération
          </h1>
          <p className="text-gray-600">
            Gérer les blocages et signalements
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('blocks')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
            activeTab === 'blocks'
              ? 'bg-rose-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <Ban size={18} />
          Blocages ({blocks.length})
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition ${
            activeTab === 'reports'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <AlertCircle size={18} />
          Signalements ({reports.length})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {activeTab === 'blocks' ? (
          <>
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Blocages</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{totalItems}</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-100 text-rose-600">
                  <Ban size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilisateurs bloqueurs</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {new Set(blocks.map(b => b.blocker.id)).size}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                  <Users size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilisateurs bloqués</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {new Set(blocks.map(b => b.blocked.id)).size}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gray-100 text-gray-600">
                  <UserCheck size={24} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Signalements</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">{totalItems}</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
                  <AlertCircle size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {reports.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-100 text-red-600">
                  <Clock size={24} />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Résolus</p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {reports.filter(r => r.status === 'resolved').length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle size={24} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Search & Filters */}
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

          {activeTab === 'reports' && (
            <select
              value={filterStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const value = e.target.value as
                  | 'all'
                  | 'pending'
                  | 'reviewed'
                  | 'resolved'
                  | 'dismissed';
              
                setFilterStatus(value);
                fetchReports(1, value);
              }}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="reviewed">Examiné</option>
              <option value="resolved">Résolu</option>
              <option value="dismissed">Rejeté</option>
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'blocks' ? (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Bloqueur</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Utilisateur bloqué</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredBlocks.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      Aucun blocage trouvé
                    </td>
                  </tr>
                ) : (
                  filteredBlocks.map((block) => (
                    <tr key={block.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-600">#{block.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                            {block.blocker.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{block.blocker.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail size={10} />
                              {block.blocker.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-400 flex items-center justify-center text-white font-bold">
                            {block.blocked.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{block.blocked.name}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail size={10} />
                              {block.blocked.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{formatDate(block.created_at)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Signaleur</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Signalé</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Raison</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Statut</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      Aucun signalement trouvé
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-600">#{report.id}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold">
                            {report.reporter.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{report.reporter.name}</div>
                            <div className="text-xs text-gray-500">{report.reporter.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-rose-500 to-pink-400 flex items-center justify-center text-white font-bold">
                            {report.reported.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{report.reported.name}</div>
                            <div className="text-xs text-gray-500">{report.reported.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-700 max-w-xs truncate" title={report.reason}>
                          {report.reason}
                        </p>
                        <div className="text-xs text-gray-500 mt-1">{formatDate(report.created_at)}</div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(report.status)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          {report.status === 'pending' && (
                            <>
                            {/* 👁️ EXAMINÉ */}
                              <button
                                onClick={() => handleUpdateReportStatus(report.id, 'reviewed')}
                                className="p-2 hover:bg-blue-50 rounded-lg transition text-blue-600"
                                title="Marquer comme examiné"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => handleUpdateReportStatus(report.id, 'resolved')}
                                className="p-2 hover:bg-emerald-50 rounded-lg transition text-emerald-600"
                                title="Marquer comme résolu"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleUpdateReportStatus(report.id, 'dismissed')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
                                title="Rejeter"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {report.status !== 'pending' && (
                            <button
                              onClick={() => handleUpdateReportStatus(report.id, 'pending')}
                              className="p-2 hover:bg-amber-50 rounded-lg transition text-amber-600"
                              title="Remettre en attente"
                            >
                              <Clock size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages} ({totalItems} éléments)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
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

export default Blocage;
