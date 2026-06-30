"""Endpoint de concordancias por documento."""

from fastapi import APIRouter

from app.core.concordance import kwic
from app.schemas.concordance import ConcordanceRequest, ConcordanceResponse

router = APIRouter(prefix="/concordance", tags=["concordance"])


@router.post("", response_model=ConcordanceResponse)
def concordance(payload: ConcordanceRequest) -> dict:
    results = []
    remaining = payload.max_results
    for document in payload.documents:
        for match in kwic(document.text, payload.query, payload.window, remaining):
            results.append(
                {
                    "document_id": document.id,
                    "document_label": document.label,
                    "left": match.left,
                    "node": match.node,
                    "right": match.right,
                }
            )
        remaining = payload.max_results - len(results)
        if remaining <= 0:
            break
    return {"results": results, "total": len(results)}
