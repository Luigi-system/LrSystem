// services/supabase/usuarios.js
// 🔹 Funciones de usuarios para Supabase

// Obtener un usuario por ID
export async function getUser(supabase, params, res) {
  try {
    const { id } = params;
    const { data, error } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("id", id)
      .single(); // devuelve un solo objeto
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Listar todos los usuarios
export async function listUsers(supabase, params, res) {
  try {
    const { data, error } = await supabase.from("Usuarios").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Crear un nuevo usuario
export async function createUser(supabase, params, res) {
  try {
    const { nombres, dni, usuario, celular, rol, fotoPerfil, email, pass } =
      params;
    const { data, error } = await supabase
      .from("Usuarios")
      .insert([
        {
          nombres,
          dni,
          usuario,
          celular,
          rol,
          fotoPerfil,
          email,
          pass,
        },
      ])
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

// Buscar usuario por email
export async function getUserByEmail(supabase, params, res) {
  try {
    const { email } = params;
    const { data, error } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("email", email)
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Buscar usuario por nombre
export async function getUserByName(supabase, params, res) {
  try {
    const { nombres } = params;
    const { data, error } = await supabase
      .from("Usuarios")
      .select("*")
      .ilike("nombres", `%${nombres}%`);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Activar o desactivar usuario
export async function toggleUserStatus(supabase, params, res) {
  try {
    const { id, estado } = params;
    const { data, error } = await supabase
      .from("Usuarios")
      .update({ estado })
      .eq("id", id)
      .select();
    if (error) throw error;
    res.json({ message: "Estado del usuario actualizado", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Filtrar por rol
export async function getUsersByRole(supabase, params, res) {
  try {
    const { rol } = params;
    const { data, error } = await supabase
      .from("Usuarios")
      .select("*")
      .eq("rol", rol);
    if (error) throw error;
    res.json(data);
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

// Exportar todas las funciones con nombres (sin default)
export const usuarioFunctions = {
  getUser,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUserByName,
  toggleUserStatus,
  getUsersByRole,
  validateLogin,
  resetPassword,
};
