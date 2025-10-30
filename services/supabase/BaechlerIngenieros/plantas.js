import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const plantas = {
  async getPlantasByEmpresa(empresaId) {
    try {
      const { data, error } = await supabase
        .from("Planta")
        .select("*")
        .eq("id_empresa", empresaId)
        .eq("estado", true);

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
  // ... más funciones para plantas
};

export default plantas;
