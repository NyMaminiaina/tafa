import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaCrown,
  FaCheck,
  FaHeart,
  FaStar,
  FaInfinity,
  FaCreditCard,
  FaMobileAlt,
  FaCommentDots,
  FaFilter,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import { initiatePayment } from "../api/api";

// Payment method logos
import mvolaLogo from "../assets/images/mvola-logo.png";
import orangeMoneyLogo from "../assets/images/orange-money-logo.jpg";
import airtelMoneyLogo from "../assets/images/airtel-money-logo.jpg";

/* =======================
   TYPES
======================= */
interface Plan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

/* =======================
   DATA
======================= */
const plans: Plan[] = [
  {
    id: "weekly",
    name: "1 Semaine",
    price: 5000,
    duration: "7 jours",
    features: [
      "Likes illimités",
      "Voir qui vous a liké",
      "5 Super Likes par jour",
    ],
  },
  {
    id: "monthly",
    name: "1 Mois",
    price: 15000,
    duration: "30 jours",
    features: [
      "Likes illimités",
      "Voir qui vous a liké",
      "10 Super Likes par jour",
      "1 Boost gratuit par mois",
      "Retour en arrière illimité",
    ],
    popular: true,
    savings: "Économisez 25%",
  },
  {
    id: "yearly",
    name: "1 An",
    price: 120000,
    duration: "365 jours",
    features: [
      "Likes illimités",
      "Voir qui vous a liké",
      "Super Likes illimités",
      "5 Boosts gratuits par mois",
      "Retour en arrière illimité",
      "Profil prioritaire",
      "Badge Gold exclusif",
    ],
    savings: "Économisez 40%",
  },
];

const paymentMethods: PaymentMethod[] = [
  {
    id: "mvola",
    name: "MVola",
    icon: mvolaLogo,
    color: "#E30613",
    description: "Paiement via Telma MVola",
  },
  {
    id: "orange_money",
    name: "Orange Money",
    icon: orangeMoneyLogo,
    color: "#FF6600",
    description: "Paiement via Orange Money",
  },
  {
    id: "airtel_money",
    name: "Airtel Money",
    icon: airtelMoneyLogo,
    color: "#ED1C24",
    description: "Paiement via Airtel Money",
  },
  {
    id: "card",
    name: "Carte Bancaire",
    icon: "",
    color: "#1A1F71",
    description: "Visa, Mastercard, etc.",
  },
];

