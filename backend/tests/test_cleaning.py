"""Casos deterministas del pipeline de limpieza."""

from app.core.cleaning import PRESETS, CleaningRule, apply_regex_pipeline


def preset(preset_id: str) -> CleaningRule:
    data = next(item for item in PRESETS if item["id"] == preset_id)
    return CleaningRule(data["regex"], data["replacement"], data["label"])


def test_reference_preset_removes_numeric_citations():
    result = apply_regex_pipeline("Texto [12] y fuente [2-4].", [preset("references")])
    assert result.text == "Texto  y fuente ."
    assert result.replacements == 2


def test_url_and_email_presets():
    result = apply_regex_pipeline("Visita https://example.org/x o escribe a hola@example.org", [preset("urls"), preset("emails")])
    assert "https" not in result.text
    assert "@" not in result.text


def test_space_normalization_is_idempotent():
    rule = preset("spaces")
    once = apply_regex_pipeline("uno    dos\t tres", [rule]).text
    assert once == "uno dos tres"
    assert apply_regex_pipeline(once, [rule]).text == once


def test_invalid_regex_warns_and_keeps_text():
    result = apply_regex_pipeline("texto", [CleaningRule("(", label="Rota")])
    assert result.text == "texto"
    assert "inválida" in result.warnings[0]


def test_catastrophic_regex_times_out_without_hanging():
    text = "a" * 20_000 + "!"
    result = apply_regex_pipeline(text, [CleaningRule(r"(a+)+$", label="Peligrosa")], timeout=0.001)
    assert result.text == text
    assert "límite de tiempo" in result.warnings[0]
