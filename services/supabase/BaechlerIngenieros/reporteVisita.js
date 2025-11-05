// services/supabase/reporteVisita.js
// 🔹 Funciones de reporte de visita para Supabase - PATRÓN SIMPLIFICADO

// 🔍 BÚSQUEDA UNIFICADA - Único método necesario
export async function searchReporteVisita(supabase, params, res) {
    try {
        const {
            id,
            cliente,
            nombre_encargado,
            email_encargado,
            nombre_operador,
            planta,
            empresa,
            voltaje_establecido,
            presurizacion,
            transformador,
            fecha_desde,
            fecha_hasta,
            search,
            orden = "desc",
            campo_orden = "fecha",
            limite
        } = params;

        let query = supabase.from("Reporte_Visita").select("*");

        // Búsqueda por ID exacto
        if (id) {
            query = query.eq("id", id);
        }

        // Búsqueda por cliente
        if (cliente) {
            query = query.ilike("cliente", `%${cliente}%`);
        }

        // Búsqueda por nombre de encargado
        if (nombre_encargado) {
            query = query.ilike("nombre_encargado", `%${nombre_encargado}%`);
        }

        // Búsqueda por email de encargado
        if (email_encargado) {
            query = query.ilike("email_encargado", `%${email_encargado}%`);
        }

        // Búsqueda por nombre de operador
        if (nombre_operador) {
            query = query.ilike("nombre_operador", `%${nombre_operador}%`);
        }

        // Búsqueda por planta
        if (planta) {
            query = query.ilike("planta", `%${planta}%`);
        }

        // Búsqueda por empresa
        if (empresa) {
            query = query.ilike("empresa", `%${empresa}%`);
        }

        // Búsqueda por condiciones técnicas
        if (voltaje_establecido !== undefined) {
            query = query.eq("voltaje_establecido", voltaje_establecido);
        }

        if (presurizacion !== undefined) {
            query = query.eq("presurizacion", presurizacion);
        }

        if (transformador !== undefined) {
            query = query.eq("transformador", transformador);
        }

        // Búsqueda por rango de fechas
        if (fecha_desde && fecha_hasta) {
            query = query.gte("fecha", fecha_desde).lte("fecha", fecha_hasta);
        } else if (fecha_desde) {
            query = query.gte("fecha", fecha_desde);
        } else if (fecha_hasta) {
            query = query.lte("fecha", fecha_hasta);
        }

        // Búsqueda general en múltiples campos
        if (search) {
            query = query.or(`cliente.ilike.%${search}%,nombre_encargado.ilike.%${search}%,email_encargado.ilike.%${search}%,nombre_operador.ilike.%${search}%,planta.ilike.%${search}%,empresa.ilike.%${search}%`);
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

// 📋 LISTAR TODOS LOS REPORTES DE VISITA (sin filtros)
export async function listReporteVisita(supabase, params, res) {
    try {
        const { orden = "desc", campo_orden = "fecha", limite } = params;

        let query = supabase
            .from("Reporte_Visita")
            .select("*")
            .order(campo_orden, { ascending: orden === "asc" });

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

// 🔎 OBTENER REPORTE DE VISITA POR ID ESPECÍFICO
export async function getReporteVisitaById(supabase, params, res) {
    try {
        const { id } = params;

        if (!id) {
            return res.status(400).json({ error: "Se requiere el parámetro 'id'" });
        }

        const { data, error } = await supabase
            .from("Reporte_Visita")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "Reporte de visita no encontrado" });
            }
            throw error;
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Crear un nuevo reporte de visita
export async function createReporteVisita(supabase, params, res) {
    try {
        const { data, error } = await supabase
            .from("Reporte_Visita")
            .insert([params])
            .select();

        if (error) throw error;
        res.status(201).json({ message: "Reporte de visita creado", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Actualizar reporte de visita
export async function updateReporteVisita(supabase, params, res) {
    try {
        const { id, ...fields } = params;
        const { data, error } = await supabase
            .from("Reporte_Visita")
            .update(fields)
            .eq("id", id)
            .select();
        if (error) throw error;
        res.json({ message: "Reporte de visita actualizado", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Eliminar reporte de visita
export async function deleteReporteVisita(supabase, params, res) {
    try {
        const { id } = params;
        const { data, error } = await supabase
            .from("Reporte_Visita")
            .delete()
            .eq("id", id)
            .select();
        if (error) throw error;
        res.json({ message: "Reporte de visita eliminado", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Exportar todas las funciones esenciales
export const reporteVisitaFunctions = {
    searchReporteVisita,     // ✅ Búsqueda con filtros
    listReporteVisita,       // ✅ Listar todos sin filtros
    getReporteVisitaById,    // ✅ Obtener por ID específico
    createReporteVisita,
    updateReporteVisita,
    deleteReporteVisita,
};