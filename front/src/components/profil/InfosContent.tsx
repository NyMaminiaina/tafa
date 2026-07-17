import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // useNavigate reste utile pour le bouton Annuler si besoin
import { API_URL } from "../../utils/api_url";
import { User, Briefcase, Calendar, FileText, Search, Languages, MapPin } from "lucide-react";

import { Music, Plane, Utensils, Trophy, Book, Camera, Film, Gamepad2, Leaf, PawPrint, Laptop, Dumbbell, Mountain, Sun, Heart, Music2, Shirt, Star, Palette, Flower2 } from "lucide-react";


interface InfosContentProps {
  userInfo: any;
}


/* ================== Liste des centres d'intérêt dans la base de donnée================== */
const AVAILABLE_INTERESTS = [
  { id: 1, name: "Sport", icon: <Trophy className="w-5 h-5" />, color: "text-red-500" },
  { id: 2, name: "Musique", icon: <Music className="w-5 h-5" />, color: "text-purple-500" },
  { id: 3, name: "Voyage", icon: <Plane className="w-5 h-5" />, color: "text-blue-400" },
  { id: 4, name: "Lecture", icon: <Book className="w-5 h-5" />, color: "text-indigo-500" },
  { id: 5, name: "Cinéma", icon: <Film className="w-5 h-5" />, color: "text-slate-700" },
  { id: 6, name: "Danse", icon: <Music2 className="w-5 h-5" />, color: "text-pink-600" },
  { id: 7, name: "Cuisine", icon: <Utensils className="w-5 h-5" />, color: "text-orange-500" },
  { id: 8, name: "Jeux vidéo", icon: <Gamepad2 className="w-5 h-5" />, color: "text-cyan-500" },
  { id: 9, name: "Photographie", icon: <Camera className="w-5 h-5" />, color: "text-pink-500" },
  { id: 10, name: "Art", icon: <Palette className="w-5 h-5" />, color: "text-rose-500" },
  { id: 11, name: "Fitness", icon: <Dumbbell className="w-5 h-5" />, color: "text-lime-600" },
  { id: 12, name: "Yoga", icon: <Flower2 className="w-5 h-5" />, color: "text-emerald-500" },
  { id: 13, name: "Théâtre", icon: <Star className="w-5 h-5" />, color: "text-yellow-600" },
  { id: 14, name: "Animaux", icon: <PawPrint className="w-5 h-5" />, color: "text-amber-600" },
  { id: 15, name: "Technologie", icon: <Laptop className="w-5 h-5" />, color: "text-blue-700" },
  { id: 16, name: "Randonnée", icon: <Mountain className="w-5 h-5" />, color: "text-stone-600" },
  { id: 17, name: "Nature", icon: <Leaf className="w-5 h-5" />, color: "text-green-500" },
  { id: 18, name: "Écriture", icon: <FileText className="w-5 h-5" />, color: "text-gray-600" },
  { id: 19, name: "Mode", icon: <Shirt className="w-5 h-5" />, color: "text-violet-500" },
  { id: 20, name: "Plage", icon: <Sun className="w-5 h-5" />, color: "text-yellow-500" },
];

/* ================== Liste des langues dans la base de donnée================== */
const AVAILABLE_LANGUAGES = [
  { id: 1, name: "Français" },
  { id: 2, name: "Anglais" },
  { id: 3, name: "Espagnol" },
  { id: 4, name: "Allemand" },
  { id: 5, name: "Italien" },
  { id: 6, name: "Portugais" },
  { id: 7, name: "Russe" },
  { id: 8, name: "Japonais" },
  { id: 9, name: "Chinois" },
  { id: 10, name: "Arabe" },
];

