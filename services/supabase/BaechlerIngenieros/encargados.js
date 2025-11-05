// services/supabase/encargados.js
// 🔹 Funciones de encargados para Supabase - PATRÓN SIMPLIFICADO

// 🔍 BÚSQUEDA UNIFICADA - Único método necesario
export async function searchEncargados(supabase, params, res) {
    try {
        const {
            id,
            nombre,
            apellido,
            dni,
            email,
            celular,
            cargo,
            nombreEmpresa,
            nombrePlanta,
            search,
            orden = "asc",
            campo_orden = "nombre",
            limite
        } = params;

        let query = supabase.from("Encargado").select("*");

        // Búsqueda por ID exacto
        if (id) {
            query = query.eq("id", id);
        }

        // Búsqueda por nombre (coincidencia parcial case-insensitive)
        if (nombre) {
            query = query.ilike("nombre", `%${nombre}%`);
        }

        // Búsqueda por apellido (coincidencia parcial)
        if (apellido) {
            query = query.ilike("apellido", `%${apellido}%`);
        }

        // Búsqueda por DNI (coincidencia parcial)
        if (dni) {
            query = query.ilike("dni", `%${dni}%`);
        }

        // Búsqueda por email (coincidencia parcial)
        if (email) {
            query = query.ilike("email", `%${email}%`);
        }

        // Búsqueda por celular (coincidencia exacta)
        if (celular) {
            query = query.eq("celular", celular);
        }

        // Búsqueda por cargo (coincidencia parcial)
        if (cargo) {
            query = query.ilike("cargo", `%${cargo}%`);
        }

        // Búsqueda por nombre de empresa (coincidencia parcial)
        if (nombreEmpresa) {
            query = query.ilike("nombreEmpresa", `%${nombreEmpresa}%`);
        }

        // Búsqueda por nombre de planta (coincidencia parcial)
        if (nombrePlanta) {
            query = query.ilike("nombrePlanta", `%${nombrePlanta}%`);
        }

        // Búsqueda general en múltiples campos
        if (search) {
            query = query.or(`nombre.ilike.%${search}%,apellido.ilike.%${search}%,dni.ilike.%${search}%,email.ilike.%${search}%,cargo.ilike.%${search}%,nombreEmpresa.ilike.%${search}%,nombrePlanta.ilike.%${search}%`);
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

// 📋 LISTAR TODOS LOS ENCARGADOS (sin filtros)
export async function listEncargados(supabase, params, res) {
    try {
        const { orden = "asc", campo_orden = "nombre" } = params;

        const { data, error } = await supabase
            .from("Encargado")
            .select("*")
            .order(campo_orden, { ascending: orden === "asc" });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// 🔎 OBTENER ENCARGADO POR ID ESPECÍFICO
export async function getEncargadoById(supabase, params, res) {
    try {
        const { id } = params;

        if (!id) {
            return res.status(400).json({ error: "Se requiere el parámetro 'id'" });
        }

        const { data, error } = await supabase
            .from("Encargado")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "Encargado no encontrado" });
            }
            throw error;
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Crear un nuevo encargado
export async function createEncargado(supabase, params, res) {
    try {
        const {
            nombre,
            apellido,
            dni,
            nacimiento,
            email,
            pass,
            celular,
            cargo,
            nombreEmpresa,
            nombrePlanta
        } = params;

        const { data, error } = await supabase
            .from("Encargado")
            .insert([{
                nombre,
                apellido,
                dni,
                nacimiento,
                email,
                pass,
                celular,
                cargo,
                nombreEmpresa,
                nombrePlanta
            }])
            .select();

        if (error) throw error;
        res.status(201).json({ message: "Encargado creado", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Actualizar encargado
export async function updateEncargado(supabase, params, res) {
    try {
        const { id, ...fields } = params;
        const { data, error } = await supabase
            .from("Encargado")
            .update(fields)
            .eq("id", id)
            .select();
        if (error) throw error;
        res.json({ message: "Encargado actualizado", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Eliminar encargado
export async function deleteEncargado(supabase, params, res) {
    try {
        const { id } = params;
        const { data, error } = await supabase
            .from("Encargado")
            .delete()
            .eq("id", id)
            .select();
        if (error) throw error;
        res.json({ message: "Encargado eliminado", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Validar login encargado
export async function validateLoginEncargado(supabase, params, res) {
    try {
        const { email, pass } = params;
        const { data, error } = await supabase
            .from("Encargado")
            .select("*")
            .eq("email", email)
            .eq("pass", pass)
            .single();
        if (error) throw error;
        res.json({ valid: !!data, encargado: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Resetear contraseña encargado
export async function resetPasswordEncargado(supabase, params, res) {
    try {
        const { id, newPass } = params;
        const { data, error } = await supabase
            .from("Encargado")
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
export const encargadoFunctions = {
    searchEncargados,        // ✅ Búsqueda con filtros
    listEncargados,          // ✅ Listar todos sin filtros
    getEncargadoById,        // ✅ Obtener por ID específico
    createEncargado,
    updateEncargado,
    deleteEncargado,
    validateLoginEncargado,
    resetPasswordEncargado,
};