// Estado del corpus en sesión, persistido en el navegador (localStorage), con
// historial deshacer/rehacer y selección de documentos activos. Los documentos
// sobreviven a recargas y a cerrar la pestaña. No se envía nada al servidor.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const CorpusContext = createContext(null);
const STORAGE_KEY = "alzolab-corpus";
const HISTORY_LIMIT = 30;

// Valida que lo cargado/importado tenga la forma de un documento de corpus.
function sanitizeEntries(data) {
  if (!Array.isArray(data)) return [];
  return data.filter(
    (e) =>
      e &&
      typeof e.id === "string" &&
      typeof e.modo === "string" &&
      typeof e.url === "string" &&
      typeof e.fecha === "string" &&
      typeof e.texto === "string"
  );
}

function loadCorpus() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? sanitizeEntries(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

export function CorpusProvider({ children }) {
  const [entries, setEntries] = useState(loadCorpus);
  const [analysis, setAnalysis] = useState(null);
  const [historyVersion, setHistoryVersion] = useState(0);
  // Documentos activos para las fases de análisis (por defecto, todos).
  const [selectedIds, setSelectedIds] = useState(() => new Set(loadCorpus().map((e) => e.id)));

  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);
  const pastRef = useRef([]);
  const futureRef = useRef([]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.warn("No se pudo guardar el corpus localmente:", error?.name || error);
    }
  }, [entries]);

  // Poda de la selección: quita ids que ya no existen en el corpus.
  useEffect(() => {
    setSelectedIds((prev) => {
      const ids = new Set(entries.map((e) => e.id));
      let changed = false;
      const next = new Set();
      prev.forEach((id) => (ids.has(id) ? next.add(id) : (changed = true)));
      return changed ? next : prev;
    });
  }, [entries]);

  const record = useCallback(() => {
    pastRef.current = [...pastRef.current.slice(-(HISTORY_LIMIT - 1)), entriesRef.current];
    futureRef.current = [];
    setHistoryVersion((v) => v + 1);
  }, []);

  // Marca como activos los ids nuevos (documentos recién añadidos).
  const selectNewIds = useCallback((ids) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const addEntries = useCallback((incoming) => {
    record();
    setAnalysis(null);
    const known = new Set(entriesRef.current.map((e) => e.id));
    const fresh = incoming.filter((e) => !known.has(e.id));
    setEntries((prev) => [...prev, ...fresh]);
    selectNewIds(fresh.map((e) => e.id));
    return incoming.length;
  }, [record, selectNewIds]);

  const importEntries = useCallback((data) => {
    const valid = sanitizeEntries(data);
    record();
    setAnalysis(null);
    const known = new Set(entriesRef.current.map((e) => e.id));
    const fresh = valid.filter((e) => !known.has(e.id));
    setEntries((prev) => [...prev, ...fresh]);
    selectNewIds(fresh.map((e) => e.id));
    return valid.length;
  }, [record, selectNewIds]);

  const removeEntry = useCallback((id) => {
    record();
    setAnalysis(null);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, [record]);

  const clearCorpus = useCallback(() => {
    record();
    setAnalysis(null);
    setEntries([]);
  }, [record]);

  const replaceTexts = useCallback((updates) => {
    record();
    setAnalysis(null);
    const byId = new Map(updates.map((update) => [update.id, update.texto]));
    setEntries((prev) =>
      prev.map((entry) => (byId.has(entry.id) ? { ...entry, texto: byId.get(entry.id) } : entry))
    );
  }, [record]);

  const restore = useCallback((snapshot) => {
    setAnalysis(null);
    setEntries(snapshot);
    setSelectedIds(new Set(snapshot.map((e) => e.id))); // tras deshacer/rehacer, todos activos
  }, []);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current, entriesRef.current];
    restore(previous);
    setHistoryVersion((v) => v + 1);
  }, [restore]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[futureRef.current.length - 1];
    futureRef.current = futureRef.current.slice(0, -1);
    pastRef.current = [...pastRef.current, entriesRef.current];
    restore(next);
    setHistoryVersion((v) => v + 1);
  }, [restore]);

  // --- Selección de documentos ---
  const toggleSelected = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);
  const selectAll = useCallback(() => setSelectedIds(new Set(entriesRef.current.map((e) => e.id))), []);
  const selectNone = useCallback(() => setSelectedIds(new Set()), []);

  const selectedEntries = useMemo(
    () => entries.filter((e) => selectedIds.has(e.id)),
    [entries, selectedIds]
  );

  const stats = useMemo(
    () => ({
      count: entries.length,
      chars: entries.reduce((sum, e) => sum + e.texto.length, 0),
      selected: selectedEntries.length,
    }),
    [entries, selectedEntries]
  );

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const value = useMemo(
    () => ({
      entries, selectedEntries, selectedIds, toggleSelected, selectAll, selectNone,
      addEntries, importEntries, removeEntry, clearCorpus, replaceTexts,
      undo, redo, canUndo, canRedo, stats, analysis, setAnalysis,
    }),
    [entries, selectedEntries, selectedIds, toggleSelected, selectAll, selectNone, addEntries, importEntries, removeEntry, clearCorpus, replaceTexts, undo, redo, canUndo, canRedo, stats, analysis, historyVersion]
  );

  return <CorpusContext.Provider value={value}>{children}</CorpusContext.Provider>;
}

export function useCorpus() {
  const ctx = useContext(CorpusContext);
  if (!ctx) throw new Error("useCorpus debe usarse dentro de <CorpusProvider>");
  return ctx;
}
