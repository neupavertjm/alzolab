"""Tests de los extractores que NO dependen de la red.

La descarga en vivo (trafilatura, Wikipedia) no se prueba aquí: es no
determinista. Sí probamos el parseo de HTML, que es lógica pura.
"""

from app.core.extractors import extract_bs

SAMPLE_HTML = """
<html>
  <head><title>Demo</title><style>.x{color:red}</style></head>
  <body>
    <nav>Menú que no debería aparecer</nav>
    <header>Cabecera de chrome</header>
    <main>
      <p>Primer párrafo con contenido real.</p>
      <p>   </p>
      <p>Segundo párrafo con más texto.</p>
    </main>
    <footer>Pie de página</footer>
    <script>console.log('ruido')</script>
  </body>
</html>
"""


def test_extract_bs_keeps_only_paragraph_text():
    text = extract_bs(SAMPLE_HTML)
    assert "Primer párrafo con contenido real." in text
    assert "Segundo párrafo con más texto." in text


def test_extract_bs_drops_chrome_and_scripts():
    text = extract_bs(SAMPLE_HTML)
    assert "Menú" not in text
    assert "Cabecera" not in text
    assert "Pie de página" not in text
    assert "console.log" not in text


def test_extract_bs_skips_empty_paragraphs():
    text = extract_bs(SAMPLE_HTML)
    # Dos párrafos con contenido => exactamente una línea de separación.
    assert text.count("\n") == 1
