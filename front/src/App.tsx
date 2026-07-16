import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

import ProfileEditPage from './components/profil/ProfileEditPage';
import RecherchePage from './components/recherche/RecherchePage';

import Filtrer from './components/recherche/Filtrer';
import Profil from './components/profil/Profil';
import Home from './pages/Home';
import Messages from './pages/Messages';
import Register from './pages/Register';
import Login from './pages/Login';

import Likes from './pages/Likes';
import Subscription from './pages/Subscription';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import PrivacyPolicy from './pages/PrivacyPolicy';
import LoginComponent from "./admin/LoginComponent";
import Accueil from "./admin/Accueil";
import ParametreCompte from './pages/ParametreCompte';
import PaymentStatus from './pages/PaymentStatus';



function App() {
  return (
    <ThemeProvider>
      <Routes>
        {/* <Route path="/profil" element={<Profil />} />  */}
        <Route path="/profil/:id" element={<Profil />} />

        {/* modifier profil */}
        <Route path="/modifier-profil" element={<Navigate to="/modifier-profil/infos" replace />} />
        <Route path="/modifier-profil/infos" element={<ProfileEditPage />} />
        <Route path="/modifier-profil/photos" element={<ProfileEditPage />} />
        <Route path="/modifier-profil/parametres" element={<ProfileEditPage />} />
        <Route path="/confidentialite" element={<PrivacyPolicy />} />
        <Route path="/compte" element={<ParametreCompte />} />


        <Route path="/recherche" element={<RecherchePage />} />
        <Route path="/filtres" element={<Filtrer />} />

        {/*  */}
        <Route path="/" element={<Login />} />
        <Route path="/inscription" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/welcome" element={<Home />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/likes" element={<Likes />} />
        <Route path="/subscription" element={<Subscription />} />
        <Route path="/payment-status" element={<PaymentStatus />} />

        <Route path="/admin" element={<LoginComponent />} />
        <Route path="/admin/accueil" element={<Accueil />} />
      </Routes>
    </ThemeProvider>
  )
}

export default App
