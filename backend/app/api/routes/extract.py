"""Endpoints de la fase de Importar: web, Wikipedia y archivos.

Cada endpoint orquesta las funciones puras de `core/` y devuelve un
`ExtractResult` (documentos + avisos). Una fuente que falla o no devuelve texto
no aborta el lote: se añade a `warnings`.
"""

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core import extractors
from app.core.files import parse_upload
from app.core.text import build_entry, remove_duplicates
from app.schemas.extract import (
    ExtractResult,
    WebExtractRequest,
    WebMethod,
    WikipediaExtractRequest,
)

router = APIRouter(prefix="/extract", tags=["extract"])
MAX_UPLOAD_BYTES = 10 * 1024 * 1024
MAX_UPLOAD_FILES = 10


@router.post("/web", response_model=ExtractResult)
def extract_web(payload: WebExtractRequest) -> ExtractResult:
    """Extrae texto de páginas web con el método elegido (trafilatura/jusText/BS4)."""
    entries = []
    warnings = []
    for raw_url in payload.urls:
        url = raw_url.strip()
        if not url:
            continue
        try:
            if payload.method == WebMethod.trafilatura:
                text = extractors.extract_trafilatura(url)
            else:
                html = extractors.fetch_html(url)
                text = (
                    extractors.extract_justext(html)
                    if payload.method == WebMethod.justext
                    else extractors.extract_bs(html)
                )
        except Exception as exc:
            warnings.append(f"Error en {url}: {exc}")
            continue
        if text:
            entries.append(build_entry(payload.method.value, url, text))
        else:
            warnings.append(
                f"No se extrajo texto de {url} (método «{payload.method.value}»). "
                "Prueba otro método."
            )
    return ExtractResult(entries=remove_duplicates(entries), warnings=warnings)


@router.post("/wikipedia", response_model=ExtractResult)
def extract_wikipedia(payload: WikipediaExtractRequest) -> ExtractResult:
    """Extrae el texto de páginas de Wikipedia a partir de términos de búsqueda."""
    entries = []
    warnings = []
    for raw_query in payload.queries:
        query = raw_query.strip()
        if not query:
            continue
        text = extractors.extract_wikipedia(query, lang=payload.lang)
        if text:
            entries.append(build_entry("Wikipedia", f"Wiki:{query}", text))
        else:
            warnings.append(
                f"No se encontró o no se pudo extraer la página de Wikipedia: «{query}»."
            )
    return ExtractResult(entries=remove_duplicates(entries), warnings=warnings)


@router.post("/files", response_model=ExtractResult)
async def extract_files(files: list[UploadFile] = File(...)) -> ExtractResult:
    """Extrae texto de archivos subidos (.txt / .pdf / .docx)."""
    if len(files) > MAX_UPLOAD_FILES:
        raise HTTPException(status_code=413, detail="Se permiten como máximo 10 archivos por lote.")
    entries = []
    warnings = []
    for upload in files:
        data = await upload.read(MAX_UPLOAD_BYTES + 1)
        if len(data) > MAX_UPLOAD_BYTES:
            warnings.append(f"«{upload.filename}» supera el límite de 10 MB.")
            continue
        text = parse_upload(upload.filename, data)
        if text:
            entries.append(build_entry("Archivo", upload.filename, text))
        else:
            warnings.append(
                f"No se pudo leer «{upload.filename}» "
                "(¿formato no soportado o archivo dañado?)."
            )
    return ExtractResult(entries=remove_duplicates(entries), warnings=warnings)
