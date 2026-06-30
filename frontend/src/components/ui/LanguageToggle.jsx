import React from "react";
import { useI18n } from "../../i18n/I18nContext.jsx";

// Selector de idioma ES/EN. Cambia la interfaz y el idioma de análisis a la vez.
export default function LanguageToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div
      className="flex items-center rounded-lg border border-white/15 bg-white/5 p-0.5 text-xs font-bold"
      role="group"
      aria-label="Language"
    >
      {["es", "en"].map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          aria-pressed={lang === code}
          className={`rounded-md px-2 py-1 uppercase transition ${
            lang === code ? "bg-orange text-white" : "text-slate-300 hover:text-white"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
