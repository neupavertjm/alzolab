// Hook de tema claro/oscuro: aplica la clase `dark` en <html> para Tailwind.
import { useEffect, useState } from "react";

const STORAGE_KEY = "alzolab-theme";

export default function useTheme() {
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return stored === "dark";
    } catch {
      /* ignore */
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    try {
      localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
    } catch {
      /* ignore */
    }
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}
