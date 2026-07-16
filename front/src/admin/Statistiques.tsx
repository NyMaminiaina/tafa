import React, { useState, useEffect } from 'react';
import {
	PieChart, Pie, Cell,
	Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
	Users,
	MessageCircle,
	Heart,
	TrendingUp,
	Calendar,
	Download,
	Activity,
	Crown,
	AlertCircle,
	RefreshCw,
	BarChart3,
	TrendingDown,
	Shield,
	Ban
} from 'lucide-react';


interface Stats {
	users?: {
		total: number;
		today: number;
		this_week: number;
		this_month: number;
	};
	subscriptions?: {
		active: number;
		total: number;
		revenue_this_month: number;
	};
	messages?: {
		total: number;
		today: number;
	};
	likes?: {
		total: number;
		matches: number;
	};
	reports?: {
		pending: number;
		total: number;
	};
	blocks?: {
		total: number;
	};
}

const API_URL = import.meta.env.VITE_API_URL;

// MiniGraph Component
interface MiniGraphProps {
	data: number[];
	color: string;
}

const MiniGraph: React.FC<MiniGraphProps> = ({ data, color }) => {
	if (!data || data.length === 0) return null;

	const maxValue = Math.max(...data);
	const minValue = Math.min(...data);
	const range = maxValue - minValue || 1;

	const points = data.map((value, index) => {
		const x = (index / (data.length - 1)) * 100;
		const y = 100 - ((value - minValue) / range) * 100;
		return `${x},${y}`;
	}).join(' ');

	return (
		<div className="h-16 w-full">
			<svg
				width="100%"
				height="100%"
				viewBox="0 0 100 100"
				preserveAspectRatio="none"
				className="overflow-visible"
			>
				<polyline
					fill="none"
					stroke={color}
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
					points={points}
				/>
			</svg>
		</div>
	);
};

// Stat Card Component
interface StatCardProps {
	title: string;
	value: string | number;
	change?: string | null;
	trend?: 'up' | 'down';
	icon: React.ElementType;
	color: string;
	chartData?: number[];
}

