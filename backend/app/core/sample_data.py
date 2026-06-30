"""Corpus de ejemplo precargado.

Sirve para que la demo muestre algo nada más abrirse, sin depender de fuentes en
vivo (Wikipedia, noticias) que pueden tardar o fallar en el arranque del
servidor. Son textos breves de redacción propia sobre lingüística, pensados para
enseñar el flujo completo: importar -> limpiar -> analizar -> exportar.
"""

from datetime import datetime

_SAMPLE_TEXTS = [
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
]


def build_sample_corpus():
    """Devuelve una lista de documentos lista para insertar en un corpus."""
    now = datetime.now().isoformat(timespec="seconds")
    return [
        {
            "id": f"sample{i:03d}",
            "modo": item["modo"],
            "url": item["url"],
            "fecha": now,
            "texto": item["texto"],
        }
        for i, item in enumerate(_SAMPLE_TEXTS)
    ]
