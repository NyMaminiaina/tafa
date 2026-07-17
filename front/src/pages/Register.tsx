import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import fond from "../assets/images/fond.jpg";
import logo from "../assets/images/logo.png";
import {
  FaUser, FaRegUser, FaPlus, FaHeart, FaHandshake, FaRing,
  FaGlassCheers, FaGem, FaCrown, FaEnvelope, FaCheck, FaEye,
  FaEyeSlash, FaArrowLeft, FaChild
} from "react-icons/fa";
import {
  Music, Plane, Utensils, Trophy, Book, Camera, Film,
  Gamepad2, Leaf, PawPrint, Laptop, Dumbbell, Mountain, Sun,
  Music2, Shirt, Star, Palette, Flower2, FileText
} from "lucide-react";
import { API_URL } from "../utils/api_url";
import TermsModal from "../components/TermsModal";
import AlertModal from "../components/AlertModal";

import ImageCropper from "../components/ImageCropper";

function Register() {
  // const [countryCode, setCountryCode] = useState("+261");
  const [countryCode, setCountryCode] = useState("+261");
  const [countryInput, setCountryInput] = useState("Madagascar");
  const [selectedFlag, setSelectedFlag] = useState("https://flagcdn.com/w40/mg.png");
  const [countryError, setCountryError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const fromAdmin = location.state?.fromAdmin ?? false;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // --- STATES ---
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState("");
  const [photos, setPhotos] = useState<(File | null)[]>([
    null, null, null, null, null, null,
  ]);
  const [status, setStatus] = useState("");
  const [goal, setGoal] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  const [phoneError, setPhoneError] = useState("");
  const [checkingPhone, setCheckingPhone] = useState(false);

  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropperIndex, setCropperIndex] = useState<number | null>(null);
  const [photoError, setPhotoError] = useState("");

  const availableInterests = [
    { id: 1, name: "Sport", icon: <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-red-500" },
    { id: 2, name: "Musique", icon: <Music className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-purple-500" },
    { id: 3, name: "Voyage", icon: <Plane className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-blue-400" },
    { id: 4, name: "Lecture", icon: <Book className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-indigo-500" },
    { id: 5, name: "Cinéma", icon: <Film className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-slate-700" },
    { id: 6, name: "Danse", icon: <Music2 className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-pink-600" },
    { id: 7, name: "Cuisine", icon: <Utensils className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-orange-500" },
    { id: 8, name: "Jeux vidéo", icon: <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-cyan-500" },
    { id: 9, name: "Photographie", icon: <Camera className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-pink-500" },
    { id: 10, name: "Art", icon: <Palette className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-rose-500" },
    { id: 11, name: "Fitness", icon: <Dumbbell className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-lime-600" },
    { id: 12, name: "Yoga", icon: <Flower2 className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-emerald-500" },
    { id: 13, name: "Théâtre", icon: <Star className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-yellow-600" },
    { id: 14, name: "Animaux", icon: <PawPrint className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-amber-600" },
    { id: 15, name: "Technologie", icon: <Laptop className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-blue-700" },
    { id: 16, name: "Randonnée", icon: <Mountain className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-stone-600" },
    { id: 17, name: "Nature", icon: <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-green-500" },
    { id: 18, name: "Écriture", icon: <FileText className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-gray-600" },
    { id: 19, name: "Mode", icon: <Shirt className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-violet-500" },
    { id: 20, name: "Plage", icon: <Sun className="w-4 h-4 sm:w-5 sm:h-5" />, color: "text-yellow-500" },
  ];

  const relationshipOptions = [
    { id: 1, name: "Relation sérieuse", icon: <FaHeart /> },
    { id: 2, name: "Amitié", icon: <FaHandshake /> },
    { id: 3, name: "Mariage", icon: <FaRing /> },
    { id: 4, name: "Rien de sérieux", icon: <FaGlassCheers /> },
    { id: 5, name: "Sugar daddy", icon: <FaGem /> },
    { id: 6, name: "Sugar mommy", icon: <FaCrown /> },
    { id: 7, name: "Sugar baby", icon: <FaChild /> },
  ];

  const countries = [
    { code: "+93", name: "Afghanistan", flag: "https://flagcdn.com/w40/af.png" },
    { code: "+27", name: "Afrique du Sud", flag: "https://flagcdn.com/w40/za.png" },
    { code: "+355", name: "Albanie", flag: "https://flagcdn.com/w40/al.png" },
    { code: "+213", name: "Algérie", flag: "https://flagcdn.com/w40/dz.png" },
    { code: "+49", name: "Allemagne", flag: "https://flagcdn.com/w40/de.png" },
    { code: "+376", name: "Andorre", flag: "https://flagcdn.com/w40/ad.png" },
    { code: "+244", name: "Angola", flag: "https://flagcdn.com/w40/ao.png" },
    { code: "+54", name: "Argentine", flag: "https://flagcdn.com/w40/ar.png" },
    { code: "+374", name: "Arménie", flag: "https://flagcdn.com/w40/am.png" },
    { code: "+61", name: "Australie", flag: "https://flagcdn.com/w40/au.png" },
    { code: "+43", name: "Autriche", flag: "https://flagcdn.com/w40/at.png" },
    { code: "+994", name: "Azerbaïdjan", flag: "https://flagcdn.com/w40/az.png" },
    { code: "+973", name: "Bahreïn", flag: "https://flagcdn.com/w40/bh.png" },
    { code: "+880", name: "Bangladesh", flag: "https://flagcdn.com/w40/bd.png" },
    { code: "+32", name: "Belgique", flag: "https://flagcdn.com/w40/be.png" },
    { code: "+229", name: "Bénin", flag: "https://flagcdn.com/w40/bj.png" },
    { code: "+975", name: "Bhoutan", flag: "https://flagcdn.com/w40/bt.png" },
    { code: "+226", name: "Burkina Faso", flag: "https://flagcdn.com/w40/bf.png" },
    { code: "+257", name: "Burundi", flag: "https://flagcdn.com/w40/bi.png" },
    { code: "+55", name: "Brésil", flag: "https://flagcdn.com/w40/br.png" },
    { code: "+855", name: "Cambodge", flag: "https://flagcdn.com/w40/kh.png" },
    { code: "+237", name: "Cameroun", flag: "https://flagcdn.com/w40/cm.png" },
    { code: "+1", name: "Canada", flag: "https://flagcdn.com/w40/ca.png" },
    { code: "+238", name: "Cap-Vert", flag: "https://flagcdn.com/w40/cv.png" },
    { code: "+236", name: "Centrafrique", flag: "https://flagcdn.com/w40/cf.png" },
    { code: "+56", name: "Chili", flag: "https://flagcdn.com/w40/cl.png" },
    { code: "+86", name: "Chine", flag: "https://flagcdn.com/w40/cn.png" },
    { code: "+357", name: "Chypre", flag: "https://flagcdn.com/w40/cy.png" },
    { code: "+57", name: "Colombie", flag: "https://flagcdn.com/w40/co.png" },
    { code: "+269", name: "Comores", flag: "https://flagcdn.com/w40/km.png" },
    { code: "+242", name: "Congo", flag: "https://flagcdn.com/w40/cg.png" },
    { code: "+243", name: "RDC", flag: "https://flagcdn.com/w40/cd.png" },
    { code: "+82", name: "Corée du Sud", flag: "https://flagcdn.com/w40/kr.png" },
    { code: "+225", name: "Côte d'Ivoire", flag: "https://flagcdn.com/w40/ci.png" },
    { code: "+45", name: "Danemark", flag: "https://flagcdn.com/w40/dk.png" },
    { code: "+253", name: "Djibouti", flag: "https://flagcdn.com/w40/dj.png" },
    { code: "+20", name: "Égypte", flag: "https://flagcdn.com/w40/eg.png" },
    { code: "+971", name: "Émirats Arabes Unis", flag: "https://flagcdn.com/w40/ae.png" },
    { code: "+593", name: "Équateur", flag: "https://flagcdn.com/w40/ec.png" },
    { code: "+291", name: "Érythrée", flag: "https://flagcdn.com/w40/er.png" },
    { code: "+34", name: "Espagne", flag: "https://flagcdn.com/w40/es.png" },
    { code: "+372", name: "Estonie", flag: "https://flagcdn.com/w40/ee.png" },
    { code: "+268", name: "Eswatini", flag: "https://flagcdn.com/w40/sz.png" },
    { code: "+1", name: "USA", flag: "https://flagcdn.com/w40/us.png" },
    { code: "+251", name: "Éthiopie", flag: "https://flagcdn.com/w40/et.png" },
    { code: "+679", name: "Fidji", flag: "https://flagcdn.com/w40/fj.png" },
    { code: "+358", name: "Finlande", flag: "https://flagcdn.com/w40/fi.png" },
    { code: "+33", name: "France", flag: "https://flagcdn.com/w40/fr.png" },
    { code: "+241", name: "Gabon", flag: "https://flagcdn.com/w40/ga.png" },
    { code: "+220", name: "Gambie", flag: "https://flagcdn.com/w40/gm.png" },
    { code: "+995", name: "Géorgie", flag: "https://flagcdn.com/w40/ge.png" },
    { code: "+233", name: "Ghana", flag: "https://flagcdn.com/w40/gh.png" },
    { code: "+30", name: "Grèce", flag: "https://flagcdn.com/w40/gr.png" },
    { code: "+224", name: "Guinée", flag: "https://flagcdn.com/w40/gn.png" },
    { code: "+245", name: "Guinée-Bissau", flag: "https://flagcdn.com/w40/gw.png" },
    { code: "+592", name: "Guyana", flag: "https://flagcdn.com/w40/gy.png" },
    { code: "+509", name: "Haïti", flag: "https://flagcdn.com/w40/ht.png" },
    { code: "+504", name: "Honduras", flag: "https://flagcdn.com/w40/hn.png" },
    { code: "+36", name: "Hongrie", flag: "https://flagcdn.com/w40/hu.png" },
    { code: "+91", name: "Inde", flag: "https://flagcdn.com/w40/in.png" },
    { code: "+62", name: "Indonésie", flag: "https://flagcdn.com/w40/id.png" },
    { code: "+98", name: "Iran", flag: "https://flagcdn.com/w40/ir.png" },
    { code: "+353", name: "Irlande", flag: "https://flagcdn.com/w40/ie.png" },
    { code: "+354", name: "Islande", flag: "https://flagcdn.com/w40/is.png" },
    { code: "+39", name: "Italie", flag: "https://flagcdn.com/w40/it.png" },
    { code: "+81", name: "Japon", flag: "https://flagcdn.com/w40/jp.png" },
    { code: "+962", name: "Jordanie", flag: "https://flagcdn.com/w40/jo.png" },
    { code: "+7", name: "Kazakhstan", flag: "https://flagcdn.com/w40/kz.png" },
    { code: "+254", name: "Kenya", flag: "https://flagcdn.com/w40/ke.png" },
    { code: "+965", name: "Koweït", flag: "https://flagcdn.com/w40/kw.png" },
    { code: "+856", name: "Laos", flag: "https://flagcdn.com/w40/la.png" },
    { code: "+266", name: "Lesotho", flag: "https://flagcdn.com/w40/ls.png" },
    { code: "+371", name: "Lettonie", flag: "https://flagcdn.com/w40/lv.png" },
    { code: "+961", name: "Liban", flag: "https://flagcdn.com/w40/lb.png" },
    { code: "+231", name: "Libéria", flag: "https://flagcdn.com/w40/lr.png" },
    { code: "+218", name: "Libye", flag: "https://flagcdn.com/w40/ly.png" },
    { code: "+423", name: "Liechtenstein", flag: "https://flagcdn.com/w40/li.png" },
    { code: "+370", name: "Lituanie", flag: "https://flagcdn.com/w40/lt.png" },
    { code: "+352", name: "Luxembourg", flag: "https://flagcdn.com/w40/lu.png" },
    { code: "+261", name: "Madagascar", flag: "https://flagcdn.com/w40/mg.png" },
    { code: "+60", name: "Malaisie", flag: "https://flagcdn.com/w40/my.png" },
    { code: "+265", name: "Malawi", flag: "https://flagcdn.com/w40/mw.png" },
    { code: "+223", name: "Mali", flag: "https://flagcdn.com/w40/ml.png" },
    { code: "+356", name: "Malte", flag: "https://flagcdn.com/w40/mt.png" },
    { code: "+212", name: "Maroc", flag: "https://flagcdn.com/w40/ma.png" },
    { code: "+230", name: "Maurice", flag: "https://flagcdn.com/w40/mu.png" },
    { code: "+222", name: "Mauritanie", flag: "https://flagcdn.com/w40/mr.png" },
    { code: "+52", name: "Mexique", flag: "https://flagcdn.com/w40/mx.png" },
    { code: "+373", name: "Moldavie", flag: "https://flagcdn.com/w40/md.png" },
    { code: "+377", name: "Monaco", flag: "https://flagcdn.com/w40/mc.png" },
    { code: "+976", name: "Mongolie", flag: "https://flagcdn.com/w40/mn.png" },
    { code: "+382", name: "Monténégro", flag: "https://flagcdn.com/w40/me.png" },
    { code: "+258", name: "Mozambique", flag: "https://flagcdn.com/w40/mz.png" },
    { code: "+95", name: "Myanmar", flag: "https://flagcdn.com/w40/mm.png" },
    { code: "+264", name: "Namibie", flag: "https://flagcdn.com/w40/na.png" },
    { code: "+977", name: "Népal", flag: "https://flagcdn.com/w40/np.png" },
    { code: "+227", name: "Niger", flag: "https://flagcdn.com/w40/ne.png" },
    { code: "+234", name: "Nigéria", flag: "https://flagcdn.com/w40/ng.png" },
    { code: "+47", name: "Norvège", flag: "https://flagcdn.com/w40/no.png" },
    { code: "+64", name: "Nouvelle-Zélande", flag: "https://flagcdn.com/w40/nz.png" },
    { code: "+968", name: "Oman", flag: "https://flagcdn.com/w40/om.png" },
    { code: "+256", name: "Ouganda", flag: "https://flagcdn.com/w40/ug.png" },
    { code: "+92", name: "Pakistan", flag: "https://flagcdn.com/w40/pk.png" },
    { code: "+507", name: "Panama", flag: "https://flagcdn.com/w40/pa.png" },
    { code: "+675", name: "Papouasie-Nouvelle-Guinée", flag: "https://flagcdn.com/w40/pg.png" },
    { code: "+595", name: "Paraguay", flag: "https://flagcdn.com/w40/py.png" },
    { code: "+31", name: "Pays-Bas", flag: "https://flagcdn.com/w40/nl.png" },
    { code: "+51", name: "Pérou", flag: "https://flagcdn.com/w40/pe.png" },
    { code: "+63", name: "Philippines", flag: "https://flagcdn.com/w40/ph.png" },
    { code: "+48", name: "Pologne", flag: "https://flagcdn.com/w40/pl.png" },
    { code: "+351", name: "Portugal", flag: "https://flagcdn.com/w40/pt.png" },
    { code: "+974", name: "Qatar", flag: "https://flagcdn.com/w40/qa.png" },
    { code: "+40", name: "Roumanie", flag: "https://flagcdn.com/w40/ro.png" },
    { code: "+44", name: "UK", flag: "https://flagcdn.com/w40/gb.png" },
    { code: "+7", name: "Russie", flag: "https://flagcdn.com/w40/ru.png" },
    { code: "+250", name: "Rwanda", flag: "https://flagcdn.com/w40/rw.png" },
    { code: "+221", name: "Sénégal", flag: "https://flagcdn.com/w40/sn.png" },
    { code: "+248", name: "Seychelles", flag: "https://flagcdn.com/w40/sc.png" },
    { code: "+232", name: "Sierra Leone", flag: "https://flagcdn.com/w40/sl.png" },
    { code: "+65", name: "Singapour", flag: "https://flagcdn.com/w40/sg.png" },
    { code: "+421", name: "Slovaquie", flag: "https://flagcdn.com/w40/sk.png" },
    { code: "+386", name: "Slovénie", flag: "https://flagcdn.com/w40/si.png" },
    { code: "+252", name: "Somalie", flag: "https://flagcdn.com/w40/so.png" },
    { code: "+249", name: "Soudan", flag: "https://flagcdn.com/w40/sd.png" },
    { code: "+94", name: "Sri Lanka", flag: "https://flagcdn.com/w40/lk.png" },
    { code: "+46", name: "Suède", flag: "https://flagcdn.com/w40/se.png" },
    { code: "+41", name: "Suisse", flag: "https://flagcdn.com/w40/ch.png" },
    { code: "+963", name: "Syrie", flag: "https://flagcdn.com/w40/sy.png" },
    { code: "+886", name: "Taïwan", flag: "https://flagcdn.com/w40/tw.png" },
    { code: "+255", name: "Tanzanie", flag: "https://flagcdn.com/w40/tz.png" },
    { code: "+235", name: "Tchad", flag: "https://flagcdn.com/w40/td.png" },
    { code: "+420", name: "Tchéquie", flag: "https://flagcdn.com/w40/cz.png" },
    { code: "+66", name: "Thaïlande", flag: "https://flagcdn.com/w40/th.png" },
    { code: "+228", name: "Togo", flag: "https://flagcdn.com/w40/tg.png" },
    { code: "+216", name: "Tunisie", flag: "https://flagcdn.com/w40/tn.png" },
    { code: "+90", name: "Turquie", flag: "https://flagcdn.com/w40/tr.png" },
    { code: "+380", name: "Ukraine", flag: "https://flagcdn.com/w40/ua.png" },
    { code: "+598", name: "Uruguay", flag: "https://flagcdn.com/w40/uy.png" },
    { code: "+58", name: "Venezuela", flag: "https://flagcdn.com/w40/ve.png" },
    { code: "+84", name: "Vietnam", flag: "https://flagcdn.com/w40/vn.png" },
    { code: "+967", name: "Yémen", flag: "https://flagcdn.com/w40/ye.png" },
    { code: "+260", name: "Zambie", flag: "https://flagcdn.com/w40/zm.png" },
    { code: "+263", name: "Zimbabwe", flag: "https://flagcdn.com/w40/zw.png" },
  ];

  // --- PASSWORD LOGIC ---
  const passwordChecks = {
    length6: password.length >= 6,
    length8: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  // --- AGE CALCULATION ---
  const calculateAge = (): number | null => {
    if (!birthDay || !birthMonth || !birthYear || birthYear.length !== 4) return null;
    const birthDate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };
  const isAdult = (calculateAge() || 0) >= 18;

  // --- VALIDATIONS ---
  const isStep1Complete =
    firstName && lastName && phone && !phoneError && gender &&
    birthDay && birthMonth && birthYear && isAdult &&
    !countryError && countryInput.trim() !== "";
  const isStep2Complete = status && goal && interests.length >= 3;
  const isStep3Complete =
    email &&
    !emailError &&
    password &&
    password === confirm &&
    passwordChecks.length8 &&
    passwordChecks.uppercase &&
    passwordChecks.number;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (step === 1 && isStep1Complete) setStep(2);
      else if (step === 2 && isStep2Complete) setStep(3);
      else if (step === 3 && isStep3Complete) setStep(4);
      else if (step === 4 && acceptedTerms && !loading) handleSubmit();
    }
  };

  const emailTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkEmail = (emailToCheck: string) => {
    if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);

    if (!emailToCheck || !emailToCheck.includes("@")) {
      setEmailError("");
      return;
    }

    emailTimeoutRef.current = setTimeout(async () => {
      setCheckingEmail(true);
      try {
        const response = await fetch(`${API_URL}/check-email?email=${encodeURIComponent(emailToCheck)}`);
        const data = await response.json();
        if (data.exists) {
          setEmailError("Cet email est déjà utilisé");
        } else {
          setEmailError("");
        }
      } catch (error) {
        // Silencieux
      } finally {
        setCheckingEmail(false);
      }
    }, 800);
  };

  const phoneTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkPhone = (phoneToCheck: string) => {
    if (phoneTimeoutRef.current) clearTimeout(phoneTimeoutRef.current);

    if (!phoneToCheck || phoneToCheck.length < 8) {
      setPhoneError("");
      return;
    }

    phoneTimeoutRef.current = setTimeout(async () => {
      setCheckingPhone(true);
      try {
        const fullPhone = countryCode + phoneToCheck;
        const response = await fetch(`${API_URL}/check-phone?phone=${encodeURIComponent(fullPhone)}`);
        const data = await response.json();
        if (data.exists) {
          setPhoneError("Ce numéro est déjà utilisé");
        } else {
          setPhoneError("");
        }
      } catch (error) {
        // Silencieux
      } finally {
        setCheckingPhone(false);
      }
    }, 800);
  };

  // --- COMPRESSION D'IMAGE ---
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

  const handleCropDone = (croppedFile: File) => {
    if (cropperIndex !== null) {
      const n = [...photos];
      n[cropperIndex] = croppedFile;
      setPhotos(n);
    }
    setCropperFile(null);
    setCropperIndex(null);
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    setLoading(true);
    const formData = new FormData();

    formData.append("name", lastName);
    formData.append("prenom", firstName);
    formData.append("firstname", firstName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("password_confirmation", confirm);
    formData.append("phone", countryCode + phone);
    formData.append("sexe", gender === "man" ? "Homme" : "Femme");

    const statusMap: { [key: string]: string } = {
      celibataire: "Celibataire",
      marie: "marie",
      divorce: "Divorce",
      veuf: "veuf",
      separe: "separe",
    };
    formData.append("Situation_amoureuse", statusMap[status] || "Celibataire");
    formData.append("date_de_naissance", `${birthYear}-${birthMonth}-${birthDay}`);

    formData.append("relationship_type_id", goal);
    formData.append("genre_id", goal);

    formData.append("localisation", "Non spécifiée");

    interests.forEach((id) => formData.append("interests[]", id.toString()));

    for (const p of photos) {
      if (p instanceof File) {
        const compressed = await compressImage(p, 800, 0.7);
        formData.append("file[]", compressed);
      }
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.status === 500) {
        if (fromAdmin) {
          setSuccessMessage("Utilisateur ajouté avec succès !");
          setShowSuccessModal(true);
        } else {
          navigate("/welcome");
        }
        return;
      }

      const result = await response.json();

      if (response.ok) {
        const userToStore = {
          ...result.user,
          image: result.image,
        };

        if (fromAdmin) {
          setSuccessMessage("Utilisateur ajouté avec succès !");
          setShowSuccessModal(true);
        } else {
          localStorage.setItem("token", result.token);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...userToStore,
              sexe: gender === "man" ? "Homme" : "Femme",
            })
          );
          window.dispatchEvent(new Event("user-logged-in"));
          navigate("/welcome");
        }
      } else {
        if (result.errors) {
          setErrorMessage(Object.values(result.errors).flat().join("\n"));
          setShowErrorModal(true);
        } else {
          setErrorMessage(result.message || "Erreur lors de l'inscription");
          setShowErrorModal(true);
        }
      }
    } catch (error) {
      setErrorMessage("Erreur de connexion réseau.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  // --- HELPERS ---
  const renderInputWithIcon = (Icon: any, value: string, placeholder: string, onChange: any, type = "text") => (
    <div style={{ position: "relative", marginBottom: 20 }}>
      <Icon style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", color: "#555" }} />
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  );

  const renderPasswordCheck = (checked: boolean, text: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 6, color: checked ? "green" : "#777", fontSize: 12 }}>
      <FaCheck size={10} color={checked ? "green" : "#ccc"} />
      {text}
    </div>
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${fond})` }}
      onKeyDown={handleKeyDown}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur-xl">

        {/* LEFT PANEL */}
        <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-blue-900" />
          <div className="absolute -top-20 -left-20 w-[300px] h-[300px] bg-cyan-400/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-blue-500/40 rounded-full blur-3xl" />

          <div className="relative z-10">
            <img src={logo} alt="Tafa" className="mx-auto w-80 mb-12 drop-shadow-xl transition-transform duration-300 hover:scale-105" />
            <h1 className="text-5xl font-black leading-tight mb-6">
              Rejoignez <span className="text-cyan-200">Tafa</span>
            </h1>
            <p className="text-white/90 text-lg leading-relaxed max-w-md">
              Créez votre profil, ajoutez vos photos et commencez à découvrir de nouvelles rencontres.
            </p>
          </div>

          <div className="relative z-10 text-sm text-white/70">
            Étape {step} sur 4 — Création de compte
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-6 sm:p-10 lg:p-10 flex flex-col justify-center" style={{ backgroundColor: "var(--bg-primary)" }}>

          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <img src={logo} alt="Tafa" className="w-24" />
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">
              Inscription
            </p>
            <h2 className="text-2xl sm:text-3xl font-black" style={{ color: "var(--text-primary)" }}>
              Créer votre compte
            </h2>
            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
              Complétez les informations étape par étape.
            </p>
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* FORMULAIRE À GAUCHE */}
                <div>
                  <h3 className="text-lg font-black mb-4" style={{ color: "var(--text-primary)" }}>
                    Votre profil
                  </h3>

                  {renderInputWithIcon(FaUser, firstName, "Prénom", setFirstName)}
                  {renderInputWithIcon(FaRegUser, lastName, "Nom", setLastName)}

                  {/* Sélecteur de pays avec autocomplétion */}
                  <div className="mb-3">
                    <input
                      type="text"
                      list="countries-list"
                      value={countryInput}
                      placeholder="Recherchez votre pays..."
                      onChange={(e) => {
                        const val = e.target.value;
                        setCountryInput(val);

                        const found = countries.find(
                          (c) => c.name.toLowerCase() === val.trim().toLowerCase()
                        );

                        if (found) {
                          setCountryCode(found.code);
                          setSelectedFlag(found.flag);
                          setCountryError("");
                        } else {
                          setCountryError("Veuillez sélectionner un pays valide dans la liste");
                        }
                      }}
                      className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition"
                      style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                    />
                    <datalist id="countries-list">
                      {countries.map((c) => (
                        <option key={c.code + c.name} value={c.name}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </datalist>
                    {countryError && (
                      <p className="text-red-500 text-xs mt-1 ml-2">{countryError}</p>
                    )}
                  </div>

                  {/* Téléphone avec indicatif */}
                  <div style={phoneContainerStyle}>
                    <div className="flex items-center gap-1 pl-2 pr-2 py-2 border-r" style={{ backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)" }}>
                      <img
                        src={selectedFlag}
                        alt="drapeau"
                        className="w-5 h-4 object-cover rounded-sm"
                      />
                      <span className="text-sm font-semibold text-gray-700">{countryCode || "+261"}</span>
                    </div>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setPhone(val);
                        setPhoneError("");
                      }}
                      onBlur={() => {
                        if (phone.length >= 8) {
                          checkPhone(phone);
                        }
                      }}
                      placeholder="34 00 000 00"
                      className="flex-1 pl-3 pr-4 py-3 text-sm outline-none"
                      style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)" }}
                      maxLength={15}
                    />
                  </div>

                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1 ml-2">{phoneError}</p>
                  )}
                  {checkingPhone && (
                    <p className="text-gray-400 text-xs mt-1 ml-2">Vérification...</p>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <input
                      type="text"
                      value={birthDay}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val === "" || (parseInt(val) >= 1 && parseInt(val) <= 31)) {
                          setBirthDay(val);
                        }
                      }}
                      placeholder="Jour"
                      style={dateInputStyle}
                      maxLength={2}
                    />
                    <select value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} style={dateInputStyle}>
                      <option value="">Mois</option>
                      {[
                        { v: "01", n: "Janvier" }, { v: "02", n: "Février" }, { v: "03", n: "Mars" },
                        { v: "04", n: "Avril" }, { v: "05", n: "Mai" }, { v: "06", n: "Juin" },
                        { v: "07", n: "Juillet" }, { v: "08", n: "Août" }, { v: "09", n: "Septembre" },
                        { v: "10", n: "Octobre" }, { v: "11", n: "Novembre" }, { v: "12", n: "Décembre" },
                      ].map((m) => (
                        <option key={m.v} value={m.v}>{m.n}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={birthYear}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 4) {
                          setBirthYear(val);
                        }
                      }}
                      placeholder="Année"
                      style={dateInputStyle}
                      maxLength={4}
                    />
                  </div>

                  {!isAdult && birthYear && (
                    <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm font-semibold">
                      Inscriptions réservées aux +18 ans.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setGender("man")}
                      style={gender === "man" ? btnGenderActive : btnGender}
                    >
                      Homme
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender("woman")}
                      style={gender === "woman" ? btnGenderActive : btnGender}
                    >
                      Femme
                    </button>
                  </div>
                </div>

                {/* PHOTOS À DROITE */}
                <div>
                  <h3 className="text-lg font-black mb-2" style={{ color: "var(--text-primary)" }}>
                    Photos
                  </h3>
                  <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
                    Ajoutez jusqu'à 6 photos.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {photos.map((p, i) => (
                      <label
                        key={i}
                        style={{
                          ...photoBox,
                          backgroundImage: p ? `url(${URL.createObjectURL(p)})` : "none",
                          backgroundSize: "cover",
                          backgroundPosition: "center center",
                          border: p ? "2px solid #06b6d4" : "2px dashed #cbd5e1",
                        }}
                      >
                        {!p && <FaPlus />}
                        <input
                          type="file"
                          hidden
                          accept="image/jpeg,image/png,image/webp,image/jfif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            if (!file.type.startsWith('image/')) {
                              setPhotoError('Veuillez sélectionner une vraie photo (JPG, JFIF PNG ou WEBP).');
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
                            setCropperIndex(i);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  disabled={!isStep1Complete}
                  onClick={() => setStep(2)}
                  className={`w-full py-3.5 rounded-2xl text-base font-bold text-white transition shadow-lg ${isStep1Complete
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/30"
                    : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  Suivant
                </button>
                <Link
                  to={fromAdmin ? "/admin/accueil" : "/"}
                  className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold hover:underline transition"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <FaArrowLeft />
                  {fromAdmin ? "Retour" : "Retour à la connexion"}
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              {/* Situation */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Situation amoureuse
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                  style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                >
                  <option value="">Sélectionnez votre situation</option>
                  <option value="celibataire">Célibataire</option>
                  <option value="marie">Marié(e)</option>
                  <option value="divorce">Divorcé(e)</option>
                  <option value="veuf">Veuf/Veuve</option>
                  <option value="separe">Séparé(e)</option>
                </select>
              </div>

              {/* Objectifs */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    Que cherchez-vous ?
                  </h3>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Choisissez 1
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relationshipOptions.map((option) => {
                    const active = goal === option.id.toString();
                    return (
                      <button
                        type="button"
                        key={option.id}
                        onClick={() => setGoal(option.id.toString())}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-bold transition ${active
                          ? "border-blue-500 bg-blue-50 text-blue-600 shadow-sm"
                          : "text-gray-700 hover:border-blue-300"
                          }`}
                        style={!active ? { backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" } : {}}
                      >
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${active
                            ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white"
                            : "bg-white text-blue-500"
                            }`}
                        >
                          {option.icon}
                        </span>
                        {option.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Centres d'intérêt – maintenant responsive */}
              <div className="mb-7">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                    Centres d'intérêt
                  </h3>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
                    {interests.length}/6
                  </span>
                </div>
                <p className="text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                  Choisissez au moins 3 centres d'intérêt.
                </p>

                {/* 🌟 Grille responsive modifiée */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                  {availableInterests.map((item) => {
                    const active = interests.includes(item.id.toString());
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => {
                          if (active) {
                            setInterests(interests.filter((i) => i !== item.id.toString()));
                          } else if (interests.length < 6) {
                            setInterests([...interests, item.id.toString()]);
                          }
                        }}
                        className={`flex items-center justify-center gap-1 px-1.5 py-1.5 sm:px-2 sm:py-2 rounded-xl border text-[10px] sm:text-xs font-bold transition-all duration-200 ${active
                          ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-500 shadow-md scale-[1.05]"
                          : "hover:border-blue-300"
                          }`}
                        style={
                          !active
                            ? { backgroundColor: "var(--bg-secondary)", borderColor: "var(--border-color)", color: "var(--text-primary)" }
                            : {}
                        }
                      >
                        {/* Icône : blanc si actif, couleur personnalisée sinon */}
                        <span className={`flex items-center ${active ? "text-white" : item.color}`}>
                          {item.icon}
                        </span>
                        <span>{item.name}</span>
                        {active && <span className="text-white text-[10px] ml-1">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Boutons Précédent / Suivant */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="py-3.5 rounded-2xl text-base font-bold transition"
                  style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                >
                  Précédent
                </button>
                <button
                  type="button"
                  disabled={!isStep2Complete}
                  onClick={() => setStep(3)}
                  className={`py-3.5 rounded-2xl text-base font-bold text-white transition shadow-lg ${isStep2Complete
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/30"
                    : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div className="mb-5">
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Adresse e-mail
                </label>
                <div style={{ position: "relative", marginBottom: 5 }}>
                  <FaEnvelope style={{ position: "absolute", top: "50%", left: 12, transform: "translateY(-50%)", color: "#555", zIndex: 1 }} />
                  <input
                    type="email"
                    value={email}
                    placeholder="exemple@email.com"
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    onBlur={() => {
                      if (email.includes("@")) {
                        checkEmail(email);
                      }
                    }}
                    style={inputStyle}
                  />
                </div>
                {emailError && <p className="text-red-500 text-xs mt-1 ml-2">{emailError}</p>}
                {checkingEmail && <p className="text-gray-400 text-xs mt-1 ml-2">Vérification...</p>}
              </div>

              <div className="mb-5 relative">
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Mot de passe
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full pl-4 pr-10 py-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                  style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                />
                <div
                  className="absolute right-4 top-[42px] cursor-pointer text-gray-400 hover:text-blue-500 transition"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <div className="mb-5 relative">
                <label className="block text-sm font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Confirmer le mot de passe
                </label>
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  className="w-full pl-4 pr-10 py-3.5 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition outline-none"
                  style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                />
                <div
                  className="absolute right-4 top-[42px] cursor-pointer text-gray-400 hover:text-blue-500 transition"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>

              <div className="mb-6 rounded-2xl p-4" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}>
                <p className="text-xs font-bold mb-2" style={{ color: "var(--text-primary)" }}>
                  Votre mot de passe doit contenir :
                </p>
                <div className="space-y-1 text-xs">
                  {renderPasswordCheck(passwordChecks.length8, "8 caractères minimum")}
                  {renderPasswordCheck(passwordChecks.uppercase, "Une majuscule")}
                  {renderPasswordCheck(passwordChecks.number, "Un chiffre")}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="py-3.5 rounded-2xl text-base font-bold transition"
                  style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                >
                  Précédent
                </button>
                <button
                  disabled={!isStep3Complete}
                  onClick={() => setStep(4)}
                  className={`py-3.5 rounded-2xl text-base font-bold text-white transition shadow-lg ${isStep3Complete
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/30"
                    : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  Suivant
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "var(--text-primary)" }}>
                Bienvenue sur{" "}
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Tafa
                </span>
              </h1>
              <p className="text-sm max-w-md mx-auto mb-6" style={{ color: "var(--text-secondary)" }}>
                Votre profil est presque prêt !
                Vous allez bientôt pouvoir découvrir des profils, faire des rencontres
                et commencer à discuter avec des personnes qui vous correspondent.
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl p-5 text-sm text-blue-800 mb-6 text-left space-y-2">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-500 text-xs shrink-0" />
                  <span>Votre profil sera visible après validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-500 text-xs shrink-0" />
                  <span>Vous pourrez modifier vos informations à tout moment</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-green-500 text-xs shrink-0" />
                  <span>Vos données restent sécurisées</span>
                </div>
              </div>
              <label className="flex items-center justify-center gap-2 text-sm mb-6 cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                />
                <span>
                  J'accepte les{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-600 font-semibold underline hover:text-blue-700"
                  >
                    conditions d'utilisation
                  </button>
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="py-3.5 rounded-2xl text-base font-bold transition"
                  style={{ backgroundColor: "var(--bg-secondary)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                >
                  Précédent
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!acceptedTerms || loading}
                  className={`py-3.5 rounded-2xl text-base font-bold text-white transition shadow-lg ${acceptedTerms && !loading
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-blue-500/30"
                    : "bg-gray-400 cursor-not-allowed"
                    }`}
                >
                  {loading ? "Création..." : "Commencer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {cropperFile && (
        <ImageCropper
          file={cropperFile}
          onCropDone={handleCropDone}
          onCancel={() => { setCropperFile(null); setCropperIndex(null); }}
        />
      )}

      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />

      <AlertModal
        open={showSuccessModal}
        type="success"
        message={successMessage}
        onClose={() => {
          setShowSuccessModal(false);
          if (fromAdmin) navigate("/admin/accueil");
        }}
        secondaryButton={{
          text: "Se connecter",
          onClick: () => navigate("/"),
        }}
      />

      <AlertModal
        open={showErrorModal}
        type="error"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />

      <AlertModal
        open={!!photoError}
        type="error"
        message={photoError}
        onClose={() => setPhotoError("")}
      />

    </div>
  );
}

// STYLES
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 12px 12px 40px",
  borderRadius: 10,
  border: "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
  fontSize: 14,
  outline: "none",
  marginBottom: 5,
  color: "var(--text-primary)",
};

const btnGender: React.CSSProperties = {
  flex: 1,
  padding: 12,
  border: "1px solid var(--border-color)",
  borderRadius: 10,
  background: "var(--bg-secondary)",
  cursor: "pointer",
  color: "var(--text-primary)",
};

const btnGenderActive = { ...btnGender, border: "2px solid #06668f", background: "var(--color-primary-light)" };

const photoBox: React.CSSProperties = {
  height: 95,
  border: "2px dashed var(--border-color)",
  borderRadius: 18,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  cursor: "pointer",
  backgroundColor: "var(--bg-secondary)",
  color: "var(--color-primary)",
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
};

const dateInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 8px",
  borderRadius: 10,
  border: "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
  fontSize: 14,
  outline: "none",
  marginBottom: 5,
  color: "var(--text-primary)",
  textAlign: "center",
  appearance: "auto" as any,
  WebkitAppearance: "auto" as any,
};

const phoneContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  border: "1px solid var(--border-color)",
  borderRadius: 10,
  background: "var(--bg-secondary)",
  overflow: "hidden",
  marginBottom: 15,
};

export default Register;