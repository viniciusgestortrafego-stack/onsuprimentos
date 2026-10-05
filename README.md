# ON Suprimentos

Landing page responsiva com catálogo interativo de 255 produtos em 22 categorias.

## Executar localmente

Site estático, sem etapa de compilação. Na pasta do projeto:

```sh
python -m http.server 4173
```

Abra http://localhost:4173.

## Arquivos

- `index.html`: página e contatos.
- `style.css`: visual responsivo.
- `app.js`: CTAs do WhatsApp e formulário.
- `catalog-data.js`: produtos e referências.
- `catalog.js`: busca, filtros e lista de cotação.
- `assets/`: logo, fotos e imagens dos produtos.

## Publicação

Envie o conteúdo desta pasta a uma hospedagem de sites estáticos. O arquivo de entrada é `index.html`. Não são necessários servidor de aplicação, instalação de pacotes ou variáveis de ambiente.

## WordPress

`dist/on-suprimentos-tema-wordpress.zip` é um tema do WordPress com a landing page completa. Para instalar: Aparência → Temas → Adicionar novo → Enviar tema → escolha o `.zip` → Instalar → Ativar. A página inicial do site passa a ser a landing page.

O tema já inclui o Google Tag Manager; não instale o GTM de novo por plugin. Para gerar o `.zip` depois de alterar o site: `python3 scripts/build-wordpress.py`.

### Elementor (widget HTML)

`dist/on-suprimentos-elementor.html` é a landing page em um bloco único para colar no widget **HTML** do Elementor. O CSS fica restrito ao bloco (`#on-lp`) e as imagens vêm do jsDelivr a partir deste repositório público, fixadas em um commit. Para gerar de novo: `python3 scripts/build-elementor.py`.

## Formulário de leads

Os botões "FAÇA SUA COTAÇÃO" abrem um formulário (nome, telefone e e-mail) antes de levar ao WhatsApp, e o formulário "Solicite seu orçamento" também abre o WhatsApp preenchido. Os dois enviam o cadastro para a aba "ON SUPRIMENTOS" da planilha "GRUPO ESTRUTALICA - LEADS" pelo Google Apps Script em `scripts/google-apps-script.gs`, com origem, produtos selecionados, UTMs, gclid e fbclid.

Para ativar: instale o script na planilha (instruções no topo do arquivo), publique como app da Web e coloque o URL `/exec` em `leadEndpoint`, em `app.js`. Depois gere de novo os arquivos de `dist/`.

Para o Google Tag Manager, o site envia ao `dataLayer` os eventos `cta_cotacao_click` e `lead_cotacao`, sem dados pessoais.

## Conteúdo

Imagens e referências de produtos fornecidas no catálogo ON Suprimentos. Disponibilidade, preços e especificações devem ser confirmados na cotação.
