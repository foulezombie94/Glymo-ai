/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState("EN");

  const changeLanguage = (newLang) => {
    setLang(newLang);
    // Language preference stored in component state only
  };

  const toggleLanguage = () => {
    const langs = ['EN', 'FR', 'ES'];
    const currentIndex = langs.indexOf(lang);
    changeLanguage(langs[(currentIndex + 1) % langs.length]);
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
