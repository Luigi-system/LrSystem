// services/gemini/geminiTextService.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const UI_SCHEMA_RULES = {
  low_level_objects: [
    {
      type: "field",
      attributes: [
        { name: "label", dataType: "string" },
        { name: "inputType", dataType: "string" },
      ],
    },
    {
      type: "checkbox",
      attributes: [
        { name: "label", dataType: "string" },
        { name: "checked", dataType: "boolean" },
      ],
    },
    {
      type: "button",
      attributes: [
        { name: "label", dataType: "string" },
        { name: "action", dataType: "string" },
        { name: "api", dataType: "string" },
        { name: "method", dataType: "string" },
      ],
    },
    { type: "label", attributes: [{ name: "text", dataType: "string" }] },
    {
      type: "file_base64",
      attributes: [
        { name: "label", dataType: "string" },
        { name: "mimeType", dataType: "string" },
      ],
    },
    {
      type: "combobox",
      attributes: [
        { name: "label", dataType: "string" },
        { name: "options", dataType: "array" },
      ],
    },
    {
      type: "list",
      attributes: [
        { name: "title", dataType: "string" },
        { name: "items", dataType: "array" },
      ],
    },
    {
      type: "hidden",
      attributes: [
        { name: "name", dataType: "string" },
        { name: "value", dataType: "string" },
      ],
    },
  ],
  key_functional_attributes: [
    {
      attribute: "action",
      component_applicable: "button",
      description: "Código de acción.",
    },
    {
      attribute: "api",
      component_applicable: "button",
      description: "URL de la API.",
    },
    {
      attribute: "data_rows",
      component_applicable: "table, chart",
      description: "Datos para poblar.",
    },
  ],
};

// Convierte las reglas a una cadena JSON para inyectarlas fácilmente en el prompt
const UI_RULES_JSON_STRING = JSON.stringify(UI_SCHEMA_RULES);
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
    const responseText = await generateText(
      prompt +
        "" +
        `\n\n Importante "Solo crea el JSON sin explicar nada":\n${UI_RULES_JSON_STRING}`
    );
    res.json({
      provider: "Gemini",
      type: "ui",
      text: responseText,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// ✅ Exportamos todas las funciones para usar en el router unificado
export const UiFunctions = {
  initText,
};
