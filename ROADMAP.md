# Roadmap de AlzoLab — pasos hasta completar el programa

Documento de trabajo. Las seis fases del MVP funcionan end-to-end; este archivo
conserva su especificación y enumera el trabajo transversal pendiente. Sin estimaciones
de tiempo: el orden importa más que el calendario.

---

## Estado actual (hecho)

- **Monorepo** `backend/` (FastAPI) + `frontend/` (React 18 + Vite + Tailwind),
  `Dockerfile` multi-stage para Hugging Face Spaces, README, LICENSE (MIT).
- **Backend**: lógica pura en `app/core/` (extractores, texto, archivos, sample),
  contrato JSON tipado con Pydantic, router `/api/extract` (web/wikipedia/files)
  y `/api/corpus/sample`. Tests deterministas en verde.
- **Frontend**: sistema de diseño propio (navy + naranja, serif Fraunces, mono
  IBM Plex, fondo papel), barra de proceso horizontal sin números (Importar como
  puerta; el resto se desbloquea con ≥1 documento), corpus en sesión.
- **Fase 1 · Importar**: completa y verificada contra fuentes reales.
- **Fase 2 · Limpiar**: pipeline regex, presets, preview visual, aplicación al
  corpus y timeout anti-ReDoS, con tests deterministas.
- **Fase 3 · Analizar**: spaCy español con carga diferida, salida estructurada,
  caché LRU por hash, métricas, POS, lemas y n-gramas visualizados.
- **Fase 4 · Terminología**: candidatos nominales y C-value genérico con ajuste
  de términos anidados, controles y tabla reordenable.
- **Fase 5 · Concordancia**: KWIC por palabra o frase, contexto configurable y
  resultados alineados por documento.
- **Fase 6 · Exportar**: corpus y análisis descargables en TXT, JSON y CSV.
- **El proyecto**: sección pública sobre Juan Manuel Neupavert Alzola, la
  motivación de AlzoLab y el origen del nombre.

---

## Principios que guían cada fase (no romper)

1. **Lógica pura en `core/`**, desacoplada de FastAPI: se prueba sin servidor.
2. **Contrato JSON tipado** con Pydantic: nada de serializar a strings y reparsear.
3. **Tests de lo determinista** (C-value, KWIC, n-gramas, limpieza) con casos
   conocidos — es el núcleo del perfil de *AI Evaluation*.
4. **Coste cero**: nada que exija infraestructura de pago; lo pesado se precomputa
   offline y se sirve como JSON estático.
5. **Diseño no genérico**: coherencia editorial navy + naranja, sin look de plantilla.

### La receta para añadir una fase (se repite en 2–6)

1. Portar/escribir la lógica pura en `app/core/<fase>.py`.
2. Definir `app/schemas/<fase>.py` (request/response Pydantic).
3. Crear `app/api/routes/<fase>.py` y registrarlo en `main.py`.
4. Escribir `backend/tests/test_<fase>.py` con casos conocidos.
5. Crear `frontend/src/pages/<Fase>Page.jsx` + cableado al cliente axios.
6. Marcar la fase como `ready: true` en `frontend/src/config/stages.js` y enrutar
   en `App.jsx`.
7. Verificar: `pytest` + `npm run build` + prueba manual end-to-end.

---

## Fase 2 · Limpiar (pipeline regex)

**Estado: completada.**

**Backend**
- `core/cleaning.py`: portar `apply_regex_pipeline(text, rules)` del prototipo.
- **Guardia anti-ReDoS**: las regex del usuario son entrada peligrosa. Usar el
  módulo `regex` con `timeout=` por sustitución (o validar/limitar), capturando el
  fallo y devolviéndolo como aviso en vez de colgar el worker.
- Presets de limpieza (quitar `[12]`, URLs, emails, normalizar espacios, unir
  líneas, dígitos sueltos) como constantes reutilizables.
