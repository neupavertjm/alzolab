"""Endpoints auxiliares de corpus."""

from fastapi import APIRouter

from app.core.sample_data import build_sample_corpus
from app.schemas.extract import CorpusEntry

router = APIRouter(prefix="/corpus", tags=["corpus"])


@router.get("/sample", response_model=list[CorpusEntry])
def sample_corpus() -> list[dict]:
    """Corpus de ejemplo precargado, para que la app muestre algo al abrirse."""
    return build_sample_corpus()
