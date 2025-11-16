import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import geminiRouter from "./services/geminiAiService/geminiAiService.js";
import openaiRouter from "./services/openAiService/openAiService.js";
import whatsappRouter from "./services/whatsappService/whatsappService.js";
import supabaseRouter from "./services/supabase/BaechlerIngenieros/supabaseService.js";
import mailRouter from "./services/mailService/mailService.js";

dotenv.config();

const app = express();

/* ---------------------------------------
   🚀 Aumentar límite a 50MB para PDFs
---------------------------------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

/* ---------------------------------------
   🚀 CORS correctos
---------------------------------------- */
app.use(
  cors({
    origin: [
      "https://baechler-ingenieros.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type"],
  })
);

/* ---------------------------------------
   🚀 Rutas
---------------------------------------- */
app.use("/gemini", geminiRouter);
app.use("/openai", openaiRouter);
app.use("/whatsapp", whatsappRouter);
app.use("/supabase", supabaseRouter);
app.use("/mail", mailRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
