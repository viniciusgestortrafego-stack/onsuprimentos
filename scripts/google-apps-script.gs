/**
 * Receptor de leads da landing page ON Suprimentos.
 *
 * Grava na aba "ON SUPRIMENTOS" da planilha "GRUPO ESTRUTALICA - LEADS".
 *
 * Instalação: em Extensões → Apps Script, apague o conteúdo, cole este código e salve.
 * Primeira vez: Implantar → Nova implantação → tipo "App da Web" → Executar como: "Eu"
 * → Quem pode acessar: "Qualquer pessoa" → Implantar → autorize → copie o URL (/exec).
 * Atualização (mantém o mesmo URL): Implantar → Gerenciar implantações → lápis
 * → Versão: "Nova versão" → Implantar.
 */
const SHEET_ID = '1Zjcq6qfUSIAb-JTCHyJDxl06PqqTWpqvS1bCbU5C4r0';
const SHEET_NAME = 'ON SUPRIMENTOS';
const COLUMNS = [
  ['data', 'Data'],
  ['origem', 'Origem'],
  ['nome', 'Nome'],
  ['telefone', 'Telefone'],
  ['email', 'E-mail'],
  ['empresa', 'Empresa'],
  ['necessidade', 'Necessidade'],
  ['produtos', 'Produtos selecionados'],
  ['utm_source', 'utm_source'],
  ['utm_medium', 'utm_medium'],
  ['utm_campaign', 'utm_campaign'],
  ['utm_term', 'utm_term'],
  ['utm_content', 'utm_content'],
  ['gclid', 'gclid'],
  ['fbclid', 'fbclid'],
  ['pagina', 'Página'],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let data = {};
    try { data = JSON.parse(e.postData.contents); } catch (err) { data = e.parameter || {}; }
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Aba "' + SHEET_NAME + '" não encontrada.');
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(COLUMNS.map(c => c[1]));
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, COLUMNS.length).setFontWeight('bold');
    }
    const row = COLUMNS.map(([key]) => {
      if (key === 'data') return new Date();
      // Limita o tamanho e impede que um valor seja interpretado como fórmula.
      const value = String(data[key] == null ? '' : data[key]).slice(0, 2000);
      return /^[=+\-@]/.test(value) ? "'" + value : value;
    });
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Receptor de leads ON Suprimentos ativo.');
}
