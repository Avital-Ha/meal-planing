import React from "react";
import { useNavigate } from "react-router-dom";
import "./Styles/Landing.css";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="landing-container">
      <LanguageSelector />

      <h1 className="landing-title">{t("landing.title")}</h1>
      <p className="landing-text">{t("landing.text")}</p>

      <section className="landing-buttons">
        <button onClick={() => navigate("/register")}>
          {t("landing.signUp")}
        </button>
        <button onClick={() => navigate("/login")}>
          {t("landing.login")}
        </button>
      </section>
    </div>
  );
}