import React from "react";
import { motion } from "motion/react";
import { Sun, Moon } from "lucide-react";
import { useI18n } from "../../i18n/I18nContext.jsx";

export default function ThemeToggle({ dark, toggle }) {
  const { t } = useI18n();
  return (
    <button
      onClick={toggle}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 transition hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
      aria-label={dark ? t("Cambiar a modo claro") : t("Cambiar a modo oscuro")}
    >
      <motion.div
        key={dark ? "moon" : "sun"}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {dark ? (
          <Sun size={16} className="text-secondary" />
        ) : (
          <Moon size={16} className="text-slate-600" />
        )}
      </motion.div>
    </button>
  );
}
