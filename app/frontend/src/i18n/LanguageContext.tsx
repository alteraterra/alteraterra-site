import { createContext, useContext, useCallback, type ReactNode } from 'react';

export type Language = 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

/* ─── Flat translation dictionary (English only) ─── */
import { translations } from './translations';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang: Language = 'en';

  const setLang = useCallback((_l: Language) => {
    // No-op: site is English only
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[key] ?? key;
    },
    []
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}