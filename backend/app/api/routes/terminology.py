"""Endpoint C-value construido sobre el análisis cacheado."""

from fastapi import APIRouter, HTTPException

from app.core.analysis import ModelUnavailableError, analyze_text
from app.core.terminology import extract_terminology
from app.schemas.terminology import TerminologyRequest, TerminologyResponse

router = APIRouter(prefix="/terminology", tags=["terminology"])


@router.post("", response_model=TerminologyResponse)
def terminology(payload: TerminologyRequest) -> dict:
    if payload.min_words > payload.max_words:
        raise HTTPException(status_code=422, detail="min_words no puede superar max_words.")
    text = "\n\n".join(document.text for document in payload.documents)
    if len(text) > 1_000_000:
        raise HTTPException(status_code=413, detail="El corpus supera el límite de 1.000.000 de caracteres.")
    try:
        analysis, cached = analyze_text(text)
    except ModelUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    terms = extract_terminology(
        analysis.tokens,
        min_words=payload.min_words,
        max_words=payload.max_words,
        min_frequency=payload.min_frequency,
        top_n=payload.top_n,
    )
    return {"corpus_hash": analysis.corpus_hash, "analysis_cached": cached, "terms": terms}
