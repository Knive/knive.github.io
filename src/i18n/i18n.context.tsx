import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import { en } from './translations/en';
import { fr } from './translations/fr';
import type { Language, Translations } from './i18n.types';

interface I18nContextType {
    lang: Language;
    t: Translations;
    setLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = 'knive-lang';

const getInitialLanguage = (): Language => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved === 'en' || saved === 'fr') return saved;

    // Fallback to browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'fr' ? 'fr' : 'en';
};

export const I18nProvider = ({ children }: { children: ReactNode }) => {
    const [lang, setLang] = useState<Language>(getInitialLanguage);

    const setLanguage = useCallback((newLang: Language) => {
        setLang(newLang);
        localStorage.setItem(STORAGE_KEY, newLang);
        document.documentElement.lang = newLang;
    }, []);

    const t = useMemo(() => (lang === 'fr' ? fr : en), [lang]);

    const value = useMemo(() => ({ lang, t, setLanguage }), [lang, t, setLanguage]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) throw new Error('useI18n must be used within I18nProvider');
    return context;
};
