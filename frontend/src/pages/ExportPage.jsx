import React, { useState } from "react";
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import UiButton from "../components/ui/UiButton.jsx";
import { useCorpus } from "../context/CorpusContext.jsx";
import api, { apiErrorMessage } from "../lib/api.js";

const FORMATS = [{ id: "txt", label: "Texto", icon: FileText }, { id: "json", label: "JSON", icon: FileJson }, { id: "csv", label: "CSV", icon: FileSpreadsheet }];

export default function ExportPage() {
  const { entries, analysis } = useCorpus();
  const [kind, setKind] = useState("corpus");
  const [format, setFormat] = useState("txt");
  const [loading, setLoading] = useState(false);

  const download = async () => {
    if (kind === "analysis" && !analysis) return toast.warning("Ejecuta primero la fase Analizar.");
    setLoading(true);
    try {
      const response = await api.post("/export", { kind, format, documents: kind === "corpus" ? entries : [], analysis: kind === "analysis" ? analysis : null }, { responseType: "blob" });
      const disposition = response.headers["content-disposition"] || "";
      const filename = disposition.match(/filename="?([^";]+)"?/)?.[1] || `alzolab-${kind}.${format}`;
      const url = URL.createObjectURL(response.data);
      const anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
      toast.success(`Archivo ${filename} generado.`);
    } catch (error) { toast.error(apiErrorMessage(error)); } finally { setLoading(false); }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="text-center"><p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-orange">Fase 6 de 6</p><h2 className="mt-1 font-brand text-3xl font-semibold text-navy dark:text-slate-100">Exportar</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Conserva el corpus o sus resultados en un formato interoperable.</p></header>
      <section className="rounded-xl border border-line bg-white p-6 shadow-card dark:border-white/10 dark:bg-navy-900">
        <h3 className="mb-3 text-sm font-bold text-navy dark:text-slate-100">1. Contenido</h3><div className="grid gap-3 sm:grid-cols-2">{[{ id: "corpus", title: "Corpus", detail: `${entries.length} documentos con metadatos y texto` }, { id: "analysis", title: "Análisis", detail: analysis ? `${analysis.tokens.length} tokens etiquetados` : "Ejecuta antes la fase Analizar", disabled: !analysis }].map((option) => <button key={option.id} disabled={option.disabled} onClick={() => setKind(option.id)} className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${kind === option.id ? "border-orange bg-orange-soft dark:bg-orange/10" : "border-line hover:border-orange/50 dark:border-white/10"}`}><strong className="block text-navy dark:text-slate-100">{option.title}</strong><span className="mt-1 block text-xs text-slate-400">{option.detail}</span></button>)}</div>
        <h3 className="mb-3 mt-6 text-sm font-bold text-navy dark:text-slate-100">2. Formato</h3><div className="grid grid-cols-3 gap-3">{FORMATS.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setFormat(id)} className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition ${format === id ? "border-orange text-orange-dark dark:text-orange" : "border-line text-slate-400 hover:border-orange/50 dark:border-white/10"}`}><Icon size={24} /><span className="text-xs font-bold">{label}</span></button>)}</div>
        <div className="mt-7 text-center"><UiButton size="lg" onClick={download} loading={loading} leftIcon={<Download size={17} />}>Descargar .{format}</UiButton></div>
      </section>
    </div>
  );
}
