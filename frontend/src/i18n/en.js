// Diccionario de overrides en inglés. La clave es el texto original en español
// (que es lo que se muestra en modo "es"); aquí está su equivalente en inglés.
// Las variables van como {n}, {c}, etc. y se interpolan en tiempo de ejecución.
export default {
  // --- Cabecera / navegación ---
  "El proyecto": "About",
  "Cómo funciona": "How it works",
  "corpus": "corpus",
  docs: "docs",
  "car.": "chars",
  "Sobre el creador y el proyecto": "About the creator and the project",
  "Necesita ≥1 documento en el corpus": "Needs ≥1 document in the corpus",
  "En construcción": "Under construction",
  "«{label}» — en construcción.": "“{label}” — under construction.",
  "Cambiar a modo claro": "Switch to light mode",
  "Cambiar a modo oscuro": "Switch to dark mode",
  Idioma: "Language",

  // --- Fases (etiquetas de la barra) ---
  Importar: "Import",
  Limpiar: "Clean",
  Analizar: "Analyze",
  Terminología: "Terminology",
  Concordancia: "Concordance",
  Exportar: "Export",
  "Fase {n} de 6": "Step {n} of 6",

  // --- Corpus / panel ---
  "Corpus en sesión": "Session corpus",
  Vaciar: "Clear",
  "{n} documento": "{n} document",
  "{n} documentos": "{n} documents",
  "{c} caracteres": "{c} characters",
  "Aún no hay documentos. Importa desde una fuente o carga el corpus de ejemplo.":
    "No documents yet. Import from a source or load the sample corpus.",
  "Quitar documento": "Remove document",
  "{c} car.": "{c} chars",

  // --- Importar ---
  "Reúne textos desde varias fuentes. Cada documento se normaliza (NFKC) y los duplicados exactos se descartan automáticamente.":
    "Gather texts from several sources. Each document is normalised (NFKC) and exact duplicates are discarded automatically.",
  "Páginas web": "Web pages",
  Wikipedia: "Wikipedia",
  Archivos: "Files",
  Proyecto: "Project",
  "Cargar un corpus exportado en JSON (desde la fase Exportar).":
    "Load a corpus exported as JSON (from the Export step).",
  "Cargar proyecto": "Load project",
  "Los documentos se añaden a tu corpus actual; vacíalo antes si quieres empezar de cero.":
    "Documents are added to your current corpus; clear it first if you want to start fresh.",
  "Selecciona un archivo de proyecto (.json).": "Select a project file (.json).",
  "El archivo no es un JSON válido.": "The file is not valid JSON.",
  "El archivo no contiene un corpus válido.": "The file does not contain a valid corpus.",
  "Proyecto cargado: {n} documento(s).": "Project loaded: {n} document(s).",
  "URLs (una por línea)": "URLs (one per line)",
  Extraer: "Extract",
  "Cargar ejemplo": "Load sample",
  "Automático detecta el cuerpo del artículo (ideal para noticias). jusText y BeautifulSoup son alternativas si el método automático falla.":
    "Automatic detects the article body (ideal for news). jusText and BeautifulSoup are fallbacks if the automatic method fails.",
  "Términos de búsqueda (uno por línea)": "Search terms (one per line)",
  "Extraer de Wikipedia": "Extract from Wikipedia",
  "Archivos (.txt, .pdf, .docx)": "Files (.txt, .pdf, .docx)",
  "{n} archivo(s) seleccionado(s)": "{n} file(s) selected",
  "Subir y extraer": "Upload and extract",
  "Automático (trafilatura)": "Automatic (trafilatura)",
  "Pega al menos una URL.": "Paste at least one URL.",
  "Escribe al menos un término.": "Enter at least one term.",
  "Selecciona al menos un archivo.": "Select at least one file.",
  "{n} documento{s} añadido{s} al corpus.": "{n} document{s} added to the corpus.",
  "No se obtuvo ningún documento nuevo.": "No new documents were obtained.",
  "Corpus de ejemplo cargado ({n} documentos).": "Sample corpus loaded ({n} documents).",

  // --- Limpiar ---
  "Combina presets o reglas propias. El orden importa y cada regex tiene un límite de ejecución.":
    "Combine presets or your own rules. Order matters and each regex has a time limit.",
  // presets que devuelve el backend (se traducen en cliente)
  "Quitar referencias [12]": "Remove references [12]",
  "Elimina llamadas bibliográficas numéricas entre corchetes.":
    "Removes numeric bibliographic references in brackets.",
  "Quitar URLs": "Remove URLs",
  "Elimina direcciones http, https y www, sin llevarse la puntuación final.":
    "Removes http, https and www addresses, without taking the trailing punctuation.",
  "Quitar emails": "Remove emails",
  "Elimina direcciones de correo electrónico.": "Removes email addresses.",
  "Recortar líneas": "Trim lines",
  "Quita los espacios al inicio y al final de cada línea.":
    "Removes spaces at the start and end of each line.",
  "Unir líneas": "Join lines",
  "Convierte saltos simples en espacios y conserva los párrafos.":
    "Turns single breaks into spaces and keeps paragraphs.",
  "Colapsar saltos": "Collapse line breaks",
  "Reduce tres o más saltos de línea seguidos a dos (un párrafo).":
    "Reduces three or more consecutive line breaks to two (one paragraph).",
  "Quitar dígitos sueltos": "Remove isolated digits",
  "Elimina números aislados (incluidos decimales y miles), pero no los pegados a palabras o guiones.":
    "Removes standalone numbers (including decimals and thousands), but not those attached to words or hyphens.",
  "Normalizar espacios": "Normalize spaces",
  "Reduce espacios y tabulaciones repetidos.": "Collapses repeated spaces and tabs.",
  "Añadir regla manual": "Add manual rule",
  "Puedes escribir cualquier expresión regular; se aplica de forma segura con un límite de tiempo.":
    "You can write any regular expression; it is applied safely with a time limit.",
  "Regla manual": "Manual rule",
  "Expresión regular": "Regular expression",
  "Reemplazo (vacío = eliminar)": "Replacement (empty = delete)",
  "Quitar regla": "Remove rule",
  "Vista previa antes / después": "Before / after preview",
  "{n} reemplazos": "{n} replacements",
  Modificado: "Modified",
  "Sin cambios": "Unchanged",
  "Configura las reglas y genera una vista previa. El corpus aún no se modificará.":
    "Set up the rules and generate a preview. The corpus will not be modified yet.",
  "Vista previa": "Preview",
  "Aplicar al corpus": "Apply to corpus",
  "Añade al menos una regla de limpieza.": "Add at least one cleaning rule.",
  "Las expresiones regulares no pueden estar vacías.": "Regular expressions cannot be empty.",
  "Se modificarán {n} documento(s) del corpus. ¿Continuar?":
    "{n} corpus document(s) will be modified. Continue?",
  "Limpieza aplicada: {n} documento(s) modificados.": "Cleaning applied: {n} document(s) modified.",

  // --- Analizar ---
  Análisis: "Analysis",
  "Analizar el corpus": "Analyze the corpus",
  "spaCy etiquetará los textos en {lang} y calculará categorías gramaticales, lemas, n-gramas y métricas léxicas. El resultado queda asociado al contenido exacto del corpus.":
    "spaCy will tag the texts in {lang} and compute parts of speech, lemmas, n-grams and lexical metrics. The result is tied to the exact corpus content.",
  "{n} documentos · {c} caracteres": "{n} documents · {c} characters",
  "Ejecutar análisis": "Run analysis",
  Recalcular: "Recompute",
  "Modelo {lang} · hash {hash}": "{lang} model · hash {hash}",
  caché: "cache",
  "Análisis recuperado de la caché.": "Analysis retrieved from cache.",
  "El corpus parece estar en {lang}, pero el análisis se hizo en {current}.":
    "The corpus seems to be in {lang}, but the analysis ran in {current}.",
  "Analizar en {lang}": "Analyze in {lang}",
  "Corpus analizado correctamente.": "Corpus analyzed successfully.",
  Palabras: "Words",
  "tokens alfabéticos": "alphabetic tokens",
  Tipos: "Types",
  "formas distintas": "distinct forms",
  TTR: "TTR",
  "tipos / palabras": "types / words",
  Hapax: "Hapax",
  "aparecen una vez": "appear once",
  Densidad: "Density",
  "palabras léxicas": "content words",
  "Distribución de categorías POS": "POS category distribution",
  Tokens: "Tokens",
  "Lemas frecuentes (sin stopwords)": "Frequent lemmas (no stopwords)",
  "N-gramas": "N-grams",
  Bigramas: "Bigrams",
  Trigramas: "Trigrams",
  español: "Spanish",
  inglés: "English",
  // POS
  Adjetivo: "Adjective",
  Adposición: "Adposition",
  Adverbio: "Adverb",
  Auxiliar: "Auxiliary",
  Conjunción: "Conjunction",
  Determinante: "Determiner",
  Interjección: "Interjection",
  Nombre: "Noun",
  Número: "Numeral",
  Partícula: "Particle",
  Pronombre: "Pronoun",
  "Nombre propio": "Proper noun",
  Puntuación: "Punctuation",
  "Conj. subord.": "Subord. conj.",
  Símbolo: "Symbol",
  Verbo: "Verb",
  Otro: "Other",

  // --- Terminología ---
  "Extrae secuencias nominales y ordénalas mediante C-value, ajustando la frecuencia de los términos que aparecen dentro de otros más largos.":
    "Extract nominal sequences and rank them with C-value, adjusting the frequency of terms that appear inside longer ones.",
  "Mín. palabras": "Min. words",
  "Máx. palabras": "Max. words",
  "Frecuencia mín.": "Min. frequency",
  "Máx. resultados": "Max. results",
  "Extraer términos": "Extract terms",
  "análisis reutilizado de caché": "analysis reused from cache",
  "análisis calculado": "analysis computed",
  "{n} términos candidatos obtenidos.": "{n} candidate terms obtained.",
  "El mínimo de palabras no puede superar el máximo.": "The minimum number of words cannot exceed the maximum.",
  "Configura los parámetros y ejecuta la extracción.": "Set the parameters and run the extraction.",
  Término: "Term",
  "C-value": "C-value",
  Frecuencia: "Frequency",
  "Anidado en": "Nested in",

  // --- Concordancia (KWIC) ---
  "Concordancia KWIC": "KWIC concordance",
  "Localiza una palabra o frase y compara cada uso dentro de su contexto.":
    "Find a word or phrase and compare each use within its context.",
  "Palabra o frase": "Word or phrase",
  "p. ej. lingüística de corpus": "e.g. corpus linguistics",
  Ventana: "Window",
  Límite: "Limit",
  Buscar: "Search",
  "Escribe una palabra o frase.": "Enter a word or phrase.",
  "No se encontraron concordancias.": "No concordances found.",
  "Las concordancias aparecerán alineadas aquí.": "Concordances will appear aligned here.",
  "Sin resultados para «{q}».": "No results for “{q}”.",
  "{n} concordancias": "{n} concordances",
  Documento: "Document",
  "Contexto izquierdo": "Left context",
  Nodo: "Node",
  "Contexto derecho": "Right context",

  // --- Exportar ---
  "Conserva el corpus o sus resultados en un formato interoperable.":
    "Keep the corpus or its results in an interoperable format.",
  "1. Contenido": "1. Content",
  Corpus: "Corpus",
  "{n} documentos con metadatos y texto": "{n} documents with metadata and text",
  "{n} tokens etiquetados": "{n} tagged tokens",
  "Ejecuta antes la fase Analizar": "Run the Analyze step first",
  "2. Formato": "2. Format",
  Texto: "Text",
  "Descargar .{format}": "Download .{format}",
  "Ejecuta primero la fase Analizar.": "Run the Analyze step first.",
  "Archivo {filename} generado.": "File {filename} generated.",

  // --- About ---
  "Detrás del laboratorio": "Behind the lab",
  "Una herramienta nacida entre la lingüística y el código.":
    "A tool born between linguistics and code.",
  "Lingüista y desarrollador, en el cruce entre lingüística computacional y procesamiento del lenguaje natural.":
    "Linguist and developer, at the crossroads of computational linguistics and natural language processing.",
  Correo: "Email",
  "Por qué existe AlzoLab": "Why AlzoLab exists",
  "Construir un corpus suele obligar a encadenar herramientas y scripts distintos para extraer, limpiar, analizar y exportar textos. AlzoLab nace para reunir ese proceso en un espacio guiado, reproducible y accesible desde el navegador, especialmente para quienes trabajan con lenguaje y no quieren reconstruir la infraestructura en cada investigación.":
    "Building a corpus usually means chaining together different tools and scripts to extract, clean, analyze and export texts. AlzoLab brings that process into a single guided, reproducible space accessible from the browser, especially for those who work with language and would rather not rebuild the infrastructure for every study.",
  "Del prototipo al producto": "From prototype to product",
  "El proyecto comenzó como un prototipo en Streamlit y evoluciona hacia una aplicación React + FastAPI. La lógica lingüística permanece separada de la interfaz y cubierta por pruebas: el objetivo no es solo obtener resultados, sino hacer visible un proceso técnico que se pueda revisar, repetir y ampliar.":
    "The project began as a Streamlit prototype and is evolving into a React + FastAPI application. The linguistic logic stays separate from the interface and covered by tests: the goal is not just to get results, but to make visible a technical process that can be reviewed, repeated and extended.",
};
