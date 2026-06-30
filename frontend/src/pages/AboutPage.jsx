import React from "react";
import { Code2, Github, Linkedin, Mail, Search } from "lucide-react";
import { useI18n } from "../i18n/I18nContext.jsx";

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <article className="mx-auto max-w-4xl">
      <header className="mb-8 border-b border-line pb-7 dark:border-white/10">
        <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-orange">{t("Detrás del laboratorio")}</p>
        <h1 className="max-w-3xl font-brand text-4xl font-semibold leading-tight text-navy dark:text-slate-100 sm:text-5xl">{t("Una herramienta nacida entre la lingüística y el código.")}</h1>
      </header>

      <div className="grid gap-8 md:grid-cols-[1fr_1.35fr]">
        <aside className="rounded-xl bg-navy p-6 text-white shadow-card">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-orange font-brand text-2xl font-bold">JM</div>
          <h2 className="font-brand text-2xl font-semibold">Juan Manuel Neupavert Alzola</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{t("Lingüista y desarrollador, en el cruce entre lingüística computacional y procesamiento del lenguaje natural.")}</p>
          <div className="mt-6 space-y-3 text-sm">
            <a className="flex items-center gap-2 text-slate-200 hover:text-orange" href="mailto:neupavertjm@gmail.com"><Mail size={15} /> {t("Correo")}</a>
            <a className="flex items-center gap-2 text-slate-200 hover:text-orange" href="https://www.linkedin.com/in/juan-manuel-neupavert/" target="_blank" rel="noreferrer"><Linkedin size={15} /> LinkedIn</a>
            <a className="flex items-center gap-2 text-slate-200 hover:text-orange" href="https://github.com/neupavertjm" target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a>
          </div>
        </aside>

        <div className="space-y-7 text-[15px] leading-7 text-slate-600 dark:text-slate-300">
          <section><h2 className="mb-2 flex items-center gap-2 font-brand text-2xl font-semibold text-navy dark:text-slate-100"><Search size={20} className="text-orange" />{t("Por qué existe AlzoLab")}</h2><p>{t("Construir un corpus suele obligar a encadenar herramientas y scripts distintos para extraer, limpiar, analizar y exportar textos. AlzoLab nace para reunir ese proceso en un espacio guiado, reproducible y accesible desde el navegador, especialmente para quienes trabajan con lenguaje y no quieren reconstruir la infraestructura en cada investigación.")}</p></section>
          <section><h2 className="mb-2 flex items-center gap-2 font-brand text-2xl font-semibold text-navy dark:text-slate-100"><Code2 size={20} className="text-orange" />{t("Del prototipo al producto")}</h2><p>{t("El proyecto comenzó como un prototipo en Streamlit y evoluciona hacia una aplicación React + FastAPI. La lógica lingüística permanece separada de la interfaz y cubierta por pruebas: el objetivo no es solo obtener resultados, sino hacer visible un proceso técnico que se pueda revisar, repetir y ampliar.")}</p></section>
          <section className="rounded-xl border-l-4 border-orange bg-white p-5 shadow-card dark:bg-navy-900"><h2 className="mb-2 font-brand text-2xl font-semibold text-navy dark:text-slate-100">{t("El origen del nombre")}</h2><p>{t("El nombre une mi apellido,")} <strong className="text-navy dark:text-white">Alzola</strong>{t(", con «")}<strong className="text-navy dark:text-white">lab</strong>{t("» (laboratorio). Las dos palabras comparten la sílaba «")}<span className="font-semibold text-orange">la</span>{t("», así que el apellido queda integrado en el nombre, que también describe la herramienta: un laboratorio para experimentar con corpus.")}</p></section>
        </div>
      </div>
    </article>
  );
}