- Schema: `CleanRequest { text | doc_ids, rules: [{regex, replacement}] }` y
  respuesta con **vista previa antes/después** (no aplicar a ciegas).
- Endpoint `/api/clean/preview` (devuelve diff) y `/api/clean/apply` (modifica el
  corpus en sesión del cliente; el backend solo transforma texto).

**Tests**
- Cada preset hace lo que dice; idempotencia donde aplique.
- Una regex catastrófica (p. ej. `(a+)+$`) corta por timeout y no cuelga.

**Frontend** — `CleanPage.jsx`
- Botones de preset (un clic) + editor de regla manual (avanzado).
- **Vista previa antes/después** sobre un documento de muestra (resaltado del diff).
- Aplicar al corpus completo con confirmación.

**Hecho cuando**: se aplican reglas con preview, las regex peligrosas no tumban el
servidor, y el corpus refleja los cambios.

---

## Fase 3 · Analizar (spaCy)

**Estado: completada.**

**Backend**
- Añadir a `requirements.txt`: `spacy` + el wheel de `es_core_news_sm`. Actualizar
  el `Dockerfile` para que el modelo quede instalado en la imagen.
- `core/analysis.py`: **NO** serializar a TSV. Devolver estructuras:
  `list[Token{token, lemma, pos, tag, morph}]`. Portar `top_ngrams` y
  `lexical_stats` (TTR, hapax, densidad léxica), y la distribución de POS.
- **Caché por corpus**: indexar el análisis por hash del texto para no recalcular
  spaCy en cada interacción (clave para la agilidad y el coste).
- Schema tipado para tokens, n-gramas, métricas y distribución POS.
- Endpoint `/api/analyze` (recibe texto/corpus, devuelve el análisis estructurado).

**Tests**
- `top_ngrams` con casos conocidos (bigramas/trigramas y conteos).
- `lexical_stats`: TTR, hapax y densidad sobre un texto pequeño calculado a mano.

**Frontend** — `AnalyzePage.jsx`
- Gráfico de distribución de POS (Recharts).
- Tabla de lemas frecuentes con filtro de stopwords (spaCy es).
- N-gramas (bigramas/trigramas) y tarjetas de métricas léxicas.

**Nota honesta**: spaCy engorda la imagen y el arranque en frío de HF Spaces.
Es asumible para portfolio; mantener la fase de Importar sin cargar el modelo.

**Hecho cuando**: se ejecuta el análisis, se cachea por corpus y se visualiza
POS + lemas + n-gramas + métricas sin reparsear strings.

---

## Fase 4 · Terminología (C-value)

**Estado: completada.**

**Backend**
- `core/terminology.py`: portar `extract_term_candidates` (filtro POS) y
  `compute_cvalue` (C-value de Frantzi, Ananiadou & Mima, 2000) + `extract_terminology`.
  Usa el POS de spaCy de la fase 3; nada propietario.
- Schema + endpoint `/api/terminology` con parámetros (min/max palabras, frecuencia
  mínima, top N).

**Tests** (los más valiosos para el perfil)
- C-value con un corpus de juguete donde el ranking esperado se conoce.
- Términos anidados: que la ponderación por anidamiento se calcule bien.

**Frontend** — `TermsPage.jsx`
- Tabla rankeada (término · C-value · frecuencia · nº palabras).
- Controles de parámetros y reordenación.

**Límite de IP**: aquí va el **C-value genérico del prototipo**, no el método de
NeupaTerm. No introducir nada derivado de ese proyecto privado.

**Hecho cuando**: la tabla de términos sale rankeada por C-value y los tests de
casos conocidos pasan.

---

## Fase 5 · Concordancia (KWIC)

**Estado: completada.**

**Backend**
- `core/concordance.py`: portar `tokenize_words` y `kwic` (ventana, sin distinguir
  mayúsculas, máximo de resultados).
- Schema + endpoint `/api/concordance`.

