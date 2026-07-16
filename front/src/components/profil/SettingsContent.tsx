import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import {  deleteAccount } from '../../api/api';
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaCog } from 'react-icons/fa';

type Color = 'rose' | 'blue';
type Mode = 'clair' | 'sombre';

interface ThemeOptionCardProps {
    color: Color;
    mode: Mode;
    selectedTheme: string;
    onSelect: (color: Color, mode: Mode) => void;
}

const ThemeOptionCard: React.FC<ThemeOptionCardProps> = ({ color, mode, selectedTheme, onSelect }) => {
    const themeKey = `${color}-${mode}`;
    const isChecked = selectedTheme === themeKey;

    const colorClass = color === 'rose' ? 'bg-pink-400' : 'bg-[#1daeed]';
    const previewBgClass = mode === 'clair' ? 'bg-white' : 'bg-slate-900';

    const cardClasses = `flex items-center p-4 rounded-2xl cursor-pointer transition-all ${
        isChecked
            ? 'border-2 border-[var(--color-primary)] bg-[var(--color-primary-light)]'
            : 'border-2 border-slate-200 hover:border-slate-300 bg-white'
    }`;

    const checkmark = isChecked && (
        <svg className="w-6 h-6 ml-auto flex-shrink-0" style={{ color: 'var(--color-primary)' }} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
        </svg>
    );

    const colorLabel = color === 'rose' ? 'Rose' : 'Bleu';
    const modeLabel = mode === 'clair' ? 'Clair' : 'Sombre';

    return (
        <div className={cardClasses} onClick={() => onSelect(color, mode)}>
            {/* Preview */}
            <div className="w-16 h-16 flex flex-shrink-0 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm">
                <div className={`w-1/3 ${colorClass} h-full`}></div>
                <div className={`w-2/3 ${previewBgClass} h-full`}></div>
            </div>

            {/* Label */}
            <div className="ml-4 flex-grow">
                <p className="text-slate-800 font-bold text-base">
                    {colorLabel} - {modeLabel}
                </p>
                <p className="text-sm text-slate-500">
                    Thème {colorLabel.toLowerCase()} avec fond {modeLabel.toLowerCase()}
                </p>
            </div>

            {checkmark}
        </div>
    );
};

// ------------------------------------------------------------------

interface SettingsContentProps {
    userInfo?: any;
}

const SettingsContent: React.FC<SettingsContentProps> = ({ }) => {
    const { themeKey, setTheme } = useTheme();
    const navigate = useNavigate();



    // Delete account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' });
    const [showDeletePassword, setShowDeletePassword] = useState(false);

    // Admin state
    const [isAdmin] = useState(false);



    const handleThemeSelect = (color: Color, mode: Mode) => {
        setTheme(color, mode);
    };


    // Handle account deletion
    const handleDeleteAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeleteLoading(true);
        setDeleteMessage({ type: '', text: '' });
    
        try {
            const response = await deleteAccount(deletePassword);
            console.log("DELETE RESPONSE =", response);
    
            if (response?.success) {
                setDeleteMessage({
                    type: 'success',
                    text: response.message || 'Compte supprimé avec succès'
                });
            
                // attendre 2 secondes avant redirection
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    navigate('/');
                }, 4000);
            } else {
                setDeleteMessage({
                    type: 'error',
                    text: response?.error || response?.message || 'Erreur lors de la suppression'
                });
            }
        } catch (error: any) {
            console.error("Erreur suppression compte =", error);
    
            setDeleteMessage({
                type: 'error',
                text: error?.message || 'Erreur de connexion'
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto">




            {/* THÈME DE L'APPLICATION */}
            <div className="mb-8 p-6 rounded-2xl border-2 border-slate-100 bg-white shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        🎨
                    </span>
                    Thème de l'application
                </h3>

                <div className="space-y-3">
                    <ThemeOptionCard color="blue" mode="clair" selectedTheme={themeKey} onSelect={handleThemeSelect} />
                    <ThemeOptionCard color="blue" mode="sombre" selectedTheme={themeKey} onSelect={handleThemeSelect} />
                    <ThemeOptionCard color="rose" mode="clair" selectedTheme={themeKey} onSelect={handleThemeSelect} />
                    <ThemeOptionCard color="rose" mode="sombre" selectedTheme={themeKey} onSelect={handleThemeSelect} />
                </div>
            </div>

            {/* NOTIFICATION */}
            <div className="mb-8 p-6 rounded-2xl border-2 border-slate-100 bg-white shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        🔔
                    </span>
                    Notifications
                </h3>

                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50">
                    <span className="text-slate-700 font-medium">Recevoir des notifications</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                    </label>
                </div>
            </div>

            {/* COMPTE */}
            <div className="p-6 rounded-2xl border-2 border-slate-100 bg-white shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        ⚙️
                    </span>
                    Compte
                </h3>

                <div className="space-y-2">
                    <a href="/compte" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-slate-700 font-medium">
                        Parametre du compte
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                    <a href="/confidentialite" className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition text-slate-700 font-medium">
                        Confidentialité et sécurité
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                    

                    {/* Admin Panel Button - Only visible for admins */}
                    {isAdmin && (
                        <button
                            onClick={() => navigate('/admin/accueil')}
                            className="flex items-center justify-between w-full p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition text-white font-medium mt-4"
                        >
                            <div className="flex items-center">
                                <FaCog className="w-5 h-5 mr-2" />
                                Panneau d'administration
                            </div>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="flex items-center w-full p-3 rounded-xl hover:bg-red-50 transition text-red-600 font-medium mt-4"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Supprimer le compte
                    </button>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                                <FaExclamationTriangle className="text-red-600 text-xl" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Supprimer le compte</h3>
                                <p className="text-sm text-slate-500">Cette action est irreversible</p>
                            </div>
                        </div>

                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100">
                            <p className="text-sm text-red-700">
                                <strong>Attention :</strong> La suppression de votre compte entrainera la perte definitive de :
                            </p>
                            <ul className="text-sm text-red-600 mt-2 space-y-1 list-disc list-inside">
                                <li>Votre profil et vos photos</li>
                                <li>Vos conversations et messages</li>
                                <li>Vos likes et matchs</li>
                                <li>Votre abonnement Tafa Gold</li>
                            </ul>
                        </div>

                        {deleteMessage.text && (
                            <div className={`mb-4 p-3 rounded-xl ${deleteMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {deleteMessage.text}
                            </div>
                        )}

                        <form onSubmit={handleDeleteAccount} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Entrez votre mot de passe pour confirmer
                                </label>
                                <div className="relative">
                                    <input
                                        type={showDeletePassword ? 'text' : 'password'}
                                        value={deletePassword}
                                        onChange={(e) => setDeletePassword(e.target.value)}
                                        required
                                        className="w-full p-3 pr-12 rounded-xl border-2 border-slate-200 focus:border-red-400 focus:outline-none transition"
                                        placeholder="Votre mot de passe"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowDeletePassword(!showDeletePassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showDeletePassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeletePassword('');
                                        setDeleteMessage({ type: '', text: '' });
                                    }}
                                    className="flex-1 p-3 rounded-xl border-2 border-slate-200 hover:bg-slate-50 transition text-slate-600 font-medium"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={deleteLoading || !deletePassword}
                                    className="flex-1 p-3 rounded-xl bg-red-600 hover:bg-red-700 transition text-white font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {deleteLoading ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Supprimer'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsContent;
