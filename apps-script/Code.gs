/**
 * KHAIRUL AUTO PAYMENT — Google Sheets + Apps Script + WhatsApp Cloud API
 *
 * Sheets:
 * Kenderaan: No Plat | Model | Nama | Telefon | Jumlah Ansuran | Hari Bayaran | Aktif
 * Bayaran: Tarikh | No Plat | Jumlah
 * LogWhatsApp: Bulan | No Plat | Telefon | Status | Masa | Butiran
 *
 * Script Properties (Project Settings > Script properties):
 * WA_ACCESS_TOKEN, WA_PHONE_NUMBER_ID, WA_TEMPLATE_NAME, WA_TEMPLATE_LANG
 * DRY_RUN = true initially; change to false only after approved template + opt-in.
 */
const CFG = {
  VEHICLES: "Kenderaan",
  PAYMENTS: "Bayaran",
  LOG: "LogWhatsApp",
  TIMEZONE: "Asia/Kuala_Lumpur",
  DRY_RUN_DEFAULT: true
};

function setupKhairulAutoPayment() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, CFG.VEHICLES, ["No Plat","Model","Nama","Telefon","Jumlah Ansuran","Hari Bayaran","Aktif"]);
  ensureSheet_(ss, CFG.PAYMENTS, ["Tarikh","No Plat","Jumlah"]);
  ensureSheet_(ss, CFG.LOG, ["Bulan","No Plat","Telefon","Status","Masa","Butiran"]);
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === "semakAnsuranHarian")
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("semakAnsuranHarian").timeBased().everyDays(1).atHour(9).create();
  Logger.log("Setup siap. Trigger harian sekitar 9 pagi waktu projek.");
}

function semakAnsuranHarian() {
  const props = PropertiesService.getScriptProperties();
  const dryRun = String(props.getProperty("DRY_RUN") || "true").toLowerCase() !== "false";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const vehicles = readRows_(ss.getSheetByName(CFG.VEHICLES));
  const payments = readRows_(ss.getSheetByName(CFG.PAYMENTS));
  const logSheet = ensureSheet_(ss, CFG.LOG, ["Bulan","No Plat","Telefon","Status","Masa","Butiran"]);
  const now = new Date();
  const today = Number(Utilities.formatDate(now, CFG.TIMEZONE, "d"));
  const month = Utilities.formatDate(now, CFG.TIMEZONE, "yyyy-MM");
  const sentKeys = new Set(readRows_(logSheet).filter(r => r[0] === month && r[3] === "SENT").map(r => String(r[1]).trim().toUpperCase()));

  vehicles.forEach(v => {
    const plate = String(v[0] || "").trim().toUpperCase();
    const name = String(v[2] || "").trim();
    const phone = normalizePhone_(v[3]);
    const amount = Number(v[4]);
    const dueDay = Number(v[5]);
    const active = String(v[6] || "YA").trim().toUpperCase();
    if (!plate || active === "TIDAK" || active === "NO" || dueDay !== today) return;
    if (!phone || !Number.isFinite(amount) || amount <= 0) {
      log_(logSheet, month, plate, phone, "SKIP", "Telefon atau jumlah ansuran tidak sah");
      return;
    }
    if (sentKeys.has(plate)) return;

    const paid = payments.filter(p =>
      String(p[1] || "").trim().toUpperCase() === plate &&
      monthOf_(p[0]) === month
    ).reduce((s,p) => s + Number(p[2] || 0), 0);

    if (paid >= amount) {
      log_(logSheet, month, plate, phone, "PAID", "Bayaran bulan ini telah mencukupi");
      return;
    }

    const dueDate = Utilities.formatDate(now, CFG.TIMEZONE, "dd/MM/yyyy");
    if (dryRun) {
      log_(logSheet, month, plate, phone, "DRY_RUN", "Calon sahaja; tiada WhatsApp dihantar. RM" + amount.toFixed(2));
      return;
    }
    const result = sendTemplate_(phone, plate, amount, dueDate);
    if (result.ok) {
      log_(logSheet, month, plate, phone, "SENT", "WhatsApp berjaya diterima API; baki ansuran RM" + Math.max(0, amount-paid).toFixed(2));
      sentKeys.add(plate);
    } else {
      log_(logSheet, month, plate, phone, "ERROR", result.error);
    }
  });
}

function sendTemplate_(phone, plate, amount, dueDate) {
  const p = PropertiesService.getScriptProperties();
  const token = p.getProperty("WA_ACCESS_TOKEN");
  const phoneId = p.getProperty("WA_PHONE_NUMBER_ID");
  const template = p.getProperty("WA_TEMPLATE_NAME");
  const lang = p.getProperty("WA_TEMPLATE_LANG") || "ms";
  if (!token || !phoneId || !template) return {ok:false,error:"Tetapan WhatsApp belum lengkap"};
  const payload = {
    messaging_product: "whatsapp",
    to: phone,
    type: "template",
    template: {
      name: template,
      language: {code: lang},
      components: [{
        type: "body",
        parameters: [
          {type:"text", text:plate},
          {type:"text", text:"RM" + amount.toFixed(2)},
          {type:"text", text:dueDate}
        ]
      }]
    }
  };
  const response = UrlFetchApp.fetch("https://graph.facebook.com/v23.0/" + phoneId + "/messages", {
    method:"post",
    contentType:"application/json",
    headers:{Authorization:"Bearer " + token},
    payload:JSON.stringify(payload),
    muteHttpExceptions:true
  });
  const body = response.getContentText();
  return response.getResponseCode() >= 200 && response.getResponseCode() < 300
    ? {ok:true}
    : {ok:false,error:"HTTP " + response.getResponseCode() + ": " + body.slice(0,500)};
}

function testSemakanSahaja() {
  const props = PropertiesService.getScriptProperties();
  props.setProperty("DRY_RUN","true");
  semakAnsuranHarian();
}

function readRows_(sheet) {
  if (!sheet || sheet.getLastRow() < 2) return [];
  return sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn()).getValues();
}
function ensureSheet_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  if (sh.getLastRow() === 0) sh.appendRow(headers);
  return sh;
}
function normalizePhone_(v) {
  let s = String(v || "").replace(/[^0-9]/g,"");
  if (s.startsWith("0")) s = "6" + s;
  return s;
}
function monthOf_(value) {
  if (value instanceof Date) return Utilities.formatDate(value, CFG.TIMEZONE, "yyyy-MM");
  const s = String(value || "").trim();
  if (/^\d{4}-\d{2}/.test(s)) return s.slice(0,7);
  const d = new Date(s);
  return isNaN(d.getTime()) ? "" : Utilities.formatDate(d, CFG.TIMEZONE, "yyyy-MM");
}
function log_(sh, month, plate, phone, status, details) {
  sh.appendRow([month, plate, phone, status, new Date(), details]);
}
