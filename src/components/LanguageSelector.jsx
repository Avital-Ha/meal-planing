import React from "react";
import { useLanguage } from "../context/LanguageContext";
import "./Styles/LanguageSelector.css";

export default function LanguageSelector() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div className="language-selector">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="he">עברית</option>
        <option value="ru">Русский</option>
      </select>
    </div>
  );
}