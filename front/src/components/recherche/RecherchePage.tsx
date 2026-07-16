import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../Navbar';
import { getSubscriptionStatus } from '../../api/api';
import UpgradeModal from '../UpgradeModal';
import { FaLock } from 'react-icons/fa';
import {
  Heart,
  Users,
  Gem,
  Crown,
  Wine,
  Music,
  Plane,
  Utensils,
  Activity,
  BookOpen,
  Camera,
  Sparkles,
  Pencil
} from "lucide-react";

// Liste des intentions synchronisées avec Register
const intentions = [
  {
    id: "1",
    label: "Relation Sérieuse",
    value: "Relation sérieuse",
    icon: <Heart className="w-8 h-8" />,
    color: "bg-blue-600",
    large: true
  },
  {
    id: "2",
    label: "Amitié",
    value: "Amitié",
    icon: <Users className="w-8 h-8" />,
    color: "bg-green-600"
  },
  {
    id: "3",
    label: "Mariage",
    value: "Mariage",
    icon: <Heart className="w-8 h-8" />,
    color: "bg-purple-600"
  },
  {
    id: "4",
    label: "Rien de sérieux",
    value: "Rien de sérieux",
    icon: <Wine className="w-8 h-8" />,
    color: "bg-cyan-500",
    large: true
  },
  {
    id: "5",
    label: "Sugar Daddy",
    value: "Sugar Daddy",
    icon: <Gem className="w-8 h-8" />,
    color: "bg-amber-500"
  },
  {
    id: "6",
    label: "Sugar Mommy",
    value: "Sugar Mommy",
    icon: <Crown className="w-8 h-8" />,
    color: "bg-pink-400"
  },
  {
    id: "7",
    label: "Sugar Baby",
    value: "Sugar Baby",
    icon: <Sparkles className="w-8 h-8" />,
    color: "bg-rose-400",
    large: true
  }
];

