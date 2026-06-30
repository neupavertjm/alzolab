// Estado del corpus en sesión, persistido en el navegador (localStorage) y con
// historial de deshacer/rehacer. Los documentos sobreviven a recargas y a cerrar
// la pestaña en el mismo dispositivo. No se envía nada al servidor.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const CorpusContext = createContext(null);
const STORAGE_KEY = "alzolab-corpus";
const HISTORY_LIMIT = 30;

// Valida que lo cargado/importado tenga la forma de un documento de corpus.
// Sirve tanto al arrancar (datos viejos o corruptos) como para las importaciones.
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
  // El análisis NO se persiste: puede ser grande y el backend ya lo cachea.
  const [analysis, setAnalysis] = useState(null);
  // Contador que fuerza re-render cuando cambia el historial (vive en refs).
  const [historyVersion, setHistoryVersion] = useState(0);

  const entriesRef = useRef(entries);
  useEffect(() => {
    entriesRef.current = entries;
  }, [entries]);
  const pastRef = useRef([]);
  const futureRef = useRef([]);

  // Persiste el corpus en cada cambio (best-effort ante el cupo del navegador).
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.warn("No se pudo guardar el corpus localmente:", error?.name || error);
    }
  }, [entries]);

  // Registra el estado actual antes de un cambio (para poder deshacerlo) y limpia
  // la pila de rehacer, porque un cambio nuevo invalida el futuro anterior.
  const record = useCallback(() => {
    pastRef.current = [...pastRef.current.slice(-(HISTORY_LIMIT - 1)), entriesRef.current];
    futureRef.current = [];
    setHistoryVersion((v) => v + 1);
  }, []);

  // Añade documentos evitando duplicar por id (el backend ya deduplica por texto).
  const addEntries = useCallback((incoming) => {
    record();
    setAnalysis(null);
    setEntries((prev) => {
      const known = new Set(prev.map((e) => e.id));
      const fresh = incoming.filter((e) => !known.has(e.id));
      return [...prev, ...fresh];
    });
    return incoming.length;
  }, [record]);

  // Carga un proyecto importado (corpus exportado en JSON), validado y fusionado.
  const importEntries = useCallback((data) => {
    const valid = sanitizeEntries(data);
    record();
    setAnalysis(null);
    setEntries((prev) => {
      const known = new Set(prev.map((e) => e.id));
      const fresh = valid.filter((e) => !known.has(e.id));
      return [...prev, ...fresh];
    });
    return valid.length;
  }, [record]);

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

  // Sustituye solo el texto (lo usa la limpieza): conserva fuente, fecha e id.
  const replaceTexts = useCallback((updates) => {
    record();
    setAnalysis(null);
    const byId = new Map(updates.map((update) => [update.id, update.texto]));
    setEntries((prev) =>
      prev.map((entry) => (byId.has(entry.id) ? { ...entry, texto: byId.get(entry.id) } : entry))
    );
  }, [record]);

  const undo = useCallback(() => {
    if (pastRef.current.length === 0) return;
    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current, entriesRef.current];
    setAnalysis(null);
    setEntries(previous);
    setHistoryVersion((v) => v + 1);
  }, []);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return;
    const next = futureRef.current[futureRef.current.length - 1];
    futureRef.current = futureRef.current.slice(0, -1);
    pastRef.current = [...pastRef.current, entriesRef.current];
    setAnalysis(null);
    setEntries(next);
    setHistoryVersion((v) => v + 1);
  }, []);

  const stats = useMemo(
    () => ({
      count: entries.length,
      chars: entries.reduce((sum, e) => sum + e.texto.length, 0),
    }),
    [entries]
  );

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const value = useMemo(
    () => ({
      entries, addEntries, importEntries, removeEntry, clearCorpus, replaceTexts,
      undo, redo, canUndo, canRedo, stats, analysis, setAnalysis,
    }),
    // historyVersion entra para refrescar canUndo/canRedo (derivados de refs).
    [entries, addEntries, importEntries, removeEntry, clearCorpus, replaceTexts, undo, redo, canUndo, canRedo, stats, analysis, historyVersion]
  );

  return <CorpusContext.Provider value={value}>{children}</CorpusContext.Provider>;
}

export function useCorpus() {
  const ctx = useContext(CorpusContext);
  if (!ctx) throw new Error("useCorpus debe usarse dentro de <CorpusProvider>");
  return ctx;
}
