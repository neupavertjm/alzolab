"""Corpus de ejemplo precargado, en español e inglés.

Sirve para que la demo muestre algo nada más abrirse, sin depender de fuentes en
vivo (Wikipedia, noticias) que pueden tardar o fallar en el arranque del
servidor. Son textos breves de redacción propia sobre lingüística, pensados para
enseñar el flujo completo: importar -> limpiar -> analizar -> exportar.
"""

from datetime import datetime

_SAMPLE_TEXTS = {
    "es": [
        {
            "modo": "Ejemplo",
            "url": "Ejemplo: Lingüística de corpus",
            "texto": (
                "La lingüística de corpus es una metodología que estudia la lengua "
                "a partir de colecciones extensas de textos reales. En lugar de "
                "apoyarse solo en la intuición del investigador, analiza patrones "
                "de uso observados en datos auténticos. Permite medir la frecuencia "
                "de palabras, describir colocaciones y comparar variedades de una "
                "misma lengua. Las herramientas modernas combinan corpus anotados "
                "con técnicas de procesamiento del lenguaje natural."
            ),
        },
        {
            "modo": "Ejemplo",
            "url": "Ejemplo: Etiquetado POS",
            "texto": (
                "El etiquetado morfosintáctico, conocido como POS tagging, asigna "
                "a cada palabra de un texto su categoría gramatical: sustantivo, "
                "verbo, adjetivo, adverbio y demás. Es un paso básico en muchos "
                "sistemas de análisis lingüístico. A partir de las etiquetas se "
                "pueden estudiar la distribución de categorías, extraer lemas y "
                "construir índices de frecuencia útiles para la lexicografía."
            ),
        },
        {
            "modo": "Ejemplo",
            "url": "Ejemplo: Lematización",
            "texto": (
                "La lematización reduce cada forma flexionada a su lema o forma de "
                "diccionario. Así, las palabras corremos, corría y corrieron se "
                "agrupan bajo el lema correr. Este proceso resulta imprescindible "
                "para contar ocurrencias de manera coherente, ya que evita dispersar "
                "el recuento entre todas las variantes de una misma palabra."
            ),
        },
    ],
    "en": [
        {
            "modo": "Sample",
            "url": "Sample: Corpus linguistics",
            "texto": (
                "Corpus linguistics is a methodology that studies language through "
                "large collections of real texts. Instead of relying solely on the "
                "researcher's intuition, it analyses usage patterns observed in "
                "authentic data. It makes it possible to measure word frequency, "
                "describe collocations and compare varieties of the same language. "
                "Modern tools combine annotated corpora with natural language "
                "processing techniques."
            ),
        },
        {
            "modo": "Sample",
            "url": "Sample: POS tagging",
            "texto": (
                "Part-of-speech tagging assigns each word in a text its grammatical "
                "category: noun, verb, adjective, adverb and so on. It is a basic "
                "step in many language analysis systems. From the tags one can study "
                "the distribution of categories, extract lemmas and build frequency "
                "indexes that are useful for lexicography."
            ),
        },
        {
            "modo": "Sample",
            "url": "Sample: Lemmatisation",
            "texto": (
                "Lemmatisation reduces each inflected form to its lemma or dictionary "
                "form. Thus the words runs, running and ran are grouped under the "
                "lemma run. This process is essential for counting occurrences "
                "consistently, since it avoids scattering the count across every "
                "variant of the same word."
            ),
        },
    ],
}


def build_sample_corpus(lang: str = "es"):
    """Devuelve una lista de documentos del idioma dado, lista para el corpus."""
    items = _SAMPLE_TEXTS.get(lang, _SAMPLE_TEXTS["es"])
    now = datetime.now().isoformat(timespec="seconds")
    return [
        {
            "id": f"sample-{lang}-{i:03d}",
            "modo": item["modo"],
            "url": item["url"],
            "fecha": now,
            "texto": item["texto"],
        }
        for i, item in enumerate(items)
    ]