const RecherchePage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isGold, setIsGold] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkGoldStatus = async () => {
      try {
        const response = await getSubscriptionStatus();
        setIsGold(response.has_subscription || false);
      } catch (error) {
        console.error('[RecherchePage] Error:', error);
        setIsGold(false);
      } finally {
        setLoading(false);
      }
    };
    checkGoldStatus();
  }, []);

  const handleFilterClick = () => {
    if (!isGold) {
      setShowUpgradeModal(true);
      return;
    }
    navigate('/filtres');
  };

  const handleIntentionClick = (intention: any) => {
    const params = new URLSearchParams();
    params.append("intention", intention.value);
    params.append("intentionLabel", intention.label);
    navigate(`/welcome?${params.toString()}`);
  };

  const handleInterestClick = (interest: string) => {
    navigate(`/welcome?interest=${encodeURIComponent(interest)}`);
  };

  return (
    <div
      className="min-h-screen w-full pt-[70px]"
      style={{
        backgroundColor: "var(--bg-secondary)",
        padding: isMobile ? "60px 4% 5rem" : "70px 3% 3%"
      }}
    >
      <Navbar />

      {/* Sticky Header */}
      <div
        className="sticky top-[70px] z-10 px-[3%] shadow-lg mb-8 md:mb-12"
        style={{ backgroundColor: "var(--bg-secondary)", padding: isMobile ? "20px 0" : "30px 0" }}
      >
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h1
              className={`font-extrabold leading-none ${isMobile ? 'text-2xl' : 'text-4xl'}`}
              style={{ color: "var(--color-primary)" }}
            >
              Explorer
            </h1>
            <p
              className={`mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}
              style={{ color: "var(--text-secondary)" }}
            >
              {isMobile
                ? 'Trouve des personnes selon tes envies'
                : 'Rencontre des personnes qui partagent tes intentions'}
            </p>
          </div>

          <button
            onClick={handleFilterClick}
            className="flex items-center gap-2 font-semibold transition p-2 rounded-full relative"
            style={{ color: isGold ? "var(--color-primary)" : "var(--text-secondary)" }}
          >
            <span className="text-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`}
              >
                <path
                  fillRule="evenodd"
                  d="M10.5 3.75a6 6 0 0 0-5.875 4.717 8.922 8.922 0 0 0-1.898 2.067.75.75 0 0 0 0 .914 8.922 8.922 0 0 0 1.898 2.067A6 6 0 1 0 16.5 20.25a6 6 0 0 0 5.875-4.717 8.922 8.922 0 0 0 1.898-2.067.75.75 0 0 0 0-.914 8.922 8.922 0 0 0-1.898-2.067A6 6 0 0 0 16.5 3.75zM12 17.25a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-1.5v-2.25a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h1.5v2.25z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <span className={isMobile ? 'text-sm' : 'text-lg'}>Filtres</span>
            {!isGold && !loading && (
              <FaLock size={isMobile ? 10 : 12} className="text-yellow-500" />
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Colonne gauche – Intentions */}
        <div className="lg:col-span-2">
          <h2
            className={`font-bold mb-4 md:mb-6 ${isMobile ? 'text-xl' : 'text-2xl'}`}
            style={{ color: "var(--text-primary)" }}
          >
            Intentions populaires
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {intentions.map((intention) => (
              <div
                key={intention.id}
                onClick={() => handleIntentionClick(intention)}
                className={`
                  ${intention.large ? "col-span-2" : ""}
                  ${intention.color} text-white rounded-2xl shadow-lg flex flex-col justify-end cursor-pointer
                  hover:scale-[1.02] hover:shadow-xl transition-all duration-300
                  ${isMobile ? 'p-4 h-44' : 'p-6 md:p-8 h-75'}
                `}
              >
                <div className="flex justify-between items-center mb-3">
                  {intention.icon}
                </div>
                <p className={`font-bold ${isMobile ? 'text-xl' : 'text-3xl'}`}>
                  {intention.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite – Centres d'intérêt & Suggestions */}
        <div className="lg:col-span-1 lg:pl-[3%]">
          <h2
            className={`font-bold mb-4 md:mb-6 lg:mt-0 mt-6 ${isMobile ? 'text-xl' : 'text-2xl'}`}
            style={{ color: "var(--text-primary)" }}
          >
            Par centres d'intérêt
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 md:gap-4 mb-8">
            <InterestBox
              icon={<Music className="w-8 h-8 md:w-10 md:h-10 text-pink-400" />}
              label="Musique"
              onClick={() => handleInterestClick("Musique")}
              isMobile={isMobile}
            />
            <InterestBox
              icon={<Plane className="w-8 h-8 md:w-10 md:h-10 text-cyan-500" />}
              label="Voyage"
              onClick={() => handleInterestClick("Voyage")}
              isMobile={isMobile}
            />
            <InterestBox
              icon={<Utensils className="w-8 h-8 md:w-10 md:h-10 text-green-500" />}
              label="Cuisine"
              onClick={() => handleInterestClick("Cuisine")}
              isMobile={isMobile}
            />
            <InterestBox
              icon={<Activity className="w-8 h-8 md:w-10 md:h-10 text-teal-500" />}
              label="Sport"
              onClick={() => handleInterestClick("Sport")}
              isMobile={isMobile}
            />
            <InterestBox
              icon={<BookOpen className="w-8 h-8 md:w-10 md:h-10 text-yellow-600" />}
              label="Lecture"
              onClick={() => handleInterestClick("Lecture")}
              isMobile={isMobile}
            />
            <InterestBox
              icon={<Camera className="w-8 h-8 md:w-10 md:h-10 text-pink-500" />}
              label="Photo"
              onClick={() => handleInterestClick("Photographie")}
              isMobile={isMobile}
            />
          </div>

          {/* Suggestion box */}
          <div className="mb-8 md:mb-12">
            <h2
              className={`font-bold mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}
              style={{ color: "var(--text-primary)" }}
            >
              Suggestions pour vous
            </h2>

            <div
              className={`rounded-2xl shadow-md flex flex-col md:flex-row items-center p-4 md:p-6`}
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <div className="flex items-center gap-4 w-full md:w-auto flex-grow mb-4 md:mb-0">
                <Sparkles
                  className={`${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}
                  style={{ color: "var(--color-primary)" }}
                />
                <div>
                  <p
                    className={`font-bold ${isMobile ? 'text-base' : 'text-lg'}`}
                    style={{ color: "var(--text-primary)" }}
                  >
                    {isMobile ? 'Personnalise ton profil' : 'Personnalise tes préférences'}
                  </p>
                  <p
                    className={`${isMobile ? 'text-xs' : 'text-sm'}`}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {isMobile
                      ? 'Complète ton profil pour des recommandations'
                      : 'Complète ton profil pour des recommandations plus précises'}
                  </p>
                </div>
              </div>
              <Link
                to="/modifier-profil/infos"
                className="w-full md:w-auto text-white font-semibold py-3 px-6 rounded-full transition duration-200 text-center flex items-center justify-center gap-2"
                style={{ backgroundColor: "var(--color-primary)" }}
              >
                <Pencil className="w-4 h-4" />
                Modifier le Profil
              </Link>
            </div>
          </div>
        </div>
      </div>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Filtres avancés"
        message="Les filtres avancés sont réservés aux membres Tafa Gold. Débloquez cette fonctionnalité pour trouver exactement ce que vous cherchez !"
        feature="filters"
      />
    </div>
  );
};

// Composant réutilisable pour les centres d'intérêt
const InterestBox = ({
  icon,
  label,
  onClick,
  isMobile,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  isMobile: boolean;
}) => (
  <div
    onClick={onClick}
    className={`rounded-2xl shadow-md flex flex-col justify-center items-center cursor-pointer hover:scale-[1.02] hover:shadow-lg transition-all duration-300 ${isMobile ? 'p-4 h-28' : 'p-6 h-32'
      }`}
    style={{ backgroundColor: "var(--bg-primary)" }}
  >
    <div className="mb-2">{icon}</div>
    <p
      className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}
      style={{ color: "var(--text-primary)" }}
    >
      {label}
    </p>
  </div>
);

export default RecherchePage;