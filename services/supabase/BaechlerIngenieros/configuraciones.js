// services/supabase/configuracion.js
export async function getConfiguracion(supabase, params, res) {
  const { id } = params;
  try {
    const { data, error } = await supabase
      .from("Configuracion")
      .select("*")
      .eq("id", id);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("❌ Error al obtener configuración:", err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function listConfiguraciones(supabase, params, res) {
  try {
    const { data, error } = await supabase.from("Configuracion").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("❌ Error al listar configuraciones:", err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function createConfiguracion(supabase, params, res) {
  const { key, value, id_usuario } = params;
  try {
    const { data, error } = await supabase.from("Configuracion").insert([
      {
        key,
        value,
        id_usuario,
      },
    ]);
    if (error) throw error;
    res.status(201).json({ message: "✅ Configuración creada", data });
  } catch (err) {
    console.error("❌ Error creando configuración:", err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function updateConfiguracion(supabase, params, res) {
  const { id, ...fields } = params;
  try {
    const { data, error } = await supabase
      .from("Configuracion")
      .update(fields)
      .eq("id", id);
    if (error) throw error;
    res.json({ message: "✅ Configuración actualizada", data });
  } catch (err) {
    console.error("❌ Error actualizando configuración:", err.message);
    res.status(500).json({ error: err.message });
  }
}

export async function deleteConfiguracion(supabase, params, res) {
  const { id } = params;
  try {
    const { data, error } = await supabase
      .from("Configuracion")
      .delete()
      .eq("id", id);
    if (error) throw error;
    res.json({ message: "✅ Configuración eliminada", data });
  } catch (err) {
    console.error("❌ Error eliminando configuración:", err.message);
    res.status(500).json({ error: err.message });
  }
}

// ✅ Exportamos todas las funciones en un objeto para usar en el router unificado
export const configuracionFunctions = {
  getConfiguracion,
  listConfiguraciones,
  createConfiguracion,
  updateConfiguracion,
  deleteConfiguracion,
};
