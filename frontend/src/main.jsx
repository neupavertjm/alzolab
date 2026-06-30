import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import App from "./App.jsx";
import { I18nProvider } from "./i18n/I18nContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
      <Toaster richColors position="bottom-right" />
    </I18nProvider>
  </React.StrictMode>
);
