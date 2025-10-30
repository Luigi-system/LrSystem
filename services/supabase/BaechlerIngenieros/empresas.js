// services/supabase/empresas.js
// 🔹 Funciones de empresas para Supabase

// Listar todas las empresas
export async function listEmpresas(supabase, params, res) {
  try {
    const { data, error } = await supabase
      .from("Empresa")
      .select("*")
      .order("nombre");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Obtener empresa por ID
export async function getEmpresa(supabase, params, res) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("Empresa")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

// Buscar empresa por RUC
export async function getEmpresasByRUC(supabase, params, res) {
  try {
    const { ruc } = params;
    const { data, error } = await supabase
      .from("Empresa")
      .select("*")
      .eq("ruc", ruc);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Buscar empresa por distrito
export async function getEmpresasByDistrito(supabase, params, res) {
  try {
    const { distrito } = params;
    const { data, error } = await supabase
      .from("Empresa")
      .select("*")
      .eq("distrito", distrito);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Activar o desactivar empresa
export async function toggleEmpresaStatus(supabase, params, res) {
  try {
    const { id, estado } = params;
    const { data, error } = await supabase
      .from("Empresa")
      .update({ estado })
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Estado actualizado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Buscar empresa por nombre
export async function searchEmpresasByName(supabase, params, res) {
  try {
    const { nombre } = params;
    const { data, error } = await supabase
      .from("Empresa")
      .select("*")
      .ilike("nombre", `%${nombre}%`);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Paginación
export async function paginateEmpresas(supabase, params, res) {
  try {
    const { page = 1, pageSize = 10 } = params;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("Empresa")
      .select("*")
      .range(from, to);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Exportar todas las funciones
export const empresaFunctions = {
  listEmpresas,
  getEmpresa,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getEmpresasByRUC,
  getEmpresasByDistrito,
  toggleEmpresaStatus,
  searchEmpresasByName,
  paginateEmpresas,
};
