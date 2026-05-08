const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const qrcode = require("qrcode-terminal");
const cron = require("node-cron");
const fs = require("fs");

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    const { qr, connection } = update;

    if (qr) {
      qrcode.generate(qr, { small: true });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp Connected");
    }
  });

  // ⏰ كل يوم 6 مساء
  cron.schedule("0 18 * * *", async () => {
    console.log("📤 Sending Status...");

    const image = fs.readFileSync("./status.png");

    await sock.sendMessage("status@broadcast", {
      image,
      caption: "حالة تلقائية 🤖"
    });

    console.log("✅ Status Sent");
  });
}

startBot();
