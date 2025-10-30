import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const maquinas = {
  async getMaquinasByPlanta(plantaId) {
    try {
      const { data, error } = await supabase
        .from("Maquinas")
        .select(
          `
          *,
          Planta (nombre),
          Empresa (nombre)
        `
        )
        .eq("id_planta", plantaId)
        .eq("estado", true);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  // ... más funciones para máquinas
};

export default maquinas;
