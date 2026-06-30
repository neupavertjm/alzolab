"""Endpoint de análisis morfosintáctico y léxico."""

from fastapi import APIRouter, HTTPException

from app.core.analysis import ModelUnavailableError, analyze_text
from app.schemas.analysis import AnalyzeRequest, AnalyzeResponse

router = APIRouter(prefix="/analyze", tags=["analyze"])
MAX_CORPUS_CHARS = 1_000_000


@router.post("", response_model=AnalyzeResponse)
def analyze_corpus(payload: AnalyzeRequest) -> dict:
    text = "\n\n".join(document.text for document in payload.documents)
    if len(text) > MAX_CORPUS_CHARS:
        raise HTTPException(status_code=413, detail="El corpus supera el límite de 1.000.000 de caracteres.")
    try:
        result, cached = analyze_text(text)
    except ModelUnavailableError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    words = result.word_count
    return {
        "corpus_hash": result.corpus_hash,
        "cached": cached,
        "tokens": result.tokens,
        "metrics": {
            "words": words,
            "types": result.type_count,
            "ttr": result.ttr,
            "hapax": result.hapax,
            "lexical_density": result.lexical_density,
        },
        "pos_distribution": [
            {"label": label, "count": count, "percentage": count / words if words else 0.0}
            for label, count in result.pos_distribution
        ],
        "lemmas": [{"label": label, "count": count} for label, count in result.lemmas],
        "bigrams": [{"label": label, "count": count} for label, count in result.bigrams],
        "trigrams": [{"label": label, "count": count} for label, count in result.trigrams],
    }
