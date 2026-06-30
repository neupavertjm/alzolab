import React, { useEffect, useMemo, useState } from "react";
import { Plus, Sparkles, Trash2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import UiButton from "../components/ui/UiButton.jsx";
import { useCorpus } from "../context/CorpusContext.jsx";
import { useI18n } from "../i18n/I18nContext.jsx";
import api, { apiErrorMessage } from "../lib/api.js";

const fieldClass = "w-full rounded-lg border border-line bg-white px-3 py-2 font-mono text-xs text-ink focus:border-orange focus:outline-none focus:ring-1 focus:ring-orange dark:border-white/10 dark:bg-navy-950 dark:text-slate-100";

function TextDiff({ before, after }) {
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start += 1;
  let end = 0;
  while (end < before.length - start && end < after.length - start && before[before.length - 1 - end] === after[after.length - 1 - end]) end += 1;
  const suffix = end ? after.slice(after.length - end) : "";
  return (
    <div className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-600 dark:text-slate-300">
      {after.slice(0, start)}
      {before.slice(start, before.length - end) && <del className="bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300">{before.slice(start, before.length - end)}</del>}
      {after.slice(start, after.length - end) && <ins className="bg-emerald-100 text-emerald-800 no-underline dark:bg-emerald-950/50 dark:text-emerald-300">{after.slice(start, after.length - end)}</ins>}
      {suffix}
    </div>
  );
}

export default function CleanPage() {
  const { entries, replaceTexts, undo } = useCorpus();
  const { t } = useI18n();
  const [presets, setPresets] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedId, setSelectedId] = useState(entries[0]?.id || "");
  const [preview, setPreview] = useState(null);
  const [previewWarnings, setPreviewWarnings] = useState([]);
  const [previewing, setPreviewing] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    api.get("/clean/presets").then(({ data }) => setPresets(data)).catch((err) => toast.error(apiErrorMessage(err)));
  }, []);

  const selected = useMemo(() => entries.find((entry) => entry.id === selectedId) || entries[0], [entries, selectedId]);
  const addRule = (rule = {}) => setRules((current) => [...current, { label: rule.label || t("Regla manual"), regex: rule.regex || "", replacement: rule.replacement || "" }]);
  const updateRule = (index, key, value) => setRules((current) => current.map((rule, i) => i === index ? { ...rule, [key]: value } : rule));
  const removeRule = (index) => setRules((current) => current.filter((_, i) => i !== index));

  // Vista previa EN VIVO: se recalcula (con debounce) cada vez que cambian las
  // reglas o el documento. La hace el backend, que usa el mismo motor `regex`
  // que la limpieza real y la protege con timeout (ReDoS).
  useEffect(() => {
    const activeRules = rules.filter((rule) => rule.regex.trim());
    if (!selected || activeRules.length === 0) {
      setPreview(null);
      setPreviewWarnings([]);
      return undefined;
    }
    let cancelled = false;
    setPreviewing(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.post("/clean/preview", {
          documents: [{ id: selected.id, text: selected.texto }],
          rules: activeRules,
        });
        if (cancelled) return;
        setPreview(data.documents[0]);
        setPreviewWarnings(data.warnings || []);
      } catch {
        if (!cancelled) {
          setPreview(null);
          setPreviewWarnings([]);
        }
      } finally {
        if (!cancelled) setPreviewing(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [rules, selected]);

  const applyAll = async () => {
    const activeRules = rules.filter((rule) => rule.regex.trim());
    if (activeRules.length === 0) return toast.warning(t("Añade al menos una regla de limpieza."));
    if (!window.confirm(t("Se modificarán {n} documento(s) del corpus. ¿Continuar?", { n: entries.length }))) return;
    setApplying(true);
    try {
      const { data } = await api.post("/clean/apply", {
        documents: entries.map((entry) => ({ id: entry.id, text: entry.texto })),
        rules: activeRules,
      });
      replaceTexts(data.documents.map(({ id, after }) => ({ id, texto: after })));
      (data.warnings || []).forEach((warning) => toast.warning(warning));
      const changed = data.documents.filter((document) => document.changed).length;
      toast.success(t("Limpieza aplicada: {n} documento(s) modificados.", { n: changed }), {
        action: { label: t("Deshacer"), onClick: undo },
      });
    } catch (err) { toast.error(apiErrorMessage(err)); } finally { setApplying(false); }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-xl border border-line bg-white p-5 shadow-card dark:border-white/10 dark:bg-navy-900">
        <div className="flex items-baseline justify-between">
          <h2 className="font-brand text-2xl font-semibold text-navy dark:text-slate-100">{t("Limpiar")}</h2>
          <span className="font-mono text-xs text-orange">{t("Fase {n} de 6", { n: 2 })}</span>
        </div>
        <p className="mb-5 mt-1 text-sm text-slate-500 dark:text-slate-400">{t("Combina presets o reglas propias. El orden importa y cada regex tiene un límite de ejecución.")}</p>

        <div className="mb-5 flex flex-wrap gap-2">
          {presets.map((preset) => <button key={preset.id} onClick={() => addRule({ ...preset, label: t(preset.label) })} title={t(preset.description)} className="rounded-full border border-orange/30 bg-orange-soft px-3 py-1.5 text-xs font-semibold text-orange-dark transition hover:border-orange dark:bg-orange/10 dark:text-orange"><Sparkles size={12} className="mr-1 inline" />{t(preset.label)}</button>)}
        </div>

        <div className="space-y-3">
          {rules.map((rule, index) => (
            <div key={`${rule.label}-${index}`} className="rounded-lg border border-line p-3 dark:border-white/10">
              <div className="mb-2 flex items-center justify-between"><span className="text-xs font-bold text-navy dark:text-slate-200">{index + 1}. {rule.label}</span><button onClick={() => removeRule(index)} aria-label={t("Quitar regla")} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button></div>
              <input aria-label={`Regex ${index + 1}`} value={rule.regex} onChange={(event) => updateRule(index, "regex", event.target.value)} placeholder={t("Expresión regular")} className={fieldClass} />
              <input aria-label={`Replacement ${index + 1}`} value={rule.replacement} onChange={(event) => updateRule(index, "replacement", event.target.value)} placeholder={t("Reemplazo (vacío = eliminar)")} className={`${fieldClass} mt-2`} />
            </div>
          ))}
          <UiButton variant="ghost" size="sm" onClick={() => addRule()} leftIcon={<Plus size={14} />}>{t("Añadir regla manual")}</UiButton>
          <p className="text-xs text-slate-400">{t("Puedes escribir cualquier expresión regular; se aplica de forma segura con un límite de tiempo.")}</p>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-white p-5 shadow-card dark:border-white/10 dark:bg-navy-900">
        <div className="flex items-center justify-between">
          <h2 className="font-brand text-lg font-semibold text-navy dark:text-slate-100">{t("Vista previa antes / después")}</h2>
          {previewing && <span className="font-mono text-[11px] text-slate-400">{t("Actualizando…")}</span>}
        </div>
        <select value={selected?.id || ""} onChange={(event) => setSelectedId(event.target.value)} className="my-3 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-navy-950 dark:text-slate-100">
          {entries.map((entry) => <option key={entry.id} value={entry.id}>{entry.url}</option>)}
        </select>

        {previewWarnings.length > 0 && (
          <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
            {previewWarnings.map((warning, i) => <p key={i}>{warning}</p>)}
          </div>
        )}

        <div className="h-[26rem] overflow-auto rounded-lg border border-line bg-paper p-4 dark:border-white/10 dark:bg-navy-950">
          {preview ? (
            <>
              <div className="mb-3 flex justify-between font-mono text-[11px] uppercase tracking-wide text-slate-400">
                <span>{t("{n} reemplazos", { n: preview.replacements })}</span>
                <span>{preview.changed ? t("Modificado") : t("Sin cambios")}</span>
              </div>
              <TextDiff before={preview.before} after={preview.after} />
            </>
          ) : (
            <p className="py-20 text-center text-sm text-slate-400">{t("Escribe una regla para ver en vivo lo que se elimina. El corpus no se modifica hasta que pulses «Aplicar».")}</p>
          )}
        </div>

        <div className="mt-4">
          <UiButton variant="secondary" onClick={applyAll} loading={applying} leftIcon={<WandSparkles size={15} />}>{t("Aplicar al corpus")}</UiButton>
        </div>
      </section>
    </div>
  );
}
