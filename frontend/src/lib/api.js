// Cliente API centralizado de AlzoLab.
// Usa rutas relativas (`/api`): en dev las proxia Vite hacia el backend (8000);
// en prod FastAPI sirve el SPA y la API desde el mismo origen.
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000, // el scraping en vivo puede tardar
  headers: { "Content-Type": "application/json" },
});

// Mensajes del cliente según el idioma guardado (el `detail` del servidor pasa tal cual).
const ERROR_MESSAGES = {
  es: {
    invalid: "Datos inválidos",
    timeout: "La petición tardó demasiado y se canceló.",
    network: "No se pudo conectar con el servidor.",
  },
  en: {
    invalid: "Invalid data",
    timeout: "The request took too long and was cancelled.",
    network: "Could not connect to the server.",
  },
};

function messages() {
  let lang = "es";
  try {
    const stored = localStorage.getItem("alzolab-lang");
    if (stored === "en") lang = "en";
  } catch {
    /* ignore */
  }
  return ERROR_MESSAGES[lang];
}

/** Extrae un mensaje legible de un error de axios. */
export function apiErrorMessage(error) {
  const m = messages();
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail;
    return typeof detail === "string" ? detail : m.invalid;
  }
  if (error?.code === "ECONNABORTED") return m.timeout;
  if (!error?.response) return m.network;
  return `Error ${error.response.status}`;
}

export default api;
