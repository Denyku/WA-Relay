# WA Relay Bot
## Cara install & jalankan
1. Extract ZIP ini ke folder (misal D:\wa-relay).
2. Buka folder dengan Visual Studio Code.
3. Di terminal VS Code (gunakan CMD, bukan PowerShell):
   npm install
4. Edit file index.js bagian CONFIG:
  const CONFIG = {
  TRANSIT_TO_GMAIL: "gmailanda@gmail.com",
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: 465,
  SMTP_SECURE: true,
  SMTP_USER: "gmailanda@gmail.com",
  SMTP_PASS: "app_password_16digit",
  SUBJECT_PREFIX: "[WA]",
  WHITELIST_NUMBERS: "",
  REPLY_CONFIRMATION: true,
  HEADLESS: true
};
5. Jalankan:
   node index.js
6. Scan QR yang muncul di terminal dengan WhatsApp (Linked Devices).
7. Semua pesan masuk (teks & media) akan diteruskan ke Gmail Anda.