const InfosContent: React.FC<InfosContentProps> = ({ }) => {
  type City = {
    id: number;
    name: string;
  };

  const [cities, setCities] = useState<City[]>([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    profession: "",
    city_name: "",
    situation_amoureuse: "",
    relationship_type_id: "",
    date_de_naissance: "",
    interests: [] as number[], // Correction : tableau de nombres pour stocker les IDs
    langue_ids: [] as number[], // Modifié ici
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");

      try {
        // 🔹 1. Récupérer le profil
        const profileResponse = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const profileData = await profileResponse.json();

        // 🔹 2. Récupérer les villes
        const citiesResponse = await fetch(`${API_URL}/cities`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const citiesData = await citiesResponse.json();

        // 👉 on remplit le state cities
        setCities(citiesData.cities || []);

        // 🔹 3. Remplir le formulaire
        if (profileData.profile) {
          let formattedDate = "";

          if (profileData.profile.date_de_naissance) {
            const parts = profileData.profile.date_de_naissance.split("/");
            if (parts.length === 3) {
              formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
            }
          }

          setFormData({
            bio: profileData.profile.bio || "",
            profession: profileData.profile.profession || "",
            city_name: profileData.profile.city?.name || "",
            situation_amoureuse: profileData.profile.situation_amoureuse || "",
            relationship_type_id: profileData.profile.relationship_type_id?.toString() || "",
            date_de_naissance: formattedDate,
            interests: profileData.profile.interests?.map((i: any) => i.id) || [],
            langue_ids: profileData.profile.langues?.map((l: any) => l.id) || [],
          });
        }

      } catch (err) {
        console.error("Erreur de chargement", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  //message d'erreur si centre d'interet sup à 6
  const [interestError, setInterestError] = useState(false);
  //CENTRE D'INTERET
  const toggleInterest = (interestId: number) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.interests.includes(interestId);

      if (isAlreadySelected) {
        setInterestError(false); // On enlève l'erreur si on décoche
        return {
          ...prev,
          interests: prev.interests.filter((id) => id !== interestId),
        };
      }

      if (prev.interests.length >= 6) {
        setInterestError(true); // On affiche le message sous le titre
        return prev;
      }

      setInterestError(false);
      return {
        ...prev,
        interests: [...prev.interests, interestId],
      };
    });
  };

  const toggleLanguage = (langId: number) => {
    setFormData((prev) => ({
      ...prev,
      langue_ids: prev.langue_ids.includes(langId)
        ? prev.langue_ids.filter((id) => id !== langId)
        : [...prev.langue_ids, langId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false); // Réinitialise le succès au début
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          bio: formData.bio,
          profession: formData.profession,
          city_name: formData.city_name,
          Situation_amoureuse: formData.situation_amoureuse,
          relationship_type_id: formData.relationship_type_id,
          date_de_naissance: formData.date_de_naissance,
          interests: formData.interests, // Envoi du tableau d'IDs à Laravel
          langue_ids: formData.langue_ids // On envoie le tableau
        }),
      });

      if (response.ok) {
        // 2. Au lieu de naviguer, on affiche le succès
        setSuccess(true);
        // Optionnel : masquer le message après 4 secondes
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch (err) {
      console.error("Erreur mise à jour", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mb-20">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section Infos de base */}
        <section className="p-8 rounded-[2.5rem] shadow-sm border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <User size={20} />
            </div>
            <h3 className="font-black text-lg uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Infos de base</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Ville */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>
                Ville
              </label>

              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  name="city_name"
                  type="text"
                  value={formData.city_name || ""}
                  onChange={handleChange}
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/\b\w/g, (char) => char.toUpperCase());
                  }}
                  placeholder="Entrez votre ville..."
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none"
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
            </div>


            {/*  Proffession*/}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Profession</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input name="profession" type="text" value={formData.profession} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
              </div>
            </div>



            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Situation amoureuse</label>
              <div className="relative">
                <Heart className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select name="situation_amoureuse" value={formData.situation_amoureuse} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none appearance-none" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                  <option value="">Sélectionner...</option>
                  <option value="Celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="Divorce">Divorcé(e)</option>
                  <option value="veuf">Veuf(ve)</option>
                  <option value="separe">Séparé(e)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Relation recherchée</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <select name="relationship_type_id" value={formData.relationship_type_id} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none appearance-none" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                  <option value="">Sélectionner...</option>
                  <option value="1">Relation sérieuse</option>
                  <option value="2">Amitié</option>
                  <option value="3">Mariage</option>
                  <option value="4">Rien de sérieux</option>
                  <option value="5">Sugar Daddy</option>
                  <option value="6">Sugar Mommy</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase ml-2" style={{ color: 'var(--text-secondary)' }}>Date de naissance</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input name="date_de_naissance" type="date" value={formData.date_de_naissance} onChange={handleChange} className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm font-bold outline-none" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }} />
              </div>
            </div>

            {/* Langues */}


          </div>
        </section>

        <section className="p-8 rounded-[2.5rem] shadow-sm border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Languages size={20} />
            </div>
            <h3 className="font-black text-xl uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Langues parlées
              <span className="ml-2 text-sm font-normal opacity-60">({formData.langue_ids.length})</span>
            </h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-2"> {/* gap réduit à 2 */}
            {AVAILABLE_LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => toggleLanguage(lang.id)}
                className={`transition-all border flex items-center justify-center ${formData.langue_ids.includes(lang.id) ? 'shadow-md scale-105' : 'opacity-70'
                  }`}
                style={{
                  // TAILLE RÉDUITE ICI
                  padding: "6px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "auto", // Empêche de prendre toute la place
                  minWidth: "80px", // Juste assez pour être cliquable

                  backgroundColor: formData.langue_ids.includes(lang.id) ? 'var(--color-primary)' : 'var(--bg-secondary)',
                  color: formData.langue_ids.includes(lang.id) ? 'white' : 'var(--text-primary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </section>


        {/* Section Bio */}
        <section className="p-6 rounded-[2.5rem] shadow-sm border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <FileText size={20} />
            </div>
            <h3 className="font-black text-lg uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Ma Bio</h3>
          </div>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-5 rounded-[1.5rem] text-l focus:ring-2 focus:ring-gray-200 outline-none min-h-[120px]"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
          />
        </section>

        {/* Section Centres d'intérêt */}
        <section className="p-8 rounded-[2.5rem] shadow-sm border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Heart size={20} />
            </div>
            <h3 className="font-black text-xl uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Mes centres d'intérêt
              <span className="ml-2 text-sm font-normal opacity-60">({formData.interests.length}/6)</span>
            </h3>
          </div>
          {/* Message d'alerte affiché uniquement si la limite est atteinte */}
          {interestError && (
            <p className="mt-2 text-xs font-bold text-red-500 animate-pulse ">
              ⚠️ Vous ne pouvez pas choisir plus de 6 centres d'intérêt.
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-4">
            {AVAILABLE_INTERESTS.map((interest) => {
              const isActive = formData.interests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border flex items-center gap-2 ${isActive ? 'shadow-lg scale-105' : 'opacity-70'
                    }`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--bg-secondary)',
                    color: isActive ? 'white' : 'var(--text-primary)',
                    borderColor: 'var(--border-color)',
                  }}
                >
                  {/* Le span hérite de la couleur du bouton (white ou var(--text-primary)) */}
                  <span className={`flex items-center justify-center ${isActive ? 'text-white' : interest.color}`}>
                    {interest.icon}
                  </span>
                  <span>{interest.name}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Boutons d'action */}
        <div className="flex justify-end gap-4 mt-10">
          <Link to="/profil/me">
            <button
              type="button"
              className="font-bold py-4 px-8 rounded-2xl transition duration-200"
              style={{
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
              }}
            >
              Annuler
            </button>
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="text-white font-bold py-4 px-10 rounded-2xl shadow-lg transition duration-200 disabled:opacity-50 flex items-center gap-2"
            style={{
              backgroundColor: 'var(--color-primary)',
            }}
          >
            {loading ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </form>

      {/* 3. Affichage du message de succès */}
      {success && (
        <div className="mt-6 p-4 bg-green-50 text-green-700 rounded-2xl text-center font-semibold border border-green-200 animate-in fade-in zoom-in duration-300">
          Profil mis à jour avec succès !
        </div>
      )}
    </div>
  );
};

export default InfosContent;