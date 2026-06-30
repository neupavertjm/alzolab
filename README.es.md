<p align="center">
  <img src="assets/logo_lockup.svg" alt="AlzoLab" width="280">
</p>

<p align="center">
  <strong>Laboratorio de lingüística de corpus</strong><br>
  Pipeline de NLP end-to-end en el navegador: ingesta multifuente → limpieza →
  análisis con spaCy → terminología → concordancias → exportación. Funciona en <strong>español e inglés</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/spaCy-09A3D5?logo=spacy&logoColor=white" alt="spaCy">
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-EF7E32" alt="License: MIT">
</p>

<p align="center"><a href="README.md">English</a> · <strong>Español</strong></p>

Aplicación web para reunir textos desde varias fuentes, organizarlos en un
corpus, limpiarlos, analizarlos morfosintácticamente con spaCy, extraer
terminología y exportarlos — todo desde el navegador, sin escribir código.
Inspirada en herramientas de lingüística de corpus como Sketch Engine, pero
ligera y autocontenida.

🔗 **Demo en vivo:** <https://jmneupavert-alzolab.hf.space>

---

## El problema

Construir un corpus para investigación lingüística o NLP suele implicar pegar
scripts sueltos: uno para descargar páginas, otro para limpiar el HTML, otro
para etiquetar con spaCy y otro para volcar a CSV. Es repetitivo y poco
reproducible, sobre todo para quien viene de la lingüística y no quiere montar
una infraestructura para cada experimento.

## La solución

Una única app con el flujo completo guiado en pestañas, disponible en **español
e inglés** (un único selector cambia la interfaz y el idioma de análisis):

1. **Importar** — extrae documentos de páginas web (artículos y noticias, con
   trafilatura / jusText / BeautifulSoup), Wikipedia o archivos (`.txt`, `.pdf`,
   `.docx`), con normalización NFKC y deduplicado.
2. **Limpiar** — reglas regex con vista previa _antes / después_ y guardia anti-ReDoS.
3. **Analizar** — etiquetado POS y morfológico con spaCy, distribución de
   categorías, lemas frecuentes, n-gramas y métricas léxicas (TTR, hapax,
   densidad), cacheado por corpus.
4. **Terminología** — términos candidatos por filtro POS, rankeados con
   **C-value** (Frantzi, Ananiadou & Mima, 2000).
5. **Concordancia (KWIC)** — busca una palabra o frase y la muestra en su contexto.
6. **Exportar** — descarga del corpus o del análisis en `.txt`, `.json`, `.csv`.

## Arquitectura

```text
backend/                  FastAPI (API REST + sirve el SPA en producción)
├─ app/
│  ├─ main.py             App, CORS, rate limiting, montaje de /api y del build de React
│  ├─ api/routes/         Endpoints (extract, clean, analyze, terminology, …)
│  ├─ core/               Lógica pura de corpus, sin framework (testeable a pelo)
│  └─ schemas/            Modelos Pydantic (contrato JSON tipado)
└─ tests/                 pytest sobre la lógica pura

frontend/                 React 18 + Vite + TailwindCSS (SPA)
└─ src/{App, pages/, components/, context/, hooks/, i18n/, lib/}

Dockerfile                Multi-stage: build de React → runtime FastAPI (1 contenedor)
```

La **lógica de corpus vive en `backend/app/core`**, desacoplada de FastAPI: cada
función recibe datos y devuelve estructuras, de modo que se puede probar y
reutilizar sin levantar el servidor. El contrato entre frontend y backend es
**JSON tipado con Pydantic** (sin serializar a strings y re-parsear).

La interfaz es totalmente bilingüe mediante una pequeña capa i18n propia
(`frontend/src/i18n`); el selector de idioma también elige el modelo de spaCy
(`es_core_news_sm` / `en_core_web_sm`) usado en el análisis.

## Stack

**Backend:** Python · FastAPI · spaCy · trafilatura · jusText · BeautifulSoup
· Wikipedia-API · pypdf · python-docx
**Frontend:** React 18 · Vite · TailwindCSS · axios · Recharts · lucide-react · sonner

## Cómo ejecutar en local

Necesitas **dos procesos** en desarrollo (la API y Vite con hot-reload).

**Backend** (puerto 8000):

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (puerto 5173, proxia `/api` al backend):

```powershell
cd frontend
npm install
npm run dev
```

Abre <http://localhost:5173>.

### Tests del backend

```powershell
cd backend
pytest
```

## Despliegue (Hugging Face Spaces · Docker)

Un único contenedor: el `Dockerfile` compila el frontend y arranca FastAPI, que
sirve la API y el SPA estático desde el mismo origen (puerto 7860).

1. Crea un Space de tipo **Docker**.
2. Sube el repo (o conéctalo a GitHub).
3. HF construye la imagen y publica la app. Coste cero; se duerme con la
   inactividad y despierta en la primera visita.

## Roadmap

- [x] Importar (web, Wikipedia, archivos) end-to-end.
- [x] Limpiar (pipeline regex con vista previa y guardia anti-ReDoS).
- [x] Analizar (spaCy con salida estructurada y caché por corpus).
- [x] Terminología (C-value) y Concordancia (KWIC), con tests de casos conocidos.
- [x] Exportar (txt / json / csv).
- [x] Interfaz y análisis bilingües ES/EN.
- [ ] Capa de polisemia por embeddings (WSI), precomputada y servida como JSON.

## Autor

**Juan Manuel Neupavert Alzola** — lingüista y desarrollador, en el cruce entre
lingüística computacional y NLP.

El nombre une **Alzo**, tomado de Alzola, y **lab**, laboratorio. La sílaba
**la** actúa como bisagra: completa el apellido _Alzo·la_ y abre a la vez la
palabra _lab_. Una firma personal que también describe el producto: un
laboratorio para experimentar con corpus.

- 📧 [neupavertjm@gmail.com](mailto:neupavertjm@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/juan-manuel-neupavert/)
- 🐙 [GitHub @neupavertjm](https://github.com/neupavertjm)

## Licencia

Distribuido bajo licencia **MIT** (ver [LICENSE](LICENSE)).
