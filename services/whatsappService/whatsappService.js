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

// 🔌 6️⃣ Desconectar del servicio
router.post("/exit", async (req, res) => {
  try {
    if (!client) {
      return res.status(400).json({ success: false, message: "Cliente no inicializado" });
    }

    console.log("🔌 Desconectando cliente de WhatsApp...");

    await client.logout();  // Cerrar sesión de WhatsApp
    await client.destroy(); // Destruir Puppeteer y recursos internos

    clientStatus = "Desconectado ❌";
    qrCodeData = null;

    return res.json({
      success: true,
      message: "Cliente desconectado correctamente",
      status: clientStatus,
    });

  } catch (error) {
    console.error("❌ Error al desconectar:", error);
    return res.status(500).json({
      success: false,
      message: "No se pudo desconectar del servicio",
      error: error.message,
    });
  }
});

// 🗂️ 7️⃣ Obtener todos los mensajes de un chat
router.get("/messages/:number", async (req, res) => {
  const { number } = req.params;

  if (!number) {
    return res.status(400).json({ error: "Falta el número (number)" });
  }

  try {
    const chatId = `${number}@c.us`;

    // 🧩 Obtener el chat
    const chat = await client.getChatById(chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat no encontrado" });
    }

    // 📥 Obtener mensajes (puedes aumentar el limit)
    const messages = await chat.fetchMessages({ limit: 500 });

    // 🧹 Formatear la respuesta
    const formatted = messages.map((msg) => ({
      id: msg.id._serialized,
      fromMe: msg.fromMe,
      body: msg.body,
      type: msg.type,
      timestamp: msg.timestamp,
      sender: msg._data?.notifyName || msg.author || null,
    }));

    return res.json({
      success: true,
      chat: chatId,
      total: formatted.length,
      messages: formatted,
    });
  } catch (error) {
    console.error("❌ Error al obtener mensajes:", error);
    return res.status(500).json({
      success: false,
      message: "No se pudieron obtener los mensajes",
      error: error.message,
    });
  }
});

// 📨 8️⃣ Obtener solo los mensajes no leídos de un chat
router.get("/messages/unread/:number", async (req, res) => {
  const { number } = req.params;

  try {
    const chatId = `${number}@c.us`;
    const chat = await client.getChatById(chatId);

    if (!chat) return res.status(404).json({ success: false, message: "Chat no encontrado" });

    const messages = await chat.fetchMessages({ limit: 200 });

    const unread = messages.filter(m => !m.fromMe && m.isUnread);

    return res.json({
      success: true,
      total: unread.length,
      messages: unread.map(msg => ({
        id: msg.id._serialized,
        body: msg.body,
        timestamp: msg.timestamp,
        from: msg.author || msg.from,
      })),
    });

  } catch (error) {
    console.error("❌ Error al obtener mensajes no leídos:", error);
    res.status(500).json({ error: error.message });
  }
});

// 💬 9️⃣ Obtener el último mensaje de un chat
router.get("/messages/last/:number", async (req, res) => {
  const { number } = req.params;

  try {
    const chatId = `${number}@c.us`;
    const chat = await client.getChatById(chatId);

    const messages = await chat.fetchMessages({ limit: 1 });
    const last = messages[0];

    return res.json({
      success: true,
      message: {
        id: last.id._serialized,
        body: last.body,
        timestamp: last.timestamp,
        type: last.type,
        fromMe: last.fromMe
      }
    });

  } catch (error) {
    console.error("❌ Error en obtener último mensaje:", error);
    res.status(500).json({ error: error.message });
  }
});


// 📒 🔟 Obtener todos los chats
router.get("/chats", async (req, res) => {
  try {
    const chats = await client.getChats();

    const formatted = chats.map(chat => ({
      id: chat.id._serialized,
      name: chat.name || chat.formattedTitle,
      isGroup: chat.isGroup,
      unreadCount: chat.unreadCount,
      timestamp: chat.timestamp,
      lastMessage: chat.lastMessage?.body || null
    }));

    res.json({
      success: true,
      total: formatted.length,
      chats: formatted
    });

  } catch (error) {
    console.error("❌ Error al obtener chats:", error);
    res.status(500).json({ error: error.message });
  }
});


export default router;
