import express from "express";
import pkg from "whatsapp-web.js";
const { Client, LocalAuth, MessageMedia } = pkg;
import qrcode from "qrcode-terminal";

const router = express.Router();

let qrCodeData = null; // 🧠 Guardamos el último QR generado
let clientStatus = "Desconectado";

// Inicializa cliente con autenticación local
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

// 📱 Evento QR: se muestra en consola y se guarda para el endpoint /qr
client.on("qr", (qr) => {
  qrCodeData = qr;
  clientStatus = "Esperando escaneo del QR";
  console.log("📱 Escanea este QR para conectar:");
  qrcode.generate(qr, { small: true });
});

// ✅ Cuando se conecta
client.on("ready", () => {
  clientStatus = "Conectado ✅";
  console.log("✅ WhatsApp conectado y listo!");
});

// 🚫 Cuando se desconecta
client.on("disconnected", () => {
  clientStatus = "Desconectado ❌";
  qrCodeData = null;
  console.log("⚠️ Cliente desconectado");
});

// 🚀 Inicialización del cliente con manejo de errores y espera
(async () => {
  try {
    console.log("🕒 Iniciando cliente de WhatsApp...");
    await client.initialize();

    // ✅ Espera 3 segundos para evitar el error de navegación de Puppeteer
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log("✅ Cliente WhatsApp inicializado correctamente");
  } catch (error) {
    console.error("❌ Error al inicializar cliente de WhatsApp:", error.message);
    console.error("🧠 Sugerencia: elimina la carpeta '.wwebjs_auth' y vuelve a ejecutar.");
  }
})();

// 📡 0️⃣ Endpoint para ver el QR actual
router.get("/qr", async (req, res) => {
  if (!qrCodeData) {
    return res.json({
      success: false,
      message: "No hay QR disponible o ya fue escaneado",
      status: clientStatus,
    });
  }
  res.json({
    success: true,
    message: "QR disponible",
    qr: qrCodeData,
  });
});

// 📡 🔁 Endpoint para ver estado actual del cliente
router.get("/status", async (req, res) => {
  res.json({
    success: true,
    status: clientStatus,
  });
});

// 📨 1️⃣ Enviar mensaje de texto
router.post("/send", async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res.status(400).json({ error: "Faltan campos requeridos (to, message)" });
  }

  try {
    await client.sendMessage(`${to}@c.us`, message);
    console.log(`📨 Mensaje enviado a ${to}: ${message}`);
    res.json({ success: true, message: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error);
    res.status(500).json({ error: "No se pudo enviar el mensaje" });
  }
});

// 🖼️ 2️⃣ Enviar imagen desde URL
router.post("/sendImage", async (req, res) => {
  const { to, imageUrl, caption } = req.body;

  if (!to || !imageUrl) {
    return res.status(400).json({ error: "Faltan campos requeridos (to, imageUrl)" });
  }

  try {
    const media = await MessageMedia.fromUrl(imageUrl);
    await client.sendMessage(`${to}@c.us`, media, { caption });
    console.log(`🖼️ Imagen enviada a ${to}`);
    res.json({ success: true, message: "Imagen enviada correctamente" });
  } catch (error) {
    console.error("❌ Error al enviar imagen:", error);
    res.status(500).json({ error: "No se pudo enviar la imagen" });
  }
});

// 📎 3️⃣ Enviar archivo en Base64
router.post("/sendFile", async (req, res) => {
  const { to, fileBase64, fileName, caption } = req.body;

  if (!to || !fileBase64 || !fileName) {
    return res.status(400).json({ error: "Faltan campos requeridos (to, fileBase64, fileName)" });
  }

  try {
    const media = new MessageMedia(
      "application/octet-stream",
      fileBase64.split(";base64,").pop(),
      fileName
    );

    await client.sendMessage(`${to}@c.us`, media, { caption });
    console.log(`📎 Archivo ${fileName} enviado a ${to}`);
    res.json({ success: true, message: "Archivo enviado correctamente" });
  } catch (error) {
    console.error("❌ Error al enviar archivo:", error);
    res.status(500).json({ error: "No se pudo enviar el archivo" });
  }
});

// 🎧 4️⃣ Enviar audio (MP3 o nota de voz)
router.post("/sendAudio", async (req, res) => {
  const { to, audioBase64 } = req.body;

  if (!to || !audioBase64) {
    return res.status(400).json({ error: "Faltan campos requeridos (to, audioBase64)" });
  }

  try {
    const media = new MessageMedia("audio/mpeg", audioBase64.split(";base64,").pop());
    await client.sendMessage(`${to}@c.us`, media, { sendAudioAsVoice: true });
    console.log(`🎧 Audio enviado a ${to}`);
    res.json({ success: true, message: "Audio enviado correctamente" });
  } catch (error) {
    console.error("❌ Error al enviar audio:", error);
    res.status(500).json({ error: "No se pudo enviar el audio" });
  }
});

// 📋 5️⃣ Verificar si un número existe
router.get("/checkNumber/:number", async (req, res) => {
  const { number } = req.params;

  try {
    const exists = await client.isRegisteredUser(`${number}@c.us`);
    res.json({ number, exists });
  } catch (error) {
    console.error("❌ Error al verificar número:", error);
    res.status(500).json({ error: "No se pudo verificar el número" });
  }
});

export default router;
