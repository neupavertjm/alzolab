// Las 6 fases del flujo de AlzoLab.
// - `entry`: puerta de entrada (Importar), siempre disponible.
// - `ready`: fase ya implementada (las demás muestran "en construcción").
// El resto se desbloquea cuando hay ≥1 documento en el corpus.
export const STAGES = [
  { id: "import", label: "Importar", entry: true, ready: true },
  { id: "clean", label: "Limpiar", ready: true },
  { id: "analyze", label: "Analizar", ready: true },
  { id: "terms", label: "Terminología", ready: true },
  { id: "kwic", label: "Concordancia", ready: true },
  { id: "export", label: "Exportar", ready: true },
];
