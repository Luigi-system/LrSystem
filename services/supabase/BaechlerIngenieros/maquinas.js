// services/supabase/maquinas.js
// 🔹 Funciones de máquinas para Supabase - PATRÓN SIMPLIFICADO

// 🔍 BÚSQUEDA UNIFICADA - Único método necesario
export async function searchMaquinas(supabase, params, res) {
  try {
    const {
      id,
      marca,
      linea,
      serie,
      modelo,
      id_planta,
      id_empresa,
      nombreplanta,
      nombreempresa,
      estado,
      detalles,
      search,
      orden = "asc",
      campo_orden = "marca",
      limite
    } = params;

    let query = supabase.from("Maquinas").select(`
      *,
      Planta (nombre),
      Empresa (nombre)
    `);

    // Búsqueda por ID exacto
    if (id) {
      query = query.eq("id", id);
    }

    // Búsqueda por marca (coincidencia parcial case-insensitive)
    if (marca) {
      query = query.ilike("marca", `%${marca}%`);
    }

    // Búsqueda por línea (coincidencia parcial)
    if (linea) {
      query = query.ilike("linea", `%${linea}%`);
    }

    // Búsqueda por serie (coincidencia parcial)
    if (serie) {
      query = query.ilike("serie", `%${serie}%`);
    }

    // Búsqueda por modelo (coincidencia parcial)
    if (modelo) {
      query = query.ilike("modelo", `%${modelo}%`);
    }

    // Búsqueda por ID de planta
    if (id_planta) {
      query = query.eq("id_planta", id_planta);
    }

    // Búsqueda por ID de empresa
    if (id_empresa) {
      query = query.eq("id_empresa", id_empresa);
    }

    // Búsqueda por nombre de planta (coincidencia parcial)
    if (nombreplanta) {
      query = query.ilike("nombreplanta", `%${nombreplanta}%`);
    }

    // Búsqueda por nombre de empresa (coincidencia parcial)
    if (nombreempresa) {
      query = query.ilike("nombreempresa", `%${nombreempresa}%`);
    }

    // Búsqueda por detalles (coincidencia parcial)
    if (detalles) {
      query = query.ilike("detalles", `%${detalles}%`);
    }

    // Búsqueda por estado
    if (estado !== undefined) {
      query = query.eq("estado", estado);
    }

    // Búsqueda general en múltiples campos
    if (search) {
      query = query.or(`marca.ilike.%${search}%,linea.ilike.%${search}%,serie.ilike.%${search}%,modelo.ilike.%${search}%,nombreplanta.ilike.%${search}%,nombreempresa.ilike.%${search}%`);
    }

    // Aplicar ordenamiento
    if (campo_orden) {
      query = query.order(campo_orden, { ascending: orden === "asc" });
    }

    // Aplicar límite si se especifica
    if (limite) {
      query = query.limit(limite);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📋 LISTAR TODAS LAS MÁQUINAS (sin filtros)
export async function listMaquinas(supabase, params, res) {
  try {
    const { orden = "asc", campo_orden = "marca" } = params;

    const { data, error } = await supabase
      .from("Maquinas")
      .select(`
        *,
        Planta (nombre),
        Empresa (nombre)
      `)
      .order(campo_orden, { ascending: orden === "asc" });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🔎 OBTENER MÁQUINA POR ID ESPECÍFICO
export async function getMaquinaById(supabase, params, res) {
  try {
    const { id } = params;

    if (!id) {
      return res.status(400).json({ error: "Se requiere el parámetro 'id'" });
    }

    const { data, error } = await supabase
      .from("Maquinas")
      .select(`
        *,
        Planta (nombre, direccion),
        Empresa (nombre, ruc)
      `)
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Máquina no encontrada" });
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Crear una nueva máquina
export async function createMaquina(supabase, params, res) {
  try {
    const {
      marca,
      linea,
      serie,
      modelo,
      id_planta,
      id_empresa,
      nombreplanta,
      nombreempresa,
      detalles,
      estado = true
    } = params;

    const { data, error } = await supabase
      .from("Maquinas")
      .insert([{
        marca,
        linea,
        serie,
        modelo,
        id_planta,
        id_empresa,
        nombreplanta,
        nombreempresa,
        detalles,
        estado
      }])
      .select();

    if (error) throw error;
    res.status(201).json({ message: "Máquina creada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Actualizar máquina
export async function updateMaquina(supabase, params, res) {
  try {
    const { id, ...fields } = params;
    const { data, error } = await supabase
      .from("Maquinas")
      .update(fields)
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Máquina actualizada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Eliminar máquina (soft delete cambiando estado)
export async function deleteMaquina(supabase, params, res) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("Maquinas")
      .update({ estado: false })
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Máquina eliminada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Activar máquina
export async function activateMaquina(supabase, params, res) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("Maquinas")
      .update({ estado: true })
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Máquina activada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Exportar todas las funciones esenciales
export const maquinaFunctions = {
  searchMaquinas,  // ✅ Búsqueda con filtros
  listMaquinas,    // ✅ Listar todas sin filtros
  getMaquinaById,  // ✅ Obtener por ID específico
  createMaquina,
  updateMaquina,
  deleteMaquina,
  activateMaquina,
};