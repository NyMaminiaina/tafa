import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';

import NavbarProfil from '../NavbarProfil';
import InfosContent from './InfosContent';
import SettingsContent from './SettingsContent';
import PhotosContent from './PhotosContent';
import { API_URL } from '../../utils/api_url';

import {
  ArrowLeft,

  User,
  Image
} from "lucide-react";


const BASE_URL = API_URL?.replace("/api", "");

const formatImageUrl = (path: string | null | undefined) => {
  if (!path) return "/default-avatar.png";

  if (path.startsWith("http") || path.startsWith("data:")) {
    return path;
  }

  const cleanBase = BASE_URL.replace(/\/+$/, "");
  const cleanPath = path.replace(/^\/+/, "");

  return `${cleanBase}/${cleanPath}`;
};

const ProfileEditPage: React.FC = () => {
  const location = useLocation();

  const [userInfo, setUserInfo] = useState<any>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isProfileLoading, setIsProfileLoading] = useState(true);

  /* ================= FETCH PROFIL ================= */
  /* ================= FETCH PROFIL ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsProfileLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await response.json();

        if (data.profile) {
          setUserInfo(data.profile);

          // --- CORRECTION ICI ---
          // On cherche les images soit dans data.images, soit dans data.profile.images
          const imagesSource = data.profile?.images || data.images || [];

          const primary = imagesSource.find(
            (img: any) => img.is_primary == 1
          );

          const imagePath =
            primary?.url ||
            primary?.path ||
            imagesSource[0]?.url ||
            imagesSource[0]?.path ||
            null;

          setPreviewImage(formatImageUrl(imagePath));
        }
      } catch (err) {
        console.error("Erreur fetch profile:", err);
      } finally {
        setIsProfileLoading(false); // ← ligne à ajouter
      }
    };

    fetchProfile();
  }, []);

  /* ================= ONGLET ACTIF ================= */
  let activeTab: 'infos' | 'photos' | 'parametres' = 'infos';
  if (location.pathname.includes('/photos')) activeTab = 'photos';
  else if (location.pathname.includes('/parametres')) activeTab = 'parametres';


  const handlePrimaryPhotoChanged = (imagePath: string) => {
    setPreviewImage(formatImageUrl(imagePath));
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'infos':
        return <InfosContent userInfo={userInfo} />;
      case 'photos':
        return (
          <PhotosContent
            userInfo={userInfo}
            onPrimaryPhotoChanged={handlePrimaryPhotoChanged}
          />
        );
      case 'parametres':
        return <SettingsContent userInfo={userInfo} />;
      default:
        return <InfosContent userInfo={userInfo} />;
    }
  };

  /* ================= PHOTO HANDLERS ================= */
  // const handlePhotoClick = () => {
  //   fileInputRef.current?.click();
  // };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    setPreviewImage(preview);
  };

  return (
    <div
      className="h-screen w-full flex justify-center overflow-y-auto pt-[90px]"
      style={{ backgroundColor: 'var(--bg-secondary)' }}
    >
      <NavbarProfil />

      <div
        className="w-full max-w-4xl p-8 md:p-12 shadow-xl h-full overflow-y-auto"
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderColor: 'var(--border-color)'
        }}
      >
        {/* Bouton retour */}
        <Link to="/profil/me">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)'
            }}
          >
            <ArrowLeft className="w-5 h-5" />
          </div>
        </Link>

        {/* ================= AVATAR ================= */}
        <div className="flex flex-col items-center mb-10 mt-6">
          <div className="relative mb-6">
            {/* Photo de profil avec bordure colorée */}
            <div
              className="w-40 h-40 rounded-full p-1 shadow-xl"
              style={{
                background: `linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))`
              }}
            >
              <div
                className="w-full h-full rounded-full overflow-hidden"
                style={{ backgroundColor: 'var(--bg-secondary)' }}
              >
                {isProfileLoading ? (
                  <div className="w-full h-full animate-pulse bg-gray-200" />
                ) : (
                  <img
                    src={previewImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                    alt="Avatar"
                    className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png";
                    }}
                  />
                )}
              </div>
            </div>

            {/* Bouton changer photo */}
            {/* <button
              onClick={handlePhotoClick}
              className="absolute bottom-2 right-2 p-3 rounded-full shadow-lg transition-all hover:scale-110"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                border: '3px solid var(--bg-primary)'
              }}
            >
              <Camera className="w-4 h-4" />
            </button> */}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Nom de l'utilisateur */}
          {userInfo && (
            <h2
              className="text-xl font-bold mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              {/* On teste toutes les possibilités pour le prénom, puis on affiche le nom */}
              {userInfo.first_name || ""} {userInfo.name || ""}
            </h2>
          )}


          {/* ================= ONGLETS ================= */}
          <div
            className="flex justify-center gap-2 p-1 rounded-2xl w-full max-w-md"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <Link
              to="/modifier-profil/infos"
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-center transition-all flex items-center justify-center gap-2`}
              style={{
                backgroundColor: activeTab === 'infos' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'infos' ? 'white' : 'var(--text-secondary)',
              }}
            >
              <User className="w-4 h-4" /> Infos
            </Link>

            <Link
              to="/modifier-profil/photos"
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-center transition-all flex items-center justify-center gap-2`}
              style={{
                backgroundColor: activeTab === 'photos' ? 'var(--color-primary)' : 'transparent',
                color: activeTab === 'photos' ? 'white' : 'var(--text-secondary)',
              }}
            >
              <Image className="w-4 h-4" /> Photos
            </Link>

          </div>
        </div>

        {/* ================= CONTENU ================= */}
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfileEditPage;
