// Cliente API centralizado de AlzoLab.
// Usa rutas relativas (`/api`): en dev las proxia Vite hacia el backend (8000);
// en prod FastAPI sirve el SPA y la API desde el mismo origen.
import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000, // el scraping en vivo puede tardar
  headers: { "Content-Type": "application/json" },
});

/** Extrae un mensaje legible de un error de axios. */
export function apiErrorMessage(error) {
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail;
    return typeof detail === "string" ? detail : "Datos inválidos";
  }
  if (error?.code === "ECONNABORTED") return "La petición tardó demasiado y se canceló.";
  if (!error?.response) return "No se pudo conectar con el servidor.";
  return `Error ${error.response.status}`;
}

export default api;
