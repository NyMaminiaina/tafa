import React, { useState, useEffect } from 'react';
import { changePassword, changeEmail, getUserInfo } from '../api/api';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from 'react-icons/fa';
import Navbar from "../components/Navbar";
import { API_URL } from "../utils/api_url";
import { Link,  } from 'react-router-dom';
import {
    ArrowLeft
  } from "lucide-react";






const ParametreCompte: React.FC = () => {
    // Email state
    const [currentEmail, setCurrentEmail] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);
    const [emailMessage, setEmailMessage] = useState({ type: '', text: '' });
    const [showEmailForm, setShowEmailForm] = useState(false);

    // Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

    //name


// Identity state
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [showProfileForm, setShowProfileForm] = useState(false);
const [isSaving, setIsSaving] = useState(false); // Pour l'état de chargement

useEffect(() => {
    const fetchUserInfo = async () => {
        try {
            const data = await getUserInfo();
            if (data.email) setCurrentEmail(data.email);
            
            // On remplit le prénom et le nom
            setFirstName(data.firstname || data.first_name || '');
            setLastName(data.name || '');
        } catch (error) {
            console.error('Erreur lors de la récupération des infos:', error);
        }
    };
    fetchUserInfo();
}, []);

const handleUpdateProfile = async () => {
    setIsSaving(true);
    const token = localStorage.getItem("token");

    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: "PUT",
            headers: { 
                Authorization: `Bearer ${token}`, 
                "Content-Type": "application/json",
                Accept: "application/json" 
            },
            body: JSON.stringify({ 

                firstname: firstName, 
                name: lastName 
            })
        });

        if (response.ok) {
            setProfileMessage({
                type: 'success',
                text: 'Profil mis à jour avec succès.'
            });
            setShowProfileForm(false);
        } else {
            setProfileMessage({
                type: 'error',
                text: 'Erreur lors de la mise à jour'
            });
        }
    } catch (err) {
        console.error("Erreur:", err);
    } finally {
        setIsSaving(false);
    }
};

    const handleEmailChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailLoading(true);
        setEmailMessage({ type: '', text: '' });
        try {
            const response = await changeEmail({ new_email: newEmail, password: emailPassword });
            if (response.success) {
                setEmailMessage({ type: 'success', text: response.message });
                setCurrentEmail(newEmail);
                setNewEmail('');
                setEmailPassword('');
                setShowEmailForm(false);
            } else {
                setEmailMessage({ type: 'error', text: response.message || 'Erreur lors du changement' });
            }
        } catch (error) {
            setEmailMessage({ type: 'error', text: 'Erreur de connexion' });
        } finally {
            setEmailLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
            return;
        }
        setPasswordLoading(true);
        try {
            const response = await changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });
            if (response.success) {
                setPasswordMessage({ type: 'success', text: response.message });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowPasswordForm(false);
            } else {
                setPasswordMessage({ type: 'error', text: response.message || 'Erreur lors du changement' });
            }
        } catch (error) {
            setPasswordMessage({ type: 'error', text: 'Erreur de connexion' });
        } finally {
            setPasswordLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
          <Navbar />
      
          <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-[110px] pb-16">
            {/* Header */}
            <div className="mb-8">
              <Link to="/modifier-profil/parametres">
                <button
                  className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm border border-slate-200 bg-white hover:scale-105 transition"
                  style={{ color: "var(--color-primary)" }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </Link>
      
              <div className="mt-6">
                <h2 className="text-3xl font-extrabold text-slate-900">
                  Paramètres du compte
                </h2>
                <p className="text-slate-500 mt-2">
                  Gérez vos informations personnelles, votre email et votre sécurité.
                </p>
              </div>
            </div>
      
            <div className="space-y-6">
              {/* INFORMATIONS PERSONNELLES */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center text-xl">
                    👤
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Informations personnelles
                    </h3>
                    <p className="text-sm text-slate-500">
                      Modifiez votre prénom et votre nom.
                    </p>
                  </div>
                </div>
      
                {profileMessage.text && (
                    <div
                        className={`mb-5 p-4 rounded-2xl font-medium ${
                        profileMessage.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}
                    >
                        {profileMessage.text}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">
                      Prénom
                    </p>
                    <p className="text-slate-900 font-semibold mt-1">
                      {firstName || "Non renseigné"}
                    </p>
                  </div>
      
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">
                      Nom
                    </p>
                    <p className="text-slate-900 font-semibold mt-1">
                      {lastName || "Non renseigné"}
                    </p>
                  </div>
                </div>
      
                {!showProfileForm ? (
                  <button
                    onClick={() => setShowProfileForm(true)}
                    style={{ backgroundColor: "var(--color-primary)" }}
                    className="w-full p-4 rounded-2xl border border-dashed border-slate-300 hover:border-pink-400 hover:bg-pink-50 text-slate-700 font-semibold transition"
                  >
                    Modifier le profil
                  </button>
                ) : (
                  <div className="space-y-5 pt-5 border-t border-slate-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Nouveau prénom
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Ex: Jean"
                          className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition"
                        />
                      </div>
      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Nouveau nom
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Ex: Dupont"
                          className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition"
                        />
                      </div>
                    </div>
      
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setShowProfileForm(false)}
                        className="flex-1 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition"
                      >
                        Annuler
                      </button>
      
                      <button
                        onClick={handleUpdateProfile}
                        style={{ backgroundColor: "var(--color-primary)" }}
                        disabled={isSaving}
                        className="flex-1 p-4 rounded-2xl hover:bg-pink-600 text-white font-semibold shadow-lg shadow-pink-100 disabled:opacity-50 transition"
                      >
                        {isSaving ? "Enregistrement..." : "Enregistrer"}
                      </button>
                    </div>
                  </div>
                )}
              </section>
      
              {/* EMAIL */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Adresse email
                    </h3>
                    <p className="text-sm text-slate-500">
                      Modifiez votre adresse email de connexion.
                    </p>
                  </div>
                </div>
      
                <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wide">
                    Email actuel
                  </p>
                  <p className="text-slate-900 font-semibold mt-1 break-all">
                    {currentEmail || "Chargement..."}
                  </p>
                </div>
      
                {emailMessage.text && (
                  <div
                    className={`mb-5 p-4 rounded-2xl font-medium ${
                      emailMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {emailMessage.text}
                  </div>
                )}
      
                {!showEmailForm ? (
                  <button
                    onClick={() => setShowEmailForm(true)}
                    style={{ backgroundColor: "var(--color-primary)" }}
                    className="w-full p-4 rounded-2xl border border-dashed border-slate-300 hover:border-pink-400 hover:bg-pink-50 text-slate-700 font-semibold transition"
                  >
                    Modifier l’adresse email
                  </button>
                ) : (
                  <form onSubmit={handleEmailChange} className="space-y-4">
                    <input
                      type="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Nouvel email"
                      required
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition"
                    />
      
                    <input
                      type="password"
                      value={emailPassword}
                      onChange={(e) => setEmailPassword(e.target.value)}
                      placeholder="Mot de passe pour confirmer"
                      required
                      className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition"
                    />
      
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setShowEmailForm(false)}
                        className="flex-1 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition"
                      >
                        Annuler
                      </button>
      
                      <button
                        type="submit"
                        disabled={emailLoading}
                        style={{ backgroundColor: "var(--color-primary)" }}
                        className="flex-1 p-4 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg shadow-pink-100 disabled:opacity-50 transition"
                      >
                        {emailLoading ? "Chargement..." : "Confirmer"}
                      </button>
                    </div>
                  </form>
                )}
              </section>
      
              {/* MOT DE PASSE */}
              <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-500 flex items-center justify-center">
                    <FaLock />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Sécurité du mot de passe
                    </h3>
                    <p className="text-sm text-slate-500">
                      Changez votre mot de passe régulièrement.
                    </p>
                  </div>
                </div>
      
                {passwordMessage.text && (
                  <div
                    className={`mb-5 p-4 rounded-2xl font-medium ${
                      passwordMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-red-50 text-red-700 border border-red-100"
                    }`}
                  >
                    {passwordMessage.text}
                  </div>
                )}
      
                {!showPasswordForm ? (
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    style={{ backgroundColor: "var(--color-primary)" }}
                    className="w-full p-4 rounded-2xl border border-dashed border-slate-300 hover:border-pink-400 hover:bg-pink-50 text-slate-700 font-semibold transition"
                  >
                    Changer le mot de passe
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {[
                      {
                        value: currentPassword,
                        setValue: setCurrentPassword,
                        show: showCurrentPassword,
                        setShow: setShowCurrentPassword,
                        placeholder: "Mot de passe actuel",
                      },
                      {
                        value: newPassword,
                        setValue: setNewPassword,
                        show: showNewPassword,
                        setShow: setShowNewPassword,
                        placeholder: "Nouveau mot de passe",
                      },
                      {
                        value: confirmPassword,
                        setValue: setConfirmPassword,
                        show: showConfirmPassword,
                        setShow: setShowConfirmPassword,
                        placeholder: "Confirmer le nouveau mot de passe",
                      },
                    ].map((field, index) => (
                      <div className="relative" key={index}>
                        <input
                          type={field.show ? "text" : "password"}
                          value={field.value}
                          onChange={(e) => field.setValue(e.target.value)}
                          placeholder={field.placeholder}
                          required
                          className="w-full p-4 pr-12 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition"
                        />
      
                        <button
                          type="button"
                          onClick={() => field.setShow(!field.show)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                        >
                          {field.show ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    ))}
      
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(false)}
                        className="flex-1 p-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold transition"
                      >
                        Annuler
                      </button>
      
                      <button
                        type="submit"
                        style={{ backgroundColor: "var(--color-primary)" }}
                        disabled={passwordLoading}
                        className="flex-1 p-4 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-semibold shadow-lg shadow-pink-100 disabled:opacity-50 transition"
                      >
                        {passwordLoading ? "Chargement..." : "Sauvegarder"}
                      </button>
                    </div>
                  </form>
                )}
              </section>
            </div>
          </main>
        </div>
      );
};

export default ParametreCompte;