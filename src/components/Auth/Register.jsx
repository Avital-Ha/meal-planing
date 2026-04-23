import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../firebase/auth.js";
import { db } from "../../firebase/firestore.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import "../Styles/Register.css";
import LanguageSelector from "../LanguageSelector";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../context/LanguageContext";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!fullName || !email || !password) {
      setError(t("register.errorFillAll"));
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: fullName,
      });

      await sendEmailVerification(userCredential.user);

      await setDoc(doc(db, "users", userCredential.user.uid), {
        id: userCredential.user.uid,
        fullName,
        email,
        language,
        createdAt: new Date(),
      });

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
  };

  if (success) {
    return (
      <div className="register-container">
        <h2 className="Entrance-title">
          {t("register.successTitle")}
        </h2>

        <p className="register-text">
          {t("register.successText")}
        </p>

        <button
          className="register-button2"
          onClick={() => navigate("/login")}
        >
          {t("register.goToLogin")}
        </button>
      </div>
    );
  }

  return (
    <div className="register-container">
        <LanguageSelector />
      <h2 className="Register-title">
        {t("register.title")}
      </h2>

      <form className="register-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder={t("register.fullName")}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder={t("register.email")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder={t("register.password")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />

        <select
          value={language}
          onChange={(e) => changeLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="he">עברית</option>
          <option value="ru">Русский</option>
        </select>

        {error && (
          <p className="register-error">
            {error}
          </p>
        )}

        <button className="register-button" type="submit">
          {t("register.button")}
        </button>
      </form>
    </div>
  );
}