import React, { useState } from "react";
import { Download, Globe, Sparkles, Upload } from "lucide-react";
import { toast } from "sonner";
import api, { apiErrorMessage } from "../lib/api.js";
import { useCorpus } from "../context/CorpusContext.jsx";
import CorpusPanel from "../components/CorpusPanel.jsx";
import UiButton from "../components/ui/UiButton.jsx";

const SOURCES = [
  { id: "web", label: "Páginas web", icon: Globe },
  { id: "wikipedia", label: "Wikipedia", icon: Sparkles },
  { id: "files", label: "Archivos", icon: Upload },
];

const WEB_METHODS = [
  { value: "trafilatura", label: "Automático (trafilatura)" },
  { value: "justext", label: "jusText" },
  { value: "beautifulsoup", label: "BeautifulSoup" },
];

const fieldClass =
  "w-full rounded-lg border border-line bg-white p-3 text-sm text-ink focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange dark:border-white/10 dark:bg-navy-950 dark:text-slate-100";

const splitLines = (text) =>
  text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

export default function ImportPage() {
  const { addEntries } = useCorpus();
  const [source, setSource] = useState("web");
  const [loading, setLoading] = useState(false);

  const [urls, setUrls] = useState("");
  const [method, setMethod] = useState("trafilatura");
  const [queries, setQueries] = useState("");
  const [files, setFiles] = useState([]);

  const applyResult = (data) => {
    const added = addEntries(data.entries);
    (data.warnings || []).forEach((w) => toast.warning(w));
    if (added > 0) {
      toast.success(`${added} documento${added !== 1 ? "s" : ""} añadido${added !== 1 ? "s" : ""} al corpus.`);
    } else if (!data.warnings?.length) {
      toast.info("No se obtuvo ningún documento nuevo.");
    }
  };

  const runImport = async (fn) => {
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const importWeb = () => {
    const list = splitLines(urls);
    if (list.length === 0) return toast.warning("Pega al menos una URL.");
    return runImport(async () => {
      const { data } = await api.post("/extract/web", { urls: list, method });
      applyResult(data);
    });
  };

  const importWikipedia = () => {
    const list = splitLines(queries);
    if (list.length === 0) return toast.warning("Escribe al menos un término.");
    return runImport(async () => {
      const { data } = await api.post("/extract/wikipedia", { queries: list, lang: "es" });
      applyResult(data);
    });
  };

  const importFiles = () => {
    if (files.length === 0) return toast.warning("Selecciona al menos un archivo.");
    return runImport(async () => {
      const form = new FormData();
      files.forEach((f) => form.append("files", f));
      const { data } = await api.post("/extract/files", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      applyResult(data);
    });
  };

  const loadSample = () =>
    runImport(async () => {
      const { data } = await api.get("/corpus/sample");
      const added = addEntries(data);
      toast.success(`Corpus de ejemplo cargado (${added} documentos).`);
    });

  return (
    <div className="grid gap-6 lg:grid-cols-[1.12fr_0.95fr]">
      <section className="rounded-xl border border-line bg-white p-5 shadow-card dark:border-white/10 dark:bg-navy-900">
        <div className="flex items-baseline justify-between">
          <h2 className="font-brand text-2xl font-semibold text-navy dark:text-slate-100">
            Importar
          </h2>
          <span className="font-mono text-xs text-orange">Fase 1 de 6</span>
        </div>
        <p className="mb-5 mt-1 max-w-[60ch] text-sm text-slate-500 dark:text-slate-400">
          Reúne textos desde varias fuentes. Cada documento se normaliza (NFKC) y los
          duplicados exactos se descartan automáticamente.
        </p>

        {/* Selector de fuente */}
        <div className="mb-5 inline-flex rounded-lg border border-line bg-white p-1 dark:border-white/10 dark:bg-navy-950">
          {SOURCES.map((s) => {
            const Icon = s.icon;
            const isActive = s.id === source;
            return (
              <button
                key={s.id}
                onClick={() => setSource(s.id)}
                className={[
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold transition",
                  isActive
                    ? "bg-navy text-white"
                    : "text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-slate-100",
                ].join(" ")}
              >
                <Icon size={14} />
                {s.label}
              </button>
            );
          })}
        </div>

        {source === "web" && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300">
              URLs (una por línea)
            </label>
            <textarea
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={5}
              placeholder={"https://es.wikipedia.org/wiki/Lingüística_de_corpus\nhttps://..."}
              className={`${fieldClass} font-mono text-xs`}
            />
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="rounded-lg border border-line bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-navy-950 dark:text-slate-100"
              >
                {WEB_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <UiButton onClick={importWeb} loading={loading} leftIcon={<Globe size={15} />}>
                Extraer
              </UiButton>
              <UiButton variant="ghost" size="sm" onClick={loadSample} leftIcon={<Download size={14} />}>
                Cargar ejemplo
              </UiButton>
            </div>
            <p className="text-xs text-slate-400">
              <strong>Automático</strong> detecta el cuerpo del artículo (ideal para
              noticias). <strong>jusText</strong> y <strong>BeautifulSoup</strong> son
              alternativas si el método automático falla.
            </p>
          </div>
        )}

        {source === "wikipedia" && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300">
              Términos de búsqueda (uno por línea)
            </label>
            <textarea
              value={queries}
              onChange={(e) => setQueries(e.target.value)}
              rows={5}
              placeholder={"Lingüística de corpus\nProcesamiento de lenguaje natural"}
              className={fieldClass}
            />
            <div className="flex flex-wrap items-center gap-3">
              <UiButton onClick={importWikipedia} loading={loading} leftIcon={<Sparkles size={15} />}>
                Extraer de Wikipedia
              </UiButton>
              <UiButton variant="ghost" size="sm" onClick={loadSample} leftIcon={<Download size={14} />}>
                Cargar ejemplo
              </UiButton>
            </div>
          </div>
        )}

        {source === "files" && (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-600 dark:text-slate-300">
              Archivos (.txt, .pdf, .docx)
            </label>
            <input
              type="file"
              multiple
              accept=".txt,.pdf,.docx"
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-orange-soft file:px-4 file:py-2 file:text-sm file:font-semibold file:text-orange-dark hover:file:bg-orange/20 dark:text-slate-300"
            />
            {files.length > 0 && (
              <p className="font-mono text-xs text-slate-500">
                {files.length} archivo(s) seleccionado(s)
              </p>
            )}
            <UiButton onClick={importFiles} loading={loading} leftIcon={<Upload size={15} />}>
              Subir y extraer
            </UiButton>
          </div>
        )}
      </section>

      <CorpusPanel />
    </div>
  );
}
