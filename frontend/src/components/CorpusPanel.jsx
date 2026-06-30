import React from "react";
import { Trash2 } from "lucide-react";
import { useCorpus } from "../context/CorpusContext.jsx";
import UiButton from "./ui/UiButton.jsx";

// Lista de documentos del corpus en sesión, con conteo de caracteres y borrado.
export default function CorpusPanel() {
  const { entries, removeEntry, clearCorpus, stats } = useCorpus();

  return (
    <section className="rounded-xl border border-line bg-white p-4 shadow-card dark:border-white/10 dark:bg-navy-900">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-brand text-base font-semibold text-navy dark:text-slate-100">
          Corpus en sesión
        </h2>
        {entries.length > 0 && (
          <UiButton variant="ghost" size="sm" onClick={clearCorpus} leftIcon={<Trash2 size={14} />}>
            Vaciar
          </UiButton>
        )}
      </div>
      <p className="mb-3 font-mono text-[11px] text-slate-400">
        {stats.count} documento{stats.count !== 1 && "s"} ·{" "}
        {stats.chars.toLocaleString("es")} caracteres
      </p>

      {entries.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-400">
          Aún no hay documentos. Importa desde una fuente o carga el corpus de ejemplo.
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
                  aria-label="Quitar documento"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <p className="mt-1 text-right font-mono text-[10.5px] text-slate-400">
                {e.texto.length.toLocaleString("es")} car.
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
