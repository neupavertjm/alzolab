import React from "react";
import { Database, Download, Eraser, FileSearch, Globe, Languages, Lock, Microscope, Quote, Tags } from "lucide-react";
import { useI18n } from "../i18n/I18nContext.jsx";

// Contenido bilingüe de la página. El texto largo vive aquí (no en el diccionario
// de UI) para mantener `en.js` enfocado en cadenas cortas de interfaz.
const CONTENT = {
  es: {
    kicker: "Cómo funciona",
    title: "El método detrás de cada fase",
    intro:
      "AlzoLab reproduce el flujo clásico de la lingüística de corpus en seis fases. Aquí se explica qué hace cada una y con qué método, para que los resultados sean interpretables y reproducibles.",
    pipelineTitle: "El flujo en seis fases",
    phases: [
      { icon: FileSearch, name: "Importar", desc: "Reúne textos desde páginas web, Wikipedia o archivos (.txt, .pdf, .docx). La extracción web usa trafilatura (detección automática del cuerpo del artículo), jusText o BeautifulSoup. Cada documento se normaliza (Unicode NFKC y finales de línea) y se descartan los duplicados exactos." },
      { icon: Eraser, name: "Limpiar", desc: "Aplica reglas de expresiones regulares con vista previa antes/después. Puedes combinar presets o escribir las tuyas; todas se ejecutan con un límite de tiempo que protege frente a expresiones catastróficas (ReDoS)." },
      { icon: Microscope, name: "Analizar", desc: "spaCy etiqueta cada token con su categoría gramatical (POS), su lema y sus rasgos morfológicos, y se calculan métricas léxicas y n-gramas. El resultado se cachea por corpus." },
      { icon: Tags, name: "Terminología", desc: "Detecta sintagmas nominales candidatos a término y los ordena por C-value." },
      { icon: Quote, name: "Concordancia (KWIC)", desc: "Muestra cada aparición de una palabra o frase con su contexto izquierdo y derecho (keyword in context)." },
      { icon: Download, name: "Exportar", desc: "Descarga el corpus o el análisis en formato .txt, .json o .csv." },
    ],
    metricsTitle: "Métricas léxicas",
    metrics: [
      { term: "TTR (type-token ratio)", desc: "Tipos divididos por número de palabras. Mide la diversidad léxica del texto." },
      { term: "Hapax", desc: "Número de lemas que aparecen una sola vez en el corpus." },
      { term: "Densidad léxica", desc: "Proporción de palabras de contenido (nombres, verbos, adjetivos y adverbios) sobre el total de palabras." },
    ],
    cvalueTitle: "Terminología por C-value",
    cvalue:
      "El C-value (Frantzi, Ananiadou & Mima, 2000) es un método clásico de reconocimiento automático de términos. Combina la frecuencia de una secuencia multipalabra con cuánto aparece anidada dentro de términos más largos, ponderado por su longitud. No usa nada propietario: solo las categorías gramaticales de spaCy y estadística publicada.",
    langTitle: "El idioma del análisis",
    lang:
      "El selector ES/EN de la cabecera cambia a la vez la interfaz y el modelo de spaCy del análisis (es_core_news_sm para español, en_core_web_sm para inglés). No hay detección automática: elige el idioma que corresponde a tu corpus para que el etiquetado, los lemas y la terminología sean correctos.",
    privacyTitle: "Privacidad de tus datos",
    privacy:
      "Tu corpus vive en la sesión del navegador mientras dura la visita. No se almacena en el servidor; al recargar la página se reinicia, salvo lo que hayas exportado.",
    limitsTitle: "Límites",
    limits:
      "Pensado para corpus pequeños y medianos. La demo se aloja en Hugging Face Spaces (plan gratuito): se duerme con la inactividad, así que el primer acceso —y el primer análisis en cada idioma— tardan unos segundos más por el arranque en frío.",
  },
  en: {
    kicker: "How it works",
    title: "The method behind each step",
    intro:
      "AlzoLab reproduces the classic corpus linguistics workflow in six steps. This page explains what each one does and with which method, so the results stay interpretable and reproducible.",
    pipelineTitle: "The six-step workflow",
    phases: [
      { icon: FileSearch, name: "Import", desc: "Gather texts from web pages, Wikipedia or files (.txt, .pdf, .docx). Web extraction uses trafilatura (automatic article-body detection), jusText or BeautifulSoup. Each document is normalised (Unicode NFKC and line endings) and exact duplicates are discarded." },
      { icon: Eraser, name: "Clean", desc: "Apply regular-expression rules with a before/after preview. You can combine presets or write your own; all of them run with a time limit that guards against catastrophic expressions (ReDoS)." },
      { icon: Microscope, name: "Analyze", desc: "spaCy tags each token with its part of speech (POS), lemma and morphological features, and computes lexical metrics and n-grams. The result is cached per corpus." },
      { icon: Tags, name: "Terminology", desc: "Detect noun phrases that are candidate terms and rank them by C-value." },
      { icon: Quote, name: "Concordance (KWIC)", desc: "Show every occurrence of a word or phrase with its left and right context (keyword in context)." },
      { icon: Download, name: "Export", desc: "Download the corpus or the analysis as .txt, .json or .csv." },
    ],
    metricsTitle: "Lexical metrics",
    metrics: [
      { term: "TTR (type-token ratio)", desc: "Types divided by the number of words. Measures the lexical diversity of the text." },
      { term: "Hapax", desc: "Number of lemmas that appear only once in the corpus." },
      { term: "Lexical density", desc: "Proportion of content words (nouns, verbs, adjectives and adverbs) over the total number of words." },
    ],
    cvalueTitle: "Terminology via C-value",
    cvalue:
      "C-value (Frantzi, Ananiadou & Mima, 2000) is a classic automatic term recognition method. It combines the frequency of a multi-word sequence with how often it appears nested inside longer terms, weighted by its length. It uses nothing proprietary: only spaCy parts of speech and published statistics.",
    langTitle: "The analysis language",
    lang:
      "The ES/EN switch in the header changes both the interface and the spaCy analysis model (es_core_news_sm for Spanish, en_core_web_sm for English). There is no automatic detection: pick the language that matches your corpus so that tagging, lemmas and terminology are correct.",
    privacyTitle: "Privacy of your data",
    privacy:
      "Your corpus lives in the browser session for as long as the visit lasts. It is not stored on the server; reloading the page resets it, except for whatever you have exported.",
    limitsTitle: "Limits",
    limits:
      "Designed for small and medium corpora. The demo is hosted on Hugging Face Spaces (free tier): it sleeps on inactivity, so the first visit —and the first analysis in each language— take a few extra seconds due to the cold start.",
  },
};

