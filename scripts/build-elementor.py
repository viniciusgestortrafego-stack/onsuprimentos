"""Gera um bloco HTML único para colar no widget "HTML" do Elementor.

O CSS fica restrito a #on-lp para não conflitar com o tema, os scripts vão
embutidos e as imagens são servidas pelo jsDelivr a partir deste repositório
(público), fixadas em um commit para não mudarem sozinhas.

Uso: python3 scripts/build-elementor.py [commit]
Saída: dist/on-suprimentos-elementor.html
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = 'viniciusgestortrafego-stack/onsuprimentos'
SCOPE = '#on-lp'


def read(name):
    return open(os.path.join(ROOT, name), encoding='utf-8').read()


def scope_selector(sel):
    sel = sel.strip()
    if sel in (':root', 'html', 'body'):
        return SCOPE
    if sel == '*':
        return SCOPE + ',' + SCOPE + ' *'
    sel = re.sub(r'^(html|body)\s+', '', sel)
    return SCOPE + ' ' + sel


def scope_css(css):
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, i, n = [], 0, len(css)
    while i < n:
        if css[i].isspace():
            i += 1
            continue
        if css.startswith('@import', i):
            m = re.compile(r'@import\s+(url\([^)]*\)|"[^"]*"|\'[^\']*\')[^;]*;').match(css, i)
            j = m.end()
            out.insert(0, css[i:j])
            i = j
            continue
        brace = css.index('{', i)
        prelude = css[i:brace].strip()
        depth, j = 1, brace + 1
        while depth:
            depth += {'{': 1, '}': -1}.get(css[j], 0)
            j += 1
        block = css[brace + 1:j - 1]
        if prelude.startswith('@media') or prelude.startswith('@supports'):
            out.append(prelude + '{' + scope_css(block) + '}')
        elif prelude.startswith('@'):
            out.append(prelude + '{' + block + '}')
        else:
            sels = ','.join(scope_selector(s) for s in prelude.split(','))
            out.append(sels + '{' + block + '}')
        i = j
    return ''.join(out)


def main():
    commit = sys.argv[1] if len(sys.argv) > 1 else subprocess.check_output(
        ['git', 'rev-parse', 'origin/main'], cwd=ROOT, text=True).strip()
    base = 'https://cdn.jsdelivr.net/gh/%s@%s/' % (REPO, commit)
    html = read('index.html')
    body = html[html.index('<body>') + len('<body>'):html.index('</body>')]
    body = re.sub(r'<!-- Google Tag Manager \(noscript\) -->.*?<!-- End Google Tag Manager \(noscript\) -->', '', body, flags=re.S)
    body = re.sub(r'<script src="[^"]+"></script>', '', body)
    body = body.replace('"assets/', '"' + base + 'assets/').strip()
    css = scope_css(read('style.css'))
    # Garante que o tema não reduza a largura nem mude a fonte base do bloco.
    css += SCOPE + '{display:block;width:100%;max-width:none;text-align:left}'
    # Blindagem contra estilos comuns de temas/Elementor (incluindo !important).
    css += (SCOPE + ' h1,' + SCOPE + ' h2,' + SCOPE + ' h3{font-style:normal;color:inherit;text-transform:none}'
            + SCOPE + ' .banner h1{color:#fff}'
            + SCOPE + ' .button{background:var(--orange)!important;color:#161a17!important;border:0!important;'
            'border-radius:5px!important;box-shadow:none!important;text-transform:none;text-decoration:none!important}'
            + SCOPE + ' .button:hover{background:var(--orange-hover)!important}'
            + SCOPE + ' .button.ghost{background:transparent!important;color:#fff!important;border:1.5px solid #ffffff66!important}'
            + SCOPE + ' .button.ghost:hover{background:#ffffff14!important;border-color:#fff!important}'
            + SCOPE + ' .outline-button{background:#fff!important;color:var(--ink)!important;border:1px solid #a9b4ac!important;border-radius:5px!important}'
            + SCOPE + ' .outline-button:hover{border-color:var(--orange)!important;background:var(--orange-soft)!important}'
            + SCOPE + ' .text-button,' + SCOPE + ' .modal-close{background:transparent!important;border:0!important;box-shadow:none!important}'
            + SCOPE + ' .text-button{color:var(--orange)!important}' + SCOPE + ' .modal-close{color:var(--muted)!important}')
    gtm = ("(function(w,d,s,l,i){if(w.google_tag_manager&&w.google_tag_manager[i])return;"
           "w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});"
           "var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';"
           "j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);"
           "})(window,document,'script','dataLayer','GTM-PRHXFQTP');")
    scripts = ('window.ON_ASSET_BASE=%r;\n' % base) + read('app.js') + '\n' + read('catalog-data.js') + '\n' + read('catalog.js')
    out = ('<!-- ON Suprimentos: landing page para o widget HTML do Elementor -->\n'
           '<style>' + css + '</style>\n'
           '<div id="on-lp">\n' + body + '\n</div>\n'
           '<script>' + gtm + '</script>\n'
           '<script>\n' + scripts + '\n</script>\n')
    os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
    path = os.path.join(ROOT, 'dist', 'on-suprimentos-elementor.html')
    open(path, 'w', encoding='utf-8').write(out)
    print(path, len(out.encode()), 'bytes')


if __name__ == '__main__':
    main()
