import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { message, phone } = req.body;
    // Aquí podrías conectar tu lógica de whatsapp-web.js o Twilio
    res.json({
      provider: "WhatsApp",
      status: "Mensaje enviado",
      phone,
      message,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
