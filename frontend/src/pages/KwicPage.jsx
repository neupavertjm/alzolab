import React, { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import UiButton from "../components/ui/UiButton.jsx";
import { useCorpus } from "../context/CorpusContext.jsx";
import api, { apiErrorMessage } from "../lib/api.js";

const inputClass = "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-orange focus:outline-none dark:border-white/10 dark:bg-navy-950 dark:text-slate-100";

export default function KwicPage() {
  const { entries } = useCorpus();
  const [query, setQuery] = useState("");
  const [windowSize, setWindowSize] = useState(7);
  const [maxResults, setMaxResults] = useState(100);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = async (event) => {
    event.preventDefault();
    if (!query.trim()) return toast.warning("Escribe una palabra o frase.");
    setLoading(true);
    try {
      const { data } = await api.post("/concordance", {
        documents: entries.map((entry) => ({ id: entry.id, label: entry.url, text: entry.texto })),
        query: query.trim(), window: Number(windowSize), max_results: Number(maxResults),
      });
      setResults(data.results);
      if (!data.total) toast.info("No se encontraron concordancias.");
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <header><p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-orange">Fase 5 de 6</p><h2 className="mt-1 font-brand text-3xl font-semibold text-navy dark:text-slate-100">Concordancia KWIC</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Localiza una palabra o frase y compara cada uso dentro de su contexto.</p></header>
      <form onSubmit={search} className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-4 shadow-card dark:border-white/10 dark:bg-navy-900">
        <label className="min-w-56 flex-1 text-xs font-semibold text-slate-500 dark:text-slate-300"><span className="mb-1 block">Palabra o frase</span><input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} w-full`} placeholder="p. ej. lingüística de corpus" /></label>
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-300"><span className="mb-1 block">Ventana</span><input type="number" min="0" max="30" value={windowSize} onChange={(event) => setWindowSize(event.target.value)} className={`${inputClass} w-24`} /></label>
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-300"><span className="mb-1 block">Límite</span><input type="number" min="1" max="500" value={maxResults} onChange={(event) => setMaxResults(event.target.value)} className={`${inputClass} w-24`} /></label>
        <UiButton type="submit" loading={loading} leftIcon={<Search size={15} />}>Buscar</UiButton>
      </form>
      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-card dark:border-white/10 dark:bg-navy-900">
        {results === null ? <p className="py-20 text-center text-sm text-slate-400">Las concordancias aparecerán alineadas aquí.</p> : results.length === 0 ? <p className="py-20 text-center text-sm text-slate-400">Sin resultados para «{query}».</p> : <><div className="border-b border-line px-4 py-3 font-mono text-xs text-slate-400 dark:border-white/10">{results.length} concordancias</div><div className="max-h-[34rem] overflow-auto"><table className="w-full table-fixed font-mono text-xs"><thead className="sticky top-0 bg-navy text-white"><tr><th className="w-28 px-3 py-2 text-left">Documento</th><th className="px-3 py-2 text-right">Contexto izquierdo</th><th className="w-40 px-3 py-2 text-center text-orange">Nodo</th><th className="px-3 py-2 text-left">Contexto derecho</th></tr></thead><tbody>{results.map((row, index) => <tr key={`${row.document_id}-${index}`} className="border-b border-line dark:border-white/10"><td title={row.document_label} className="truncate px-3 py-2 text-slate-400">{row.document_label}</td><td className="truncate px-3 py-2 text-right text-slate-500 dark:text-slate-300">{row.left}</td><td className="px-3 py-2 text-center font-bold text-orange-dark dark:text-orange">{row.node}</td><td className="truncate px-3 py-2 text-slate-500 dark:text-slate-300">{row.right}</td></tr>)}</tbody></table></div></>}
      </section>
    </div>
  );
}
