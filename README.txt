# WA Relay Bot

## Cara install & jalankan
1. Extract ZIP ini ke folder (misal D:\wa-relay).
2. Buka folder dengan Visual Studio Code.
3. Di terminal VS Code (gunakan CMD, bukan PowerShell):
   npm install
4. Edit file index.js bagian CONFIG:
   - TRANSIT_TO_GMAIL = Gmail Anda
   - SMTP_USER = Gmail Anda
   - SMTP_PASS = App Password Gmail (16 digit)
5. Jalankan:
   node index.js
6. Scan QR yang muncul di terminal dengan WhatsApp (Linked Devices).
7. Semua pesan masuk (teks & media) akan diteruskan ke Gmail Anda.

Opsional: atur auto-forward di Gmail agar diteruskan ke email kantor Anda.
