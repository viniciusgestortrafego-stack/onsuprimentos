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

A integração com a planilha ainda está pendente. `leadEndpoint` está vazio em `app.js`, e o formulário informa que nenhum dado foi enviado. Os links do WhatsApp funcionam independentemente da integração. Configure um receptor que confirme a gravação antes de ativar o cadastro. Nunca inclua credenciais privadas no JavaScript do navegador.

## Conteúdo

Imagens e referências de produtos fornecidas no catálogo ON Suprimentos. Disponibilidade, preços e especificações devem ser confirmados na cotação.
