import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import stringSimilarity from "string-similarity";

dotenv.config();

// Inicializa Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * 🔹 Obtiene información sobre los tipos de columnas de una tabla
 */
async function obtenerInfoColumnas(tabla) {
  const { data, error } = await supabase.from(tabla).select("*").limit(1);
  if (error || !data || data.length === 0)
    return { texto: [], numero: [], fecha: [], todas: [] };

  const columnas = {
    texto: [],
    numero: [],
    fecha: [],
    todas: Object.keys(data[0]),
  };

  Object.entries(data[0]).forEach(([key, value]) => {
    // Detectar tipo de columna
    if (value === null) {
      // Si es null, no podemos determinar el tipo, lo ponemos en texto por defecto
      columnas.texto.push(key);
    } else if (typeof value === "string") {
      // Verificar si parece una fecha
      if (isDateString(value)) {
        columnas.fecha.push(key);
      } else {
        columnas.texto.push(key);
      }
    } else if (typeof value === "number") {
      columnas.numero.push(key);
    } else if (value instanceof Date) {
      columnas.fecha.push(key);
    }
  });

  return columnas;
}

/**
 * 🔹 Retorna columnas tipo texto de una tabla (mantiene compatibilidad)
 */
async function obtenerColumnasTexto(tabla) {
  const columnas = await obtenerInfoColumnas(tabla);
  return columnas.texto;
}

/**
 * 🔹 Verifica si una cadena parece ser una fecha
 */
function isDateString(str) {
  // Verificar formatos comunes de fecha
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO
    /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY o MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY o MM-DD-YYYY
  ];

  return (
    datePatterns.some((pattern) => pattern.test(str)) || !isNaN(Date.parse(str))
  );
}

/**
 * 🔍 Busca coincidencias aproximadas en TODAS las columnas texto
 */
async function buscarCoincidenciaAproximada(tabla, valor, umbral = 0.8) {
  const columnas = await obtenerColumnasTexto(tabla);
  if (columnas.length === 0) return null;

  const { data, error } = await supabase.from(tabla).select(columnas.join(","));
  if (error || !data) return null;

  let mejor = { valor: null, similitud: 0, columna: null };

  for (const col of columnas) {
    const valores = data.map((r) => r[col]).filter(Boolean);
    if (valores.length === 0) continue;

    const match = stringSimilarity.findBestMatch(
      valor.toUpperCase(),
      valores.map((v) => v.toUpperCase())
    );
    if (match.bestMatch.rating > mejor.similitud) {
      mejor = {
        valor: valores[match.bestMatchIndex],
        similitud: match.bestMatch.rating,
        columna: col,
      };
    }
  }

  if (mejor.similitud >= umbral) {
    console.log(
      `✅ Coincidencia en ${tabla}.${mejor.columna}: "${valor}" ≈ "${
        mejor.valor
      }" (${(mejor.similitud * 100).toFixed(1)}%)`
    );
    return mejor;
  }

  console.log(`❌ No se encontró coincidencia en ${tabla} para "${valor}"`);
  return null;
}

/**
 * 🔹 Procesa un valor de filtro según el tipo de columna
 */
