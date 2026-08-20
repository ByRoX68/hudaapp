import React, { createContext, useContext, useCallback } from 'react';
import { useState, useEffect } from 'react';
import { LANGUAGES, DEFAULT_LANG, translate } from '@/lib/i18n';

const LanguageContext = createContext({ lang: DEFAULT_LANG, setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('hudaa-lang') || DEFAULT_LANG);

  useEffect(() => {
    const meta = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', meta.dir);
    document.body.classList.toggle('font-body', true);
    localStorage.setItem('hudaa-lang', lang);
  }, [lang]);

  const setLang = useCallback((l) => setLangState(l), []);
  const t = useCallback((key) => translate(lang, key), [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);