**Tests**
- KWIC con casos conocidos: ventana izquierda/derecha, insensibilidad a mayúsculas,
  límite `max_results`, palabra inexistente → lista vacía.

**Frontend** — `KwicPage.jsx`
- Input de palabra + tamaño de ventana; tabla con el nodo centrado/alineado
  (izquierda · nodo · derecha) en tipografía mono.

**Hecho cuando**: buscar una palabra muestra sus concordancias alineadas.

---

## Fase 6 · Exportar

**Estado: completada.**

**Backend**
- Endpoint `/api/export` que sirva el **corpus** o el **análisis** en `.txt`,
  `.json` o `.csv` (CSV/JSON del análisis es más cómodo generarlos en servidor;
  el `.txt` del corpus puede ser cliente).
- Cabeceras `Content-Disposition` para descarga directa.

**Frontend** — `ExportPage.jsx`
- Elegir qué exportar (corpus / análisis) y formato; botón de descarga.

**Hecho cuando**: se descarga el corpus y el análisis en los tres formatos.

---

## Transversal (calidad y cierre)

- **Caché de análisis** por corpus ya cubierta en fase 3; revisar invalidación al
  limpiar/editar.
- **Persistencia opcional** del corpus en `localStorage` para sobrevivir recargas
  (el prototipo se reiniciaba; mejora barata de UX). Decidir alcance.
- **Múltiples corpora** en sesión (el prototipo los soportaba): opcional; si entra,
  el `CorpusContext` pasa de uno a un mapa de corpora con selector. Evaluar si
  aporta o complica.
- **Manejo de errores** consistente (toasts) y estados de carga en todas las fases.
- **Accesibilidad** básica: foco, `aria-label`, contraste (el naranja sobre navy
  cumple; revisar el naranja sobre papel en textos pequeños).

---

## Despliegue (Hugging Face Spaces · Docker)

**Preparación completada:** metadatos `sdk: docker`, puerto 7860, healthcheck,
usuario no-root, límites de entrada, rate limiting y protección SSRF.

1. Finalizar el `Dockerfile`: instalar `es_core_news_sm` en la imagen (fase 3) y
   probar el build en local (`docker build` + `docker run`).
2. Verificar que un solo contenedor sirve API + SPA en el puerto 7860.
3. Crear el Space tipo Docker, conectar el repo, publicar.
4. Poner la **URL de la demo** en el README y añadir **capturas** en `docs/`
   (importar, limpieza con diff, análisis con gráfico POS, terminología, KWIC).

---

## Tests y CI

- Ampliar `pytest` con cada fase (objetivo: toda la lógica de `core/` cubierta).
- **GitHub Actions**: workflow que corra `pytest` del backend y `npm run build`
  (+ lint) del frontend en cada push. Da un badge verde de calidad en el README.

---

## Roadmap futuro (pieza estrella, no bloquea el MVP)

- **Capa de polisemia por embeddings (WSI)**: clustering de usos de una palabra con
  `sentence-transformers`, **precomputado offline** y servido como **JSON estático**
  (mantiene el coste cero). Construir el frontend ya extensible para enchufarla.
- **Esports Polysemy Dataset** exportable, derivado de esa capa.

---

## Checklist resumida

- [x] Fase 1 · Importar (web / Wikipedia / archivos) end-to-end
- [x] Fase 2 · Limpiar (regex + preview + guardia ReDoS)
- [x] Fase 3 · Analizar (spaCy estructurado + caché + visualizaciones)
- [x] Fase 4 · Terminología (C-value + tests de casos conocidos)
- [x] Fase 5 · Concordancia (KWIC + tests)
- [x] Fase 6 · Exportar (txt / json / csv)
- [ ] Persistencia / múltiples corpora (opcional)
- [ ] CI (pytest + build) y badge
- [ ] Despliegue en HF Spaces + URL de demo + capturas
- [ ] Capa WSI de polisemia (futuro)
