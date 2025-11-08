import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

/**
 * Crea un transporter con el host especificado
 */
function createTransporter(host) {
  return nodemailer.createTransport({
    host,
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS,
    },
    tls: {
      rejectUnauthorized: false, // evita error de certificado en algunos hosts
    },
  });
}

/**
 * Intenta enviar el correo con diferentes hosts
 */
async function trySendEmail({ from, to, subject, message }) {
  const hosts = [
    "smtp-relay.sendinblue.com", // ✅ principal
    "smtp-relay.brevo.com",      // 🔄 alternativo
  ];

  let lastError = null;

  for (const host of hosts) {
    const transporter = createTransporter(host);
    try {
      const info = await transporter.sendMail({
        from, // ahora usa el remitente recibido por parámetro
        to,
        subject,
        html: `<p>${message}</p>`,
      });
      console.log(`📧 Correo enviado con ${host}:`, info.messageId);
      return info; // si se envía correctamente, retorna
    } catch (err) {
      console.warn(`⚠️ Falló con ${host}:`, err.message);
      lastError = err;
    }
  }

  // si todos fallaron
  throw lastError;
}

/**
 * Endpoint para enviar correo
 */
router.post("/", async (req, res) => {
  const { from, to, subject, message } = req.body;

  if (!from || !to || !subject || !message) {
    return res.status(400).json({ error: "Faltan campos requeridos (from, to, subject, message)" });
  }

  try {
    const info = await trySendEmail({ from, to, subject, message });
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    res.status(500).json({ error: "No se pudo enviar el correo", details: error.message });
  }
});

export default router;
