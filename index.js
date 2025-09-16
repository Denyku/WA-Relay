/**
 * WA pribadi -> Gmail (transit) -> (opsional: auto-forward ke email kantor via Gmail)
 * Gratis, tanpa Cloud API/Twilio. Menggunakan WhatsApp Web.
 */

const CONFIG = {
  TRANSIT_TO_GMAIL: "gmailanda@gmail.com",
  SMTP_HOST: "smtp.gmail.com",
  SMTP_PORT: 465,
  SMTP_SECURE: true,
  SMTP_USER: "gmailanda@gmail.com",
  SMTP_PASS: "app_password_gmail_16digit",
  SUBJECT_PREFIX: "[WA]",
  WHITELIST_NUMBERS: "",
  REPLY_CONFIRMATION: true,
  HEADLESS: true
};

const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const nodemailer = require("nodemailer");
const mime = require("mime-types");

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "wa-relay" }),
  puppeteer: {
    headless: CONFIG.HEADLESS,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  }
});

const transporter = nodemailer.createTransport({
  host: CONFIG.SMTP_HOST,
  port: Number(CONFIG.SMTP_PORT),
  secure: !!CONFIG.SMTP_SECURE,
  auth: { user: CONFIG.SMTP_USER, pass: CONFIG.SMTP_PASS }
});

function isWhitelisted(msisdn) {
  const list = (CONFIG.WHITELIST_NUMBERS || "").split(",").map(s => s.trim()).filter(Boolean);
  return list.length === 0 || list.includes(msisdn);
}

function extFromMime(mimeType) {
  return mime.extension(mimeType || "") || "bin";
}

client.on("qr", qr => {
  console.log("Scan QR berikut memakai WhatsApp di ponsel Anda (Linked devices):");
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => console.log("✅ WhatsApp client siap. Menunggu pesan masuk…"));
client.on("auth_failure", msg => console.error("❌ Gagal autentikasi:", msg));
client.on("disconnected", reason => console.log("⚠️ Terputus:", reason));

client.on("message", async (msg) => {
  try {
    const from = msg.from;
    const match = from.match(/^(\d+)/);
    const msisdn = match ? match[1] : from;
    if (!isWhitelisted(msisdn)) {
      console.log(`Lewatkan ${msisdn}: tidak di whitelist`);
      return;
    }

    const contact = await msg.getContact();
    const pushName = contact?.pushname || contact?.name || "Unknown";
    const ts = new Date().toISOString();

    let subject = `${CONFIG.SUBJECT_PREFIX} ${pushName} (${msisdn}) • ${ts}`;
    let textBody = `Pengirim: ${pushName} (${msisdn})\nWaktu: ${ts}\n\n`;
    const attachments = [];

    if (msg.body && msg.body.trim()) textBody += `Pesan:\n${msg.body}\n\n`;
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      if (media && media.data) {
        const buffer = Buffer.from(media.data, "base64");
        const mimeType = media.mimetype || "application/octet-stream";
        const ext = extFromMime(mimeType);
        const fileName = (media.filename && media.filename.trim()) || `wa-${msisdn}-${Date.now()}.${ext}`;
        attachments.push({ filename: fileName, content: buffer, contentType: mimeType });
        textBody += `Lampiran: ${fileName} (${mimeType})\n`;
      }
    }

    const info = await transporter.sendMail({
      from: `"WA Relay" <${CONFIG.SMTP_USER}>`,
      to: CONFIG.TRANSIT_TO_GMAIL,
      subject,
      text: textBody,
      attachments
    });

    console.log(`📧 Email terkirim ke ${CONFIG.TRANSIT_TO_GMAIL}: ${info.messageId}`);
    if (CONFIG.REPLY_CONFIRMATION) await msg.reply("✔️ Pesan Anda sudah diteruskan ke email kami.");
  } catch (err) {
    console.error("Error:", err?.message || err);
    try { if (CONFIG.REPLY_CONFIRMATION) await msg.reply("❌ Gagal meneruskan pesan."); } catch {}
  }
});

client.initialize();
