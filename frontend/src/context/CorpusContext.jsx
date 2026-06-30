// Estado del corpus en sesión: los documentos viven en memoria del navegador
// mientras dura la visita (igual que el prototipo Streamlit con session_state).
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const CorpusContext = createContext(null);

export function CorpusProvider({ children }) {
  const [entries, setEntries] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  // Añade documentos evitando duplicar por id (el backend ya deduplica por texto).
  const addEntries = useCallback((incoming) => {
    setAnalysis(null);
    setEntries((prev) => {
      const known = new Set(prev.map((e) => e.id));
      const fresh = incoming.filter((e) => !known.has(e.id));
      return [...prev, ...fresh];
    });
    return incoming.length;
  }, []);

  const removeEntry = useCallback((id) => {
    setAnalysis(null);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearCorpus = useCallback(() => {
    setAnalysis(null);
    setEntries([]);
  }, []);

  // Sustituye solo el texto: conserva fuente, fecha e identificador del documento.
  const replaceTexts = useCallback((updates) => {
    setAnalysis(null);
    const byId = new Map(updates.map((update) => [update.id, update.texto]));
    setEntries((prev) =>
      prev.map((entry) =>
        byId.has(entry.id) ? { ...entry, texto: byId.get(entry.id) } : entry
      )
    );
  }, []);

  const stats = useMemo(
    () => ({
      count: entries.length,
      chars: entries.reduce((sum, e) => sum + e.texto.length, 0),
    }),
    [entries]
  );

  const value = useMemo(
    () => ({ entries, addEntries, removeEntry, clearCorpus, replaceTexts, stats, analysis, setAnalysis }),
    [entries, addEntries, removeEntry, clearCorpus, replaceTexts, stats, analysis]
  );

  return <CorpusContext.Provider value={value}>{children}</CorpusContext.Provider>;
}

export function useCorpus() {
  const ctx = useContext(CorpusContext);
  if (!ctx) throw new Error("useCorpus debe usarse dentro de <CorpusProvider>");
  return ctx;
}
