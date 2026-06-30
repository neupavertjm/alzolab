import React, { useMemo, useState } from "react";
import { ArrowUpDown, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import UiButton from "../components/ui/UiButton.jsx";
import DownloadCsvButton from "../components/ui/DownloadCsvButton.jsx";
import { useCorpus } from "../context/CorpusContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import api, { apiErrorMessage } from "../lib/api.js";

const inputClass = "rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink focus:border-orange focus:outline-none dark:border-white/10 dark:bg-navy-950 dark:text-slate-100";

export default function TermsPage() {
  const { entries } = useCorpus();
  const { t, lang, locale } = useI18n();
  const [params, setParams] = useState({ min_words: 2, max_words: 5, min_frequency: 2, top_n: 100 });
  const [terms, setTerms] = useState([]);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sort, setSort] = useState({ key: "cvalue", direction: "desc" });

  const update = (key, value) => setParams((current) => ({ ...current, [key]: Number(value) }));
  const extract = async () => {
    if (params.min_words > params.max_words) return toast.warning(t("El mínimo de palabras no puede superar el máximo."));
    setLoading(true);
    try {
      const { data } = await api.post("/terminology", {
        documents: entries.map((entry) => ({ id: entry.id, text: entry.texto })), lang, ...params,
      });
      setTerms(data.terms); setCached(data.analysis_cached);
      toast.success(t("{n} términos candidatos obtenidos.", { n: data.terms.length }));
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setLoading(false); }
  };

  const sorted = useMemo(() => [...terms].sort((a, b) => {
    const factor = sort.direction === "asc" ? 1 : -1;
    return typeof a[sort.key] === "string" ? factor * a[sort.key].localeCompare(b[sort.key], locale) : factor * (a[sort.key] - b[sort.key]);
  }), [terms, sort, locale]);
  const changeSort = (key) => setSort((current) => ({ key, direction: current.key === key && current.direction === "desc" ? "asc" : "desc" }));

  return (
    <div className="space-y-6">
      <header><p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-orange">{t("Fase {n} de 6", { n: 4 })}</p><h2 className="mt-1 font-brand text-3xl font-semibold text-navy dark:text-slate-100">{t("Terminología")}</h2><p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">{t("Extrae secuencias nominales y ordénalas mediante C-value, ajustando la frecuencia de los términos que aparecen dentro de otros más largos.")}</p></header>
      <section className="flex flex-wrap items-end gap-3 rounded-xl border border-line bg-white p-4 shadow-card dark:border-white/10 dark:bg-navy-900">
        {[['min_words', t('Mín. palabras')], ['max_words', t('Máx. palabras')], ['min_frequency', t('Frecuencia mín.')], ['top_n', t('Máx. resultados')]].map(([key, label]) => <label key={key} className="text-xs font-semibold text-slate-500 dark:text-slate-300"><span className="mb-1 block">{label}</span><input type="number" min="1" max={key === 'top_n' ? 500 : 8} value={params[key]} onChange={(event) => update(key, event.target.value)} className={`${inputClass} w-28`} /></label>)}
        <UiButton onClick={extract} loading={loading} leftIcon={<Sparkles size={15} />}>{t("Extraer términos")}</UiButton>
        <DownloadCsvButton
          rows={sorted}
          headers={[{ key: "term", label: t("Término") }, { key: "cvalue", label: "C-value" }, { key: "frequency", label: t("Frecuencia") }, { key: "words", label: t("Palabras") }, { key: "nested_in", label: t("Anidado en") }]}
          filename="alzolab-terminologia.csv"
        />
        {terms.length > 0 && <span className="pb-2 font-mono text-[11px] text-slate-400">{cached ? t("análisis reutilizado de caché") : t("análisis calculado")}</span>}
      </section>

      <section className="overflow-hidden rounded-xl border border-line bg-white shadow-card dark:border-white/10 dark:bg-navy-900">
        {terms.length === 0 ? <div className="py-20 text-center"><Search className="mx-auto mb-3 text-slate-300" /><p className="text-sm text-slate-400">{t("Configura los parámetros y ejecuta la extracción.")}</p></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-navy text-white"><tr>{[['term', t('Término')], ['cvalue', t('C-value')], ['frequency', t('Frecuencia')], ['words', t('Palabras')], ['nested_in', t('Anidado en')]].map(([key, label]) => <th key={key} className="px-4 py-3"><button onClick={() => changeSort(key)} className="flex items-center gap-1 font-semibold">{label}<ArrowUpDown size={12} /></button></th>)}</tr></thead><tbody>{sorted.map((term, index) => <tr key={term.term} className="border-b border-line last:border-0 dark:border-white/10"><td className="px-4 py-3"><span className="mr-3 font-mono text-xs text-slate-400">{index + 1}</span><strong className="text-navy dark:text-slate-100">{term.term}</strong></td><td className="px-4 py-3 font-mono font-bold text-orange">{term.cvalue.toFixed(3)}</td><td className="px-4 py-3 font-mono">{term.frequency}</td><td className="px-4 py-3 font-mono">{term.words}</td><td className="px-4 py-3 font-mono">{term.nested_in}</td></tr>)}</tbody></table></div>}
      </section>
    </div>
  );
}
