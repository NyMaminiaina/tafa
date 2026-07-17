import { Link } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import NavbarProfil from "../NavbarProfil";
import { API_URL } from "../../utils/api_url";
import {
  Mail, MapPin, Briefcase, Camera, Edit3, Languages, Cake, Heart, User, Star, Pencil, X, ChevronLeft, ChevronRight, Settings, Sparkles
} from "lucide-react";
import {
  Music, Plane, Utensils, Trophy, Book, Film, Music2,
  Palette, Gamepad2, Leaf, PawPrint, Shirt, Laptop, Flower2,
  Dumbbell, Mountain, Sun
} from "lucide-react";
// Ajoutez ceci avec vos autres imports API
import { getLikes } from "../../api/api";
import ImageCropper from "../../components/ImageCropper";
import AlertModal from "../../components/AlertModal";

const BASE_URL = API_URL?.replace("/api", "");

// Mapping des icônes pour les centres d'intérêt (Design de l'ancien)
const INTEREST_ICONS: { [key: string]: React.ReactNode } = {
  "Musique": <Music className="w-4 h-4 text-purple-500" />,
  "Voyage": <Plane className="w-4 h-4 text-blue-400" />,
  "Cuisine": <Utensils className="w-4 h-4 text-orange-500" />,
  "Sport": <Trophy className="w-4 h-4 text-red-500" />,
  "Lecture": <Book className="w-4 h-4 text-indigo-500" />,
  "Photographie": <Camera className="w-4 h-4 text-pink-500" />,
  "Cinéma": <Film className="w-4 h-4 text-slate-700" />,
  "Danse": <Music2 className="w-4 h-4 text-rose-400" />,
  "Art": <Palette className="w-4 h-4 text-yellow-500" />,
  "Jeux vidéo": <Gamepad2 className="w-4 h-4 text-cyan-500" />,
  "Nature": <Leaf className="w-4 h-4 text-green-500" />,
  "Animaux": <PawPrint className="w-4 h-4 text-amber-600" />,
  "Mode": <Shirt className="w-4 h-4 text-pink-400" />,
  "Technologie": <Laptop className="w-4 h-4 text-blue-600" />,
  "Méditation": <Flower2 className="w-4 h-4 text-teal-400" />,
  "Fitness": <Dumbbell className="w-4 h-4 text-lime-600" />,
  "Randonnée": <Mountain className="w-4 h-4 text-stone-600" />,
  "Plage": <Sun className="w-4 h-4 text-yellow-500" />,
};

const SITUATION_LABELS: { [key: string]: string } = {
  'Celibataire': 'Célibataire',
  'marie': 'Marié(e)',
  'Divorce': 'Divorcé(e)',
  'veuf': 'Veuf(ve)',
  'separe': 'Séparé(e)'
};

const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newName = file.name.replace(/\.(png|webp|gif|jfif)$/i, '.jpg').replace(/\.jpeg$/i, '.jpg');
              const compressedFile = new File([blob], newName, { type: "image/jpeg" });

              resolve(compressedFile);
            } else {
              reject(new Error("Compression échouée"));
            }
          },
          "image/jpeg",
          quality
        );
      };
    };
    reader.onerror = reject;
  });
};

