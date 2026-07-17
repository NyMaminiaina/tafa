import React, { useEffect, useRef, useState } from "react";
import { API_URL } from "../../utils/api_url";
import { Trash2, Star, RefreshCw, Plus, Loader2 } from "lucide-react";
import AlertModal from "../AlertModal";

const BASE_URL = API_URL?.replace("/api", "");
// 1. Ajoutez 'url' à l'interface
interface Photo {
  id?: number;
  path?: string;   // Gardez au cas où
  url?: string;    // Ajoutez ceci
  preview?: string;
  is_primary?: number;
  isUploading?: boolean;
}
interface PhotosContentProps {
  userInfo: any;
  onPrimaryPhotoChanged?: (imagePath: string) => void;
}

const MAX_PHOTOS = 6;

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

const PhotosContent: React.FC<PhotosContentProps> = ({ onPrimaryPhotoChanged }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const [replacePhotoId, setReplacePhotoId] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<number | null>(null);
  const [photoError, setPhotoError] = useState("");

  /* ==============================
     1. Charger les photos existantes
  ============================== */
  const formatImageUrl = (path: string | undefined | null) => {
    if (!path) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    if (path.startsWith("http") || path.startsWith("data:")) return path;

    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const cleanBase = BASE_URL.endsWith('/') ? BASE_URL : `${BASE_URL}/`;

    return `${cleanBase}${cleanPath}`;
  };
  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (data?.profile?.images) {
        setPhotos(data.profile.images);
      }
    } catch (err) {
      console.error("Error fetching photos:", err);
    }
  };

  /* ==============================
     2. Upload une nouvelle photo
  ============================== */
  const handleAddClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
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

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const compressedFile = await compressImage(file, 800, 0.7);
      const formData = new FormData();
      formData.append("image", compressedFile);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/images/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Photo ajoutée avec succès !");
        fetchPhotos();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Erreur lors de l'upload");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  /* ==============================
     3. Supprimer une photo
  ============================== */
  const handleDelete = async (photoId: number) => {


    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/images/${photoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Photo supprimée !");
        fetchPhotos();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Erreur lors de la suppression");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     4. Définir comme photo principale
  ============================== */
  const handleSetPrimary = async (photoId: number) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/images/${photoId}/primary`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Photo principale mise à jour !");

        const selectedPhoto = photos.find((photo) => photo.id === photoId);

        if (selectedPhoto) {
          onPrimaryPhotoChanged?.(selectedPhoto.url || selectedPhoto.path || "");
        }

        fetchPhotos();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Erreur");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  /* ==============================
     5. Remplacer une photo
  ============================== */
  const handleReplaceClick = (photoId: number) => {
    setReplacePhotoId(photoId);
    replaceInputRef.current?.click();
  };

  const handleReplaceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacePhotoId) return;

    // Validation
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

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const compressedFile = await compressImage(file, 800, 0.7);
      const formData = new FormData();
      formData.append("image", compressedFile);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/images/${replacePhotoId}/replace`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("Photo remplacée avec succès !");
        fetchPhotos();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Erreur lors du remplacement");
      }
    } catch (err) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
      setReplacePhotoId(null);
      e.target.value = "";
    }
  };

  /* ==============================
     6. Calcul placeholders
  ============================== */
  const placeholdersCount = MAX_PHOTOS - photos.length;

  return (
    <div className="rounded-[2rem] p-8 shadow-sm" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>

      {/* Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-center font-semibold border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl text-center font-semibold border border-green-200">
          {success}
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex items-center gap-3">
            <Loader2 className="animate-spin" style={{ color: 'var(--color-primary)' }} />
            <span>Chargement...</span>
          </div>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/jfif" className="hidden" onChange={handleFileChange} />
      <input ref={replaceInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/jfif" className="hidden" onChange={handleReplaceChange} />

      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
        Vous pouvez ajouter jusqu'à 6 photos. Cliquez sur une photo pour voir les options.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
        {/* === PHOTOS EXISTANTES === */}
        {photos.map((photo, index) => (
          <div
            key={photo.id || index}
            className="relative aspect-square rounded-[1rem] overflow-hidden shadow-sm group"
            style={{ backgroundColor: 'var(--bg-secondary)' }}
          >
            <img
              src={
                photo.preview ||
                formatImageUrl(photo.url || photo.path) ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              className="w-full h-full object-cover object-top transition-transform group-hover:scale-110 duration-500"
              alt={`Photo ${index + 1}`}
            />

            {/* Badge photo principale */}
            {Number(photo.is_primary) === 1 && (
              <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star size={12} fill="currentColor" /> Principale
              </div>
            )}

            {/* Overlay avec actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              {/* Définir comme principale */}
              {Number(photo.is_primary) !== 1 && photo.id && (
                <button
                  onClick={() => handleSetPrimary(photo.id!)}
                  className="p-2 bg-yellow-400 text-yellow-900 rounded-full hover:bg-yellow-300 transition"
                  title="Définir comme principale"
                >
                  <Star size={18} />
                </button>
              )}

              {/* Remplacer */}
              {photo.id && (
                <button
                  onClick={() => handleReplaceClick(photo.id!)}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-400 transition"
                  title="Remplacer"
                >
                  <RefreshCw size={18} />
                </button>
              )}

              {/* Supprimer */}
              {photo.id && (
                <button
                  onClick={() => {
                    setPhotoToDelete(photo.id!);
                    setShowDeleteModal(true);
                  }}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-400 transition"
                  title="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* === PLACEHOLDERS === */}
        {Array.from({ length: placeholdersCount }).map((_, i) => (
          <div
            key={`ph-${i}`}
            onClick={loading ? undefined : handleAddClick}
            className="aspect-square rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center transition"
            style={{
              borderColor: 'var(--color-primary)',
              color: 'var(--color-primary)',
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={32} />
                <span className="font-bold text-sm mt-2">Ajouter</span>
              </>
            )}
          </div>
        ))}
      </div>


      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div
            className="w-full max-w-sm mx-4 rounded-2xl p-6 shadow-xl"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <h3 className="text-lg font-bold mb-3 text-center">
              Supprimer la photo
            </h3>

            <p
              className="text-center mb-6"
              style={{ color: "var(--text-secondary)" }}
            >
              Voulez-vous vraiment supprimer cette photo ?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPhotoToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl border"
              >
                Annuler
              </button>

              <button
                onClick={() => {
                  if (photoToDelete) {
                    handleDelete(photoToDelete);
                  }
                  setShowDeleteModal(false);
                  setPhotoToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <AlertModal
        open={!!photoError}
        type="error"
        message={photoError}
        onClose={() => setPhotoError("")}
      />

    </div>
  );
};

export default PhotosContent;