const StatCard: React.FC<StatCardProps> = ({
	title,
	value,
	change,
	trend,
	icon: Icon,
	color,
	chartData
}) => {
	const iconColorClass = {
		'blue': 'text-blue-600',
		'green': 'text-emerald-600',
		'amber': 'text-amber-600',
		'rose': 'text-rose-600',
		'red': 'text-red-600',
		'purple': 'text-purple-600',
	}[color] || 'text-blue-600';

	const bgGradient = {
		'blue': 'from-blue-500 to-cyan-500',
		'green': 'from-emerald-500 to-teal-500',
		'amber': 'from-amber-500 to-orange-500',
		'rose': 'from-rose-500 to-pink-500',
		'red': 'from-red-500 to-rose-500',
		'purple': 'from-purple-500 to-indigo-500',
	}[color] || 'from-blue-500 to-cyan-500';

	const chartColor = {
		'blue': '#3b82f6',
		'green': '#10b981',
		'amber': '#f59e0b',
		'rose': '#ec4899',
		'red': '#ef4444',
		'purple': '#8b5cf6',
	}[color] || '#3b82f6';

	return (
		<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-all duration-300">
			<div className="flex items-start justify-between mb-4">
				<div className={`p-3 rounded-xl bg-gradient-to-br ${bgGradient} bg-opacity-10`}>
					<Icon className={iconColorClass} size={24} />
				</div>
				{change && (
					<div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
						}`}>
						{trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
						{change}
					</div>
				)}
			</div>

			<h3 className="text-2xl font-bold text-gray-800 mb-1">{value}</h3>
			<p className="text-sm text-gray-600 font-medium mb-4">{title}</p>

			{chartData && <MiniGraph data={chartData} color={chartColor} />}
		</div>
	);
};

export default function Statistiques() {
	const [stats, setStats] = useState<Stats | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [timeRange, setTimeRange] = useState<string>('30j');

	const timeRanges = [
		{ id: '7j', label: '7 derniers jours' },
		{ id: '30j', label: '30 derniers jours' },
		{ id: '90j', label: '3 derniers mois' },
		{ id: '1a', label: '1 an' }
	];

	// Fetch real statistics from API
	const fetchStatistics = async (): Promise<void> => {
		setIsLoading(true);
		setError(null);

		try {
			const token = localStorage.getItem('adminToken') ?? '';
			const response = await fetch(`${API_URL}/admin/statistics`, {
				headers: {
					'Authorization': `Bearer ${token}`,
					'Accept': 'application/json',
				}
			});

			if (!response.ok) {
				throw new Error('Erreur lors du chargement des statistiques');
			}

			const data: Stats = await response.json();
			setStats(data);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchStatistics();
	}, []);



	if (isLoading) {
		return (
			<div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen flex items-center justify-center">
				<div className="text-center">
					<RefreshCw className="animate-spin text-sky-600 mx-auto mb-4" size={48} />
					<p className="text-gray-600 font-medium">Chargement des statistiques...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen flex items-center justify-center">
				<div className="text-center bg-white p-8 rounded-2xl shadow-lg">
					<AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
					<p className="text-gray-800 font-semibold mb-2">Erreur de chargement</p>
					<p className="text-gray-600 mb-4">{error}</p>
					<button
						onClick={fetchStatistics}
						className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
					>
						Réessayer
					</button>
				</div>
			</div>
		);
	}

	// Calculate derived values
	const totalUsers = stats?.users?.total || 0;
	const usersToday = stats?.users?.today || 0;
	const usersThisWeek = stats?.users?.this_week || 0;
	const usersThisMonth = stats?.users?.this_month || 0;

	const activeSubscriptions = stats?.subscriptions?.active || 0;
	const totalSubscriptions = stats?.subscriptions?.total || 0;
	const revenueThisMonth = stats?.subscriptions?.revenue_this_month || 0;

	const totalMessages = stats?.messages?.total || 0;
	const messagesToday = stats?.messages?.today || 0;

	const totalLikes = stats?.likes?.total || 0;
	const totalMatches = stats?.likes?.matches || 0;

	const pendingReports = stats?.reports?.pending || 0;
	const totalReports = stats?.reports?.total || 0;

	const totalBlocks = stats?.blocks?.total || 0;

	// Premium percentage
	const premiumPercentage = totalUsers > 0 ? ((activeSubscriptions / totalUsers) * 100).toFixed(1) : 0;

	// Pie chart data for premium distribution
	const premiumDistribution = [
		{ name: 'Premium', value: activeSubscriptions, color: '#f59e0b' },
		{ name: 'Standard', value: totalUsers - activeSubscriptions, color: '#94a3b8' }
	];

	return (
		<div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen">
			{/* Header */}
			<div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
						<BarChart3 className="text-sky-600" size={32} />
						Dashboard Analytique
					</h1>
					<p className="text-gray-600">Statistiques en temps réel de votre plateforme</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					<div className="relative">
						<select
							value={timeRange}
							onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
								setTimeRange(e.target.value)
							}
							className="pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none"
						>
							{timeRanges.map(range => (
								<option key={range.id} value={range.id}>{range.label}</option>
							))}
						</select>
						<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
					</div>

					<button
						onClick={fetchStatistics}
						disabled={isLoading}
						className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition disabled:opacity-50"
					>
						<RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
						Actualiser
					</button>

					<button className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-sky-500 text-white hover:from-sky-700 hover:to-sky-600 rounded-xl transition shadow-lg">
						<Download size={18} />
						Exporter
					</button>
				</div>
			</div>

			{/* Main KPI Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<StatCard
					title="Utilisateurs Total"
					value={totalUsers.toLocaleString()}
					change={usersThisMonth > 0 ? `+${usersThisMonth} ce mois` : null}
					trend="up"
					icon={Users}
					color="blue"
				/>
				<StatCard
					title="Messages Total"
					value={totalMessages.toLocaleString()}
					change={messagesToday > 0 ? `+${messagesToday} aujourd'hui` : null}
					trend="up"
					icon={MessageCircle}
					color="green"
				/>
				<StatCard
					title="Abonnés Premium"
					value={activeSubscriptions.toLocaleString()}
					change={`${premiumPercentage}% du total`}
					trend="up"
					icon={Crown}
					color="amber"
				/>
				<StatCard
					title="Matchs"
					value={Math.floor(totalMatches).toLocaleString()}
					change={totalLikes > 0 ? `${totalLikes} likes total` : null}
					trend="up"
					icon={Heart}
					color="rose"
				/>
			</div>

			{/* Secondary Stats */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
				<StatCard
					title="Nouveaux aujourd'hui"
					value={usersToday.toLocaleString()}
					icon={Activity}
					color="purple"
				/>
				<StatCard
					title="Cette semaine"
					value={usersThisWeek.toLocaleString()}
					icon={TrendingUp}
					color="blue"
				/>
				<StatCard
					title="Signalements en attente"
					value={pendingReports.toLocaleString()}
					change={totalReports > 0 ? `${totalReports} total` : null}
					trend={pendingReports > 5 ? 'down' : 'up'}
					icon={Shield}
					color="red"
				/>
				<StatCard
					title="Blocages"
					value={totalBlocks.toLocaleString()}
					icon={Ban}
					color="rose"
				/>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				{/* Premium Distribution Pie Chart */}
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
								<Crown className="text-amber-600" size={20} />
								Répartition Premium vs Standard
							</h3>
							<p className="text-sm text-gray-600">Distribution des utilisateurs</p>
						</div>
						<div className="text-lg font-bold text-amber-700">
							{premiumPercentage}% Premium
						</div>
					</div>

					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={premiumDistribution}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={100}
									paddingAngle={2}
									dataKey="value"
									label={(entry) => `${entry.name}: ${entry.value}`}
								>
									{premiumDistribution.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip formatter={(value) => [value, 'Utilisateurs']} />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>

					<div className="mt-4 grid grid-cols-2 gap-3">
						<div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
							<div className="text-sm text-amber-700 mb-1">Revenus ce mois</div>
							<div className="text-lg font-bold text-amber-800">{revenueThisMonth.toLocaleString()} MGA</div>
						</div>
						<div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg">
							<div className="text-sm text-blue-700 mb-1">Total abonnements</div>
							<div className="text-lg font-bold text-blue-800">{totalSubscriptions}</div>
						</div>
					</div>
				</div>

				{/* Activity Summary */}
				<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
					<div className="flex items-center justify-between mb-6">
						<div>
							<h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
								<Activity className="text-sky-600" size={20} />
								Résumé d'Activité
							</h3>
							<p className="text-sm text-gray-600">Vue d'ensemble des métriques</p>
						</div>
					</div>

					<div className="space-y-4">
						{/* Users Progress */}
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-sm font-medium text-gray-700">Utilisateurs</span>
								<span className="text-sm font-bold text-gray-800">{totalUsers}</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-3">
								<div
									className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full"
									style={{ width: '100%' }}
								></div>
							</div>
						</div>

						{/* Messages Progress */}
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-sm font-medium text-gray-700">Messages</span>
								<span className="text-sm font-bold text-gray-800">{totalMessages}</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-3">
								<div
									className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full"
									style={{ width: `${Math.min((totalMessages / (totalUsers * 10)) * 100, 100)}%` }}
								></div>
							</div>
						</div>

						{/* Likes Progress */}
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-sm font-medium text-gray-700">Likes</span>
								<span className="text-sm font-bold text-gray-800">{totalLikes}</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-3">
								<div
									className="bg-gradient-to-r from-rose-500 to-pink-500 h-3 rounded-full"
									style={{ width: `${Math.min((totalLikes / (totalUsers * 5)) * 100, 100)}%` }}
								></div>
							</div>
						</div>

						{/* Premium Progress */}
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-sm font-medium text-gray-700">Premium</span>
								<span className="text-sm font-bold text-gray-800">{activeSubscriptions}</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-3">
								<div
									className="bg-gradient-to-r from-amber-500 to-orange-500 h-3 rounded-full"
									style={{ width: `${premiumPercentage}%` }}
								></div>
							</div>
						</div>

						{/* Matches */}
						<div>
							<div className="flex justify-between mb-2">
								<span className="text-sm font-medium text-gray-700">Matchs</span>
								<span className="text-sm font-bold text-gray-800">{Math.floor(totalMatches)}</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-3">
								<div
									className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full"
									style={{ width: `${Math.min((totalMatches / totalLikes) * 100, 100) || 0}%` }}
								></div>
							</div>
						</div>
					</div>

					{/* Quick Stats */}
					<div className="mt-6 pt-4 border-t border-gray-200">
						<div className="grid grid-cols-2 gap-4">
							<div className="text-center">
								<div className="text-2xl font-bold text-sky-600">{usersToday}</div>
								<div className="text-xs text-gray-500">Inscriptions aujourd'hui</div>
							</div>
							<div className="text-center">
								<div className="text-2xl font-bold text-emerald-600">{messagesToday}</div>
								<div className="text-xs text-gray-500">Messages aujourd'hui</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Reports & Moderation Section */}
			<div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
					<Shield className="text-red-600" size={20} />
					Modération & Signalements
				</h3>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
						<div className="flex items-center gap-3 mb-2">
							<AlertCircle className="text-red-600" size={24} />
							<span className="font-semibold text-red-800">Signalements en attente</span>
						</div>
						<div className="text-3xl font-bold text-red-700">{pendingReports}</div>
						<p className="text-sm text-red-600 mt-1">À traiter</p>
					</div>

					<div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
						<div className="flex items-center gap-3 mb-2">
							<Shield className="text-amber-600" size={24} />
							<span className="font-semibold text-amber-800">Total signalements</span>
						</div>
						<div className="text-3xl font-bold text-amber-700">{totalReports}</div>
						<p className="text-sm text-amber-600 mt-1">Historique complet</p>
					</div>

					<div className="p-4 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl">
						<div className="flex items-center gap-3 mb-2">
							<Ban className="text-slate-600" size={24} />
							<span className="font-semibold text-slate-800">Utilisateurs bloqués</span>
						</div>
						<div className="text-3xl font-bold text-slate-700">{totalBlocks}</div>
						<p className="text-sm text-slate-600 mt-1">Blocages mutuels</p>
					</div>
				</div>
			</div>
		</div>
	);
}
