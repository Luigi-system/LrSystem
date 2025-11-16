import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const router = express.Router();

/* --------------------- CORS FIX --------------------- */
router.use(
  cors({
    origin: "*",
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type"],
  })
);

/* --------------------- BODY LIMIT FIX --------------------- */
router.use(express.json({ limit: "50mb" }));
router.use(express.urlencoded({ limit: "50mb", extended: true }));

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
      rejectUnauthorized: false,
    },
  });
}

/**
 * Intenta enviar el correo con diferentes hosts
 */
async function trySendEmail({ from, to, subject, message, attachments }) {
  const hosts = [
    "smtp-relay.sendinblue.com",
    "smtp-relay.brevo.com",
  ];

  let lastError = null;

  for (const host of hosts) {
    const transporter = createTransporter(host);
    try {
      const info = await transporter.sendMail({
        from,
        to,
        subject,
        html: message,
        attachments: attachments?.map((a) => ({
          filename: a.filename,
          content: Buffer.from(a.content, "base64"),
        })) || [],
      });

      console.log(`📧 Correo enviado con ${host}:`, info.messageId);
      return info;
    } catch (err) {
      console.warn(`⚠️ Falló con ${host}:`, err.message);
      lastError = err;
    }
  }

  throw lastError;
}

/**
 * Endpoint para enviar correo
 */
router.post("/", async (req, res) => {
  const { from, to, subject, message, attachments } = req.body;

  if (!from || !to || !subject || !message) {
    return res.status(400).json({
      error: "Faltan campos requeridos (from, to, subject, message)",
    });
  }

  try {
    const info = await trySendEmail({ from, to, subject, message, attachments });
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error("❌ Error al enviar correo:", error);
    res.status(500).json({
      error: "No se pudo enviar el correo",
      details: error.message,
    });
  }
});

export default router;
