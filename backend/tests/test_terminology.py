"""Casos conocidos del C-value genérico."""

import pytest

from app.core.terminology import compute_cvalue


def test_cvalue_known_ranking_and_values():
    results = compute_cvalue({"red neuronal": 3, "red neuronal profunda": 2})
    by_term = {result.term: result for result in results}
    assert results[0].term == "red neuronal profunda"
    assert by_term["red neuronal profunda"].cvalue == pytest.approx(2 * 1.5849625)
    assert by_term["red neuronal"].cvalue == pytest.approx(1.0)


def test_nested_term_uses_mean_container_frequency():
    results = compute_cvalue(
        {"modelo lenguaje": 8, "gran modelo lenguaje": 4, "modelo lenguaje neuronal": 2}
    )
    nested = next(result for result in results if result.term == "modelo lenguaje")
    assert nested.nested_in == 2
    assert nested.cvalue == pytest.approx(5.0)  # 8 - media(4, 2)


def test_single_word_has_zero_cvalue():
    assert compute_cvalue({"corpus": 10})[0].cvalue == 0.0
