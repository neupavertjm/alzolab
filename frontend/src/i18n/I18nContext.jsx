// i18n ligero y propio. El idioma controla TODO el laboratorio: la interfaz y
// el idioma de análisis que se envía a la API. La clave de traducción es el texto
// español; el modo inglés lo reemplaza con el diccionario `en`.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "./en.js";

const STORAGE_KEY = "alzolab-lang";
const I18nContext = createContext(null);

function interpolate(template, vars) {
  if (!vars) return template;
  return Object.keys(vars).reduce(
    (text, key) => text.split(`{${key}}`).join(String(vars[key])),
    template
  );
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "es" || stored === "en") return stored;
    } catch {
      /* ignore */
    }
    return navigator.language?.startsWith("en") ? "en" : "es";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);

  const t = useCallback(
    (key, vars) => {
      const template = lang === "en" ? en[key] ?? key : key;
      return interpolate(template, vars);
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, t, locale: lang === "en" ? "en-US" : "es-ES" }),
    [lang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n debe usarse dentro de <I18nProvider>");
  return ctx;
}
