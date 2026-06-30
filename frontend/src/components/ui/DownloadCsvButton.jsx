import React from "react";
import { Download } from "lucide-react";
import { downloadFile, toCSV } from "../../lib/download.js";
import { useI18n } from "../../i18n/I18nContext.jsx";

// Botón compacto que descarga unas filas como CSV (en cliente).
export default function DownloadCsvButton({ rows, headers, filename }) {
  const { t } = useI18n();
  if (!rows || rows.length === 0) return null;
  return (
    <button
      onClick={() => downloadFile(filename, toCSV(rows, headers), "text/csv")}
      className="inline-flex items-center gap-1 rounded-lg border border-line px-2.5 py-1 text-xs font-semibold text-slate-500 transition hover:border-orange hover:text-orange dark:border-white/10 dark:text-slate-300"
    >
      <Download size={13} /> {t("Descargar CSV")}
    </button>
  );
}
