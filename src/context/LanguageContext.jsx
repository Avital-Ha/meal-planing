import { createContext, useContext, useState, useEffect } from "react";
import i18n from "../i18n";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("language") || "en";
    setLanguage(savedLang);
    i18n.changeLanguage(savedLang);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);