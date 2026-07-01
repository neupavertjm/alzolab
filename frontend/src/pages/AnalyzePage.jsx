import React, { useState } from "react";
import { BarChart3, Database, Languages, Play, Tags } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import UiButton from "../components/ui/UiButton.jsx";
import DownloadCsvButton from "../components/ui/DownloadCsvButton.jsx";
import { useCorpus } from "../context/CorpusContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import api, { apiErrorMessage } from "../lib/api.js";

const POS_NAMES = {
  ADJ: "Adjetivo", ADP: "Adposición", ADV: "Adverbio", AUX: "Auxiliar",
  CCONJ: "Conjunción", DET: "Determinante", INTJ: "Interjección", NOUN: "Nombre",
  NUM: "Número", PART: "Partícula", PRON: "Pronombre", PROPN: "Nombre propio",
  PUNCT: "Puntuación", SCONJ: "Conj. subord.", SYM: "Símbolo", VERB: "Verbo", X: "Otro",
};

function MetricCard({ label, value, note }) {
  return <div className="rounded-xl border border-line bg-white p-4 shadow-card dark:border-white/10 dark:bg-navy-900"><p className="font-mono text-[11px] uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 font-brand text-3xl font-semibold text-navy dark:text-white">{value}</p><p className="mt-1 text-xs text-slate-400">{note}</p></div>;
}

