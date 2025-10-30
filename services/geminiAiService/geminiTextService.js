// services/gemini/geminiTextService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Función interna para generar texto desde Gemini
async function generateText(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    return output;
  } catch (err) {
    console.error("Error generando texto:", err.message);
    throw err;
  }
}

// Función que el router llamará
export async function initText(params, res) {
  const { prompt } = params;

  try {
    const responseText = await generateText(prompt);
    res.json({
      provider: "Gemini",
      type: "text",
      text: responseText,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ✅ Exportamos todas las funciones para usar en el router unificado
export const textFunctions = {
  initText,
};
