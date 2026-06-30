import React from "react";
import { UserRound } from "lucide-react";
import { toast } from "sonner";
import { STAGES } from "../config/stages.js";
import { useCorpus } from "../context/CorpusContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import ThemeToggle from "./ui/ThemeToggle.jsx";
import LanguageToggle from "./ui/LanguageToggle.jsx";

// Wordmark de marca con el tratamiento "pivote": la sílaba «la» en naranja
// revela el apellido (Alzo·la) y «lab» a la vez.
function Wordmark() {
  return (
    <span className="text-[19px] font-extrabold tracking-tight text-white">
      Alzo<span className="text-orange">la</span>b
    </span>
  );
}

// Barra de proceso horizontal: Importar es la puerta; el resto se desbloquea
// con ≥1 documento y es libremente navegable (sin orden impuesto, sin números).
export default function AppShell({ active, onSelect, dark, toggleTheme, children }) {
  const { stats } = useCorpus();
  const { t } = useI18n();
  const hasCorpus = stats.count > 0;

  const handleClick = (stage) => {
    if (stage.entry) return onSelect(stage.id);
    if (!hasCorpus) return; // bloqueada hasta tener corpus
    if (!stage.ready) return toast.info(t("«{label}» — en construcción.", { label: t(stage.label) }));
    onSelect(stage.id);
  };

  const stepClasses = (stage, isActive) => {
    const locked = !stage.entry && !hasCorpus;
    return [
      "relative flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-2.5 pt-1 text-sm font-semibold transition",
      isActive ? "border-orange text-white" : "border-transparent",
      locked
        ? "cursor-not-allowed text-slate-500/70"
        : stage.entry
          ? "text-slate-100"
          : "text-slate-300 hover:text-white",
    ].join(" ");
  };

  const dotClasses = (stage, isActive) => {
    const locked = !stage.entry && !hasCorpus;
    if (isActive)
      return "h-2 w-2 rounded-full bg-orange shadow-[0_0_0_4px_rgba(239,126,50,0.18)]";
    if (locked) return "h-2 w-2 rounded-full border-[1.5px] border-white/15";
    if (stage.entry) return "h-2 w-2 rounded-full border-[1.5px] border-orange";
    return "h-2 w-2 rounded-full border-[1.5px] border-white/30";
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <img src="/logo.svg" alt="AlzoLab" className="h-8 w-8 rounded-lg" />
            <Wordmark />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-xs text-slate-300 sm:inline">
              {t("corpus")} · <span className="text-white">{stats.count} {t("docs")}</span> ·{" "}
              <span className="text-white">{stats.chars.toLocaleString("es")}</span> {t("car.")}
            </span>
            <button
              onClick={() => onSelect("about")}
              className={`flex items-center gap-1.5 text-xs font-semibold transition hover:text-orange ${active === "about" ? "text-orange" : "text-slate-300"}`}
              aria-label={t("Sobre el creador y el proyecto")}
            >
              <UserRound size={15} />
              <span className="hidden sm:inline">{t("El proyecto")}</span>
            </button>
            <LanguageToggle />
            <ThemeToggle dark={dark} toggle={toggleTheme} />
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl items-center overflow-x-auto px-5">
          {STAGES.map((stage, i) => {
            const isActive = stage.id === active;
            const locked = !stage.entry && !hasCorpus;
            return (
              <React.Fragment key={stage.id}>
                {i > 0 && (
                  <span className="mx-3 select-none text-white/25" aria-hidden>
                    ›
                  </span>
                )}
                <button
                  onClick={() => handleClick(stage)}
                  disabled={locked}
                  title={locked ? t("Necesita ≥1 documento en el corpus") : stage.ready ? t(stage.label) : t("En construcción")}
                  className={stepClasses(stage, isActive)}
                >
                  <span className={dotClasses(stage, isActive)} />
                  {t(stage.label)}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-7">{children}</main>

      <footer className="border-t border-line py-4 text-center text-xs text-slate-400 dark:border-white/10">
        <button onClick={() => onSelect("about")} className="transition hover:text-orange">
          AlzoLab · Juan Manuel Neupavert Alzola · MIT
        </button>
      </footer>
    </div>
  );
}
