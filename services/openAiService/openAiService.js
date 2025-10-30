import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config(); // 🔹 Carga el archivo .env ANTES de usar process.env

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 🔹 Ahora sí tiene valor
});

router.post("/", async (req, res) => {
  try {
    const { prompt } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    res.json({
      provider: "OpenAI",
      output: completion.choices[0].message.content,
    });
  } catch (error) {
    console.error("❌ Error en OpenAI Service:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
