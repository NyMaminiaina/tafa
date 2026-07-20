import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, UserPlus, UserCheck, UserX, Mail, Phone, MapPin, Plus,
  Trash2, Shield, AlertCircle,
  Download, RefreshCw, CheckCircle, XCircle, Crown, Key
} from 'lucide-react';
import { FaHeart, FaHandshake, FaRing, FaGlassCheers, FaGem, FaCrown, FaChild } from "react-icons/fa";
import ImageCropper from "../components/ImageCropper";

import { useNavigate } from "react-router-dom";

import AlertModal from "../components/AlertModal";

type UserType = {
  id: number;
  name: string;
  fullName: string;
  email: string;
  phone: string;
  city: string;
  age: number | null;
  status: string;
  premium: boolean;
  registrationDate: string;
  lastActive: string;
  verified: boolean;
  isAdmin: boolean;
  created_by_admin?: boolean;
  avatar: string | null;
};
// Stats
type Stats = {
  total: number;
  active: number;
  premium: number;
  totalAdmins: number;
};
const API_URL = import.meta.env.VITE_API_URL;
const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;

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

const Utilisateurs = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField] = useState('created_at');
  const [sortDirection] = useState('desc');
  const usersPerPage = 15;

  const [globalTotalUsers, setGlobalTotalUsers] = useState(0);
  const displayedTotal = searchTerm ? totalUsers : globalTotalUsers;

  const refreshAll = async (page = currentPage) => {
    await fetchUsers(page);
    await fetchStats();
  };

  // Add admin/user modal state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminSearchResults, setAdminSearchResults] = useState<UserType[]>([]);
  const [isSearchingAdmin, setIsSearchingAdmin] = useState(false);
  const [addingAdminId, setAddingAdminId] = useState<number | null>(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserStep, setNewUserStep] = useState(1);
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserBirthDay, setNewUserBirthDay] = useState('');
  const [newUserBirthMonth, setNewUserBirthMonth] = useState('');
  const [newUserBirthYear, setNewUserBirthYear] = useState('');

  const [newUserCountryCode, setNewUserCountryCode] = useState('+261');
  const [newUserCountryInput, setNewUserCountryInput] = useState('Madagascar');
  const [newUserSelectedFlag, setNewUserSelectedFlag] = useState('https://flagcdn.com/w40/mg.png');
  const [newUserCountryError, setNewUserCountryError] = useState('');
  const [newUserPhoneError, setNewUserPhoneError] = useState('');

  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [cropperIndex, setCropperIndex] = useState<number | null>(null);

  const [newUserGender, setNewUserGender] = useState('');
  const [newUserSituation, setNewUserSituation] = useState('celibataire');
  const [newUserGoal, setNewUserGoal] = useState('');
  const [newUserGenre, setNewUserGenre] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  // const [newUserPassword] = useState('');
  const [newUserPhotos, setNewUserPhotos] = useState<File[]>([]);
  const [newUserError, setNewUserError] = useState<string | null>(null);
  const [newUserEmailError, setNewUserEmailError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [checkingNewUserEmail, setCheckingNewUserEmail] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [showLoginButton, setShowLoginButton] = useState(false);

  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    premium: 0,
    totalAdmins: 0
  });


  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/admin/statistics`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        }
      });

      const data = await res.json();

      setStats(prev => ({
        ...prev,
        premium: data?.subscriptions?.active || 0,
        totalAdmins: data?.admins?.total || 0,
      }));

    } catch {
      setErrorMessage("Erreur de connexion.");
      setShowErrorModal(true);
    }
  }, []);

  // Fetch users from API
  const fetchUsers = useCallback(async (page: number = 1): Promise<void> => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const params = new URLSearchParams({
        per_page: String(usersPerPage),
        page: String(page),
        search: searchTerm
      });

      const response = await fetch(`${API_URL}/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Erreur recherche");
        setShowErrorModal(true);
        return;
      }

      // Map API response to our format
      const mappedUsers: UserType[] = (data?.data || []).map((user: any) => ({
        id: user.id,
        name: user.profile?.prenom || user.name || 'Sans nom',
        fullName: `${user.profile?.prenom || ''} ${user.profile?.name || user.name || ''}`.trim(),
        email: user.email,
        phone: user.profile?.telephone || 'Non renseigné',
        city: user.profile?.localisation || 'Non renseigné',
        age: user.profile?.age || calculateAge(user.profile?.date_de_naissance),
        status: user.email_verified_at ? 'active' : 'pending',
        // premium: user.active_subscription > 0,
        premium: user.is_premium,
        registrationDate: user.created_at?.split('T')[0] || 'N/A',
        lastActive: user.profile?.last_active || user.updated_at,
        verified: !!user.email_verified_at,
        isAdmin: Number(user.is_admin) === 1,
        created_by_admin: Number(user.created_by_admin) === 1,
        avatar: user.profile?.images?.[0]?.path?.replace(/^\/+/, '') || null
      }));

      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);
      setTotalUsers(data.total || 0);
      setTotalPages(data.last_page || 1);
      if (!searchTerm) {
        setGlobalTotalUsers(data.total || 0);
      }
      setCurrentPage(data.current_page || 1);
    } catch {
      setErrorMessage("Erreur de connexion.");
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  // Calculate age from birthdate
  const calculateAge = (birthDate?: string | null): number | null => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Initial fetch
  useEffect(() => {
    fetchUsers(1);
    fetchStats();
  }, [fetchUsers, fetchStats]);

  // Refetch when search changes (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, fetchUsers]);

  // Filter locally for status
  useEffect(() => {
    let result = [...users];

    if (selectedStatus !== 'all') {

      if (selectedStatus === 'premium') {
        result = result.filter(user => user.premium);

      } else if (selectedStatus === 'admin') {
        // 🔥 ADMIN
        result = result.filter(user => user.isAdmin);

      } else {
        result = result.filter(user => user.status === selectedStatus);
      }

    }

    // Sort
    result.sort((a, b) => {
      const aValue = (a as any)[sortField];
      const bValue = (b as any)[sortField];

      //  Cas des dates
      if (sortField === 'lastActive' || sortField === 'registrationDate') {
        const aDate = new Date(aValue || 0).getTime();
        const bDate = new Date(bValue || 0).getTime();

        return sortDirection === 'asc'
          ? aDate - bDate
          : bDate - aDate;
      }

      //  Cas général (string / number)
      return sortDirection === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });


    setFilteredUsers(result);
  }, [selectedStatus, sortField, sortDirection, users]);

  // Status badge
  const getStatusBadge = (user: UserType) => {
    if (user.isAdmin) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Shield size={12} />
          Admin
        </span>
      );
    }

    const statusConfig = {
      active: { color: 'bg-emerald-100 text-emerald-800', icon: <CheckCircle size={12} />, label: 'Actif' },
      pending: { color: 'bg-amber-100 text-amber-800', icon: <AlertCircle size={12} />, label: 'En attente' },
      inactive: { color: 'bg-gray-100 text-gray-800', icon: <UserX size={12} />, label: 'Inactif' },
      banned: { color: 'bg-rose-100 text-rose-800', icon: <XCircle size={12} />, label: 'Banni' }
    };

    const config = statusConfig[user.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Delete user
  const handleDeleteUser = async (userId: number): Promise<void> => {
    setConfirmMessage("Voulez-vous vraiment supprimer cet utilisateur ?");

    setConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        });

        if (response.ok) {
          await refreshAll();
          setShowLoginButton(false);
          setSuccessMessage("Utilisateur supprimé avec succès !");
          setShowSuccessModal(true);
        } else {
          const data = await response.json();
          setErrorMessage(data.error || "Erreur lors de la suppression.");
          setShowErrorModal(true);
        }
      } catch (err) {
        console.error(err);
        setErrorMessage("Erreur de connexion");
        setShowErrorModal(true);
      }
    });

    setShowConfirmModal(true);
  };

  // Toggle admin status
  const handleToggleAdmin = async (
    userId: number,
    currentStatus: boolean
  ): Promise<void> => {

    setConfirmMessage(
      currentStatus
        ? "Voulez-vous vraiment retirer les droits administrateur de cet utilisateur ?"
        : "Voulez-vous vraiment rendre cet utilisateur administrateur ?"
    );

    setConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_admin: !currentStatus,
          }),
        });

        if (response.ok) {
          await refreshAll();

          setShowLoginButton(false);
          setSuccessMessage(
            currentStatus
              ? "Les droits administrateur ont été retirés avec succès !"
              : "Utilisateur promu administrateur avec succès !"
          );
          setShowSuccessModal(true);

        } else {
          const data = await response.json();
          setErrorMessage(data.error || "Erreur lors de la mise à jour.");
          setShowErrorModal(true);
        }

      } catch (err) {
        console.error(err);
        setErrorMessage("Erreur de connexion.");
        setShowErrorModal(true);
      }
    });

    setShowConfirmModal(true);
  };
  // Search users for admin modal
  const searchUsersForAdmin = async (search: string): Promise<void> => {
    if (!search || search.length < 2) {
      setAdminSearchResults([]);
      return;
    }

    setIsSearchingAdmin(true);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      const response = await fetch(`${API_URL}/admin/users?search=${encodeURIComponent(search)}&per_page=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        }
      });
      const data = await response.json();
      if (!response.ok) {
        setAdminSearchResults([]);
        setErrorMessage(data.message || "Erreur lors de la recherche");
        setShowErrorModal(true);
        return;
      }
      setAdminSearchResults((data?.data || []).map((user: any) => ({
        id: user.id,
        name: user.profile?.prenom || user.name || 'Sans nom',
        fullName: `${user.profile?.prenom || ''} ${user.profile?.name || user.name || ''}`.trim(),
        email: user.email,
        isAdmin: Number(user.is_admin) === 1,
        avatar: user.profile?.images?.[0]?.path || null
      })));
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setIsSearchingAdmin(false);
    }
  };

  const calculateNewUserAge = (): number | null => {
    if (!newUserBirthDay || !newUserBirthMonth || !newUserBirthYear || newUserBirthYear.length !== 4) return null;
    const birthDate = new Date(parseInt(newUserBirthYear), parseInt(newUserBirthMonth) - 1, parseInt(newUserBirthDay));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // --- COMPRESSION D'IMAGE (copié depuis Register) ---
  const compressImage = (file: File, maxWidth = 800, quality = 0.7): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
                resolve(compressedFile);
              } else {
                reject(new Error('Compression échouée'));
              }
            },
            'image/jpeg',
            quality
          );
        };
      };
      reader.onerror = reject;
    });
  };

  const isNewUserAdult = (calculateNewUserAge() || 0) >= 18;
  const isNewUserStep1Complete = newUserFirstName && newUserLastName && newUserPhone && newUserGender && newUserBirthDay && newUserBirthMonth && newUserBirthYear && isNewUserAdult;
  // Step 2: photos (optional) — always valid (no flag needed)
  // Step 3: situation/goal
  const isNewUserStep3Complete = newUserSituation && newUserGoal && newUserGenre;
  // Step 4: account
  const isNewUserStep4Complete = newUserEmail && !newUserEmailError;

  const checkNewUserEmail = (emailToCheck: string) => {
    setNewUserEmail(emailToCheck);
    setNewUserEmailError('');

    if (!emailToCheck || !emailToCheck.includes('@')) return;

    setCheckingNewUserEmail(true);
    fetch(`${API_URL}/check-email?email=${encodeURIComponent(emailToCheck)}`)
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          setNewUserEmailError('Cet email est déjà utilisé');
        }
      })
      .catch(() => { })
      .finally(() => setCheckingNewUserEmail(false));
  };

  const handleCreateUser = async (): Promise<void> => {
    if (newUserEmail && !newUserEmailError) {
      try {
        const response = await fetch(`${API_URL}/check-email?email=${encodeURIComponent(newUserEmail)}`);
        const data = await response.json();
        if (data.exists) {
          setNewUserEmailError('Cet email est déjà utilisé');
          setNewUserError('Veuillez corriger les erreurs avant de créer.');
          return;
        }
      } catch {
        // si erreur réseau, on laisse passer
      }
    }

    if (!isNewUserStep4Complete) {
      setNewUserError('Veuillez compléter toutes les étapes et corriger les erreurs.');
      return;
    }

    setIsCreatingUser(true);
    setNewUserError(null);

    try {
      const formData = new FormData();
      formData.append('firstname', newUserFirstName);
      formData.append('name', newUserLastName);
      formData.append('email', newUserEmail);

      formData.append('password', 'password');
      formData.append('password_confirmation', 'password');

      formData.append('phone', newUserCountryCode + newUserPhone);
      formData.append('sexe', newUserGender === 'man' ? 'Homme' : 'Femme');
      formData.append('Situation_amoureuse', newUserSituation);
      formData.append('relationship_type_id', newUserGoal);
      formData.append('genre_id', newUserGenre);
      formData.append('date_de_naissance', `${newUserBirthYear}-${newUserBirthMonth}-${newUserBirthDay}`);
      formData.append('created_by_admin', '1');

      // Append photos if any (compress like registration)
      for (const p of newUserPhotos) {
        if (p instanceof File) {
          try {
            const compressed = await compressImage(p, 800, 0.7);
            formData.append('file[]', compressed);
          } catch {
            formData.append('file[]', p);
          }
        }
      }

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setShowAddUserModal(false);
        setNewUserStep(1);
        setNewUserFirstName('');
        setNewUserLastName('');
        setNewUserPhone('');
        setNewUserBirthDay('');
        setNewUserBirthMonth('');
        setNewUserBirthYear('');
        setNewUserGender('');
        setNewUserSituation('celibataire');
        setNewUserGoal('');
        setNewUserGenre('');
        setNewUserEmail('');
        setNewUserEmailError('');
        setNewUserPhotos([]);
        setNewUserError(null);

        await refreshAll();

        setShowLoginButton(false);
        setSuccessMessage('Utilisateur créé avec succès !');
        setShowSuccessModal(true);
      } else {
        if (data.errors) {
          setNewUserError(Object.values(data.errors).flat().join(' '));
        } else {
          setNewUserError(data.message || data.error || 'Erreur lors de la création');
        }
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setNewUserError('Erreur de connexion.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handlePromoteToAdmin = async (userId: number): Promise<void> => {
    setConfirmMessage(
      "Voulez-vous vraiment promouvoir cet utilisateur en administrateur ?"
    );
    setAddingAdminId(userId);
    setConfirmAction(() => async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          setIsLoading(false);
          return;
        }
        const response = await fetch(`${API_URL}/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ is_admin: true })
        });

        if (response.ok) {
          // Update local state
          await refreshAll();
          setShowAddAdminModal(false);
          setShowLoginButton(false);
          setSuccessMessage("Utilisateur promu administrateur avec succès !");
          setShowSuccessModal(true);
        } else {
          const data = await response.json();
          setErrorMessage(data.error || "Erreur lors de la promotion.");
          setShowErrorModal(true);
        }
      } catch (err) {
        console.error('Error promoting user:', err);
        setErrorMessage("Erreur de connexion");
        setShowErrorModal(true);
      } finally {
        setAddingAdminId(null);
      }
    });
    setShowConfirmModal(true);
  };

  // Debounce admin search
  useEffect(() => {
    if (!adminSearchTerm || adminSearchTerm.length < 2) {
      setAdminSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      searchUsersForAdmin(adminSearchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [adminSearchTerm]);

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Ville', 'Âge', 'Statut', 'Premium', 'Date inscription'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.fullName}"`,
        user.email,
        user.phone,
        `"${user.city}"`,
        user.age || 'N/A',
        user.status,
        user.premium ? 'Oui' : 'Non',
        user.registrationDate
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilisateurs_tafa_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Format date
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  // Format last active
  const formatLastActive = (dateStr: string): string => {
    if (!dateStr) return 'Jamais';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 5) return 'En ligne';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return formatDate(dateStr);
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="animate-spin text-sky-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 font-medium">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  const checkNewUserPhone = (phoneToCheck: string) => {
    if (!phoneToCheck || phoneToCheck.length < 8) {
      setNewUserPhoneError('');
      return;
    }
    fetch(`${API_URL}/check-phone?phone=${encodeURIComponent(newUserCountryCode + phoneToCheck)}`)
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          setNewUserPhoneError('Ce numéro est déjà utilisé');
        } else {
          setNewUserPhoneError('');
        }
      })
      .catch(() => { });
  };

  const handleCropDone = (croppedFile: File) => {
    if (cropperIndex !== null) {
      setNewUserPhotos(prev => {
        const copy = [...prev];
        copy[cropperIndex] = croppedFile;
        return copy.slice(0, 6);
      });
    }
    setCropperFile(null);
    setCropperIndex(null);
  };

  return (
    <div className="p-3 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50/20 min-h-screen overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <UserCheck className="text-sky-600" size={32} />
            Gestion des Utilisateurs
          </h1>
          <p className="text-gray-600">
            {displayedTotal} utilisateurs au total
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={() => fetchUsers(currentPage)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl transition"
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            Actualiser
          </button>
          <button
            onClick={() => {
              setShowAddAdminModal(true);
              setAdminSearchTerm('');
              setAdminSearchResults([]);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
          >
            <UserPlus size={18} />
            Ajouter un admin
          </button>
          <button
            onClick={() => {
              setShowAddUserModal(true);
              setNewUserStep(1);
              setNewUserError(null);
              setNewUserEmailError('');
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition shadow-lg"
          >
            <UserPlus size={18} />
            Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Utilisateurs</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{totalUsers}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
              <UserCheck size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Premium (Gold)</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.premium}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-100 text-amber-600">
              <Crown size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Admin</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{stats.totalAdmins}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-100 text-purple-600">
              <Shield size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedStatus}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Admin par pagination</option>
              <option value="premium">Premium par pagination</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                fetchUsers(1);
              }}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 transition"
            >
              <RefreshCw size={18} />
              Réinitialiser
            </button>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-600 transition"
            >
              <Download size={18} />
              Exporter CSV
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Utilisateur
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Contact
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Localisation
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Statut
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Abonnement
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 flex items-center justify-center text-white font-bold overflow-hidden">
                          {user.avatar ? (
                            <img
                              src={`${STORAGE_URL}/${user.avatar}`}
                              alt={user.name}
                              className="w-full h-full object-cover"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            user.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800">{user.fullName}</span>
                            {user.created_by_admin && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700" title="Créé par l'admin">
                                <Key size={10} />
                              </span>
                            )}
                            {user.verified && (
                              <CheckCircle size={14} className="text-sky-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                          {user.age && (
                            <div className="text-xs text-gray-400">{user.age} ans</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-gray-400" />
                          <span className="truncate max-w-[200px]">{user.email}</span>
                        </div>
                        {user.phone !== 'Non renseigné' && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Phone size={14} className="text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <span>{user.city}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Inscrit le {formatDate(user.registrationDate)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(user)}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatLastActive(user.lastActive)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {user.premium ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm">
                          <Crown size={12} />
                          Gold
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">
                          Standard
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                          className={`p-2 rounded-lg transition ${user.isAdmin
                            ? 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                            : 'hover:bg-gray-100 text-gray-400'
                            }`}
                          title={user.isAdmin ? 'Retirer admin' : 'Rendre admin'}
                        >
                          <Shield size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 hover:bg-rose-50 rounded-lg transition text-rose-600"
                          title="Supprimer"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}

              {/* account step moved to modal (step 4) */}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages} ({totalUsers} utilisateurs)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchUsers(currentPage - 1)}
              disabled={currentPage === 1 || isLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => fetchUsers(pageNum)}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg ${currentPage === pageNum
                    ? 'bg-sky-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => fetchUsers(currentPage + 1)}
              disabled={currentPage === totalPages || isLoading}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <Shield size={24} />
                  <h2 className="text-xl font-bold">Ajouter un administrateur</h2>
                </div>
                <button
                  onClick={() => setShowAddAdminModal(false)}
                  className="text-white/80 hover:text-white transition"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Recherchez un utilisateur par nom ou email pour le promouvoir administrateur.
              </p>

              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
                  value={adminSearchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAdminSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoFocus
                />
              </div>

              {/* Search Results */}
              <div className="max-h-[300px] overflow-y-auto">
                {isSearchingAdmin ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="animate-spin text-purple-600" size={24} />
                    <span className="ml-2 text-gray-600">Recherche...</span>
                  </div>
                ) : adminSearchTerm.length < 2 ? (
                  <div className="text-center py-8 text-gray-500">
                    Tapez au moins 2 caractères pour rechercher
                  </div>
                ) : adminSearchResults.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Aucun utilisateur trouvé
                  </div>
                ) : (
                  <div className="space-y-2">
                    {adminSearchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 flex items-center justify-center text-white font-bold overflow-hidden">
                            {user.avatar ? (
                              <img
                                src={`${STORAGE_URL}/${user.avatar}`}
                                alt={user.name}
                                className="w-full h-full object-cover"
                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{user.fullName}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>

                        {user.isAdmin ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                            <Shield size={14} />
                            Déjà admin
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePromoteToAdmin(user.id)}
                            disabled={addingAdminId === user.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                          >
                            {addingAdminId === user.id ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" />
                                Ajout...
                              </>
                            ) : (
                              <>
                                <UserPlus size={14} />
                                Promouvoir
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="w-full py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 transition font-medium"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-emerald-600 to-teal-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <UserPlus size={24} />
                  <div>
                    <h2 className="text-xl font-bold">Créer un utilisateur</h2>
                    <p className="text-sm text-emerald-100">Étape {newUserStep} sur 4</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-white/80 hover:text-white transition"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              {newUserStep === 1 && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                      <div className="relative">
                        <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={newUserFirstName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserFirstName(e.target.value)}
                          className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Prénom"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                      <div className="relative">
                        <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="text"
                          value={newUserLastName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserLastName(e.target.value)}
                          className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="Nom"
                        />
                      </div>
                    </div>
                    {/* Sélecteur de pays */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                      <input
                        type="text"
                        list="admin-countries-list"
                        value={newUserCountryInput}
                        placeholder="Recherchez votre pays..."
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewUserCountryInput(val);
                          const found = countries.find(
                            (c) => c.name.toLowerCase() === val.trim().toLowerCase()
                          );
                          if (found) {
                            setNewUserCountryCode(found.code);
                            setNewUserSelectedFlag(found.flag);
                            setNewUserCountryError('');
                          } else {
                            setNewUserCountryError('Veuillez sélectionner un pays valide');
                          }
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <datalist id="admin-countries-list">
                        {countries.map((c) => (
                          <option key={c.code + c.name} value={c.name}>
                            {c.name} ({c.code})
                          </option>
                        ))}
                      </datalist>
                      {newUserCountryError && (
                        <p className="text-red-500 text-xs mt-1">{newUserCountryError}</p>
                      )}
                    </div>

                    {/* Téléphone avec indicatif */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                      <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden">
                        <div className="flex items-center gap-1 pl-3 pr-2 py-3 bg-gray-50 border-r">
                          <img
                            src={newUserSelectedFlag}
                            alt="drapeau"
                            className="w-5 h-4 object-cover rounded-sm"
                          />
                          <span className="text-sm font-semibold text-gray-700">{newUserCountryCode}</span>
                        </div>
                        <input
                          type="tel"
                          value={newUserPhone}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setNewUserPhone(val);
                            setNewUserPhoneError('');
                          }}
                          onBlur={() => {
                            if (newUserPhone.length >= 8) checkNewUserPhone(newUserPhone);
                          }}
                          className="flex-1 pl-3 pr-4 py-3 outline-none"
                          placeholder="34 00 000 00"
                          maxLength={15}
                        />
                      </div>
                      {newUserPhoneError && (
                        <p className="text-red-500 text-xs mt-1 ml-1">{newUserPhoneError}</p>
                      )}
                    </div>

                    {/* Photos moved to step 2 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={newUserBirthDay}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 31)) {
                              setNewUserBirthDay(val);
                            }
                          }}
                          placeholder="Jour"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          maxLength={2}
                        />
                        <select
                          value={newUserBirthMonth}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewUserBirthMonth(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Mois</option>
                          {[
                            { v: '01', n: 'Janvier' }, { v: '02', n: 'Février' }, { v: '03', n: 'Mars' },
                            { v: '04', n: 'Avril' }, { v: '05', n: 'Mai' }, { v: '06', n: 'Juin' },
                            { v: '07', n: 'Juillet' }, { v: '08', n: 'Août' }, { v: '09', n: 'Septembre' },
                            { v: '10', n: 'Octobre' }, { v: '11', n: 'Novembre' }, { v: '12', n: 'Décembre' },
                          ].map((m) => (
                            <option key={m.v} value={m.v}>{m.n}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={newUserBirthYear}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 4) {
                              setNewUserBirthYear(val);
                            }
                          }}
                          placeholder="Année"
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          maxLength={4}
                        />
                      </div>
                    </div>
                    {!isNewUserAdult && newUserBirthYear && (
                      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                        L'utilisateur doit avoir au moins 18 ans.
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setNewUserGender('man')}
                          className={`py-3 rounded-xl border font-semibold transition ${newUserGender === 'man' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-300 text-gray-700 hover:border-emerald-400'}`}
                        >
                          Homme
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewUserGender('woman')}
                          className={`py-3 rounded-xl border font-semibold transition ${newUserGender === 'woman' ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-300 text-gray-700 hover:border-emerald-400'}`}
                        >
                          Femme
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {newUserStep === 2 && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Photos de profil (jusqu'à 6)</label>
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <label
                            key={idx}
                            onClick={() => console.log('Clic sur label', idx)}
                            className={`w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center relative cursor-pointer ${newUserPhotos[idx] ? '' : 'bg-gray-100 border-2 border-dashed border-gray-300'}`}
                            style={newUserPhotos[idx] ? { backgroundImage: `url(${URL.createObjectURL(newUserPhotos[idx])})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' } : {}}
                          >
                            {!newUserPhotos[idx] && <Plus className="text-gray-400" size={24} />}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp,image/jfif"
                              hidden
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                if (!e.target.files || !e.target.files[0]) return;
                                const file = e.target.files[0];

                                if (!file.type.startsWith('image/')) {
                                  setPhotoError('Veuillez sélectionner une vraie photo (JPG, PNG ou WEBP).');
                                  e.currentTarget.value = '';
                                  return;
                                }

                                const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'jfif'];
                                const ext = file.name.split('.').pop()?.toLowerCase();
                                if (!ext || !allowedExtensions.includes(ext)) {
                                  setPhotoError('Formats acceptés : JPG, PNG, WEBP, JFIF');
                                  e.currentTarget.value = '';
                                  return;
                                }

                                setCropperFile(file);
                                setCropperIndex(idx);
                                e.currentTarget.value = '';
                              }}
                            />
                            {newUserPhotos[idx] && (
                              <button
                                type="button"
                                onClick={(ev) => { ev.stopPropagation(); setNewUserPhotos(prev => prev.filter((_, i) => i !== idx)); }}
                                className="absolute top-1 right-1 bg-white/80 rounded-full p-1 text-rose-600"
                              >
                                <XCircle size={18} />
                              </button>
                            )}
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Vous pouvez ajouter jusqu'à 6 photos. La première sera utilisée comme avatar principal.</p>
                    </div>
                  </div>
                </>
              )}

              {newUserStep === 3 && (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Situation amoureuse</label>
                      <select
                        value={newUserSituation}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewUserSituation(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Sélectionnez la situation</option>
                        <option value="celibataire">Célibataire</option>
                        <option value="marie">Marié(e)</option>
                        <option value="divorce">Divorcé(e)</option>
                        <option value="veuf">Veuf/Veuve</option>
                        <option value="separe">Séparé(e)</option>
                      </select>
                    </div>
                    <div>
                      <p className="block text-sm font-medium text-gray-700 mb-2">Que cherchez-vous</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: 1, name: 'Relation sérieuse', icon: <FaHeart /> },
                          { id: 2, name: 'Amitié', icon: <FaHandshake /> },
                          { id: 3, name: 'Mariage', icon: <FaRing /> },
                          { id: 4, name: 'Rien de sérieux', icon: <FaGlassCheers /> },
                          { id: 5, name: 'Sugar daddy', icon: <FaGem /> },
                          { id: 6, name: 'Sugar mommy', icon: <FaCrown /> },
                          { id: 7, name: 'Sugar baby', icon: <FaChild /> },
                        ].map((option) => {
                          const active = newUserGoal === option.id.toString();
                          return (
                            <button
                              key={option.id}
                              type="button"
                              onClick={() => {
                                setNewUserGoal(option.id.toString());
                                setNewUserGenre(option.id.toString());
                              }}
                              className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition ${active ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-300 text-gray-700 hover:border-emerald-400'}`}
                            >
                              <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white' : 'bg-white text-emerald-500'}`}>
                                {option.icon}
                              </span>
                              {option.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {newUserStep === 4 && (
                <>
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm space-y-2">
                      <p className="text-amber-800 flex items-center gap-2">
                        <Key size={16} />
                        <span className="font-semibold">Mot de passe par défaut</span>
                      </p>
                      <p className="text-amber-700">
                        Le compte sera créé avec le mot de passe : <code className="bg-amber-100 px-2 py-0.5 rounded font-bold text-amber-900">password</code>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => {
                            setNewUserEmail(e.target.value);
                            setNewUserEmailError('');
                          }}
                          onBlur={(e) => checkNewUserEmail(e.target.value)}
                          className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          placeholder="utilisateur@example.com"
                        />
                      </div>
                      {checkingNewUserEmail && <p className="mt-2 text-sm text-gray-500">Vérification...</p>}
                      {newUserEmailError && <p className="mt-2 text-sm text-rose-600">{newUserEmailError}</p>}
                    </div>
                  </div>
                </>
              )}

              {newUserError && (
                <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">
                  {newUserError}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setNewUserStep((prev) => Math.max(1, prev - 1))}
                  disabled={newUserStep === 1 || isCreatingUser}
                  className="flex-1 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Retour
                </button>
                {newUserStep < 4 && (
                  <button
                    onClick={() => {
                      if (newUserStep === 1 && isNewUserStep1Complete) {
                        setNewUserStep(2);
                      } else if (newUserStep === 2) {
                        setNewUserStep(3);
                      } else if (newUserStep === 3 && isNewUserStep3Complete) {
                        setNewUserStep(4);
                      }
                    }}
                    disabled={
                      (newUserStep === 1 && !isNewUserStep1Complete) ||
                      (newUserStep === 3 && !isNewUserStep3Complete) ||
                      isCreatingUser
                    }
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50"
                  >
                    Suivant
                  </button>
                )}
              </div>
              <button
                onClick={handleCreateUser}
                disabled={!isNewUserStep4Complete || isCreatingUser || checkingNewUserEmail}
                className="w-full py-3 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition disabled:opacity-50"
              >
                {isCreatingUser ? 'Création en cours...' : 'Créer l’utilisateur'}
              </button>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="w-full py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )
      }

      <AlertModal
        open={showSuccessModal}
        type="success"
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
        secondaryButton={
          showLoginButton
            ? {
              text: "Se connecter",
              onClick: () => {
                setShowSuccessModal(false);
                navigate("/");
              },
            }
            : undefined
        }
      />

      <AlertModal
        open={showErrorModal}
        type="error"
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />

      <AlertModal
        open={showConfirmModal}
        type="confirm"
        message={confirmMessage}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          confirmAction?.();
          setShowConfirmModal(false);
        }}
      />

      {cropperFile && (
        <ImageCropper
          file={cropperFile}
          onCropDone={handleCropDone}
          onCancel={() => { setCropperFile(null); setCropperIndex(null); }}
        />
      )}

      <AlertModal
        open={!!photoError}
        type="error"
        message={photoError}
        onClose={() => setPhotoError("")}
      />

    </div >
  );
};

export default Utilisateurs;