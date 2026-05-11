import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import en from "@/i18n/en.json";
import ru from "@/i18n/ru.json";

type Lang = "en" | "ru";
const translations: Record<Lang, Record<string, any>> = { en, ru };

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: any, path: string): string {
  return path.split(".").reduce((o, k) => o?.[k], obj) ?? path;
}

function detectDefaultLang(): Lang {
  const stored = localStorage.getItem("duomath-lang") as Lang | null;
  if (stored === "en" || stored === "ru") return stored;
  return navigator.language.startsWith("ru") ? "ru" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectDefaultLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem("duomath-lang", l);
  }, []);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    let str = getNestedValue(translations[lang], key);
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v));
      });
    }
    return str;
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
