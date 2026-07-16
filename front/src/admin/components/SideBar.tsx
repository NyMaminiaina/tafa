
import { useNavigate } from 'react-router-dom';
import {
    FiBarChart2, FiUsers, FiMessageCircle,
    FiLock, FiMoreHorizontal, FiLogOut, FiBell
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

type TabType = 'stats' | 'users' | 'chat' | 'ban' | 'more';

interface LinkItem {
    url: TabType;
    name: string;
}

interface SideBarProps {
    links?: LinkItem[];
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    isOpen: boolean;
}


const getIcon = (url: TabType): IconType => {
    switch (url) {
        case 'stats': return FiBarChart2;
        case 'users': return FiUsers;
        case 'chat': return FiMessageCircle;
        case 'ban': return FiLock;
        default: return FiMoreHorizontal;
    }
};


export default function SideBar({
    links = [],
    activeTab,
    onTabChange,
    isOpen
}: SideBarProps) {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState<any>(null);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const storedAdmin = localStorage.getItem('adminUser');
        if (storedAdmin) {
            setAdmin(JSON.parse(storedAdmin));
        }
    }, []);

    // Classes de base pour la sidebar
    const fixedClasses = 'bg-gray-800 text-white h-screen shadow-2xl transition-transform duration-300 fixed top-0 left-0 z-40 flex flex-col w-64';

    // Gestion de l'animation d'ouverture/fermeture
    const dynamicClasses = isOpen
        ? 'translate-x-0'
        : '-translate-x-full';

    const logoutClasses = 'flex items-center space-x-3 p-3 rounded-lg bg-red-600 hover:bg-red-700 transition duration-150 w-full text-lg font-medium text-white';

    return (
        <aside className={`${fixedClasses} ${dynamicClasses}`}>

            <div className='flex flex-col flex-grow p-6 pb-7'>
                {/* Header de la Sidebar (Logo + Profil) */}
                <div className='flex flex-col pb-3 mb-6 border-b border-gray-700'>
                    {/* <div className='flex justify-center items-center mb-6'>
                        <img src="/logo full white.png" alt="logo" className='h-9 w-auto' />
                    </div> */}

                    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700/50 cursor-pointer transition">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shrink-0">
                            A
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white truncate">Admin</p>
                            <p className="text-xs text-gray-300 truncate">
                                {admin ? `${admin.firstname || ''} ${admin.name || ''}`.trim() : 'Principal'}
                            </p>
                        </div>
                        <FiBell className="text-blue-400 shrink-0" size={16} />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 overflow-y-auto">
                    {links.map((link: LinkItem) => {
                        const IconComponent = getIcon(link.url);
                        const isActive = link.url === activeTab;

                        return (
                            <button
                                key={link.url}
                                onClick={() => onTabChange(link.url)}
                                className={`w-full flex items-center space-x-3 p-3 rounded-lg transition duration-150 ${isActive
                                    ? 'bg-sky-600 text-white font-bold shadow-md'
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                            >
                                <IconComponent size={20} className={isActive ? "text-white" : "text-blue-400"} />
                                <span className='text-lg font-medium'>{link.name}</span>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Pied de la SideBar */}
            <div className="mt-auto pt-6 border-t border-gray-700 px-6 pb-6 space-y-3">
                {/* Bouton Thème */}
                <button
                    onClick={() => setTheme(theme.color, theme.mode === 'clair' ? 'sombre' : 'clair')}
                    className="flex items-center space-x-3 p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition duration-150 w-full text-lg font-medium text-white"
                >
                    {theme.mode === 'clair' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    )}
                    <span>{theme.mode === 'clair' ? 'Mode sombre' : 'Mode clair'}</span>
                </button>

                {/* Logout Button */}
                <button
                    onClick={() => {
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminUser');
                        localStorage.removeItem('isAuthenticated');
                        navigate('/admin');
                    }}
                    className={logoutClasses}
                >
                    <FiLogOut size={20} />
                    <span>Déconnecter</span>
                </button>
            </div>

        </aside>
    );
}