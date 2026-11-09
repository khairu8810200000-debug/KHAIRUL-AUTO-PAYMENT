/**
 * KHAIRUL AUTO PAYMENT — reminder eligibility check (DRY RUN ONLY).
 * Reads Firestore and reports customers due today who appear unpaid.
 * This file intentionally does NOT send WhatsApp messages.
 */
const admin = require("firebase-admin");

function monthKeyInMalaysia(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "2-digit",
  }).format(date);
}
function dayInMalaysia(date = new Date()) {
  return Number(new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "2-digit",
  }).format(date));
}
function normalizeName(value) {
  return String(value || "").trim().toLocaleLowerCase("ms-MY").replace(/\s+/g, " ");
}
function maskPhone(value) {
  const s = String(value || "").replace(/\s+/g, "");
  return s.length > 4 ? `${"*".repeat(Math.max(0, s.length - 4))}${s.slice(-4)}` : "(tiada)";
}

async function main() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (raw) {
    // Legacy credential path; prefer GitHub OIDC + Workload Identity Federation.
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } else {
    // Uses Application Default Credentials supplied by google-github-actions/auth.
    admin.initializeApp({ credential: admin.credential.applicationDefault() });
  }
  const db = admin.firestore();

  const [customersSnap, vehiclesSnap, paymentsSnap] = await Promise.all([
    db.collection("customers").get(),
    db.collection("vehicles").get(),
    db.collection("payments").get(),
  ]);

  const customers = customersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const vehicles = vehiclesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const payments = paymentsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  const today = dayInMalaysia();
  const month = monthKeyInMalaysia();
  let eligible = 0, skipped = 0;

  console.log(`DRY RUN | Tarikh Malaysia: ${month}-${String(today).padStart(2, "0")}`);
  console.log(`Rekod: ${customers.length} pelanggan, ${vehicles.length} kenderaan, ${payments.length} bayaran.`);

  for (const vehicle of vehicles) {
    const dueDay = Number(vehicle.dueDay);
    if (!Number.isInteger(dueDay) || dueDay !== today) continue;

    const plate = String(vehicle.plate || "").trim().toUpperCase();
    const amount = Number(vehicle.monthlyAmount);
    if (!plate || !Number.isFinite(amount) || amount <= 0) {
      skipped++;
      console.log(`SKIP ${plate || "(plat kosong)"}: maklumat ansuran tidak sah.`);
      continue;
    }

    const paidThisMonth = payments
      .filter(p => String(p.plate || "").trim().toUpperCase() === plate)
      .filter(p => String(p.paidDate || "").slice(0, 7) === month)
      .reduce((sum, p) => sum + Number(p.amount || 0), 0);

    if (paidThisMonth >= amount) {
      skipped++;
      console.log(`SKIP ${plate}: bayaran bulan ini telah direkodkan (RM${paidThisMonth.toFixed(2)}).`);
      continue;
    }

    const matches = customers.filter(c => normalizeName(c.name) === normalizeName(vehicle.customerName));
    if (matches.length !== 1 || !matches[0].phone) {
      skipped++;
      console.log(`SKIP ${plate}: padanan pelanggan tidak unik atau nombor telefon tiada.`);
      continue;
    }

    eligible++;
    console.log(`CALON PERINGATAN: ${plate} | RM${amount.toFixed(2)} | telefon ${maskPhone(matches[0].phone)} | belum dibayar penuh.`);
  }

  console.log(`Selesai. Calon: ${eligible}; dilepaskan: ${skipped}. TIADA WHATSAPP DIHANTAR (DRY RUN).`);
  await admin.app().delete();
}

main().catch(err => {
  console.error("Pemeriksaan gagal:", err.message);
  process.exitCode = 1;
});
