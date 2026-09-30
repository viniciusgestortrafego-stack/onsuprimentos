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

## Formulário de leads

Os botões "FAÇA SUA COTAÇÃO" abrem um formulário (nome, telefone e e-mail) antes de levar ao WhatsApp. A mensagem sai preenchida com esses dados e com a lista do catálogo, se houver. O formulário "Solicite seu orçamento" também abre o WhatsApp preenchido enquanto `leadEndpoint` estiver vazio em `app.js`. Os dados não são gravados em nenhum outro lugar. Nunca inclua credenciais privadas no JavaScript do navegador.

Para o Google Tag Manager, o site envia ao `dataLayer` os eventos `cta_cotacao_click` e `lead_cotacao`, sem dados pessoais.

## Conteúdo

Imagens e referências de produtos fornecidas no catálogo ON Suprimentos. Disponibilidade, preços e especificações devem ser confirmados na cotação.