function Profil() {
  // --- États (Contenu du nouveau + Logique photo de l'ancien) ---
  const [userInfo, setUserInfo] = useState<any>(null);
  const [userImages, setUserImages] = useState<any[]>([]);
  const [stats, setStats] = useState({ likes: 3, matches: 0, views: 50 });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [isPhotoLimitModalOpen, setIsPhotoLimitModalOpen] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropperTarget, setCropperTarget] = useState<"avatar" | "gallery" | null>(null);

  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [photoError, setPhotoError] = useState("");
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  const [showCompletionBanner, setShowCompletionBanner] = useState(true);

  const urlParts = window.location.pathname.split('/');
  const profileId = urlParts[urlParts.length - 1];
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isMyProfile = !profileId || profileId === 'me' || Number(profileId) === Number(storedUser.id);

  const formatImageUrl = (path: string | null) => {
    if (!path) return "/default-avatar.png";
    if (path.startsWith("http")) return path;
    // Remplacer /storage/ par / pour les images
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;
    return `${cleanBase}${cleanPath}`;
  };

  const getDefaultAvatar = () => {
    return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsProfileLoading(false);
        return;
      }

      try {
        let response;

        if (isMyProfile) {
          response = await fetch(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          });
        } else {
          response = await fetch(`${API_URL}/profiles/${profileId}`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          });
        }

        const data = await response.json();
        // console.log("Données reçues:", data);

        if (data.profile) setUserInfo(data.profile);
        if (data.images) setUserImages(data.images);
        else if (data.profile?.images) setUserImages(data.profile.images);

        if (isMyProfile) {
          const likesRes = await getLikes();
          const likesData = likesRes?.likes?.data || likesRes?.likes || [];
          const matchesData = likesRes?.matches?.data || likesRes?.matches || [];
          setStats({
            likes: likesRes?.count || likesData.length,
            matches: matchesData.length,
            views: 50
          });
        }

      } catch (err) {
        console.error("Erreur chargement profil:", err);
      } finally {
        setIsProfileLoading(false);
      }
    };

    fetchProfileAndStats();
  }, [profileId]);

  // suivant et precedent par clavier 
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Si la modal n'est pas ouverte, on ne fait rien
      if (selectedImageIndex === null) return;

      // Flèche droite → image suivante
      if (e.key === "ArrowRight") {
        showNextImage();
      }

      // Flèche gauche ← image précédente
      if (e.key === "ArrowLeft") {
        showPreviousImage();
      }

      // Échap → fermer la modal
      if (e.key === "Escape") {
        setSelectedImageIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedImageIndex]);


  // --- LOGIQUE DE DONNÉES (Mise à jour avec la clé correcte du JSON) ---
  const firstName = userInfo?.first_name || userInfo?.user?.firstname || "";
  const lastName = userInfo?.name || userInfo?.user?.name || "";
  const userEmail = userInfo?.user?.email || userInfo?.email || "Non renseigné";

  // États pour la modal de biographie
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [bioText, setBioText] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Fonction pour sauvegarder la nouvelle bio
  const handleSaveBio = async () => {
    const token = localStorage.getItem("token");
    setIsSavingBio(true);
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ bio: bioText })
      });

      if (response.ok) {
        setUserInfo({ ...userInfo, bio: bioText }); // Mise à jour locale
        setIsBioModalOpen(false); // Fermer la modal
      }
    } catch (err) {
      console.error("Erreur lors de la sauvegarde de la bio:", err);
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleProfilePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Veuillez sélectionner une vraie photo (JPG, PNG ou WEBP).');
      e.target.value = '';
      return;
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'jfif'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setPhotoError('Formats acceptés : JPG, PNG, WEBP, JFIF');
      e.target.value = '';
      return;
    }

    setCropperFile(file);
    setCropperTarget("avatar");
    e.target.value = "";
  };

  const handlePhotoClick = () => {
    if (userImages.length >= 6) {
      setIsPhotoLimitModalOpen(true);
      return;
    }

    galleryInputRef.current?.click();
  };

  const handleGalleryPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setPhotoError('Veuillez sélectionner une vraie photo (JPG, PNG ou WEBP).');
      e.target.value = '';
      return;
    }

    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'jfif'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setPhotoError('Formats acceptés : JPG, PNG, WEBP, JFIF');
      e.target.value = '';
      return;
    }

    setCropperFile(file);
    setCropperTarget("gallery");
    e.target.value = "";
  };

  const handleCropDone = async (croppedFile: File) => {
    setCropperFile(null);
    const target = cropperTarget;
    setCropperTarget(null);

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const compressedFile = await compressImage(croppedFile, 800, 0.7);
      const formData = new FormData();
      formData.append("image", compressedFile);

      if (target === "avatar") {
        formData.append("make_primary", "1");
        setUploadingIndex(0);
      } else {
        setUploadingIndex(-1);
      }

      const res = await fetch(`${API_URL}/images/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: formData,
      });

      if (res.ok) {
        setTimeout(async () => {
          const refreshRes = await fetch(`${API_URL}/profile`, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          });
          const refreshData = await refreshRes.json();
          if (refreshData.images) setUserImages(refreshData.images);
          setUploadingIndex(null);
        }, 1500);
        window.dispatchEvent(new Event("profile-photo-updated"));
      } else {
        setUploadingIndex(null);
        alert(res.ok ? "" : "Erreur lors de l'upload");
      }
    } catch (err) {
      setUploadingIndex(null);
      console.error("Erreur upload:", err);
    }
  };

  const primaryImage = userImages.find(
    (img) => Number(img.is_primary) === 1
  );

  // affichage image par clic
  const showPreviousImage = () => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;

      return prev === 0
        ? userImages.length - 1
        : prev - 1;
    });
  };

  const showNextImage = () => {
    setSelectedImageIndex((prev) => {
      if (prev === null) return null;

      return prev === userImages.length - 1
        ? 0
        : prev + 1;
    });
  };

  const getProfileCompletion = () => {
    if (!userInfo) return 0;
    const fields = [
      userInfo.first_name,
      userInfo.name,
      userInfo.bio,
      userInfo.profession,
      userInfo.age,
      userInfo.city?.name,
      userInfo.situation_amoureuse,
      userInfo.relations_rechercher,
      userImages.length > 0,
      userInfo.interests?.length > 0,
      userInfo.langues?.length > 0,
      userInfo.Zodiac_sign,
    ];
    const filled = fields.filter(Boolean).length;
    return Math.round((filled / fields.length) * 100);
  };

  console.log("Completion:", getProfileCompletion(), "userInfo:", userInfo);

  return (
    <div className="min-h-screen w-full antialiased" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
      <NavbarProfil />

      {isMyProfile && userInfo && showCompletionBanner && getProfileCompletion() < 100 && (
        <div className="fixed top-[70px] left-0 right-0 z-40" style={{ marginTop: '12px' }}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="rounded-2xl p-4 shadow-lg border" style={{
              backgroundColor: 'var(--bg-primary)',
              borderColor: 'var(--border-color)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Sparkles size={20} style={{ color: 'var(--color-primary)' }} />
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                    Profil complété à {getProfileCompletion()}%
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs hidden sm:inline" style={{ color: 'var(--text-secondary)' }}>
                    Les profils complets ont 3x plus de matchs
                  </span>
                  <Link
                    to="/modifier-profil/infos"
                    className="text-xs font-bold px-3 py-1.5 rounded-full text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Compléter
                  </Link>
                  <button
                    onClick={() => setShowCompletionBanner(false)}
                    className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${getProfileCompletion()}%`,
                    background: `linear-gradient(90deg, var(--color-primary), var(--color-primary-hover))`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="w-full pt-[100px] pb-12" style={{ padding: isMobile ? "100px 3% 6rem" : "100px 3% 3%" }}>
        <div className="grid grid-cols-1 lg:grid-cols-[30%_1fr] gap-[3%] items-start">

          {/* --- BLOC GAUCHE (Design Ancien / Contenu Nouveau) --- */}
          <div className="space-y-[5%]">
            <div className="rounded-[2.5rem] shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
              <div className="h-24" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-hover))' }}></div>

              <div className="px-8 pb-8 -mt-12 flex flex-col items-center">
                {/* Photo de Profil */}
                <div className="relative mb-4">
                  <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-slate-50">
                    {(isProfileLoading || uploadingIndex === 0) ? (
                      <div className="w-full h-full animate-pulse bg-gray-200" />
                    ) : (
                      <img
                        src={
                          primaryImage?.url || primaryImage?.path ||
                            userImages[0]?.url || userImages[0]?.path
                            ? formatImageUrl(primaryImage?.url || primaryImage?.path || userImages[0]?.url || userImages[0]?.path)
                            : getDefaultAvatar()
                        }
                        alt="Avatar"
                        className="w-full h-full object-cover object-top transition-transform duration-500 hover:scale-105"
                      />
                    )}
                  </div>
                  {isMyProfile && (
                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 p-2 rounded-full text-white shadow-lg border-2 border-white hover:scale-110 transition-transform bg-gray-300">
                      <Camera className="w-4 h-4 text-gray-500" />
                    </button>
                  )}
                  {isMyProfile && (
                    <>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/jfif" onChange={handleProfilePhotoUpload} />
                      <input type="file" ref={galleryInputRef} className="hidden" accept="image/jpeg,image/png,image/webp,image/jfif" onChange={handleGalleryPhotoUpload} />
                    </>
                  )}
                </div>

                {/* Nom & Métier (Contenu Nouveau) */}
                <div className="text-center mb-6">

                  <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                    {firstName} {lastName}
                  </h2>
                  {/* <pre className="text-[10px] bg-black text-green-500 p-2">
                      {JSON.stringify(userInfo, null, 2)}
                    </pre> */}
                  <p className="font-bold text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--color-primary)' }}>
                    {userInfo?.profession || "UTILISATEUR"}
                  </p>
                </div>

                {/* STATS (Design Ancien) */}
                <div className="flex w-full py-5 rounded-[2rem] mb-6" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
                  <StatItem value={stats.likes} label="Likes" border />
                  <StatItem value={stats.matches} label="Matches" border />
                  {/* <StatItem value={stats.views} label="Vues" /> */}
                </div>

                {/* LES 8 CHAMPS (Contenu Nouveau / Design Ancien) */}
                <div className="w-full space-y-3 mb-6">
                  <InfoItem icon={<Mail size={18} />} label="Email" value={userEmail} />
                  <InfoItem icon={<Cake size={18} />} label="Âge" value={userInfo?.age ? `${userInfo.age} ans` : "Non spécifié"} />
                  <InfoItem icon={<Briefcase size={18} />} label="Profession" value={userInfo?.profession || "Non spécifié"} />
                  <InfoItem icon={<Languages size={18} />} label="Langues" value={userInfo?.langues?.map((l: any) => l.name).join(", ") || "Non spécifié"} />

                  <InfoItem icon={<Heart size={18} />} label="Situation Amoureuse" value={userInfo?.situation_amoureuse ? (SITUATION_LABELS[userInfo.situation_amoureuse] || userInfo.situation_amoureuse) : "Non spécifié"} />
                  <InfoItem icon={<User size={18} />} label="Relation Recherchée" value={userInfo?.relations_rechercher || "Non spécifié"} />
                  <InfoItem icon={<Star size={18} />} label="Signe Astro" value={userInfo?.Zodiac_sign || "Non spécifié"} />
                  <button
                    onClick={() => setShowMoreInfo(true)}
                    className="w-full py-3 rounded-2xl font-bold text-sm transition-all hover:opacity-90 mt-3"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      color: 'var(--color-primary)',
                      border: '1px solid var(--color-primary)'
                    }}
                  >
                    Plus d'infos
                  </button>
                </div>

                {isMyProfile && (
                  <>
                    <Link to="/modifier-profil" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-bold transition-all hover:opacity-90 mb-3" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                      <Edit3 size={18} /> Modifier le profil
                    </Link>

                    <Link to="/modifier-profil/parametres" className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold transition-all hover:opacity-90" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                      <Settings size={18} /> Sécurité
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* --- BLOC DROITE (Design Ancien / Contenu Nouveau) --- */}
          <div className="space-y-6">

            <div className="rounded-[2rem] p-8 shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>À propos</h3>

                {/* Icône de modification */}
                {isMyProfile && (
                  <button onClick={() => { setBioText(userInfo?.bio || ""); setIsBioModalOpen(true); }} className="p-2 rounded-xl transition-all hover:bg-slate-100" style={{ color: 'var(--color-primary)' }}>
                    <Pencil size={18} />
                  </button>
                )}
              </div>

              <p className="text-l leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {userInfo?.bio || "Aucune description disponible."}
              </p>
            </div>



            <div className="rounded-[2.5rem] p-8 shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                Mes Photos <span className="text-sm font-normal" style={{ color: 'var(--text-secondary)' }}>({userImages.length}/6)</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {isProfileLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-[1.5rem] bg-gray-200 animate-pulse" />
                  ))
                ) : (
                  <>
                    {userImages.map((img, i) => (
                      <div key={i} className="aspect-square rounded-[1.5rem] overflow-hidden relative group shadow-sm">
                        {(uploadingIndex === i || img.uploading) && (
                          <div className="absolute inset-0 bg-black/40 rounded-[1.5rem] flex items-center justify-center z-10">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                        <img
                          src={formatImageUrl(img.url)}
                          alt={`Photo ${i + 1}`}
                          onClick={() => setSelectedImageIndex(i)}
                          className="w-full h-full object-cover object-top transition-transform group-hover:scale-105 duration-500 cursor-pointer"
                        />
                        {Number(img.is_primary) === 1 && (
                          <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
                            Principale
                          </div>
                        )}
                      </div>
                    ))}

                    {isMyProfile && userImages.length < 6 && (
                      <div onClick={uploadingIndex === -1 ? undefined : handlePhotoClick}
                        className="aspect-square rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center transition hover:opacity-80"
                        style={{
                          borderColor: 'var(--color-primary)',
                          color: 'var(--color-primary)',
                          cursor: uploadingIndex === -1 ? 'default' : 'pointer',
                          opacity: uploadingIndex === -1 ? 0.7 : 1,
                        }}
                      >
                        {uploadingIndex === -1 ? (
                          <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Camera size={28} />
                            <span className="font-bold text-xs mt-1">Ajouter</span>
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

              {isMyProfile && (
                <Link to="/modifier-profil/photos" className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl font-semibold transition-all hover:opacity-90" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                  <Edit3 size={16} /> Gérer mes photos
                </Link>
              )}
            </div>

            <div className="rounded-[2rem] p-8 shadow-sm mb-20 md:mb-0" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Heart size={20} style={{ color: 'var(--color-primary)' }} /> Centres d'intérêt
              </h3>
              <div className="flex flex-wrap gap-2">
                {userInfo?.interests?.map((it: any, i: number) => (
                  <span key={i} className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                    <span>{INTEREST_ICONS[it.name] || "❤️"}</span> {it.name}
                  </span>
                )) || <span style={{ color: 'var(--text-secondary)' }}>Aucun intérêt.</span>}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL POUR LA BIO */}
      {isBioModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Modifier ma Bio</h2>
              <button onClick={() => setIsBioModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <textarea
              value={bioText}
              onChange={(e) => setBioText(e.target.value)}
              placeholder="Décrivez-vous ici..."
              rows={6}
              className="w-full p-5 rounded-[1.5rem] text-sm border outline-none focus:ring-2 focus:ring-pink-500/20"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsBioModalOpen(false)}
                className="px-6 py-3 font-bold text-sm"
                style={{ color: 'var(--text-secondary)' }}
              >
                Annuler
              </button>
              <button
                onClick={handleSaveBio}
                disabled={isSavingBio}
                className="px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {isSavingBio ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPhotoLimitModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-[2rem] p-6 shadow-2xl text-center"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-primary)" }}>
              Limite atteinte
            </h2>

            <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
              Vous avez atteint la limite de photos autorisées. Veuillez supprimer une image existante pour en ajouter une nouvelle.
            </p>

            <button
              onClick={() => setIsPhotoLimitModalOpen(false)}
              className="w-full py-3 rounded-xl font-bold text-white"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              D’accord
            </button>
          </div>
        </div>
      )}

      {/* modals pour afficher image */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center">

          {/* Fermer */}
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-6 right-6 text-white"
          >
            <X size={35} />
          </button>

          {/* Précédent */}
          {userImages.length > 1 && (
            <button
              onClick={showPreviousImage}
              className="absolute left-6 text-white bg-black/40 p-3 rounded-full hover:bg-black/60"
            >
              <ChevronLeft size={40} />
            </button>
          )}

          {/* Image */}
          <img
            src={formatImageUrl(userImages[selectedImageIndex].url)}
            alt="Photo"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
          />

          {/* Suivant */}
          {userImages.length > 1 && (
            <button
              onClick={showNextImage}
              className="absolute right-6 text-white bg-black/40 p-3 rounded-full hover:bg-black/60"
            >
              <ChevronRight size={40} />
            </button>
          )}

        </div>
      )}

      {cropperFile && (
        <ImageCropper
          file={cropperFile}
          onCropDone={handleCropDone}
          onCancel={() => { setCropperFile(null); setCropperTarget(null); }}
        />
      )}

      <AlertModal
        open={!!photoError}
        type="error"
        message={photoError}
        onClose={() => setPhotoError("")}
      />

      {/* MODAL PLUS D'INFOS */}
      {showMoreInfo && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                  <User size={20} />
                </div>
                <h2 className="font-black text-lg uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Infos complètes</h2>
              </div>
              <button onClick={() => setShowMoreInfo(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Email</span>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <div className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {userEmail}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Âge</span>
                <div className="relative">
                  <Cake className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <div className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {userInfo?.age ? `${userInfo.age} ans` : "Non spécifié"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Ville</span>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <div className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {userInfo?.city?.name || userInfo?.localisation || "Non spécifié"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Profession</span>
                <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <div className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {userInfo?.profession || "Non spécifié"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Situation amoureuse</span>
                <div className="relative">
                  <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <div className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {userInfo?.situation_amoureuse ? (SITUATION_LABELS[userInfo.situation_amoureuse] || userInfo.situation_amoureuse) : "Non spécifié"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Relation recherchée</span>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <div className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {userInfo?.relations_rechercher || "Non spécifié"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Langues</span>
                <div className="relative">
                  <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <div className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {userInfo?.langues?.map((l: any) => l.name).join(", ") || "Non spécifié"}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Signe Astro</span>
                <div className="relative">
                  <Star className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <div className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                    {userInfo?.Zodiac_sign || "Non spécifié"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <span className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Bio</span>
              <div className="w-full p-5 rounded-[1.5rem] text-sm mt-2" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                {userInfo?.bio || "Aucune description disponible."}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- Sous-composants pour garder le design propre ---
function StatItem({ value, label, border }: any) {
  return (
    <div className={`flex flex-col items-center flex-1 ${border ? 'border-r' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
      <span className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-2xl shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', borderWidth: '1px' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
        {icon}
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-[10px] font-bold uppercase tracking-tight" style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{value}</span>
      </div>
    </div>
  );
}

export default Profil;