function procesarValorFiltro(valor, tipoColumna) {
  // Si es una cadena vacía o null, devolver tal cual
  if (valor === null || valor === "") return valor;

  // Si es una cadena, intentar procesar según el tipo de columna
  if (typeof valor === "string") {
    // Para fechas
    if (tipoColumna === "fecha") {
      // Manejar operadores de comparación en fechas
      const operadores = {
        ">=": "gte",
        ">": "gt",
        "<=": "lte",
        "<": "lt",
        "=": "eq",
        "!=": "neq",
      };

      // Buscar si hay un operador al inicio
      let operador = "eq"; // Por defecto es igual
      let valorLimpio = valor;

      for (const [op, supaOp] of Object.entries(operadores)) {
        if (valor.trim().startsWith(op)) {
          operador = supaOp;
          valorLimpio = valor.trim().substring(op.length).trim();
          break;
        }
      }

      // Manejar expresiones especiales de fecha
      if (
        valorLimpio.toLowerCase().includes("now()") ||
        valorLimpio.toLowerCase().includes("interval")
      ) {
        // Convertir expresiones tipo NOW() - INTERVAL a fechas reales
        const hoy = new Date();

        // Buscar patrones como "5 days", "1 month", etc.
        const diasMatch = valorLimpio.match(/(\d+)\s*days?/i);
        const mesesMatch = valorLimpio.match(/(\d+)\s*months?/i);
        const añosMatch = valorLimpio.match(/(\d+)\s*years?/i);

        if (diasMatch) {
          const dias = parseInt(diasMatch[1]);
          hoy.setDate(hoy.getDate() - dias);
        }

        if (mesesMatch) {
          const meses = parseInt(mesesMatch[1]);
          hoy.setMonth(hoy.getMonth() - meses);
        }

        if (añosMatch) {
          const años = parseInt(añosMatch[1]);
          hoy.setFullYear(hoy.getFullYear() - años);
        }

        return { operador, valor: hoy.toISOString() };
      }

      // Intentar convertir a fecha ISO si es posible
      try {
        const fecha = new Date(valorLimpio);
        if (!isNaN(fecha.getTime())) {
          return { operador, valor: fecha.toISOString() };
        }
      } catch (e) {
        // Si falla, devolver el valor original
      }
    }

    // Para números, intentar convertir
    if (tipoColumna === "numero") {
      // Detectar operadores
      const operadores = {
        ">=": "gte",
        ">": "gt",
        "<=": "lte",
        "<": "lt",
        "=": "eq",
        "!=": "neq",
      };

      let operador = "eq";
      let valorLimpio = valor;

      for (const [op, supaOp] of Object.entries(operadores)) {
        if (valor.trim().startsWith(op)) {
          operador = supaOp;
          valorLimpio = valor.trim().substring(op.length).trim();
          break;
        }
      }

      // Convertir a número si es posible
      const numero = parseFloat(valorLimpio);
      if (!isNaN(numero)) {
        return { operador, valor: numero };
      }
    }
  }

  // Para otros casos, devolver el valor tal cual
  return { operador: "eq", valor };
}

/**
 * 🧠 Ejecuta consulta con detección automática de columnas y tipos
 */
export async function ejecutarConsulta(tabla, filtros = {}, union = null) {
  try {
    let query = supabase.from(tabla).select("*");

    // Obtener información de columnas para la tabla principal
    const infoColumnas = await obtenerInfoColumnas(tabla);

    for (const [col, val] of Object.entries(filtros)) {
      // 1️⃣ Si la columna existe directamente en la tabla
      if (infoColumnas.todas.includes(col)) {
        // Determinar el tipo de columna
        let tipoColumna = "texto";
        if (infoColumnas.numero.includes(col)) tipoColumna = "numero";
        if (infoColumnas.fecha.includes(col)) tipoColumna = "fecha";

        // Procesar el valor según el tipo
        const { operador, valor } = procesarValorFiltro(val, tipoColumna);

        // Aplicar el filtro con el operador correcto
        if (operador === "eq") {
          query = query.eq(col, valor);
        } else if (operador === "neq") {
          query = query.neq(col, valor);
        } else if (operador === "gt") {
          query = query.gt(col, valor);
        } else if (operador === "gte") {
          query = query.gte(col, valor);
        } else if (operador === "lt") {
          query = query.lt(col, valor);
        } else if (operador === "lte") {
          query = query.lte(col, valor);
        }

        continue;
      }

      // 2️⃣ Si no existe, buscar en tablas relacionadas conocidas
      const posiblesTablas = ["Empresa", "Planta", "Encargado"];
      let coincidenciaEncontrada = null;
      let idRelacionado = null;

      for (const t of posiblesTablas) {
        const columnasTexto = await obtenerColumnasTexto(t);
        if (columnasTexto.includes(col) || columnasTexto.length > 0) {
          coincidenciaEncontrada = await buscarCoincidenciaAproximada(t, val);
          if (coincidenciaEncontrada) {
            const { data: ref, error: errRef } = await supabase
              .from(t)
              .select("id")
              .eq(coincidenciaEncontrada.columna, coincidenciaEncontrada.valor)
              .single();

            if (!errRef && ref) {
              idRelacionado = ref.id;
              const columnaRelacion = `id_${t.toLowerCase()}`;
              query = query.eq(columnaRelacion, idRelacionado);
              break;
            }
          }
        }
      }

      // 3️⃣ Si no se halló coincidencia, lanzar error
      if (!idRelacionado && !infoColumnas.todas.includes(col)) {
        throw new Error(
          `No se encontró coincidencia para el filtro "${col}: ${val}"`
        );
      }
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return data;
  } catch (err) {
    console.error("Error initText:", err.message);
    throw err;
  }
}

export const textFunctions = { ejecutarConsulta };
