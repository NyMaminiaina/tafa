import React from "react";
import {

  FaLanguage,
  FaHeart,
  FaUser,
  FaStar,
  FaInfoCircle,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBriefcase,
} from "react-icons/fa";
import { X } from "lucide-react";

interface ModalProfileProps {
  open: boolean;
  onClose: () => void;
  currentProfile: any;
  INTEREST_ICONS: { [key: string]: React.ReactNode };
  SITUATION_LABELS: { [key: string]: string };
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-4 py-3 border transition-all"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--color-primary)",
        }}
      >
        {icon}
      </div>

      <div className="flex flex-col min-w-0">
        <span
          className="text-[10px] font-black uppercase tracking-widest"
          style={{ color: "var(--text-secondary)" }}
        >
          {label}
        </span>

        <span
          className="text-sm font-bold truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export default function ModalProfile({
  open,
  onClose,
  currentProfile,
  INTEREST_ICONS,
  SITUATION_LABELS,
}: ModalProfileProps) {
  if (!open || !currentProfile) return null;

  return (
    <div className="fixed inset-0 z-[3000] lg:hidden bg-black/50 flex items-end">
      <div
        className="w-full max-h-[85vh] overflow-y-auto rounded-t-[32px] p-6"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black">
            Profil de {currentProfile.name}
          </h2>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--bg-secondary)" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* BLOC PRINCIPAL */}
        <div
          className="p-5 rounded-3xl border mb-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <h3
            className="text-lg font-black"
            style={{ color: "var(--color-primary)" }}
          >
            {currentProfile.name}, {currentProfile.age}
          </h3>

          <div className="flex items-center gap-2 text-sm mt-2">
            <FaMapMarkerAlt
              className="text-red-400 shrink-0"
            />
            <span>{currentProfile.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm mt-2">
            <FaBriefcase
              style={{ color: "var(--color-primary)" }}
              className="shrink-0"
            />
            <span>{currentProfile.job}</span>
          </div>
        </div>

        {/* BIO */}
        <div
          className="p-5 rounded-3xl border mb-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <h3 className="text-xs font-black uppercase mb-2">Bio</h3>

          <p className="text-sm italic leading-relaxed">
            “{currentProfile.bio || "Aucune description disponible"}”
          </p>
        </div>

        {/* COMPATIBILITÉ */}
        <div
          className="p-5 rounded-3xl border mb-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FaHeart className="text-red-500" />

            <h3 className="text-xs font-black uppercase">
              Compatibilité
            </h3>
          </div>

          <div className="text-4xl font-black text-[#FF5A60]">
            {currentProfile.compatibility ?? 0}%
          </div>
        </div>

        {/* INTÉRÊTS */}
        <div
          className="p-5 rounded-3xl border mb-4"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FaInfoCircle className="text-blue-500" />

            <h3 className="text-xs font-black uppercase">
              Centres d'intérêts
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {currentProfile.interests?.length ? (
              currentProfile.interests.map((it: any, i: number) => {
                const name = typeof it === "string" ? it : it.name;

                return (
                  <span
                    key={i}
                    className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black"
                    style={{
                      backgroundColor: "var(--color-primary-light)",
                      color: "var(--color-primary)",
                    }}
                  >
                    {INTEREST_ICONS[name] || "❤️"}
                    {name}
                  </span>
                );
              })
            ) : (
              <span className="text-xs italic">
                Aucun intérêt
              </span>
            )}
          </div>
        </div>

        {/* DETAILS */}
        <div className="space-y-3 pb-6">
          {/* <InfoRow
            icon={<FaClock />}
            label="Activité"
            value={currentProfile.lastActive || "Actif récemment"}
          /> */}

          <InfoRow
            icon={<FaEnvelope />}
            label="Email"
            value={currentProfile.email || "Email non défini"}
          />

          <InfoRow
            icon={<FaLanguage />}
            label="Langues"
            value={
              currentProfile.langues
                ?.map((l: any) => l.name || l)
                .join(", ") || "Non spécifié"
            }
          />

          <InfoRow
            icon={<FaHeart />}
            label="Situation Amoureuse"
            value={
              currentProfile.situation_amoureuse
                ? (
                    SITUATION_LABELS[
                      currentProfile.situation_amoureuse
                    ] || currentProfile.situation_amoureuse
                  )
                : "Non spécifié"
            }
          />

          <InfoRow
            icon={<FaUser />}
            label="Relation Recherchée"
            value={
              currentProfile.relations_rechercher ||
              "Relation non définie"
            }
          />

          <InfoRow
            icon={<FaStar />}
            label="Signe astro"
            value={
              currentProfile.Zodiac_sign ||
              "Signe Astro non défini"
            }
          />
        </div>
      </div>
    </div>
  );
}