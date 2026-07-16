import { useState } from 'react';
import { FiMenu, FiX } from 'react-icons/fi';
import SideBar from './components/SideBar';
import Statistiques from './Statistiques';
import Utilisateurs from './Utilisateurs';
import Blocage from './Blocage';
import Chat from './Chat';
import { useTheme } from '../context/ThemeContext';
import Paiement from './Paiement';

type TabType = 'stats' | 'users' | 'chat' | 'ban' | 'more';

interface NavLink {
    name: string;
    url: TabType;
}

const navigationLinks: NavLink[] = [
    { name: 'Statistiques', url: 'stats' },
    { name: 'Utilisateurs', url: 'users' },
    { name: 'Chat', url: 'chat' },
    { name: 'Blocage', url: 'ban' },
    { name: 'Paiements', url: 'more' },
];


export default function Accueil() {

    const [activeTab, setActiveTab] = useState<TabType>(navigationLinks[0].url);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    useTheme();

    const toggleSidebar = (): void => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleTabChange = (tab: TabType): void => {
        setIsLoading(true);
        setActiveTab(tab);
        setTimeout(() => setIsLoading(false), 300);
    };

    return (
        <div className='flex min-h-screen' style={{ backgroundColor: "var(--bg-secondary)" }}>
            {/* Barre latérale fixe */}
            <SideBar
                links={navigationLinks}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isOpen={isSidebarOpen}
            />

            {/* Contenu Principal */}
            <main
                className={`flex-1 p-8 transition-all duration-300 relative min-h-screen ${isSidebarOpen ? 'ml-64' : 'ml-0'
                    }`}
                style={{ color: "var(--text-primary)" }}
            >
                {/* Overlay de chargement */}
                {isLoading && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Bouton Toggle flottant */}
                <button
                    onClick={toggleSidebar}
                    className={`fixed top-4 z-50 p-2 rounded-full bg-gray-800 text-white shadow-lg transition-all duration-300 hover:bg-gray-700`}
                    style={{
                        // On calcule la position pour qu'il soit sur le bord de la sidebar
                        left: isSidebarOpen ? '240px' : '16px',
                    }}
                >
                    {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </button>

                {/* Wrapper de contenu pour éviter que les éléments ne collent aux bords */}
                <div className="mt-8">
                    {activeTab === 'stats' && <Statistiques />}
                    {activeTab === 'users' && <Utilisateurs />}
                    {activeTab === 'chat' && <Chat />}
                    {activeTab === 'ban' && <Blocage />}
                    {activeTab === 'more' && <Paiement />}
                </div>
            </main>
        </div>
    );
}