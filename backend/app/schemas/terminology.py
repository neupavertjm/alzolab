"""Contrato de extracción terminológica."""

from pydantic import BaseModel, Field

from app.schemas.analysis import AnalysisDocument


class TerminologyRequest(BaseModel):
    documents: list[AnalysisDocument] = Field(min_length=1, max_length=50)
    min_words: int = Field(default=2, ge=1, le=5)
    max_words: int = Field(default=5, ge=1, le=8)
    min_frequency: int = Field(default=2, ge=1, le=1000)
    top_n: int = Field(default=100, ge=1, le=500)


class TermResponse(BaseModel):
    term: str
    cvalue: float
    frequency: int
    words: int
    nested_in: int


class TerminologyResponse(BaseModel):
    corpus_hash: str
    analysis_cached: bool
    terms: list[TermResponse]
