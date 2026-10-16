#!/usr/bin/env python3
"""Mantiene solo el sitemap.xml y el noindex de las páginas.

- sitemap.xml: lista todos los .html de la raíz que se pueden indexar (la portada va como la raíz de la web).
- noindex automático: las páginas marcadas como privadas (el ojo del índice) reciben
  <meta name="robots" content="noindex, nofollow" data-auto>; si se vuelven públicas, se quita.
- Un noindex puesto a mano (sin data-auto) se respeta siempre: esa página nunca entra en el sitemap.
- Los archivos de verificación de Google (google*.html) y 404.html se ignoran.
"""
import glob, json, os, re, subprocess, sys, urllib.request

PROJECT = os.environ.get('FIREBASE_PROJECT', 'moonlight-teamm-947ee')
REPO = os.environ.get('GITHUB_REPOSITORY', '')
IGNORE = re.compile(r'^(google[0-9a-f]+\.html|404\.html)$', re.I)
AUTO_RE = re.compile(r'[ \t]*<meta name="robots" content="[^"]*" data-auto>[ \t]*\n?', re.I)
MANUAL_RE = re.compile(r'<meta\s+name="robots"[^>]*noindex(?![^>]*data-auto)[^>]*>', re.I)
AUTO_TAG = '<meta name="robots" content="noindex, nofollow" data-auto>'


def site_url():
    owner, _, repo = REPO.partition('/')
    if not owner:
        sys.exit('Falta GITHUB_REPOSITORY')
    owner = owner.lower()  # el host va siempre en minúsculas (igual que la canónica y la propiedad de Search Console)
    return f'https://{owner}.github.io/' + ('' if repo.lower() == f'{owner}.github.io'.lower() else repo + '/')


def private_pages():
    """Páginas ocultas para el público según el índice (colección 'paginas'). None si no se pudo leer."""
    if 'SEO_PRIVATE' in os.environ:  # para pruebas
        return {x for x in os.environ['SEO_PRIVATE'].split(',') if x}
    url = f'https://firestore.googleapis.com/v1/projects/{PROJECT}/databases/(default)/documents/paginas?pageSize=300'
    out, token = set(), None
    try:
        while True:
            with urllib.request.urlopen(url + (f'&pageToken={token}' if token else ''), timeout=30) as r:
                data = json.load(r)
            for d in data.get('documents', []):
                if d.get('fields', {}).get('private', {}).get('booleanValue') is True:
                    out.add(d['name'].rsplit('/', 1)[-1])
            token = data.get('nextPageToken')
            if not token:
                return out
    except Exception as e:
        print('No se pudo leer Firestore, no se tocan los noindex:', e)
        return None


def lastmod(path):
    try:
        r = subprocess.run(['git', 'log', '-1', '--format=%cI', '--', path], capture_output=True, text=True)
        return r.stdout.strip() or None
    except Exception:
        return None


def set_auto_noindex(html, want):
    has = bool(AUTO_RE.search(html))
    if want and not has:
        m = re.search(r'</title>[ \t]*\n?', html, re.I) or re.search(r'<head[^>]*>[ \t]*\n?', html, re.I)
        if not m:
            return html
        sep = '' if m.group(0).endswith('\n') else '\n'
        return html[:m.end()] + sep + AUTO_TAG + '\n' + html[m.end():]
    if not want and has:
        return AUTO_RE.sub('', html)
    return html


def main():
    base = site_url()
    private = private_pages()
    files = sorted(f for f in glob.glob('*.html') if not IGNORE.match(f))
    urls = []
    for f in files:
        html = open(f, encoding='utf-8').read()
        if private is not None:
            new = set_auto_noindex(html, f in private)
            if new != html:
                open(f, 'w', encoding='utf-8').write(new)
                html = new
                print('noindex', 'añadido a' if f in private else 'quitado de', f)
        if MANUAL_RE.search(html) or AUTO_RE.search(html):
            continue
        urls.append((f, lastmod(f)))
    urls.sort(key=lambda x: (x[0] != 'index.html', x[0]))
    xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for f, lm in urls:
        loc = base if f == 'index.html' else base + f
        xml.append(f'  <url><loc>{loc}</loc>' + (f'<lastmod>{lm}</lastmod>' if lm else '') + '</url>')
    xml.append('</urlset>')
    new_xml = '\n'.join(xml) + '\n'
    old = open('sitemap.xml', encoding='utf-8').read() if os.path.exists('sitemap.xml') else ''
    if new_xml != old:
        open('sitemap.xml', 'w', encoding='utf-8').write(new_xml)
        print('sitemap.xml actualizado:', ', '.join(f for f, _ in urls))


if __name__ == '__main__':
    main()