function Ranking({ title, icon: Icon, items, action }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-card dark:border-white/10 dark:bg-navy-900">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 font-brand text-lg font-semibold text-navy dark:text-slate-100"><Icon size={17} className="text-orange" />{title}</h3>
        {action}
      </div>
      <div className="max-h-72 overflow-y-auto">
        {items.map((item, index) => <div key={item.label} className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 border-b border-line py-2 text-sm last:border-0 dark:border-white/10"><span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, "0")}</span><span className="truncate font-medium text-navy dark:text-slate-200">{item.label}</span><span className="rounded bg-orange-soft px-2 py-0.5 font-mono text-xs font-bold text-orange-dark dark:bg-orange/10 dark:text-orange">{item.count}</span></div>)}
      </div>
    </section>
  );
}

export default function AnalyzePage() {
  const { entries, analysis, setAnalysis } = useCorpus();
  const { t, lang, setLang, locale } = useI18n();
  const [loading, setLoading] = useState(false);
  const [ngramSize, setNgramSize] = useState(2);
  const langName = t(lang === "es" ? "español" : "inglés");
  const nameOf = (code) => t(code === "es" ? "español" : "inglés");

  const runAnalysis = async (analysisLang = lang) => {
    setLoading(true);
    try {
      const { data } = await api.post("/analyze", { documents: entries.map((entry) => ({ id: entry.id, text: entry.texto })), lang: analysisLang });
      setAnalysis(data);
      toast.success(data.cached ? t("Análisis recuperado de la caché.") : t("Corpus analizado correctamente."));
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setLoading(false); }
  };

  // Cambia el idioma del laboratorio al detectado y reanaliza con él.
  const switchAndReanalyze = (detected) => { setLang(detected); runAnalysis(detected); };

  const chartData = (analysis?.pos_distribution || []).map((item) => ({ ...item, name: t(POS_NAMES[item.label] || item.label) }));
  const ngrams = ngramSize === 2 ? analysis?.bigrams || [] : analysis?.trigrams || [];

  if (!analysis) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-line bg-white p-8 text-center shadow-card dark:border-white/10 dark:bg-navy-900">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-soft text-orange-dark dark:bg-orange/10 dark:text-orange"><BarChart3 size={28} /></div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-orange">{t("Fase {n} de 6", { n: 3 })}</p>
        <h2 className="mt-2 font-brand text-3xl font-semibold text-navy dark:text-slate-100">{t("Analizar el corpus")}</h2>
        <p className="mx-auto mb-6 mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">{t("spaCy etiquetará los textos en {lang} y calculará categorías gramaticales, lemas, n-gramas y métricas léxicas. El resultado queda asociado al contenido exacto del corpus.", { lang: langName })}</p>
        <div className="mb-6 font-mono text-xs text-slate-400">{t("{n} documentos · {c} caracteres", { n: entries.length, c: entries.reduce((sum, entry) => sum + entry.texto.length, 0).toLocaleString(locale) })}</div>
        <UiButton onClick={() => runAnalysis()} loading={loading} leftIcon={<Play size={16} />}>{t("Ejecutar análisis")}</UiButton>
      </section>
    );
  }

  const mismatch = analysis.detected_lang && analysis.detected_lang !== lang;

  return (
    <div className="space-y-6">
      {mismatch && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange/40 bg-orange-soft p-4 dark:bg-orange/10">
          <p className="flex items-center gap-2 text-sm text-orange-dark dark:text-orange">
            <Languages size={16} className="shrink-0" />
            {t("El corpus parece estar en {lang}, pero el análisis se hizo en {current}.", { lang: nameOf(analysis.detected_lang), current: nameOf(lang) })}
          </p>
          <UiButton size="sm" onClick={() => switchAndReanalyze(analysis.detected_lang)} leftIcon={<Languages size={14} />}>
            {t("Analizar en {lang}", { lang: nameOf(analysis.detected_lang) })}
          </UiButton>
        </div>
      )}
      <header className="flex flex-wrap items-end justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="font-brand text-3xl font-semibold text-navy dark:text-slate-100">{t("Análisis")}</h2>{analysis.cached && <span className="rounded-full bg-emerald-100 px-2 py-1 font-mono text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{t("caché")}</span>}</div><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("Modelo {lang} · hash {hash}", { lang: langName, hash: analysis.corpus_hash.slice(0, 10) })}</p></div><UiButton variant="secondary" onClick={() => runAnalysis()} loading={loading} leftIcon={<Play size={15} />}>{t("Recalcular")}</UiButton></header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label={t("Palabras")} value={analysis.metrics.words.toLocaleString(locale)} note={t("tokens alfabéticos")} />
        <MetricCard label={t("Tipos")} value={analysis.metrics.types.toLocaleString(locale)} note={t("formas distintas")} />
        <MetricCard label={t("TTR")} value={analysis.metrics.ttr.toFixed(3)} note={t("tipos / palabras")} />
        <MetricCard label={t("Hapax")} value={analysis.metrics.hapax.toLocaleString(locale)} note={t("aparecen una vez")} />
        <MetricCard label={t("Densidad")} value={`${(analysis.metrics.lexical_density * 100).toFixed(1)}%`} note={t("palabras léxicas")} />
      </div>

      <section className="rounded-xl border border-line bg-white p-5 shadow-card dark:border-white/10 dark:bg-navy-900">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-brand text-lg font-semibold text-navy dark:text-slate-100"><BarChart3 size={17} className="text-orange" />{t("Distribución de categorías POS")}</h3>
          <DownloadCsvButton rows={chartData} headers={[{ key: "name", label: "POS" }, { key: "count", label: t("Tokens") }, { key: "percentage", label: "%" }]} filename="alzolab-pos.csv" />
        </div>
        <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ left: 0, right: 10, bottom: 45 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3ddd1" /><XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip formatter={(value, _name, props) => [`${value} (${(props.payload.percentage * 100).toFixed(1)}%)`, t("Tokens")]} /><Bar dataKey="count" fill="#EF7E32" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Ranking title={t("Lemas frecuentes (sin stopwords)")} icon={Tags} items={analysis.lemmas} action={<DownloadCsvButton rows={analysis.lemmas} headers={[{ key: "label", label: t("Lema") }, { key: "count", label: t("Frecuencia") }]} filename="alzolab-lemas.csv" />} />
        <section className="rounded-xl border border-line bg-white p-5 shadow-card dark:border-white/10 dark:bg-navy-900">
          <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 font-brand text-lg font-semibold text-navy dark:text-slate-100"><Database size={17} className="text-orange" />{t("N-gramas")}</h3><div className="flex items-center gap-2"><DownloadCsvButton rows={ngrams} headers={[{ key: "label", label: t("N-grama") }, { key: "count", label: t("Frecuencia") }]} filename="alzolab-ngramas.csv" /><div className="rounded-lg border border-line p-1 text-xs dark:border-white/10">{[2, 3].map((size) => <button key={size} onClick={() => setNgramSize(size)} className={`rounded px-2 py-1 font-semibold ${ngramSize === size ? "bg-navy text-white" : "text-slate-400"}`}>{size === 2 ? t("Bigramas") : t("Trigramas")}</button>)}</div></div></div>
          <div className="max-h-72 overflow-y-auto">{ngrams.map((item, index) => <div key={item.label} className="grid grid-cols-[2rem_1fr_auto] gap-2 border-b border-line py-2 text-sm last:border-0 dark:border-white/10"><span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, "0")}</span><span className="font-mono text-xs text-navy dark:text-slate-200">{item.label}</span><span className="font-mono text-xs font-bold text-orange">{item.count}</span></div>)}</div>
        </section>
      </div>
    </div>
  );
}
