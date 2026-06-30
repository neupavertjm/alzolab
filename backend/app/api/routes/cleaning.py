"""Endpoints de vista previa y aplicación de limpieza."""

from fastapi import APIRouter

from app.core.cleaning import PRESETS, CleaningRule, apply_regex_pipeline
from app.schemas.cleaning import CleanRequest, CleanResponse, CleanedDocument, CleaningPreset

router = APIRouter(prefix="/clean", tags=["clean"])


@router.get("/presets", response_model=list[CleaningPreset])
def cleaning_presets() -> tuple[dict, ...]:
    return PRESETS


def _transform(payload: CleanRequest) -> CleanResponse:
    if sum(len(document.text) for document in payload.documents) > 1_000_000:
        from fastapi import HTTPException

        raise HTTPException(status_code=413, detail="El lote supera 1.000.000 de caracteres.")
    rules = [CleaningRule(**rule.model_dump()) for rule in payload.rules]
    documents = []
    warnings: list[str] = []
    for document in payload.documents:
        result = apply_regex_pipeline(document.text, rules)
        documents.append(CleanedDocument(id=document.id, before=document.text, after=result.text, changed=result.text != document.text, replacements=result.replacements))
        warnings.extend(f"{document.id}: {warning}" for warning in result.warnings)
    return CleanResponse(documents=documents, warnings=list(dict.fromkeys(warnings)))


@router.post("/preview", response_model=CleanResponse)
def preview_cleaning(payload: CleanRequest) -> CleanResponse:
    return _transform(payload)


@router.post("/apply", response_model=CleanResponse)
def apply_cleaning(payload: CleanRequest) -> CleanResponse:
    # El corpus vive en el navegador; este endpoint transforma, no persiste.
    return _transform(payload)
