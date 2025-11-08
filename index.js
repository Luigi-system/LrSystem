import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // 👈 agrega esto
import geminiRouter from "./services/geminiAiService/geminiAiService.js";
import openaiRouter from "./services/openAiService/openAiService.js";
import whatsappRouter from "./services/whatsappService/whatsappService.js";
import supabaseRouter from "./services/supabase/BaechlerIngenieros/supabaseService.js";
import mailRouter from "./services/mailService/mailService.js"; // 👈 nuevo


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // 👈 permite peticiones desde el frontend

// 🔗 Conectar servicios
app.use("/gemini", geminiRouter);
app.use("/openai", openaiRouter);
app.use("/whatsapp", whatsappRouter);
app.use("/supabase", supabaseRouter);
app.use("/mail", mailRouter); // 👈 nuevo servicio de correo

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
