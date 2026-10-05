/**
 * Receptor único de leads das landing pages do grupo (Google Apps Script).
 * Grava cada cadastro na aba da empresa, na planilha "GRUPO ESTRUTALICA - LEADS".
 *
 * Cada página envia um JSON (Content-Type text/plain) com o campo "brand":
 *   on-suprimentos → ON SUPRIMENTOS        estrutec → ESTRUTEC
 *   estrutalica-civil → ESTRUTALICA CIVIL  estrutalica-automotiva → ESTRUTALICA AUTOMOTIVA
 * Sem "brand", o cadastro vai para ON SUPRIMENTOS (versão da página já publicada).
 *
 * Instalação: em Extensões → Apps Script, apague o conteúdo, cole este código e salve.
 * Primeira vez: Implantar → Nova implantação → tipo "App da Web" → Executar como: "Eu"
 * → Quem pode acessar: "Qualquer pessoa" → Implantar → autorize → copie o URL (/exec).
 * Atualização (mantém o mesmo URL): Implantar → Gerenciar implantações → lápis
 * → Versão: "Nova versão" → Implantar.
 */
const SHEET_ID = '1Zjcq6qfUSIAb-JTCHyJDxl06PqqTWpqvS1bCbU5C4r0';
const UTM = [
  ['utm_source', 'utm_source'], ['utm_medium', 'utm_medium'], ['utm_campaign', 'utm_campaign'],
  ['utm_term', 'utm_term'], ['utm_content', 'utm_content'], ['gclid', 'gclid'], ['fbclid', 'fbclid'],
];

// Colunas de cada aba, na ordem da planilha: [chave enviada pelo site, título da coluna].
// "data" é a data do envio; "requestId" evita linhas duplicadas quando o site reenvia.
const BRANDS = {
  'on-suprimentos': {
    aba: 'ON SUPRIMENTOS',
    colunas: [
      ['data', 'Data'], ['origem', 'Origem'], ['nome', 'Nome'], ['telefone', 'Telefone'],
      ['email', 'E-mail'], ['empresa', 'Empresa'], ['necessidade', 'Necessidade'],
      ['produtos', 'Produtos selecionados'], ...UTM, ['pagina', 'Página'],
    ],
  },
  'estrutec': {
    aba: 'ESTRUTEC',
    colunas: [
      ['data', 'Data'], ['nome', 'Nome'], ['telefone', 'WhatsApp'], ['cidade', 'Cidade'],
      ['imovel', 'O que deseja proteger'], ['interesse', 'O que procura'], ['origem', 'Origem'],
      ['requestId', 'ID da solicitação'], ...UTM, ['pagina', 'Página'],
    ],
  },
  'estrutalica-civil': {
    aba: 'ESTRUTALICA CIVIL',
    colunas: [
      ['data', 'Data e hora'], ['nome', 'Nome'], ['telefone', 'Telefone'], ['email', 'E-mail'],
      ['empresa', 'Empresa'], ['tipo', 'Tipo de projeto'], ['descricao', 'Descrição'], ['origem', 'Origem'],
    ],
  },
  'estrutalica-automotiva': {
    aba: 'ESTRUTALICA AUTOMOTIVA',
    colunas: [
      ['data', 'Data do cadastro'], ['nome', 'Nome'], ['empresa', 'Empresa'], ['telefone', 'WhatsApp'],
      ['email', 'E-mail'], ['solucao', 'Solução de interesse'], ['origem', 'Origem'], ['requestId', 'ID do cadastro'],
    ],
  },
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    let dados = {};
    try { dados = JSON.parse(e.postData.contents); } catch (err) { dados = e.parameter || {}; }
    const requestId = String(dados.requestId || '').slice(0, 64);
    const config = BRANDS[dados.brand || 'on-suprimentos'];
    if (!config) return saida({ ok: false, erro: 'marca desconhecida' });
    if (dados.website) return saida({ ok: true, requestId }); // campo isca preenchido por robô

    const aba = obterAba(config);
    const colunaId = config.colunas.findIndex(([chave]) => chave === 'requestId') + 1;
    if (requestId && colunaId && aba.getLastRow() > 1) {
      const ids = aba.getRange(2, colunaId, aba.getLastRow() - 1, 1).getValues().flat().map(String);
      if (ids.indexOf(requestId) !== -1) return saida({ ok: true, requestId }); // reenvio: não duplica
    }
    aba.appendRow(config.colunas.map(([chave]) => chave === 'data' ? new Date() : limpar(dados[chave])));
    return saida({ ok: true, requestId });
  } catch (erro) {
    return saida({ ok: false });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Receptor de leads ativo.');
}

function obterAba(config) {
  const planilha = SpreadsheetApp.openById(SHEET_ID);
  const aba = planilha.getSheetByName(config.aba) || planilha.insertSheet(config.aba);
  if (aba.getLastRow() === 0) {
    aba.appendRow(config.colunas.map(([, titulo]) => titulo));
    aba.setFrozenRows(1);
    aba.getRange(1, 1, 1, config.colunas.length).setFontWeight('bold');
  }
  return aba;
}

// Corta o tamanho e impede que o texto vire fórmula na planilha.
function limpar(valor) {
  const texto = String(valor == null ? '' : valor).trim().slice(0, 2000);
  return /^[=+\-@]/.test(texto) ? "'" + texto : texto;
}

function saida(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}
