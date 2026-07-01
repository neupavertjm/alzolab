import React from "react";
import { Redo2, Trash2, Undo2 } from "lucide-react";
import { useCorpus } from "../context/CorpusContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import UiButton from "./ui/UiButton.jsx";

// Lista de documentos del corpus en sesión: selección para análisis, conteo y borrado.
export default function CorpusPanel() {
  const { entries, removeEntry, clearCorpus, undo, redo, canUndo, canRedo, stats, selectedIds, toggleSelected, selectAll, selectNone } = useCorpus();
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
      <p className="font-mono text-[11px] text-slate-400">
        {t(stats.count === 1 ? "{n} documento" : "{n} documentos", { n: stats.count })} ·{" "}
        {t("{c} caracteres", { c: stats.chars.toLocaleString(locale) })}
      </p>

      {entries.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          {t("Aún no hay documentos. Importa desde una fuente o carga el corpus de ejemplo.")}
        </p>
      ) : (
        <>
          <div className="mb-3 mt-2 flex items-center justify-between border-b border-line pb-2 dark:border-white/10">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t("{m} de {n} para analizar", { m: stats.selected, n: stats.count })}
            </span>
            <span className="flex gap-1 text-xs font-semibold">
              <button onClick={selectAll} className="rounded px-1.5 py-0.5 text-slate-500 transition hover:text-orange dark:text-slate-400">{t("Todos")}</button>
              <span className="text-slate-300">·</span>
              <button onClick={selectNone} className="rounded px-1.5 py-0.5 text-slate-500 transition hover:text-orange dark:text-slate-400">{t("Ninguno")}</button>
            </span>
          </div>
          <ul className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {entries.map((e) => {
              const checked = selectedIds.has(e.id);
              return (
                <li
                  key={e.id}
                  className={`group flex gap-2.5 rounded-lg border p-3 transition ${checked ? "border-line dark:border-white/10" : "border-transparent bg-paper/60 opacity-60 dark:bg-navy-950/40"}`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSelected(e.id)}
                    aria-label={t("Incluir en el análisis")}
                    className="mt-1 h-4 w-4 shrink-0 accent-orange"
                  />
                  <div className="min-w-0 flex-1">
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
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
