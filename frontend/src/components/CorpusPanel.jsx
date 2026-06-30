import React from "react";
import { Redo2, Trash2, Undo2 } from "lucide-react";
import { useCorpus } from "../context/CorpusContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import UiButton from "./ui/UiButton.jsx";

// Lista de documentos del corpus en sesión, con conteo de caracteres y borrado.
export default function CorpusPanel() {
  const { entries, removeEntry, clearCorpus, undo, redo, canUndo, canRedo, stats } = useCorpus();
  const { t, locale } = useI18n();

  const histBtn = "rounded-lg p-1.5 text-slate-400 transition hover:bg-paper-100 hover:text-navy disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-white/5 dark:hover:text-slate-100";

  return (
    <section className="rounded-xl border border-line bg-white p-4 shadow-card dark:border-white/10 dark:bg-navy-900">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-brand text-base font-semibold text-navy dark:text-slate-100">
          {t("Corpus en sesión")}
        </h2>
        <div className="flex items-center gap-1">
          <button onClick={undo} disabled={!canUndo} title={t("Deshacer")} aria-label={t("Deshacer")} className={histBtn}>
            <Undo2 size={15} />
          </button>
          <button onClick={redo} disabled={!canRedo} title={t("Rehacer")} aria-label={t("Rehacer")} className={histBtn}>
            <Redo2 size={15} />
          </button>
          {entries.length > 0 && (
            <UiButton variant="ghost" size="sm" onClick={clearCorpus} leftIcon={<Trash2 size={14} />}>
              {t("Vaciar")}
            </UiButton>
          )}
        </div>
      </div>
      <p className="mb-3 font-mono text-[11px] text-slate-400">
        {t(stats.count === 1 ? "{n} documento" : "{n} documentos", { n: stats.count })} ·{" "}
        {t("{c} caracteres", { c: stats.chars.toLocaleString(locale) })}
      </p>

      {entries.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          {t("Aún no hay documentos. Importa desde una fuente o carga el corpus de ejemplo.")}
        </p>
      ) : (
        <ul className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
          {entries.map((e) => (
            <li
              key={e.id}
              className="group rounded-lg border border-line p-3 dark:border-white/10"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-block rounded bg-orange-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-dark dark:bg-orange/15 dark:text-orange">
                    {e.modo}
                  </span>
                  <p className="mt-1.5 truncate text-sm font-semibold text-navy dark:text-slate-100">
                    {e.url}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {e.texto.slice(0, 180)}…
                  </p>
                </div>
                <button
                  onClick={() => removeEntry(e.id)}
                  className="shrink-0 rounded p-1 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-900/30"
                  aria-label={t("Quitar documento")}
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="mt-1 text-right font-mono text-[10.5px] text-slate-400">
                {t("{c} car.", { c: e.texto.length.toLocaleString(locale) })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
