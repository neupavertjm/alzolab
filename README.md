---
title: AlzoLab
emoji: 🔬
colorFrom: blue
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: Bilingual (ES/EN) web lab for corpus linguistics and NLP
---

<p align="center">
  <img src="assets/logo_lockup.svg" alt="AlzoLab" width="280">
</p>

<p align="center">
  <strong>A corpus linguistics laboratory</strong><br>
  End-to-end NLP pipeline in the browser: multi-source ingestion → cleaning →
  spaCy analysis → terminology → concordances → export. Works in <strong>Spanish and English</strong>.
</p>

<p align="center">
  <a href="https://github.com/neupavertjm/alzolab/actions/workflows/ci.yml"><img src="https://github.com/neupavertjm/alzolab/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/spaCy-09A3D5?logo=spacy&logoColor=white" alt="spaCy">
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-EF7E32" alt="License: MIT">
</p>

<p align="center"><strong>English</strong> · <a href="README.es.md">Español</a></p>

A web app to gather texts from several sources, organize them into a corpus,
clean them, analyze them morphosyntactically with spaCy, extract terminology and
export them — all from the browser, without writing code. Inspired by corpus
linguistics tools such as Sketch Engine, but lightweight and self-contained.

🔗 **Live demo:** <https://jmneupavert-alzolab.hf.space>

## Screenshots

**Import** — gather texts from web pages, Wikipedia or files.

![Import](docs/importar.png)

**Clean** — regex rules with a live before/after preview.

![Clean](docs/limpiar.png)

**Analyze** — POS distribution, lemmas, n-grams and lexical metrics with spaCy.

![Analyze](docs/analizar.png)

**Concordance (KWIC)** — a word in its context.

![Concordance](docs/concordancia.png)

**Export** — corpus or analysis as txt / json / csv.

![Export](docs/exportar.png)

---

## The problem

Building a corpus for linguistic research or NLP usually means gluing together
loose scripts: one to download pages, another to clean the HTML, another to tag
with spaCy and another to dump to CSV. It is repetitive and hard to reproduce,
especially for people coming from linguistics who do not want to set up an
infrastructure for every experiment.

## The solution

A single app with the full workflow guided in tabs, available in **Spanish and
English** (one switch changes both the interface and the analysis language):

1. **Import** — extract documents from web pages (articles and news, via
   trafilatura / jusText / BeautifulSoup), Wikipedia or files (`.txt`, `.pdf`,
   `.docx`), with NFKC normalization and deduplication.
2. **Clean** — regex rules with a _before / after_ preview and a ReDoS guard.
3. **Analyze** — POS and morphological tagging with spaCy, category distribution,
   frequent lemmas, n-grams and lexical metrics (TTR, hapax, density), cached per corpus.
4. **Terminology** — candidate terms by POS filter, ranked with **C-value**
   (Frantzi, Ananiadou & Mima, 2000).
5. **Concordance (KWIC)** — find a word or phrase and show it in context.
6. **Export** — download the corpus or the analysis as `.txt`, `.json`, `.csv`.

## Architecture

```text
backend/                  FastAPI (REST API + serves the SPA in production)
├─ app/
│  ├─ main.py             App, CORS, rate limiting, /api mount and React build
│  ├─ api/routes/         Endpoints (extract, clean, analyze, terminology, …)
│  ├─ core/               Pure corpus logic, framework-free (testable on its own)
│  └─ schemas/            Pydantic models (typed JSON contract)
└─ tests/                 pytest over the pure logic

frontend/                 React 18 + Vite + TailwindCSS (SPA)
└─ src/{App, pages/, components/, context/, hooks/, i18n/, lib/}

Dockerfile                Multi-stage: React build → FastAPI runtime (single container)
```

The **corpus logic lives in `backend/app/core`**, decoupled from FastAPI: each
function takes data and returns structures, so it can be tested and reused
without starting the server. The frontend/backend contract is **typed JSON with
Pydantic** (no serializing to strings and re-parsing).

The interface is fully bilingual through a small custom i18n layer
(`frontend/src/i18n`); the language selector also picks the spaCy model
(`es_core_news_sm` / `en_core_web_sm`) used for analysis.

## Stack

**Backend:** Python · FastAPI · spaCy · trafilatura · jusText · BeautifulSoup
· Wikipedia-API · pypdf · python-docx
**Frontend:** React 18 · Vite · TailwindCSS · axios · Recharts · lucide-react · sonner

## Running locally

You need **two processes** in development (the API and Vite with hot reload).

**Backend** (port 8000):

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (port 5173, proxies `/api` to the backend):

```powershell
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>.

### Backend tests

```powershell
cd backend
pytest
```

## Deployment (Hugging Face Spaces · Docker)

A single container: the `Dockerfile` builds the frontend and starts FastAPI,
which serves the API and the static SPA from the same origin (port 7860).

1. Create a **Docker** Space.
2. Push the repo (or connect it to GitHub).
3. HF builds the image and publishes the app. Zero cost; it sleeps on inactivity
   and wakes up on the first visit.

## Roadmap

- [x] Import (web, Wikipedia, files) end-to-end.
- [x] Clean (regex pipeline with preview and ReDoS guard).
- [x] Analyze (spaCy with structured output and per-corpus cache).
- [x] Terminology (C-value) and Concordance (KWIC), with known-case tests.
- [x] Export (txt / json / csv).
- [x] Bilingual ES/EN interface and analysis.
- [ ] Embeddings-based polysemy layer (WSI), precomputed and served as JSON.

## Author

**Juan Manuel Neupavert Alzola** — linguist and developer, at the crossroads of
computational linguistics and NLP.

- 📧 [neupavertjm@gmail.com](mailto:neupavertjm@gmail.com)
- 💼 [LinkedIn](https://www.linkedin.com/in/juan-manuel-neupavert/)
- 🐙 [GitHub @neupavertjm](https://github.com/neupavertjm)

## License

Distributed under the **MIT** license (see [LICENSE](LICENSE)).
