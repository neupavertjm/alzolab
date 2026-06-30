// Estado del corpus en sesión, persistido en el navegador (localStorage).
// Los documentos sobreviven a recargas y a cerrar la pestaña en el mismo
// dispositivo. No se envía nada al servidor: el dato vive solo en el navegador
// del usuario (igual de privado que antes, sin coste de almacenamiento).
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const CorpusContext = createContext(null);
const STORAGE_KEY = "alzolab-corpus";

// Valida que lo cargado/importado tenga la forma de un documento de corpus.
// Sirve tanto al arrancar (datos viejos o corruptos) como para futuras importaciones.
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

  // Guarda el corpus en cada cambio. Es "best-effort": si se supera el cupo del
  // navegador (~5 MB), el corpus sigue funcionando en memoria y solo se avisa.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.warn("No se pudo guardar el corpus localmente:", error?.name || error);
    }
  }, [entries]);

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