function Section({ icon: Icon, title, children }) {
  return (
    <section>
      <h2 className="mb-2 flex items-center gap-2 font-brand text-2xl font-semibold text-navy dark:text-slate-100">
        {Icon && <Icon size={20} className="text-orange" />}
        {title}
      </h2>
      <div className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">{children}</div>
    </section>
  );
}

export default function HowItWorksPage() {
  const { lang } = useI18n();
  const c = CONTENT[lang] || CONTENT.es;

  return (
    <article className="mx-auto max-w-4xl space-y-9">
      <header className="border-b border-line pb-7 dark:border-white/10">
        <p className="mb-2 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-orange">{c.kicker}</p>
        <h1 className="max-w-3xl font-brand text-4xl font-semibold leading-tight text-navy dark:text-slate-100 sm:text-5xl">{c.title}</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-slate-600 dark:text-slate-300">{c.intro}</p>
      </header>

      <Section icon={Globe} title={c.pipelineTitle}>
        <ol className="space-y-3">
          {c.phases.map((phase, index) => {
            const PhaseIcon = phase.icon;
            return (
              <li key={phase.name} className="flex gap-3 rounded-xl border border-line bg-white p-4 shadow-card dark:border-white/10 dark:bg-navy-900">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-soft text-orange-dark dark:bg-orange/10 dark:text-orange"><PhaseIcon size={17} /></span>
                <div>
                  <p className="font-semibold text-navy dark:text-slate-100"><span className="mr-2 font-mono text-xs text-slate-400">{String(index + 1).padStart(2, "0")}</span>{phase.name}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{phase.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Section>

      <Section icon={Database} title={c.metricsTitle}>
        <dl className="space-y-2">
          {c.metrics.map((metric) => (
            <div key={metric.term} className="rounded-lg border border-line p-3 dark:border-white/10">
              <dt className="font-semibold text-navy dark:text-slate-100">{metric.term}</dt>
              <dd className="mt-0.5 text-sm leading-6">{metric.desc}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section icon={Tags} title={c.cvalueTitle}><p>{c.cvalue}</p></Section>

      <Section icon={Languages} title={c.langTitle}>
        <p className="rounded-xl border-l-4 border-orange bg-white p-4 shadow-card dark:bg-navy-900">{c.lang}</p>
      </Section>

      <Section icon={Lock} title={c.privacyTitle}><p>{c.privacy}</p></Section>

      <Section title={c.limitsTitle}><p>{c.limits}</p></Section>
    </article>
  );
}
