"""Ingesta de textos desde fuentes en vivo.

Lógica pura, sin dependencias del framework web: cada función recibe datos
(HTML, URL o término) y devuelve texto plano. La capa de API (FastAPI) solo
orquesta estas funciones, de modo que la extracción se puede probar y reutilizar
sin levantar el servidor.
"""

import justext
import trafilatura
import wikipediaapi
from bs4 import BeautifulSoup, UnicodeDammit

from app.core.security import fetch_public_url

# Algunos sitios sirven HTML distinto (o bloquean) según el User-Agent. Imitamos
# un navegador real para las descargas que hacemos nosotros (jusText/BeautifulSoup).
BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/120.0 Safari/537.36"
    )
}

# Wikipedia exige un User-Agent descriptivo con forma de contacto; uno genérico
# puede ser rechazado (403/HTML) y romper el parseo JSON de la API.
WIKI_USER_AGENT = "Alzolab/1.0 (https://github.com/neupavertjm/alzolab; neupavertjm@gmail.com)"


def fetch_html(url, timeout=15):
    """Descarga el HTML de una URL imitando un navegador.

    Devuelve el texto decodificado con la codificación detectada. Lanza la
    excepción de `requests` si la descarga falla (4xx/5xx, timeout, red), para
    que el llamador decida cómo reportarlo.
    """
    data = fetch_public_url(url, timeout=timeout, headers=BROWSER_HEADERS)
    return UnicodeDammit(data).unicode_markup or data.decode("utf-8", errors="replace")


def extract_justext(html, lang="Spanish"):
    """Extrae el texto principal de un HTML descartando 'boilerplate' (menús,
    pies, barras laterales) con jusText."""
    paragraphs = justext.justext(
        html,
        justext.get_stoplist(lang),
        length_low=10,
        stopwords_low=0.1,
        stopwords_high=0.9,
    )
    return " ".join(p.text for p in paragraphs if not p.is_boilerplate)


def extract_bs(html):
    """Extrae el texto de los párrafos <p> tras eliminar etiquetas de chrome
    (script, style, header, footer, nav, aside) con BeautifulSoup."""
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "header", "footer", "nav", "aside"]):
        tag.decompose()
    paragraphs = [p.get_text(strip=True) for p in soup.find_all("p") if p.get_text(strip=True)]
    return "\n".join(paragraphs)


def extract_trafilatura(url):
    """Descarga y extrae el cuerpo de un artículo/noticia con trafilatura, que
    detecta automáticamente el contenido principal. Devuelve "" si no hay texto."""
    html = fetch_html(url)
    return trafilatura.extract(html, url=url) or ""


def extract_wikipedia(query, lang="es"):
    """Devuelve el texto de la página de Wikipedia, o "" si no existe o falla la API."""
    try:
        wiki = wikipediaapi.Wikipedia(user_agent=WIKI_USER_AGENT, language=lang)
        page = wiki.page(query)
        return page.text if page.exists() else ""
    except Exception:
        return ""
