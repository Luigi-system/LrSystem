import express from "express";
import * as geminiUI from "./geminiUiService.js";
import * as geminiText from "./geminiTextService.js"; // Opcional para consultas de texto
import * as geminiQuery from "./AgenteSupabase/AgenteMain.js"; // Opcional para consultas de Supabase

const router = express.Router();

router.post("/", async (req, res) => {
  const { service, content } = req.body;
  const { action, params } = content;

  try {
    switch (service) {
      case "ui":
        if (geminiUI.UiFunctions[action]) {
          return geminiUI.UiFunctions[action](params, res);
        }
        break;
      case "text":
        if (geminiText.textFunctions[action]) {
          return geminiText.textFunctions[action](params, res);
        }
        break;
      case "supabase":
        if (geminiQuery.textFunctions[action]) {
          return geminiQuery.textFunctions[action](params, res);
        }
        break;

      default:
        return res.status(400).json({ error: "Servicio no válido" });
    }
    return res.status(400).json({ error: "Acción no válida" });
  } catch (err) {
    console.error("Error Gemini Service:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
