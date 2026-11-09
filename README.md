# KHAIRUL AUTO PAYMENT

Sistem pengurusan ansuran kenderaan untuk KHAIRUL CONSULTANCY.

## Modul
- Dashboard kutipan, tunggakan dan bayaran akan datang
- Daftar pelanggan dan kenderaan
- Jadual ansuran bulanan dan rekod bayaran
- Sejarah peringatan WhatsApp
- Resit dan laporan bulanan

## Struktur
- `web/` — dashboard admin
- `firebase/` — Firestore security rules
- `functions/` — backend WhatsApp Cloud API helper
- `android/` — aplikasi Android (fasa seterusnya)

## Persediaan
1. Cipta projek Firebase dan aktifkan Email/Password Authentication serta Firestore.
2. Berikan custom claim `admin: true` hanya kepada akaun admin melalui Admin SDK yang dipercayai.
3. Deploy `firebase/firestore.rules`.
4. Konfigurasikan web Firebase dalam `web/firebase-config.js` berdasarkan contoh.
5. Untuk WhatsApp, sediakan nombor Meta yang disahkan, templat diluluskan, persetujuan penerima dan secrets backend: `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NAME`, `WHATSAPP_API_VERSION`.

**Keselamatan:** Jangan masukkan access token, private key, service-account JSON atau fail `.env` sebenar dalam Git. Gunakan GitHub Actions Secrets atau Firebase Functions Secrets.

## Status projek
Starter UI dan fail konfigurasi asas. Firebase, WhatsApp automatik dan aplikasi Android belum disambungkan/dibina. Uji autentikasi, rules dan aliran bayaran sebelum rekod sebenar digunakan.
