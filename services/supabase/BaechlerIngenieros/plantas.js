// services/supabase/plantas.js
// 🔹 Funciones de plantas para Supabase - PATRÓN SIMPLIFICADO

// 🔍 BÚSQUEDA UNIFICADA - Único método necesario
export async function searchPlantas(supabase, params, res) {
  try {
    const {
      id, nombre, id_empresa, nombreempresa, estado, direccion, search,
      orden = "asc", campo_orden = "nombre", limite
    } = params;

    let query = supabase.from("Planta").select("*");

    // Búsqueda por ID exacto
    if (id) {
      query = query.eq("id", id);
    }

    // Búsqueda por nombre (coincidencia parcial case-insensitive)
    if (nombre) {
      query = query.ilike("nombre", `%${nombre}%`);
    }

    // Búsqueda por ID de empresa
    if (id_empresa) {
      query = query.eq("id_empresa", id_empresa);
    }

    // Búsqueda por nombre de empresa (coincidencia parcial)
    if (nombreempresa) {
      query = query.ilike("nombreempresa", `%${nombreempresa}%`);
    }

    // Búsqueda por dirección (coincidencia parcial)
    if (direccion) {
      query = query.ilike("direccion", `%${direccion}%`);
    }

    // Búsqueda por estado
    if (estado !== undefined) {
      query = query.eq("estado", estado);
    }

    // Búsqueda general en múltiples campos
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,nombreempresa.ilike.%${search}%,direccion.ilike.%${search}%`);
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

// 📋 LISTAR TODAS LAS PLANTAS (sin filtros)
export async function listPlantas(supabase, params, res) {
  try {
    const { orden = "asc", campo_orden = "nombre" } = params;

    const { data, error } = await supabase
      .from("Planta")
      .select("*")
      .order(campo_orden, { ascending: orden === "asc" });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🔎 OBTENER PLANTA POR ID ESPECÍFICO
export async function getPlantaById(supabase, params, res) {
  try {
    const { id } = params;

    if (!id) {
      return res.status(400).json({ error: "Se requiere el parámetro 'id'" });
    }

    const { data, error } = await supabase
      .from("Planta")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Planta no encontrada" });
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Crear una nueva planta
export async function createPlanta(supabase, params, res) {
  try {
    const { nombre, direccion, estado = true, id_empresa, nombreempresa } = params;
    const { data, error } = await supabase
      .from("Planta")
      .insert([{ nombre, direccion, estado, id_empresa, nombreempresa }])
      .select();
    if (error) throw error;
    res.status(201).json({ message: "Planta creada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Actualizar planta
export async function updatePlanta(supabase, params, res) {
  try {
    const { id, ...fields } = params;
    const { data, error } = await supabase
      .from("Planta")
      .update(fields)
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Planta actualizada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Eliminar planta (soft delete cambiando estado)
export async function deletePlanta(supabase, params, res) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("Planta")
      .update({ estado: false })
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Planta eliminada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Activar planta
export async function activatePlanta(supabase, params, res) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("Planta")
      .update({ estado: true })
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Planta activada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Exportar todas las funciones esenciales
export const plantaFunctions = {
  searchPlantas,  // ✅ Búsqueda con filtros
  listPlantas,    // ✅ Listar todas sin filtros
  getPlantaById,  // ✅ Obtener por ID específico
  createPlanta,
  updatePlanta,
  deletePlanta,
  activatePlanta,
};