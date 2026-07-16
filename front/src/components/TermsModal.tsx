import React from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[999] p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6">

        <h2 className="text-2xl font-bold mb-6 text-center">
          Conditions d'utilisation
        </h2>

        <div className="space-y-4 text-gray-700 text-sm">

          <div>
            <h3 className="font-bold">
              1. Conditions d'accès
            </h3>
            <p>
              L'inscription sur TAFA est réservée aux personnes âgées de 18 ans et plus.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              2. Exactitude des informations
            </h3>
            <p>
              L'utilisateur s'engage à fournir des informations exactes.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              3. Respect des autres utilisateurs
            </h3>
            <p>
              Les insultes, le harcèlement, les menaces et les arnaques sont interdits.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              4. Photos interdites
            </h3>
            <p>
              Il est interdit de publier des photos nues,
               sexuellement explicites.
            </p>
          </div>

          <div>
            <h3 className="font-bold">
              5. Suspension du compte
            </h3>
            <p>
              TAFA peut suspendre ou supprimer un compte ne respectant pas les règles.
            </p>
          </div>

        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 text-white"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

export default TermsModal;