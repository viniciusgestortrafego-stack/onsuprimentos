/**
 * Receptor de leads da landing page ON Suprimentos.
 *
 * Instalação: na planilha "onsuprimentos:leads", abra Extensões → Apps Script,
 * apague o conteúdo, cole este código e salve. Depois: Implantar → Nova implantação
 * → tipo "App da Web" → Executar como: "Eu" → Quem pode acessar: "Qualquer pessoa"
 * → Implantar → autorize → copie o URL do app da Web (termina em /exec).
 */
const SHEET_ID = '1weZ4MeKEOkiVnWr_SBn-2onwgrLPK9S_mfPD8mwiqHM';
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
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheets()[0];
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
