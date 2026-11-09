# KHAIRUL AUTO PAYMENT

## Status
Web admin MVP: Firebase Authentication, admin custom-claim gate, Firestore CRUD asas untuk pelanggan, kenderaan dan bayaran, serta ringkasan kutipan. Android dan WhatsApp automatik belum disiapkan.

## Persediaan Firebase
1. Cipta projek di Firebase Console dan aktifkan Authentication > Email/Password.
2. Cipta Firestore Database.
3. Salin `web/firebase-config.example.js` kepada `web/firebase-config.js` dan isi konfigurasi projek sebenar. Fail konfigurasi sebenar dikecualikan oleh .gitignore.
4. Deploy peraturan dalam `firebase/firestore.rules` menggunakan Firebase CLI.
5. Beri custom claim `admin: true` kepada akaun admin melalui Firebase Admin SDK pada persekitaran dipercayai. Jangan letak service-account key dalam laman web atau GitHub.
6. Hos folder `web` melalui Firebase Hosting atau pelayan HTTPS.

## Koleksi Firestore
- `customers`: name, phone, identity
- `vehicles`: plate, model, customerName, monthlyAmount, dueDay
- `payments`: plate, customerName, amount, paidDate

## Had MVP
- Tiada jadual ansuran automatik, pengiraan tunggakan mengikut bulan, resit PDF, eksport laporan atau WhatsApp scheduler lagi.
- Akses admin memerlukan custom claim yang sah; jangan longgarkan Firestore rules untuk membolehkan akses awam.
- Kutipan dashboard ialah jumlah rekod bayaran bulan semasa. Semak rekod sebelum digunakan untuk akaun sebenar.
