// services/supabase/reporteServicio.js
// 🔹 Funciones de reporte de servicio para Supabase - COMPLETO

// 🔍 BÚSQUEDA UNIFICADA COMPLETA
export async function searchReporteServicio(supabase, params, res) {
    try {
        const {
            // Búsquedas básicas
            id,
            codigo_reporte,

            // Búsquedas por personas
            id_encargado,
            id_empresa,
            id_usuario,
            nombre_usuario,
            nombre_encargado,

            // Búsquedas por máquinas
            serie_maquina,
            linea_maquina,
            marca_maquina,
            modelo_maquina,

            // Búsquedas por ubicación
            nombre_planta,
            nombre_empresa,

            // Búsquedas por estado y condiciones
            estado,
            sin_garantia,
            con_garantia,
            facturado,
            operativo,
            inoperativo,
            en_prueba,
            no_facturado,

            // Búsquedas por fechas
            fecha_desde,
            fecha_hasta,
            created_at_desde,
            created_at_hasta,

            // Búsquedas por horarios
            entrada_desde,
            entrada_hasta,
            salida_desde,
            salida_hasta,

            // Ordenamiento y límites
            orden = "desc",
            campo_orden = "fecha",
            limite,

            // Búsqueda general
            search
        } = params;

        let query = supabase.from("Reporte_Servicio").select("*");

        // Búsqueda por ID exacto
        if (id) {
            query = query.eq("id", id);
        }

        // Búsqueda por código de reporte
        if (codigo_reporte) {
            query = query.ilike("codigo_reporte", `%${codigo_reporte}%`);
        }

        // Búsqueda por encargado (ID o nombre)
        if (id_encargado) {
            query = query.eq("id_encargado", id_encargado);
        }
        if (nombre_encargado) {
            query = query.ilike("nombre_encargado", `%${nombre_encargado}%`);
        }

        // Búsqueda por empresa (ID o nombre)
        if (id_empresa) {
            query = query.eq("id_empresa", id_empresa);
        }
        if (nombre_empresa) {
            query = query.ilike("nombre_empresa", `%${nombre_empresa}%`);
        }

        // Búsqueda por usuario (ID o nombre)
        if (id_usuario) {
            query = query.eq("id_usuario", id_usuario);
        }
        if (nombre_usuario) {
            query = query.ilike("nombre_usuario", `%${nombre_usuario}%`);
        }

        // Búsqueda por máquinas
        if (serie_maquina) {
            query = query.ilike("serie_maquina", `%${serie_maquina}%`);
        }
        if (linea_maquina) {
            query = query.ilike("linea_maquina", `%${linea_maquina}%`);
        }
        if (marca_maquina) {
            query = query.ilike("marca_maquina", `%${marca_maquina}%`);
        }
        if (modelo_maquina) {
            query = query.ilike("modelo_maquina", `%${modelo_maquina}%`);
        }

        // Búsqueda por planta
        if (nombre_planta) {
            query = query.ilike("nombre_planta", `%${nombre_planta}%`);
        }

        // Búsqueda por estado
        if (estado !== undefined) {
            query = query.eq("estado", estado);
        }

        // Búsqueda por garantía
        if (sin_garantia !== undefined) {
            query = query.eq("sin_garantia", sin_garantia);
        }
        if (con_garantia !== undefined) {
            query = query.eq("con_garantia", con_garantia);
        }

        // Búsqueda por facturación
        if (facturado !== undefined) {
            query = query.eq("facturado", facturado);
        }

        // Búsqueda por operatividad
        if (operativo !== undefined) {
            query = query.eq("operativo", operativo);
        }
        if (inoperativo !== undefined) {
            query = query.eq("inoperativo", inoperativo);
        }

        // Búsqueda por pruebas
        if (en_prueba !== undefined) {
            query = query.eq("en_prueba", en_prueba);
        }
        if (no_facturado !== undefined) {
            query = query.eq("no_facturado", no_facturado);
        }

        // Búsqueda por rango de fechas (fecha del reporte)
        if (fecha_desde && fecha_hasta) {
            query = query.gte("fecha", fecha_desde).lte("fecha", fecha_hasta);
        } else if (fecha_desde) {
            query = query.gte("fecha", fecha_desde);
        } else if (fecha_hasta) {
            query = query.lte("fecha", fecha_hasta);
        }

        // Búsqueda por rango de creación
        if (created_at_desde && created_at_hasta) {
            query = query.gte("created_at", created_at_desde).lte("created_at", created_at_hasta);
        } else if (created_at_desde) {
            query = query.gte("created_at", created_at_desde);
        } else if (created_at_hasta) {
            query = query.lte("created_at", created_at_hasta);
        }

        // Búsqueda por horarios de entrada/salida
        if (entrada_desde && entrada_hasta) {
            query = query.gte("entrada", entrada_desde).lte("entrada", entrada_hasta);
        }
        if (salida_desde && salida_hasta) {
            query = query.gte("salida", salida_desde).lte("salida", salida_hasta);
        }

        // Búsqueda general en múltiples campos
        if (search) {
            query = query.or(`
        codigo_reporte.ilike.%${search}%,
        serie_maquina.ilike.%${search}%,
        linea_maquina.ilike.%${search}%,
        marca_maquina.ilike.%${search}%,
        modelo_maquina.ilike.%${search}%,
        nombre_planta.ilike.%${search}%,
        nombre_empresa.ilike.%${search}%,
        nombre_usuario.ilike.%${search}%,
        problemas_encontrados.ilike.%${search}%,
        acciones_realizadas.ilike.%${search}%,
        observaciones.ilike.%${search}%
      `);
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

// 📋 LISTAR TODOS LOS REPORTES DE SERVICIO (sin filtros)
export async function listReporteServicio(supabase, params, res) {
    try {
        const { orden = "desc", campo_orden = "fecha", limite } = params;

        let query = supabase
            .from("Reporte_Servicio")
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

// 🔎 OBTENER REPORTE DE SERVICIO POR ID ESPECÍFICO
export async function getReporteServicioById(supabase, params, res) {
    try {
        const { id } = params;

        if (!id) {
            return res.status(400).json({ error: "Se requiere el parámetro 'id'" });
        }

        const { data, error } = await supabase
            .from("Reporte_Servicio")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: "Reporte de servicio no encontrado" });
            }
            throw error;
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Crear reporte de servicio
export async function createReporteServicio(supabase, params, res) {
    try {
        const { data, error } = await supabase
            .from("Reporte_Servicio")
            .insert([params])
            .select();

        if (error) throw error;
        res.status(201).json({ message: "Reporte de servicio creado", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Actualizar reporte de servicio
export async function updateReporteServicio(supabase, params, res) {
    try {
        const { id, ...fields } = params;
        const { data, error } = await supabase
            .from("Reporte_Servicio")
            .update(fields)
            .eq("id", id)
            .select();
        if (error) throw error;
        res.json({ message: "Reporte de servicio actualizado", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Eliminar reporte de servicio
export async function deleteReporteServicio(supabase, params, res) {
    try {
        const { id } = params;
        const { data, error } = await supabase
            .from("Reporte_Servicio")
            .delete()
            .eq("id", id)
            .select();
        if (error) throw error;
        res.json({ message: "Reporte de servicio eliminado", data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// Exportar todas las funciones esenciales
export const reporteServicioFunctions = {
    searchReporteServicio,   // ✅ Búsqueda con filtros
    listReporteServicio,     // ✅ Listar todos sin filtros
    getReporteServicioById,  // ✅ Obtener por ID específico
    createReporteServicio,
    updateReporteServicio,
    deleteReporteServicio,
};