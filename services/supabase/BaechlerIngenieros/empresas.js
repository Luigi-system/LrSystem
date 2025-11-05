// services/supabase/empresas.js
// 🔹 Funciones de empresas para Supabase - SIMPLIFICADO

// 🔍 BÚSQUEDA UNIFICADA - Único método necesario
export async function searchEmpresas(supabase, params, res) {
  try {
    const { id, nombre, ruc, distrito, estado, search } = params;
    let query = supabase.from("Empresa").select("*");

    // Búsqueda por ID exacto
    if (id) {
      query = query.eq("id", id);
    }

    // Búsqueda por nombre (coincidencia parcial case-insensitive)
    if (nombre) {
      query = query.ilike("nombre", `%${nombre}%`);
    }

    // Búsqueda por RUC (coincidencia parcial)
    if (ruc) {
      query = query.ilike("ruc", `%${ruc}%`);
    }

    // Búsqueda por distrito (coincidencia parcial)
    if (distrito) {
      query = query.ilike("distrito", `%${distrito}%`);
    }

    // Búsqueda por estado
    if (estado !== undefined) {
      query = query.eq("estado", estado);
    }

    // Búsqueda general en múltiples campos
    if (search) {
      query = query.or(`nombre.ilike.%${search}%,ruc.ilike.%${search}%,distrito.ilike.%${search}%`);
    }

    // Si no hay filtros, devolver todas las empresas
    const { data, error } = await query.order("nombre");
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📋 LISTAR TODAS LAS EMPRESAS (sin filtros)
export async function listEmpresas(supabase, params, res) {
  try {
    const { data, error } = await supabase
      .from("Empresa")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🔎 OBTENER EMPRESA POR ID ESPECÍFICO
export async function getEmpresaById(supabase, params, res) {
  try {
    const { id } = params;

    if (!id) {
      return res.status(400).json({ error: "Se requiere el parámetro 'id'" });
    }

    const { data, error } = await supabase
      .from("Empresa")
      .select("*")
      .eq("id", id)
      .single(); // .single() asegura que retorne un solo objeto, no un array

    if (error) throw error;

    if (!data) {
      return res.status(404).json({ error: "Empresa no encontrada" });
    }

    res.json(data);
  } catch (err) {
    if (err.code === 'PGRST116') {
      // Error cuando no se encuentra el registro con .single()
      res.status(404).json({ error: "Empresa no encontrada" });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
}

// Crear una empresa
export async function createEmpresa(supabase, params, res) {
  try {
    const { nombre, ruc, distrito, direccion, estado = true } = params;
    const { data, error } = await supabase
      .from("Empresa")
      .insert([{ nombre, ruc, distrito, direccion, estado }])
      .select();
    if (error) throw error;
    res.status(201).json({ message: "Empresa creada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Actualizar empresa
export async function updateEmpresa(supabase, params, res) {
  try {
    const { id, ...fields } = params;
    const { data, error } = await supabase
      .from("Empresa")
      .update(fields)
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Empresa actualizada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Eliminar empresa
export async function deleteEmpresa(supabase, params, res) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("Empresa")
      .delete()
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Empresa eliminada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Exportar solo las funciones esenciales
export const empresaFunctions = {
  searchEmpresas,  // ✅ Búsqueda con filtros
  listEmpresas,    // ✅ Listar todas sin filtros
  getEmpresaById,  // ✅ Obtener por ID específico
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
};