"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import t, { type Lang, type TKeys } from "./translations";

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (key: TKeys) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("reshme_lang") as Lang | null;
    if (saved === "en" || saved === "kn") setLangState(saved);
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("reshme_lang", l);
  }

  function tr(key: TKeys): string {
    return t[lang][key];
  }

  return (
    <LangContext.Provider value={{ lang, setLang, tr }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside LangProvider");
  return ctx;
}