/* =======================
   COMPONENT
======================= */
const Subscription: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string>("monthly");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<"plan" | "payment" | "confirm">("plan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentPlan = plans.find((p) => p.id === selectedPlan);
  const currentPaymentMethod = paymentMethods.find((p) => p.id === selectedPayment);

  const handleContinue = () => {
    if (step === "plan") {
      setStep("payment");
    } else if (step === "payment" && selectedPayment) {
      if (selectedPayment !== "card" && !phoneNumber) {
        setError("Veuillez entrer votre numéro de téléphone");
        return;
      }
      setStep("confirm");
    }
    setError("");
  };

  const handleBack = () => {
    if (step === "payment") {
      setStep("plan");
    } else if (step === "confirm") {
      setStep("payment");
    } else {
      navigate(-1);
    }
    setError("");
  };

  const handlePayment = async () => {
    if (!currentPlan || !selectedPayment) return;

    setLoading(true);
    setError("");

    try {
      const response = await initiatePayment({
        plan_id: currentPlan.id,
        payment_method: selectedPayment,
        phone_number: selectedPayment !== "card" ? phoneNumber : undefined,
        amount: currentPlan.price,
      });

      if (response.success) {
        if (selectedPayment === "card" && response.payment_url) {
          // Redirect to card payment page
          window.location.href = response.payment_url;
        } else {
          // Mobile money - show instructions
          localStorage.setItem("payment_transaction_id", response.transaction_id);

          // ❌ NE PAS afficher response.message
          // ❌ NE PAS utiliser alert

          navigate("/payment-status");
        }
      } else {
        setError(response.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Erreur de connexion. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-MG").format(price) + " Ar";
  };

  return (
    <div
      className="w-full min-h-screen"
      style={{
        backgroundColor: "var(--bg-secondary)",
        padding: isMobile ? "90px 4% 5rem" : "100px 5% 40px",
      }}
    >
      <Navbar />

      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity"
          style={{ color: "var(--text-secondary)" }}
        >
          <FaArrowLeft />
          <span>Retour</span>
        </button>

        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
            style={{ backgroundColor: "rgba(255, 215, 0, 0.2)" }}
          >
            <FaCrown className="text-yellow-500" />
            <span className="font-bold text-yellow-500">TAFA GOLD</span>
          </div>
          <h1
            className="text-3xl font-extrabold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {step === "plan" && "Choisissez votre abonnement"}
            {step === "payment" && "Mode de paiement"}
            {step === "confirm" && "Confirmation"}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {step === "plan" && "Débloquez toutes les fonctionnalités premium"}
            {step === "payment" && "Sélectionnez votre méthode de paiement préférée"}
            {step === "confirm" && "Vérifiez les détails de votre commande"}
          </p>
        </div>

        {/* Step 1: Plan Selection */}
        {step === "plan" && (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                  selectedPlan === plan.id
                    ? "border-yellow-500 shadow-lg"
                    : "border-transparent hover:border-yellow-500/30"
                }`}
                style={{ backgroundColor: "var(--bg-primary)" }}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    POPULAIRE
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === plan.id
                          ? "border-yellow-500 bg-yellow-500"
                          : "border-gray-400"
                      }`}
                    >
                      {selectedPlan === plan.id && (
                        <FaCheck className="text-white text-xs" />
                      )}
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {plan.duration}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p
                      className="text-2xl font-extrabold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {formatPrice(plan.price)}
                    </p>
                    {plan.savings && (
                      <p className="text-xs text-green-500 font-bold">
                        {plan.savings}
                      </p>
                    )}
                  </div>
                </div>

                {selectedPlan === plan.id && (
                  <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <div className="grid grid-cols-2 gap-2">
                      {plan.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          <FaCheck className="text-green-500 text-xs" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Features highlight */}
            <div
              className="mt-8 p-6 rounded-2xl"
              style={{ backgroundColor: "var(--bg-primary)" }}
            >
              <h3
                className="font-bold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Avantages Tafa Gold
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(239, 68, 68, 0.2)" }}
                  >
                    <FaHeart className="text-red-500" />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Likes illimites
                  </p>
                </div>
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(59, 130, 246, 0.2)" }}
                  >
                    <FaStar className="text-blue-500" />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Top Picks ouvert
                  </p>
                </div>
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(34, 197, 94, 0.2)" }}
                  >
                    <FaCommentDots className="text-green-500" />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Messages illimites
                  </p>
                </div>
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(168, 85, 247, 0.2)" }}
                  >
                    <FaFilter className="text-purple-500" />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Filtres avances
                  </p>
                </div>
                <div className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center"
                    style={{ backgroundColor: "rgba(249, 115, 22, 0.2)" }}
                  >
                    <FaInfinity className="text-orange-500" />
                  </div>
                  <p
                    className="text-xs font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Retour illimite
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Payment Method Selection */}
        {step === "payment" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all border-2 ${
                    selectedPayment === method.id
                      ? "border-yellow-500 shadow-lg"
                      : "border-transparent hover:border-yellow-500/30"
                  }`}
                  style={{ backgroundColor: "var(--bg-primary)" }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: method.id === "card" ? `${method.color}20` : "white" }}
                    >
                      {method.icon ? (
                        <img
                          src={method.icon}
                          alt={method.name}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <FaCreditCard size={24} style={{ color: method.color }} />
                      )}
                    </div>
                    <div>
                      <h3
                        className="font-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {method.name}
                      </h3>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {method.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Phone number input for mobile money */}
            {selectedPayment && selectedPayment !== "card" && (
              <div
                className="mt-6 p-6 rounded-2xl"
                style={{ backgroundColor: "var(--bg-primary)" }}
              >
                <label
                  className="block font-bold mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <FaMobileAlt className="inline mr-2" />
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="034 00 000 00"
                  className="w-full p-4 rounded-xl border-2 focus:outline-none focus:border-yellow-500 transition-colors"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />
                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Vous recevrez une demande de paiement sur ce numéro
                </p>
              </div>
            )}

            {/* Card payment info */}
            {selectedPayment === "card" && (
              <div
                className="mt-6 p-6 rounded-2xl"
                style={{ backgroundColor: "var(--bg-primary)" }}
              >
                <div className="flex items-center gap-3">
                  <FaCreditCard
                    className="text-2xl"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <div>
                    <p
                      className="font-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Paiement sécurisé
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Vous serez redirigé vers une page de paiement sécurisée
                    </p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-center font-medium">{error}</p>
            )}
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === "confirm" && currentPlan && currentPaymentMethod && (
          <div
            className="p-6 rounded-2xl"
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <h3
              className="font-bold text-lg mb-6"
              style={{ color: "var(--text-primary)" }}
            >
              Récapitulatif de la commande
            </h3>

            <div className="space-y-4">
              <div
                className="flex justify-between items-center pb-4 border-b"
                style={{ borderColor: "var(--border-color)" }}
              >
                <div>
                  <p
                    className="font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Tafa Gold - {currentPlan.name}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {currentPlan.duration}
                  </p>
                </div>
                <p
                  className="font-bold text-xl"
                  style={{ color: "var(--text-primary)" }}
                >
                  {formatPrice(currentPlan.price)}
                </p>
              </div>

              <div
                className="flex justify-between items-center pb-4 border-b"
                style={{ borderColor: "var(--border-color)" }}
              >
                <p style={{ color: "var(--text-secondary)" }}>
                  Mode de paiement
                </p>
                <div className="flex items-center gap-2">
                  {currentPaymentMethod.icon ? (
                    <img
                      src={currentPaymentMethod.icon}
                      alt={currentPaymentMethod.name}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <FaCreditCard style={{ color: currentPaymentMethod.color }} />
                  )}
                  <span style={{ color: "var(--text-primary)" }}>
                    {currentPaymentMethod.name}
                  </span>
                </div>
              </div>

              {phoneNumber && (
                <div
                  className="flex justify-between items-center pb-4 border-b"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <p style={{ color: "var(--text-secondary)" }}>
                    Numéro de téléphone
                  </p>
                  <p style={{ color: "var(--text-primary)" }}>{phoneNumber}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <p
                  className="font-bold text-lg"
                  style={{ color: "var(--text-primary)" }}
                >
                  Total
                </p>
                <p className="font-extrabold text-2xl text-yellow-500">
                  {formatPrice(currentPlan.price)}
                </p>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-center font-medium mt-4">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Continue / Pay Button */}
        <div className="mt-8">
          {step === "confirm" ? (
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all hover:shadow-lg disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                color: "#000",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                  Traitement en cours...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Payer {currentPlan && formatPrice(currentPlan.price)}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={handleContinue}
              disabled={step === "payment" && !selectedPayment}
              className="w-full py-4 rounded-2xl font-bold text-lg transition-all hover:shadow-lg disabled:opacity-50"
              style={{
                background:
                  step === "payment" && !selectedPayment
                    ? "var(--bg-primary)"
                    : "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                color: step === "payment" && !selectedPayment ? "var(--text-secondary)" : "#000",
              }}
            >
              Continuer
            </button>
          )}

          <p
            className="text-center text-sm mt-4"
            style={{ color: "var(--text-secondary)" }}
          >
            En continuant, vous acceptez nos conditions d'utilisation
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;
