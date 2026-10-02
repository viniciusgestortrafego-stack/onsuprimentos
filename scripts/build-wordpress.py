"""Gera o tema WordPress da landing page a partir dos arquivos do site.

Uso: python3 scripts/build-wordpress.py
Saída: dist/on-suprimentos-tema-wordpress.zip
"""
import os
import re
import shutil
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SLUG = 'on-suprimentos'
OUT_DIR = os.path.join(ROOT, 'dist')
BUILD = os.path.join(OUT_DIR, SLUG)

STYLE_HEADER = """/*
Theme Name: ON Suprimentos
Description: Landing page da ON Suprimentos com catálogo interativo de produtos, formulário de cotação pelo WhatsApp e Google Tag Manager.
Version: 1.0.0
Requires at least: 5.2
Requires PHP: 7.0
Text Domain: on-suprimentos
*/
"""

FUNCTIONS = """<?php
// Tema de página única: o index.php contém a landing page completa.
add_action('wp_enqueue_scripts', function () {
    $uri = get_template_directory_uri();
    $ver = wp_get_theme()->get('Version');
    wp_enqueue_style('on-suprimentos', get_stylesheet_uri(), [], $ver);
    wp_enqueue_script('on-app', $uri . '/app.js', [], $ver, true);
    wp_enqueue_script('on-catalog-data', $uri . '/catalog-data.js', [], $ver, true);
    wp_enqueue_script('on-catalog', $uri . '/catalog.js', ['on-catalog-data'], $ver, true);
    wp_add_inline_script('on-catalog-data', 'window.ON_ASSET_BASE = ' . wp_json_encode($uri . '/') . ';', 'before');
});
"""


def build_index(html):
    head_start = html.index('<head>') + len('<head>')
    head_end = html.index('</head>')
    head = html[head_start:head_end]
    head = re.sub(r'<link rel="stylesheet" href="style.css">', '', head)
    body_start = html.index('<body>') + len('<body>')
    body_end = html.index('</body>')
    body = html[body_start:body_end]
    body = re.sub(r'<script src="(app|catalog-data|catalog)\.js"></script>', '', body)
    # GTM noscript fica logo após a abertura do body; wp_body_open vem em seguida.
    marker = '<!-- End Google Tag Manager (noscript) -->'
    if marker in body:
        body = body.replace(marker, marker + '\n<?php if (function_exists("wp_body_open")) { wp_body_open(); } ?>', 1)
    else:
        body = '<?php if (function_exists("wp_body_open")) { wp_body_open(); } ?>' + body
    asset = '<?php echo esc_url(get_template_directory_uri()); ?>/assets/'
    body = body.replace('"assets/', '"' + asset)
    head = head.replace('"assets/', '"' + asset)
    return ('<!doctype html>\n<html <?php language_attributes(); ?>><head>' + head
            + '<?php wp_head(); ?>\n</head>\n<body>' + body + '<?php wp_footer(); ?>\n</body></html>\n')


def main():
    shutil.rmtree(BUILD, ignore_errors=True)
    os.makedirs(BUILD)
    html = open(os.path.join(ROOT, 'index.html'), encoding='utf-8').read()
    open(os.path.join(BUILD, 'index.php'), 'w', encoding='utf-8').write(build_index(html))
    css = open(os.path.join(ROOT, 'style.css'), encoding='utf-8').read()
    open(os.path.join(BUILD, 'style.css'), 'w', encoding='utf-8').write(STYLE_HEADER + css)
    open(os.path.join(BUILD, 'functions.php'), 'w', encoding='utf-8').write(FUNCTIONS)
    for name in ('app.js', 'catalog.js', 'catalog-data.js'):
        shutil.copy(os.path.join(ROOT, name), BUILD)
    shutil.copytree(os.path.join(ROOT, 'assets'), os.path.join(BUILD, 'assets'))
    shot = os.path.join(ROOT, 'scripts', 'screenshot.png')
    if os.path.exists(shot):
        shutil.copy(shot, os.path.join(BUILD, 'screenshot.png'))
    zip_path = os.path.join(OUT_DIR, SLUG + '-tema-wordpress.zip')
    if os.path.exists(zip_path):
        os.remove(zip_path)
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
        for folder, _, files in os.walk(BUILD):
            for f in sorted(files):
                full = os.path.join(folder, f)
                z.write(full, os.path.relpath(full, OUT_DIR))
    shutil.rmtree(BUILD)
    print(zip_path)


if __name__ == '__main__':
    main()
