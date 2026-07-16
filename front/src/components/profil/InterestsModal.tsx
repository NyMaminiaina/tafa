import React, { useState, useEffect } from "react";
import { X, Heart } from "lucide-react";

// Liste identique à InfosContent pour la cohérence des IDs
const AVAILABLE_INTERESTS = [
  { id: 2, name: "Musique", icon: "🎵" }, 
  { id: 3, name: "Voyage", icon: "✈️" },
  { id: 7, name: "Cuisine", icon: "🍳" }, 
  { id: 1, name: "Sport", icon: "⚽" },
  { id: 4, name: "Lecture", icon: "📚" }, 
  { id: 9, name: "Photographie", icon: "📸" },
  { id: 5, name: "Cinéma", icon: "🎬" }, 
  { id: 8, name: "Jeux vidéo", icon: "🎮" },
  { id: 17, name: "Nature", icon: "🌿" }, 
  { id: 14, name: "Animaux", icon: "🐾" },
  { id: 15, name: "Technologie", icon: "💻" }, 
  { id: 11, name: "Fitness", icon: "💪" },
  { id: 16, name: "Randonnée", icon: "🥾" }, 
  { id: 20, name: "Plage", icon: "🏖️" },
];

interface InterestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInterests: number[];
  onSave: (selectedIds: number[]) => Promise<void>;
}

const InterestsModal: React.FC<InterestsModalProps> = ({ isOpen, onClose, currentInterests, onSave }) => {
  const [selectedInterests, setSelectedInterests] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setSelectedInterests(currentInterests);
  }, [isOpen, currentInterests]);

  const toggleInterest = (interestId: number) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(selectedInterests);
    setIsSaving(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in duration-300" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
              <Heart size={20} />
            </div>
            <h2 className="text-xl font-bold">Modifier mes intérêts</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          {AVAILABLE_INTERESTS.map((interest) => {
            const isActive = selectedInterests.includes(interest.id);
            return (
              <button 
                key={interest.id}
                type="button" 
                onClick={() => toggleInterest(interest.id)} 
                className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${isActive ? 'shadow-lg scale-105' : 'opacity-70'}`} 
                style={{ 
                  backgroundColor: isActive ? 'var(--color-primary)' : 'var(--bg-secondary)', 
                  color: isActive ? 'white' : 'var(--text-primary)', 
                  borderColor: 'var(--border-color)' 
                }}
              >
                <span>{interest.icon}</span> {interest.name}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <button onClick={onClose} className="px-6 py-3 font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>Annuler</button>
          <button onClick={handleSave} disabled={isSaving} className="px-8 py-3 rounded-xl font-bold text-sm text-white shadow-lg disabled:opacity-50" style={{ backgroundColor: 'var(--color-primary)' }}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterestsModal;