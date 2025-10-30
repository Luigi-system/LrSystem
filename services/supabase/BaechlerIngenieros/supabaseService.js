import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { empresaFunctions } from "./empresas.js";
import * as usuarios from "./usuarios.js";
import * as empresas from "./empresas.js"; // ejemplo de funciones de empresa
import * as configuraciones from "./configuraciones.js"; // funciones de Configuracion

dotenv.config();
const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Endpoint unificado POST
router.post("/", async (req, res) => {
  try {
    const { service, content } = req.body;
    if (!service || !content)
      return res.status(400).json({ error: "JSON inválido" });

    const { action, params } = content;

    switch (service) {
      case "user":
        if (usuarios.usuarioFunctions[action]) {
          return usuarios.usuarioFunctions[action](supabase, params, res);
        }
        return res.status(400).json({ error: "Acción de usuario no válida" });

      case "empresa":
        if (empresaFunctions[action]) {
          return empresaFunctions[action](supabase, params, res);
        }

        return res.status(400).json({ error: "Acción de empresa no válida" });

      case "configuracion":
        if (configuraciones.configuracionFunctions[action]) {
          return configuraciones.configuracionFunctions[action](
            supabase,
            params,
            res
          );
        }
        return res
          .status(400)
          .json({ error: "Acción de configuración no válida" });

      default:
        return res.status(400).json({ error: "Servicio no válido" });
    }
  } catch (err) {
    console.error("Error endpoint unificado:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
