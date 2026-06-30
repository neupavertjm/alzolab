// Descargas en cliente: genera un archivo y lo descarga sin pasar por el servidor.
export function downloadFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

// Convierte filas (array de objetos) a CSV. `headers` es [{ key, label }].
export function toCSV(rows, headers) {
  const escape = (value) => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const head = headers.map((h) => escape(h.label ?? h.key)).join(",");
  const body = rows.map((row) => headers.map((h) => escape(row[h.key])).join(",")).join("\n");
  return `${head}\n${body}`;
}
