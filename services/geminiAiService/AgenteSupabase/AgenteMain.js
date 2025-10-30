import { GoogleGenerativeAI } from "@google/generative-ai";
import * as supabaseQuery from "./AgenteSupabase.js";
import stringSimilarity from "string-similarity";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const OLLAMA_API_URL = "http://localhost:11434/api/generate";

// Atributos de tablas (igual que antes)
import {
  TABLA_ATRIBUTOS,
  TABLES_NAMES,
  DATA_SERVICE,
} from "./estructuraTablas.js"; // si lo separaste

// ---------- Funciones utilitarias ----------

// Función para generar texto con OpenAI
async function generateTextWithOpenAI(prompt, model = "gpt-3.5-turbo") {
  try {
    console.log("🤖 Usando OpenAI");
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error al llamar a OpenAI:", error.message);
    throw error;
  }
}

// Función para generar texto con Ollama local
async function generateTextWithOllama(prompt, model = "mistral") {
  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Error en la API de Ollama: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error al llamar a Ollama:", error.message);
    throw error;
  }
}

// Generar texto con OpenAI como principal, Ollama y Gemini como fallbacks
async function generateText(prompt) {
  try {
    // Intentar primero con OpenAI
    return await generateTextWithOpenAI(prompt);
  } catch (openaiError) {
    console.error(
      "Error con OpenAI, intentando con Ollama local:",
      openaiError.message
    );

    // Si falla OpenAI, intentar con Ollama como primer fallback
    try {
      console.log("🤖 Usando Ollama local");
      return await generateTextWithOllama(prompt);
    } catch (ollamaError) {
      console.error(
        "Error con Ollama local, intentando con Gemini:",
        ollamaError.message
      );

      // Si falla Ollama, intentar con Gemini como segundo fallback
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const result = await model.generateContent(prompt);
        return result.response.text();
      } catch (geminiError) {
        console.error("Error con Gemini:", geminiError.message);

        // Si todo falla, usar respuesta predefinida
        return useFallbackResponse(prompt);
      }
    }
  }
}

// Función de respuesta predefinida cuando todos los modelos fallan
function useFallbackResponse(prompt) {
  // Extraer información clave del prompt para generar una respuesta básica
  const isQueryRequest =
    prompt.toLowerCase().includes("sql") ||
    prompt.toLowerCase().includes("tabla");

  if (isQueryRequest) {
    return JSON.stringify({
      tabla: "Usuarios",
      filtros: {},
    });
  } else {
    return "Lo siento, no puedo procesar tu solicitud en este momento debido a limitaciones de la API. Por favor, intenta más tarde.";
  }
}

// Limpiar JSON que venga con ```json o ```
function cleanJSON(jsonString) {
  return jsonString
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

// Normalizar texto: sin tildes y en minúsculas
function normalizeString(str) {
  if (typeof str !== "string") return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

// Buscar coincidencia difusa >= 50 %
function findClosestMatch(valorBuscado, listaValores) {
  const valorNormalizado = normalizeString(valorBuscado);
  const listaNormalizada = listaValores.map(normalizeString);

  const matches = stringSimilarity.findBestMatch(
    valorNormalizado,
    listaNormalizada
  );
  const best = matches.bestMatch;

  if (best.rating >= 0.5) {
    // Devolver el valor original, no el normalizado
    const originalIndex = listaNormalizada.indexOf(best.target);
    return listaValores[originalIndex];
  }
  return null;
}

// ---------- Lógica principal ----------

export async function initText(params, res) {
  const { prompt } = params;
  const maxRetries = 5;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1️⃣ Generar instrucción con Gemini
      const aiPrompt = `
Eres un experto en SQL y Supabase.
Usuario: "${prompt}"

Tablas disponibles: ${TABLES_NAMES.join(", ")}
Atributos de las tablas:
${JSON.stringify(TABLA_ATRIBUTOS, null, 2)}

Reglas:
- Usa nombres exactos de columnas, no relaciones anidadas.
- Si necesitas unir tablas, indica "union" con la condición.
- Devuelve SOLO JSON plano con los campos:
  { "tabla": "Tabla", "union": { "tabla": "...", "condicion": "..." }, "filtros": { "columna": "valor" } }
`;
      const aiInstructionRaw = await generateText(aiPrompt);
      const aiInstruction = JSON.parse(cleanJSON(aiInstructionRaw));
      console.log("🧠 Gemini Output Limpio:", aiInstruction);

      let filtros = aiInstruction.filtros || {};
      let tabla = aiInstruction.tabla;
      let union = aiInstruction.union;

      // 2️⃣ Detectar filtros de tipo "Empresa.nombre"
      for (const key of Object.keys(filtros)) {
        if (key.includes(".")) {
          const [tablaRelacion, columna] = key.split(".");
          const valor = filtros[key];

          // Buscar valores reales en la tabla relacionada
          const empresas = await supabaseQuery.ejecutarConsulta(tablaRelacion);
          const nombres = empresas.map((e) => e[columna]);
          const mejorCoincidencia = findClosestMatch(valor, nombres);

          if (mejorCoincidencia) {
            // Buscar el id real
            const empresaCorrecta = empresas.find(
              (e) => e[columna] === mejorCoincidencia
            );
            if (empresaCorrecta) {
              filtros = { id_empresa: empresaCorrecta.id };
            }
          } else {
            throw new Error(
              `No se encontró coincidencia cercana a "${valor}" en ${tablaRelacion}`
            );
          }
        }
      }

      // 3️⃣ Ejecutar consulta real en Supabase
      const data = await supabaseQuery.ejecutarConsulta(tabla, filtros);

      // 4️⃣ Respuesta final
      const RESPONSE = {
        queryUser: prompt,
        data: { [tabla]: data },
      };

      // Si todo va bien, enviamos la respuesta y salimos del bucle
      return res.json({ provider: "Gemini", type: "ui", text: RESPONSE });
    } catch (err) {
      console.error(`Intento ${attempt} fallido:`, err.message);
      lastError = err;
      // Esperar un segundo antes de reintentar
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }

  // Si todos los reintentos fallan, enviar el último error
  console.error(
    "Todos los reintentos fallaron. Último error:",
    lastError.message
  );
  res
    .status(500)
    .json({ error: `Todos los reintentos fallaron: ${lastError.message}` });
}

export const textFunctions = { initText };
