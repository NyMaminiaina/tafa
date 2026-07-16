import { FaHeart, FaInstagram, FaFacebook, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
        <footer
        className="hidden lg:flex h-[76px] items-center justify-between px-10 border-t shrink-0"
        style={{
            backgroundColor: "var(--bg-primary)",
            borderColor: "var(--border-color)",
        }}
        >
      {/* LEFT */}
      <div className="flex items-center gap-2">
      <FaHeart className="theme-primary-text" />
        <span
          className="text-sm font-bold"
          style={{ color: "var(--text-primary)" }}
        >
          Tafa © 2026
        </span>
      </div>

      {/* CENTER */}
      <div
        className="text-xs font-medium"
        style={{ color: "var(--text-secondary)" }}
      >
        Rencontrez • Discutez • Connectez-vous
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 text-lg">
        <FaInstagram className="cursor-pointer hover:scale-110 transition-all text-pink-500" />
        <FaFacebook className="cursor-pointer hover:scale-110 transition-all text-blue-500" />
        <FaLinkedin className="cursor-pointer hover:scale-110 transition-all text-cyan-500" />
      </div>
    </footer>
  );
}