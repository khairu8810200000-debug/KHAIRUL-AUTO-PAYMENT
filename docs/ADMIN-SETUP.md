# Tetapkan akses Admin

Custom claim tidak boleh ditetapkan dengan selamat dari browser. Gunakan Firebase Admin SDK hanya dalam persekitaran dipercayai.

## Google Cloud Shell
1. Buka https://console.cloud.google.com/ dan pilih projek `khairul-auto-payment`.
2. Buka Cloud Shell (ikon terminal). Pastikan akaun Google anda mempunyai kebenaran IAM untuk mengurus Firebase Authentication users, contohnya peranan Firebase Authentication Admin.
3. Jalankan:

```bash
mkdir -p khairul-admin-setup && cd khairul-admin-setup
npm init -y
npm install firebase-admin
```

4. Simpan fail `scripts/set-admin-claim.cjs` daripada repositori ke folder ini (atau salin kandungannya).
5. Jalankan:

```bash
node set-admin-claim.cjs 7SaWJmeHqrUbWK9VX9GqUX0abQA2
```

Jika berjaya, log keluar dan log masuk semula dalam aplikasi supaya token diperbaharui. Jangan muat naik service-account key, token, atau rahsia ke GitHub atau kongsi dalam chat.

**Nota:** Skrip menetapkan custom claim untuk satu UID sahaja. Sahkan UID itu milik akaun admin yang anda cipta.
