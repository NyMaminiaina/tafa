import React from "react";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaCommentDots, FaFilter, FaStar, FaEye, FaCrown, FaTimes } from "react-icons/fa";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  feature: "likes" | "messages" | "filters" | "topPicks" | "likesReceived";
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  feature,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const featureIcons = {
    likes: FaHeart,
    messages: FaCommentDots,
    filters: FaFilter,
    topPicks: FaStar,
    likesReceived: FaEye,
  };

  const featureColors = {
    likes: "rgba(239, 68, 68, 0.2)",
    messages: "rgba(34, 197, 94, 0.2)",
    filters: "rgba(168, 85, 247, 0.2)",
    topPicks: "rgba(59, 130, 246, 0.2)",
    likesReceived: "rgba(249, 115, 22, 0.2)",
  };

  const iconColors = {
    likes: "#ef4444",
    messages: "#22c55e",
    filters: "#a855f7",
    topPicks: "#3b82f6",
    likesReceived: "#f97316",
  };

  const Icon = featureIcons[feature];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
      onClick={onClose}
    >
      <div
        className="rounded-3xl p-8 max-w-md w-full text-center relative"
        style={{ backgroundColor: "var(--bg-primary)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          style={{ color: "var(--text-secondary)" }}
        >
          <FaTimes size={20} />
        </button>

        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{
            background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
          }}
        >
          <FaCrown className="text-white text-3xl" />
        </div>

        {/* Feature icon */}
        <div
          className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: featureColors[feature] }}
        >
          <Icon style={{ color: iconColors[feature] }} size={20} />
        </div>

        {/* Title */}
        <h2
          className="text-2xl font-bold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          {title}
        </h2>

        {/* Message */}
        <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 font-semibold transition-colors hover:bg-gray-50"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            Plus tard
          </button>
          <button
            onClick={() => navigate("/subscription")}
            className="flex-1 py-3 rounded-xl font-bold text-black transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
            }}
          >
            Passer a Gold
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
