import React, { useState, useCallback, useEffect } from 'react';
import {Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import { getSubscriptionStatus } from '../../api/api';
import { FaCrown } from 'react-icons/fa';

import { 
    Music, 
    Plane, 
    Utensils, 
    Trophy, 
    Book, 
    Camera, 
    Film, 
    Gamepad2, 
    Leaf, 
    PawPrint, 
    Laptop, 
    Dumbbell, 
    Mountain, 
    Sun ,Heart, UserPlus, Sparkles, PartyPopper, Banknote, Gem , Pencil
  } from "lucide-react";



const FiltresPage: React.FC = () => {
    const navigate = useNavigate();
    const [isGold, setIsGold] = useState<boolean | null>(null);

    // ALL hooks must be declared before any conditional returns
    const [selectedLoveStatusIndex, setSelectedLoveStatusIndex] = useState(0);
    const [selectedIntentionIndex, setSelectedIntentionIndex] = useState(0);
    const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
    const [distanceKm, setDistanceKm] = useState(50);
    const [minAge, setMinAge] = useState(18);
    const [maxAge, setMaxAge] = useState(35);

    const handleReset = useCallback(() => {
        setDistanceKm(50);
        setMinAge(18);
        setMaxAge(35);
        setSelectedLoveStatusIndex(0);
        setSelectedIntentionIndex(0);
        setSelectedInterests([]);
    }, []);

    const handleLoveStatusClick = useCallback((index: number) => {
        setSelectedLoveStatusIndex(index);
    }, []);

    const handleIntentionClick = useCallback((index: number) => {
        setSelectedIntentionIndex(index);
    }, []);

    const handleInterestClick = useCallback((interestId: number) => {
        setSelectedInterests(prev =>
            prev.includes(interestId)
                ? prev.filter(id => id !== interestId) // Retire l'ID s'il est déjà là
                : [...prev, interestId]               // Ajoute l'ID s'il n'y est pas
        );
    }, []);

    // Check Gold status on mount
    useEffect(() => {
        const checkGoldStatus = async () => {
            try {
                const response = await getSubscriptionStatus();
                console.log('[Filtrer] API response:', response);
                const goldStatus = response.has_subscription || false;
                console.log('[Filtrer] Gold status:', goldStatus);
                setIsGold(goldStatus);
            } catch (error) {
                console.error('[Filtrer] Error:', error);
                setIsGold(false);
            }
        };
        checkGoldStatus();
    }, []);

    // Show locked overlay for non-Gold users
    if (isGold === false) {
        return (
            <div className="min-h-screen w-full pt-[70px]" style={{ backgroundColor: "var(--bg-secondary)" }}>
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
                    <div
                        className="rounded-full p-6 mb-6"
                        style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                    >
                        <FaCrown className="text-white text-5xl" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                        Filtres avances
                    </h2>
                    <p className="text-lg mb-6 max-w-md" style={{ color: "var(--text-secondary)" }}>
                        Les filtres avances sont reserves aux membres Tafa Gold.
                        Debloquez cette fonctionnalite pour trouver exactement ce que vous cherchez !
                    </p>
                    <button
                        onClick={() => navigate('/subscription')}
                        className="px-8 py-4 rounded-2xl font-bold text-lg text-black transition-opacity hover:opacity-90"
                        style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                    >
                        Passer a Tafa Gold
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-2 rounded-xl font-medium"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    // Show loading while checking
    if (isGold === null) {
        return (
            <div className="min-h-screen w-full pt-[70px] flex items-center justify-center" style={{ backgroundColor: "var(--bg-secondary)" }}>
                <Navbar />
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-transparent" style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }}></div>
            </div>
        );
    }

    // User is Gold - render full filter page
    console.log('[Filtrer] Rendering full filter page for Gold user');

    // --- Données ---
    // Liste des centres d'intérêt avec icônes (synchronisée avec Register)
    const AVAILABLE_INTERESTS = [
        { id: 2, name: "Musique", icon: <Music className="w-5 h-5 text-purple-500" /> }, 
        { id: 3, name: "Voyage", icon: <Plane className="w-5 h-5 text-blue-400" /> },
        { id: 7, name: "Cuisine", icon: <Utensils className="w-5 h-5 text-orange-500" /> }, 
        { id: 1, name: "Sport", icon: <Trophy className="w-5 h-5 text-red-500" /> },
        { id: 4, name: "Lecture", icon: <Book className="w-5 h-5 text-indigo-500" /> }, 
        { id: 9, name: "Photographie", icon: <Camera className="w-5 h-5 text-pink-500" /> },
        { id: 5, name: "Cinéma", icon: <Film className="w-5 h-5 text-slate-700" /> }, 
        { id: 8, name: "Jeux vidéo", icon: <Gamepad2 className="w-5 h-5 text-cyan-500" /> },
        { id: 17, name: "Nature", icon: <Leaf className="w-5 h-5 text-green-500" /> }, 
        { id: 14, name: "Animaux", icon: <PawPrint className="w-5 h-5 text-amber-600" /> },
        { id: 15, name: "Technologie", icon: <Laptop className="w-5 h-5 text-blue-700" /> }, 
        { id: 11, name: "Fitness", icon: <Dumbbell className="w-5 h-5 text-lime-600" /> },
        { id: 16, name: "Randonnée", icon: <Mountain className="w-5 h-5 text-stone-600" /> }, 
        { id: 20, name: "Plage", icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    ];
      

    const LOVE_STATUSES = [
        { db: 'Celibataire', label: 'Célibataire' },
        { db: 'marie', label: 'Marié(e)' },
        { db: 'Divorce', label: 'Divorcé(e)' },
        { db: 'veuf', label: 'Veuf/Veuve' },
        { db: 'separe', label: 'Séparé(e)' }
    ];

    const intentions = [
        { id: "1", label: "Relation sérieuse", value: "Relation s├®rieuse", icon: <Heart className="w-5 h-5 text-red-500" /> },
        { id: "2", label: "Amitié", value: "Amiti├®", icon: <UserPlus className="w-5 h-5 text-blue-500" /> },
        { id: "3", label: "Mariage", value: "Mariage", icon: <Sparkles className="w-5 h-5 text-yellow-600" /> },
        { id: "4", label: "Rien de sérieux", value: "Rien de s├®rieux", icon: <PartyPopper className="w-5 h-5 text-pink-500" /> },
        { id: "5", label: "Sugar Daddy", value: "Sugar Daddy", icon: <Banknote className="w-5 h-5 text-green-600" /> },
        { id: "6", label: "Sugar Mommy", value: "Sugar Mommy", icon: <Gem className="w-5 h-5 text-cyan-500" /> },
    ];

    const loveStatuses: string[] = ["Célibataire", "Divorcé(e)", "Veuf/Veuve", "Compliqué", "Ne pas préciser"];
    const maxRange = 60; // Max age range

    const quitterFiltre = () => {
        navigate(-1);
    };

const AppliquerFiltre = () => {
    // Construire les paramètres de l'URL
    const params = new URLSearchParams();

    // 1. Ajouter l'âge
    params.append("ageMin", minAge.toString());
    params.append("ageMax", maxAge.toString());

    // 2. Ajouter l'intention sélectionnée
    // LOGIQUE POUR L'INTENTION
    const selectedIntention = intentions[selectedIntentionIndex];
    if (selectedIntention) {
        // 'intention' sera utilisé par Laravel pour filtrer 'relationship_type_id'
        params.append("intention", selectedIntention.id); 
        
        // 'intentionLabel' sera utilisé par Home.tsx pour l'affichage
        params.append("intentionLabel", selectedIntention.label);
    }
    
    // Situation Amoureuse
    const selectedStatus = LOVE_STATUSES[selectedLoveStatusIndex];

    if (selectedStatus) {
        // 1. Pour la base de données (MariaDB attend 'Celibataire', 'marie', etc.)
        params.append("situation", selectedStatus.db);

        // 2. Pour l'affichage dans Home.tsx (L'utilisateur voit 'Célibataire')
        params.append("situationLabel", selectedStatus.label);
    }

    // 3. PARTIE MODIFIÉE : Ajouter les centres d'intérêt (IDs ET NOMS)
    if (selectedInterests.length > 0) {
        // 1. On envoie les IDs (ex: "2,7") pour ta condition de recherche SQL
        params.append("interests", selectedInterests.join(","));

        // 2. On transforme les IDs en NOMS (ex: "Musique, Cuisine") pour l'affichage
        const nomsLisibles = AVAILABLE_INTERESTS
            .filter(i => selectedInterests.includes(i.id))
            .map(i => i.name)
            .join(", ");
        
        // On envoie ces noms sous une nouvelle étiquette "interestNames"
        params.append("interestNames", nomsLisibles);
    }

    // 4. Ajouter la situation amoureuse
    params.append("situation", loveStatuses[selectedLoveStatusIndex]);

    // 5. Ajouter la distance
    params.append("distance", distanceKm.toString());

    // 6. Indiquer que c'est un filtre avancé
    params.append("filtered", "true");

    navigate(`/welcome?${params.toString()}`);
};

    // Sub-components for filter sections
    const FilterSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => (
        <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-700 underline italic mb-6 border-l-4 border-gray-500 pl-3">
                {title}  
            </h2>
            {children}
        </div>
    );

// DISTANCE MAXIMALE
            const DistanceRangeSlider: React.FC = () => (
                <div className="mb-10 p-6 bg-white rounded-2xl shadow-xl  border-gray-400">
                    <h2 className="text-xl font-bold text-gray-700 italic mb-6 border-l-4 border-gray-500 pl-3">Distance maximale</h2>
                    <div className="text-center mb-2">
                        <p className="text-2xl font-bold text-blue-600 tracking-tight">{distanceKm} <span className="text-lg font-semibold text-blue-600">km</span></p>
                    </div>
                    <div className="relative pt-1">
                        <input
                            type="range"
                            min="1"
                            max="200"
                            value={distanceKm}
                            onChange={(e) => setDistanceKm(Number(e.target.value))}
                            className="w-full h-3 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow-lg"
                        />
                        <div className="flex justify-between text-sm text-gray-500 mt-3 font-medium">
                            <span>1 km</span>
                            <span>200 km</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 text-center italic">
                        La localisation doit etre activee pour utiliser ce filtre
                    </p>
                </div>
            );

//TRANCHE D'AGE
            const SingleSlider: React.FC<{ label: string, value: number, max: number, min: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, max, min, onChange }) => (
                
                <div className="py-2">
                    <label className="text-gray-600 text-base mb-2 flex justify-between items-center">

                        <span>{label}</span>
                        <span className="font-bold text-gray-400 ">{value} ans</span>
                    </label>
                    <input 
                        type="range" 
                        min={min} 
                        max={max} 
                        value={value}
                        onChange={onChange}
                        className="w-full h-3 bg-blue-100 rounded-full appearance-none cursor-pointer accent-blue-600 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-600 [&::-webkit-slider-thumb]:shadow-lg"
                    />
                </div>
            );

            // 
            const DoubleAgeSlider: React.FC = () => {
                const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const newMin = Number(e.target.value);
                    setMinAge(newMin <= maxAge ? newMin : maxAge);
                };

                const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                    const newMax = Number(e.target.value);
                    setMaxAge(newMax >= minAge ? newMax : minAge);
                };

                return (
                    <div className="mb-10 p-2 bg-white rounded-2xl shadow-xl  border-gray-400">
                        <h2 className="text-xl font-bold Tranche d'âge text-gray-700  border-l-4 border-gray-500 pl-3">Tranche d'âge</h2>
                        
                        <div className="text-center">
                            <p className="text-xl font-bold text-blue-600 tracking-tight">
                                {minAge}<span className=" font-semibold text-blue-600"> ans</span> <span className='text-lg text-blue-400 font-semibold'>—</span> {maxAge} <span className=" font-semibold text-blue-600">ans</span>
                            </p>
                        </div>

                        <SingleSlider label={`Âge minimum`} value={minAge} min={18} max={maxRange} onChange={handleMinChange} />
                        <SingleSlider label={`Âge maximum`} value={maxAge} min={18} max={maxRange} onChange={handleMaxChange} />

                        <div className="flex justify-between text-sm text-gray-500 mt-3 font-medium">
                            {/* <span>18 ans</span>
                            <span>{maxRange}+ ans</span> */}
                        </div>
                    </div>
                );
            }
    
// Filtres avancés

    
    return (
        // Conteneur principal plein écran
        <div className="h-full w-full bg-gray-50 flex flex-col antialiased font-sans overflow-hidden">
            <Navbar />
            <style>
                {`
                html, body, #root { 
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                .font-sans {
                    font-family: 'Inter', sans-serif;
                }
                `}
            </style>
            
 {/* 1. En-tête  */}
            <header className="w-full bg-white p-4 shadow-lg border-b border-gray-100">
                <div className="flex justify-between items-center px-6"> {/* Padding interne seulement */}
                    <button onClick={quitterFiltre} className="text-gray-800 text-3xl font-light p-2 hover:bg-gray-100 rounded-full transition duration-150 transform hover:scale-105" aria-label="Fermer les filtres">
                        &times;
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">Filtres</h1>
                    <button onClick={handleReset} className="text-blue-600 font-bold p-2 hover:text-blue-800 transition transform hover:scale-105" aria-label="Réinitialiser les filtres">
                        Réinitialiser
                    </button>
                </div>
            </header>
            


 {/* CONTENU */}
            <main className="flex-grow overflow-y-auto w-full p-6 md:p-10 lg:p-12">
                
                <div className="w-full"> 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 h-4"> 
                        
{/* Colonne 1 */}
                        <div className="md:col-span-1">
                            <DistanceRangeSlider />
                            <DoubleAgeSlider />

                            {/* CENTRE D'INTERET */}
                            <FilterSection title="Centres d'intérêt">
                                {selectedInterests.length > 0 && (
                                    <p className="text-sm text-gray-500 mb-3 font-medium">
                                        {selectedInterests.length} sélectionné{selectedInterests.length > 1 ? 's' : ''}
                                    </p>
                                )}
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                    {/* On utilise maintenant AVAILABLE_INTERESTS au lieu de availableInterests */}
                                    {AVAILABLE_INTERESTS.map(interest => {
                                        // CRUCIAL : On vérifie si l'ID est inclus dans selectedInterests
                                        const isSelected = selectedInterests.includes(interest.id);
                                        
                                        return (
                                            <button
                                                key={interest.id} // Utiliser l'ID comme clé est plus stable
                                                onClick={() => handleInterestClick(interest.id)} // On passe l'ID au clic
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-base transition duration-200 shadow-sm focus:outline-none focus:ring-4 ${
                                                    isSelected
                                                        ? 'bg-blue-400 text-white border-blue-400 hover:bg-blue-500 focus:ring-blue-500/50'
                                                        : 'bg-white text-gray-800 border-gray-200 hover:border-blue-500 hover:bg-blue-50 focus:ring-blue-400/50'
                                                } transform hover:scale-[1.02]`}
                                            >
                                                <span className="text-xl">{interest.icon}</span>
                                                <span className="truncate">{interest.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </FilterSection> 
                        </div> 
{/* Fin de la Colonne 1 */}


{/* Colonne 2 */}
                        <div className="md:col-span-1">

                            {/* SITUATION AMOUREUSE  */}
                            <FilterSection title="Situation amoureuse">
                                <div className="flex flex-wrap gap-2">
                                    {loveStatuses.map((status, index) => {
                                        const isSelected = index === selectedLoveStatusIndex;
                                        return (
                                            <button 
                                                key={index} 
                                                onClick={() => handleLoveStatusClick(index)}
                                                className={`px-5 py-2 rounded-full  text-base  transition duration-200 shadow-sm focus:outline-none focus:ring-4 ${
                                                    isSelected
                                                        ? 'bg-blue-400 text-white border-blue-400 hover:bg-blue-400 focus:ring-blue-500/50' 
                                                        : 'bg-white text-gray-800 border-gray-200 hover:border-blue-500 hover:bg-blue-50 focus:ring-blue-400/50' 
                                                } transform hover:scale-[1.02]`}
                                            >
                                                {status}
                                            </button>
                                        );
                                    })}
                                </div>
                            </FilterSection>
                            
{/* INTENTION */}
                            <FilterSection title="Intentions">
                                <div className="grid grid-cols-2 gap-4">
                                    {intentions.map((intent, index) => {
                                        const isSelected = index === selectedIntentionIndex;
                                        return (
                                            <button 
                                                key={index} 
                                                onClick={() => handleIntentionClick(index)}
                                                className={`flex flex-col items-center justify-center py-5 px-4 rounded-xl border-2 transition duration-200 shadow-md text-sm sm:text-base h-16 ${
                                                    isSelected
                                                        ? 'bg-gradient-to-br from-blue-400 to-blue-300 text-white border-blue-200 hover:from-blue-400 hover:to-blue-400' 
                                                        : 'bg-white text-gray-800 border-gray-300 hover:border-blue-200 hover:bg-blue-400' 
                                                } transform hover:scale-[1.02]`}
                                            >
                                                <span className="text-xl mb-1">{intent.icon}</span>
                                                <span className=" text-center">{intent.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </FilterSection>

                            
                            {/* <FilterSection title="Filtres avancés">
                                
                                <div className="p-6 bg-white rounded-2xl shadow-xl  border-gray-400"> 
                                    <ToggleSwitch label="Profils avec photos seulement" defaultChecked={true} />
                                    <ToggleSwitch label="Utilisateurs en ligne" defaultChecked={false} />
                                    <ToggleSwitch label="Profils vérifiés" defaultChecked={false} />
                                </div>
                            </FilterSection> */}
                             <div className="mb-12">
                                <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                                Suggestions pour vous
                                </h2>

                                <div className="p-4 md:p-6 rounded-2xl shadow-md flex items-center" style={{ backgroundColor: "var(--bg-primary)" }}>
                                <div className="flex items-center gap-4 flex-grow">
                                    <Sparkles className="w-10 h-10" style={{ color: "var(--color-primary)" }} />
                                    <div>
                                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                                        Personnalise tes préférences
                                    </p>
                                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                        Complète ton profil pour des recommandations plus précises
                                    </p>
                                    </div>
                                </div>

                                <Link
                                    to="/modifier-profil/infos"
                                    className="text-white font-semibold py-3 px-6 rounded-full transition duration-200 ml-4 whitespace-nowrap flex items-center gap-2"
                                    style={{ backgroundColor: "var(--color-primary)" }}
                                >
                                    <Pencil className="w-4 h-4" />
                                    Modifier le Profil
                                </Link>
                                </div>
                            </div>
                            
                        </div> 
{/* Fin de la Colonne 2 */}

                    </div> 
                </div>
            </main>
            
            
            <div className="flex-shrink-0 w-full bg-white p-4 shadow-2xl z-20 border-t border-gray-100">
                <div className="px-6"> 
                    <button 
                        onClick={AppliquerFiltre} 
                        className="w-full bg-blue-400 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition duration-300 shadow-2xl shadow-blue-300/50 text-lg tracking-wider uppercase transform hover:scale-[1.01]"
                    >
                        Appliquer les Filtres
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FiltresPage;