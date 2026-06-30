import React, { lazy, Suspense, useState } from "react";
import AppShell from "./components/AppShell.jsx";
import { CorpusProvider } from "./context/CorpusContext.jsx";
import useTheme from "./hooks/useTheme.js";
import ImportPage from "./pages/ImportPage.jsx";
import CleanPage from "./pages/CleanPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import HowItWorksPage from "./pages/HowItWorksPage.jsx";

const AnalyzePage = lazy(() => import("./pages/AnalyzePage.jsx"));
const TermsPage = lazy(() => import("./pages/TermsPage.jsx"));
const KwicPage = lazy(() => import("./pages/KwicPage.jsx"));
const ExportPage = lazy(() => import("./pages/ExportPage.jsx"));

export default function App() {
  const { dark, toggle } = useTheme();
  const [active, setActive] = useState("import");

  return (
    <CorpusProvider>
      <AppShell active={active} onSelect={setActive} dark={dark} toggleTheme={toggle}>
        {active === "import" && <ImportPage />}
        {active === "clean" && <CleanPage />}
        {active === "about" && <AboutPage />}
        {active === "how" && <HowItWorksPage />}
        {active === "analyze" && (
          <Suspense fallback={<p className="py-20 text-center text-sm text-slate-400">Cargando módulo de análisis…</p>}>
            <AnalyzePage />
          </Suspense>
        )}
        {active === "terms" && <Suspense fallback={<p className="py-20 text-center text-sm text-slate-400">Cargando terminología…</p>}><TermsPage /></Suspense>}
        {active === "kwic" && <Suspense fallback={<p className="py-20 text-center text-sm text-slate-400">Cargando concordancias…</p>}><KwicPage /></Suspense>}
        {active === "export" && <Suspense fallback={<p className="py-20 text-center text-sm text-slate-400">Cargando exportación…</p>}><ExportPage /></Suspense>}
      </AppShell>
    </CorpusProvider>
  );
}
