// ═══════════════════════════════════════════════════════════
//  INSTRUCCIONES:
//  1. Reemplazá todo el código con este
//  2. Guardá (Ctrl+S)
//  3. Implementar → Nueva implementación
//     - Tipo: Aplicación web
//     - Ejecutar como: Yo
//     - Acceso: Cualquier persona
//  4. Copiá la URL nueva y pegala en ganancias.html
// ═══════════════════════════════════════════════════════════

// GET → leer datos
function doGet(e) {
  try {
    const action = (e.parameter && e.parameter.action) || 'read';
    if (action === 'read') return handleRead();
    return respond({ ok: false, error: 'Acción desconocida' });
  } catch(err) {
    return respond({ ok: false, error: err.message });
  }
}

// POST → escribir datos
function doPost(e) {
  try {
    var raw = e.postData.contents;
    var body = JSON.parse(raw);
    var action = body.action || 'write';
    if (action === 'write') return handleWrite(body.data);
    return respond({ ok: false, error: 'Acción desconocida' });
  } catch(err) {
    return respond({ ok: false, error: 'Error al parsear: ' + err.message });
  }
}

// ── LEER ─────────────────────────────────────────────────
function handleRead() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var productos   = readSheet(ss, 'Productos',  ['id','nombre','costo','venta','stock','vendidos']);
  var deudores    = readSheet(ss, 'Deudores',   ['id','nombre','monto','motivo']);
  var usuarios    = readSheet(ss, 'Usuarios',   ['id','rol','nombre','user','pass']);
  var presupuesto = readPresupuesto(ss);
  return respond({ ok: true, productos: productos, deudores: deudores, usuarios: usuarios, presupuesto: presupuesto });
}

// ── ESCRIBIR ──────────────────────────────────────────────
function handleWrite(data) {
  if (!data) return respond({ ok: false, error: 'Sin datos' });
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (data.productos  !== undefined) writeSheet(ss, 'Productos', ['id','nombre','costo','venta','stock','vendidos'], data.productos);
  if (data.deudores   !== undefined) writeSheet(ss, 'Deudores',  ['id','nombre','monto','motivo'],                  data.deudores);
  if (data.usuarios   !== undefined) writeSheet(ss, 'Usuarios',  ['id','rol','nombre','user','pass'],               data.usuarios);
  if (data.presupuesto !== undefined) writePresupuesto(ss, data.presupuesto);
  return respond({ ok: true });
}

// ── HELPERS ───────────────────────────────────────────────
function getOrCreateSheet(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function readSheet(ss, name, headers) {
  var sheet = getOrCreateSheet(ss, name);
  var rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return [];
  return rows.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i] !== undefined ? row[i] : ''; });
    return obj;
  });
}

function writeSheet(ss, name, headers, data) {
  var sheet = getOrCreateSheet(ss, name);
  sheet.clearContents();
  sheet.appendRow(headers);
  (data || []).forEach(function(item) {
    sheet.appendRow(headers.map(function(h) {
      return (item[h] !== undefined && item[h] !== null) ? item[h] : '';
    }));
  });
}

function readPresupuesto(ss) {
  var sheet = getOrCreateSheet(ss, 'Presupuesto');
  var rows  = sheet.getDataRange().getValues();
  if (rows.length <= 1) return { inicial: 0, archivado: 0 };
  return { inicial: Number(rows[1][0]) || 0, archivado: Number(rows[1][1]) || 0 };
}

function writePresupuesto(ss, presup) {
  var sheet = getOrCreateSheet(ss, 'Presupuesto');
  sheet.clearContents();
  sheet.appendRow(['inicial', 'archivado']);
  sheet.appendRow([presup.inicial || 0, presup.archivado || 0]);
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
