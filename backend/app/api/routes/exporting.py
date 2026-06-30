"""Descargas de corpus y análisis en TXT, JSON y CSV."""

from fastapi import APIRouter
from fastapi.responses import Response

from app.core.exporting import export_analysis, export_corpus
from app.schemas.exporting import ExportKind, ExportRequest

router = APIRouter(prefix="/export", tags=["export"])

CONTENT_TYPES = {
    "txt": "text/plain; charset=utf-8",
    "json": "application/json; charset=utf-8",
    "csv": "text/csv; charset=utf-8",
}


@router.post("")
def export(payload: ExportRequest) -> Response:
    file_format = payload.format.value
    if payload.kind == ExportKind.corpus:
        content = export_corpus([document.model_dump() for document in payload.documents], file_format)
    else:
        content = export_analysis(payload.analysis.model_dump(), file_format)
    filename = f"alzolab-{payload.kind.value}.{file_format}"
    return Response(
        content=content.encode("utf-8-sig" if file_format == "csv" else "utf-8"),
        media_type=CONTENT_TYPES[file_format],
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
