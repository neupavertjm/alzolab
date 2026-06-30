import React, { useState } from "react";
import { BarChart3, Database, Play, Tags } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import UiButton from "../components/ui/UiButton.jsx";
import { useCorpus } from "../context/CorpusContext.jsx";
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

function Ranking({ title, icon: Icon, items }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-card dark:border-white/10 dark:bg-navy-900">
      <h3 className="mb-3 flex items-center gap-2 font-brand text-lg font-semibold text-navy dark:text-slate-100"><Icon size={17} className="text-orange" />{title}</h3>
      <div className="max-h-72 overflow-y-auto">
        {items.map((item, index) => <div key={item.label} className="grid grid-cols-[2rem_1fr_auto] items-center gap-2 border-b border-line py-2 text-sm last:border-0 dark:border-white/10"><span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, "0")}</span><span className="truncate font-medium text-navy dark:text-slate-200">{item.label}</span><span className="rounded bg-orange-soft px-2 py-0.5 font-mono text-xs font-bold text-orange-dark dark:bg-orange/10 dark:text-orange">{item.count}</span></div>)}
      </div>
    </section>
  );
}

export default function AnalyzePage() {
  const { entries, analysis, setAnalysis } = useCorpus();
  const [loading, setLoading] = useState(false);
  const [ngramSize, setNgramSize] = useState(2);

  const runAnalysis = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/analyze", { documents: entries.map((entry) => ({ id: entry.id, text: entry.texto })) });
      setAnalysis(data);
      toast.success(data.cached ? "Análisis recuperado de la caché." : "Corpus analizado correctamente.");
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setLoading(false); }
  };

  const chartData = (analysis?.pos_distribution || []).map((item) => ({ ...item, name: POS_NAMES[item.label] || item.label }));
  const ngrams = ngramSize === 2 ? analysis?.bigrams || [] : analysis?.trigrams || [];

  if (!analysis) {
    return (
      <section className="mx-auto max-w-3xl rounded-xl border border-line bg-white p-8 text-center shadow-card dark:border-white/10 dark:bg-navy-900">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-soft text-orange-dark dark:bg-orange/10 dark:text-orange"><BarChart3 size={28} /></div>
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-orange">Fase 3 de 6</p>
        <h2 className="mt-2 font-brand text-3xl font-semibold text-navy dark:text-slate-100">Analizar el corpus</h2>
        <p className="mx-auto mb-6 mt-2 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">spaCy etiquetará los textos en español y calculará categorías gramaticales, lemas, n-gramas y métricas léxicas. El resultado queda asociado al contenido exacto del corpus.</p>
        <div className="mb-6 font-mono text-xs text-slate-400">{entries.length} documentos · {entries.reduce((sum, entry) => sum + entry.texto.length, 0).toLocaleString("es")} caracteres</div>
        <UiButton onClick={runAnalysis} loading={loading} leftIcon={<Play size={16} />}>Ejecutar análisis</UiButton>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="font-brand text-3xl font-semibold text-navy dark:text-slate-100">Análisis</h2>{analysis.cached && <span className="rounded-full bg-emerald-100 px-2 py-1 font-mono text-[10px] font-bold uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">caché</span>}</div><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Modelo español · hash <span className="font-mono text-xs">{analysis.corpus_hash.slice(0, 10)}</span></p></div><UiButton variant="secondary" onClick={runAnalysis} loading={loading} leftIcon={<Play size={15} />}>Recalcular</UiButton></header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Palabras" value={analysis.metrics.words.toLocaleString("es")} note="tokens alfabéticos" />
        <MetricCard label="Tipos" value={analysis.metrics.types.toLocaleString("es")} note="formas distintas" />
        <MetricCard label="TTR" value={analysis.metrics.ttr.toFixed(3)} note="tipos / palabras" />
        <MetricCard label="Hapax" value={analysis.metrics.hapax.toLocaleString("es")} note="aparecen una vez" />
        <MetricCard label="Densidad" value={`${(analysis.metrics.lexical_density * 100).toFixed(1)}%`} note="palabras léxicas" />
      </div>

      <section className="rounded-xl border border-line bg-white p-5 shadow-card dark:border-white/10 dark:bg-navy-900">
        <h3 className="mb-4 flex items-center gap-2 font-brand text-lg font-semibold text-navy dark:text-slate-100"><BarChart3 size={17} className="text-orange" />Distribución de categorías POS</h3>
        <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData} margin={{ left: 0, right: 10, bottom: 45 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3ddd1" /><XAxis dataKey="name" angle={-35} textAnchor="end" interval={0} tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip formatter={(value, _name, props) => [`${value} (${(props.payload.percentage * 100).toFixed(1)}%)`, "Tokens"]} /><Bar dataKey="count" fill="#EF7E32" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Ranking title="Lemas frecuentes (sin stopwords)" icon={Tags} items={analysis.lemmas} />
        <section className="rounded-xl border border-line bg-white p-5 shadow-card dark:border-white/10 dark:bg-navy-900">
          <div className="mb-3 flex items-center justify-between"><h3 className="flex items-center gap-2 font-brand text-lg font-semibold text-navy dark:text-slate-100"><Database size={17} className="text-orange" />N-gramas</h3><div className="rounded-lg border border-line p-1 text-xs dark:border-white/10">{[2, 3].map((size) => <button key={size} onClick={() => setNgramSize(size)} className={`rounded px-2 py-1 font-semibold ${ngramSize === size ? "bg-navy text-white" : "text-slate-400"}`}>{size === 2 ? "Bigramas" : "Trigramas"}</button>)}</div></div>
          <div className="max-h-72 overflow-y-auto">{ngrams.map((item, index) => <div key={item.label} className="grid grid-cols-[2rem_1fr_auto] gap-2 border-b border-line py-2 text-sm last:border-0 dark:border-white/10"><span className="font-mono text-xs text-slate-400">{String(index + 1).padStart(2, "0")}</span><span className="font-mono text-xs text-navy dark:text-slate-200">{item.label}</span><span className="font-mono text-xs font-bold text-orange">{item.count}</span></div>)}</div>
        </section>
      </div>
    </div>
  );
}
