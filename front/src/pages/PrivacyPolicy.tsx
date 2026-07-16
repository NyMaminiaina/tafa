import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, Shield, Lock, Eye, UserCheck, Bell, Trash2, Mail } from "lucide-react";
import Navbar from "../components/Navbar";

const PrivacyPolicy: React.FC = () => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/Politique_Confidentialite_Tafa.docx";
    link.download = "Politique_Confidentialite_Tafa.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <Navbar />

      <main className="w-full pt-24 pb-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/modifier-profil/parametres"
              className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-70"
              style={{ color: "var(--color-primary)" }}
            >
              <ArrowLeft size={20} />
              Retour
            </Link>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--color-primary)", color: "white" }}
            >
              <Download size={18} />
              Telecharger (Word)
            </button>
          </div>

          {/* Title */}
          <div
            className="rounded-3xl p-8 mb-8 text-center"
            style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--color-primary-light)" }}
            >
              <Shield size={40} style={{ color: "var(--color-primary)" }} />
            </div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
              Politique de Confidentialite et Securite
            </h1>
            <p style={{ color: "var(--text-secondary)" }}>
              Derniere mise a jour : Mai 2026
            </p>
          </div>

          {/* Content */}
          <div
            className="rounded-3xl p-8 space-y-8"
            style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-color)" }}
          >
            {/* Section 1 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary-light)" }}
                >
                  <Eye size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  1. Introduction
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Bienvenue sur Tafa, votre application de rencontres de confiance. La protection de vos donnees personnelles est notre priorite absolue. Cette politique de confidentialite explique comment nous collectons, utilisons, stockons et protegeons vos informations lorsque vous utilisez notre application.
              </p>
            </section>

            {/* Section 2 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary-light)" }}
                >
                  <UserCheck size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  2. Donnees collectees
                </h2>
              </div>
              <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  Nous collectons les informations suivantes :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Informations d'inscription :</strong> prénom, date de naissance,
                    sexe, adresse e-mail et mot de passe.
                  </li>

                  <li>
                    <strong>Informations de profil :</strong> photos, biographie, ville,
                    situation amoureuse, objectif de rencontre et centres d'intérêt.
                  </li>

                  <li>
                    <strong>Données d'utilisation :</strong> likes, dislikes, matchs,
                    messages échangés, abonnements TAFA Gold et activités réalisées sur la
                    plateforme.
                  </li>

                  <li>
                    <strong>Données techniques :</strong> adresse IP, navigateur utilisé et
                    informations nécessaires au bon fonctionnement du service.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary-light)" }}
                >
                  <Lock size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  3. Utilisation des donnees
                </h2>
              </div>
              <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  Vos donnees sont utilisees pour :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Créer et gérer votre compte utilisateur.</li>
                  <li>Afficher votre profil aux autres utilisateurs.</li>
                  <li>Calculer la compatibilité entre utilisateurs.</li>
                  <li>Gérer les likes, les matchs et les conversations.</li>
                  <li>Permettre l'utilisation des fonctionnalités premium TAFA Gold.</li>
                  <li>Assurer la sécurité de la plateforme et lutter contre les abus.</li>
                  <li>Produire des statistiques destinées à l'administration de la plateforme.</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary-light)" }}
                >
                  <Shield size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  4. Protection des donnees
                </h2>
              </div>
              <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
                <p>Nous mettons en oeuvre des mesures de securite robustes pour proteger vos donnees :</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Mots de passe chiffrés :</strong> les mots de passe sont stockés
                    de manière sécurisée.
                  </li>

                  <li>
                    <strong>Authentification sécurisée :</strong> accès protégé aux comptes
                    utilisateurs.
                  </li>

                  <li>
                    <strong>Contrôle des accès :</strong> seules les personnes autorisées
                    peuvent accéder aux données nécessaires.
                  </li>

                  <li>
                    <strong>Protection contre les accès non autorisés :</strong> mise en
                    place de mécanismes de sécurité adaptés.
                  </li>

                  <li>
                    <strong>Sauvegarde des données :</strong> afin d'assurer la continuité
                    du service.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary-light)" }}
                >
                  <Bell size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  5. Vos droits
                </h2>
              </div>
              <div className="space-y-4" style={{ color: "var(--text-secondary)" }}>
                <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
                  Conformement a la reglementation, vous disposez des droits suivants :
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Droit d'acces :</strong> Obtenir une copie de vos donnees personnelles</li>
                  <li><strong>Droit de rectification :</strong> Corriger vos informations inexactes</li>
                  <li><strong>Droit a l'effacement :</strong> Demander la suppression de vos donnees</li>
                  <li><strong>Droit a la portabilite :</strong> Recuperer vos donnees dans un format lisible</li>
                  <li><strong>Droit d'opposition :</strong> Vous opposer a certains traitements</li>
                  <li><strong>Droit de retrait du consentement :</strong> Retirer votre consentement a tout moment</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary-light)" }}
                >
                  <Trash2 size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  6. Conservation des donnees
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Les données personnelles sont conservées tant que votre compte reste actif.
                En cas de suppression du compte, les informations personnelles et les photos
                associées peuvent être supprimées définitivement après un délai raisonnable
                nécessaire à la gestion technique et à la sécurité de la plateforme.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary-light)" }}
                >
                  <Mail size={20} style={{ color: "var(--color-primary)" }} />
                </div>
                <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  7. Contact
                </h2>
              </div>
              <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                Pour toute question concernant cette politique de confidentialité ou
                l'utilisation de la plateforme TAFA, vous pouvez contacter l'équipe de
                développement via l'adresse e-mail :
                <strong style={{ color: "var(--color-primary)" }}>
                  {" "}
                  contact@tafa.mg
                </strong>
              </p>
            </section>

            {/* Footer note */}
            <div
              className="rounded-2xl p-6 mt-8"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
            >
              <p className="text-sm text-center" style={{ color: "var(--text-secondary)" }}>
                En utilisant Tafa, vous acceptez les termes de cette politique de confidentialite. Nous nous reservons le droit de modifier cette politique a tout moment. Les modifications seront notifiees via l'application.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
