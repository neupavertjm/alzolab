"""Endpoints auxiliares de corpus."""

from fastapi import APIRouter

from app.core.sample_data import build_sample_corpus
from app.schemas.extract import CorpusEntry, Language

router = APIRouter(prefix="/corpus", tags=["corpus"])


@router.get("/sample", response_model=list[CorpusEntry])
def sample_corpus(lang: Language = "es") -> list[dict]:
    """Corpus de ejemplo precargado (en el idioma dado), para mostrar algo al abrir."""
    return build_sample_corpus(lang)
