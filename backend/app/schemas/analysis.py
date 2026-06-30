"""Contrato JSON tipado de la fase Analizar."""

from pydantic import BaseModel, Field


class AnalysisDocument(BaseModel):
    id: str
    text: str = Field(min_length=1, max_length=500_000)


class AnalyzeRequest(BaseModel):
    documents: list[AnalysisDocument] = Field(min_length=1, max_length=50)


class TokenResult(BaseModel):
    token: str
    lemma: str
    pos: str
    tag: str
    morph: str


class LexicalMetrics(BaseModel):
    words: int
    types: int
    ttr: float
    hapax: int
    lexical_density: float


class CountResult(BaseModel):
    label: str
    count: int


class PosResult(CountResult):
    percentage: float


class AnalyzeResponse(BaseModel):
    corpus_hash: str
    cached: bool
    tokens: list[TokenResult]
    metrics: LexicalMetrics
    pos_distribution: list[PosResult]
    lemmas: list[CountResult]
    bigrams: list[CountResult]
    trigrams: list[CountResult]
