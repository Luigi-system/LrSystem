// services/supabase/usuarios.js - CORREGIDO
// 🔹 Funciones de usuarios para Supabase - SIMPLIFICADO

// 🔍 BÚSQUEDA UNIFICADA - Único método necesario
export async function searchUsers(supabase, params, res) {
  try {
    const { id, nombres, email, rol, search, estado, orden = "asc", campo_orden = "nombres", limite } = params;
    let query = supabase.from("Usuarios").select("*");

    // Búsqueda por ID exacto
    if (id) {
      query = query.eq("id", id);
    }

    // Búsqueda por nombre (coincidencia parcial case-insensitive) - CORREGIDO: usar "nombres"
    if (nombres) {
      query = query.ilike("nombres", `%${nombres}%`);
    }

    // Búsqueda por email (coincidencia parcial case-insensitive)
    if (email) {
      query = query.ilike("email", `%${email}%`);
    }

    // Búsqueda por rol exacto
    if (rol) {
      query = query.eq("rol", rol);
    }

    // Búsqueda por estado
    if (estado !== undefined) {
      query = query.eq("estado", estado);
    }

    // Búsqueda general en múltiples campos - CORREGIDO: usar "nombres" en lugar de "nombre"
    if (search) {
      query = query.or(`nombres.ilike.%${search}%,email.ilike.%${search}%,usuario.ilike.%${search}%`);
    }

    // Aplicar ordenamiento
    if (campo_orden) {
      query = query.order(campo_orden, { ascending: orden === "asc" });
    }

    // Aplicar límite si se especifica
    if (limite) {
      query = query.limit(limite);
    }

    // Si no hay filtros, devolver todos los usuarios
    const { data, error } = await query;
    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 📋 LISTAR TODOS LOS USUARIOS (sin filtros) - CORREGIDO
export async function listUsers(supabase, params, res) {
  try {
    const { orden = "asc", campo_orden = "nombres" } = params;

    const { data, error } = await supabase
      .from("Usuarios")
      .select("*")
      .order(campo_orden, { ascending: orden === "asc" });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// 🔎 OBTENER USUARIO POR ID ESPECÍFICO - CORREGIDO
export async function getUserById(supabase, params, res) {
  try {
    const { id } = params;

    if (!id) {
      return res.status(400).json({ error: "Se requiere el parámetro 'id'" });
    }

    const { data, error } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      throw error;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Crear un nuevo usuario
export async function createUser(supabase, params, res) {
  try {
    const { nombres, dni, usuario, celular, rol, fotoPerfil, email, pass } = params;
    const { data, error } = await supabase
      .from("Usuarios")
      .insert([{ nombres, dni, usuario, celular, rol, fotoPerfil, email, pass }])
      .select();
    if (error) throw error;
    res.status(201).json({ message: "Usuario creado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Actualizar usuario
export async function updateUser(supabase, params, res) {
  try {
    const { id, ...fields } = params;
    const { data, error } = await supabase
      .from("Usuarios")
      .update(fields)
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Usuario actualizado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Eliminar usuario
export async function deleteUser(supabase, params, res) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("Usuarios")
      .delete()
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Usuario eliminado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Validar login usuario
export async function validateLogin(supabase, params, res) {
  try {
    const { usuario, pass } = params;
    const { data, error } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("usuario", usuario)
      .eq("pass", pass)
      .single();
    if (error) throw error;
    res.json({ valid: !!data, user: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Resetear contraseña
export async function resetPassword(supabase, params, res) {
  try {
    const { id, newPass } = params;
    const { data, error } = await supabase
      .from("Usuarios")
      .update({ pass: newPass })
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Contraseña actualizada", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Exportar todas las funciones esenciales
export const usuarioFunctions = {
  searchUsers,    // ✅ Búsqueda con filtros
  listUsers,      // ✅ Listar todos (sin filtros) - CORREGIDO
  getUserById,    // ✅ Obtener por ID específico - CORREGIDO
  createUser,     // ✅ Crear usuario
  updateUser,     // ✅ Actualizar usuario  
  deleteUser,     // ✅ Eliminar usuario
  validateLogin,  // ✅ Validar login
  resetPassword,  // ✅ Resetear contraseña
};