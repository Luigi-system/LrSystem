import { createClient } from "@supabase/supabase-js";
import stringSimilarity from "string-similarity";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Busca coincidencias aproximadas (fuzzy match) en todas las columnas de una tabla.
 * Retorna el valor más cercano o lanza error si no hay coincidencia ≥ 0.8
 */
async function buscarCoincidenciaAproximada(tabla, valorBuscado) {
  // Obtener las columnas disponibles en la tabla
  const { data: columnasData, error: errorCols } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_schema", "public")
    .eq("table_name", tabla);

  if (errorCols || !columnasData?.length)
    throw new Error(`No se pudieron obtener las columnas de ${tabla}`);

  const columnas = columnasData.map((c) => c.column_name);
  const coincidencias = new Set();

  // Buscar coincidencias parciales en cada columna
  for (const columna of columnas) {
    const { data } = await supabase
      .from(tabla)
      .select(columna)
      .ilike(columna, `%${valorBuscado}%`);

    if (data && data.length > 0) {
      data.forEach((fila) => {
        const valor = fila[columna];
        if (typeof valor === "string") coincidencias.add(valor);
      });
    }
  }

  if (coincidencias.size === 0) {
    throw new Error(
      `No se encontró coincidencia cercana a "${valorBuscado}" en ${tabla}`
    );
  }

  // Evaluar la similitud con cada coincidencia encontrada
  const listaCoincidencias = Array.from(coincidencias);
  const { bestMatch, bestMatchIndex } = stringSimilarity.findBestMatch(
    valorBuscado.toLowerCase(),
    listaCoincidencias.map((v) => v.toLowerCase())
  );

  if (bestMatch.rating < 0.8) {
    throw new Error(
      `No se encontró coincidencia cercana a "${valorBuscado}" en ${tabla}`
    );
  }

  return listaCoincidencias[bestMatchIndex];
}

/**
 * Ejecuta una consulta compleja con detección de coincidencias aproximadas.
 */
export async function ejecutarConsultaInterpretada(interpretacion) {
  const { tabla, union, filtros } = interpretacion;

  try {
    let condiciones = {};
    let tablaFiltro = tabla;

    // Si hay unión (JOIN con otra tabla)
    if (union && filtros) {
      const [claveFiltro, valorFiltro] = Object.entries(filtros)[0];
      const [tablaRelacionada, columnaRelacionada] = claveFiltro.split(".");
      tablaFiltro = tablaRelacionada;

      // Buscar coincidencia aproximada en la tabla relacionada
      const valorCorregido = await buscarCoincidenciaAproximada(
        tablaRelacionada,
        valorFiltro
      );

      // Construir la condición con el valor corregido
      condiciones = { [columnaRelacionada]: valorCorregido };

      // Ejecutar consulta con unión manual (JOIN)
      const { data, error } = await supabase
        .from(tabla)
        .select(`*, ${tablaRelacionada}(${columnaRelacionada})`)
        .eq(`${tablaRelacionada}.${columnaRelacionada}`, valorCorregido);

      if (error) throw error;
      return { data, coincidencia: valorCorregido };
    }

    // Si no hay unión, solo aplicar los filtros directamente
    if (filtros) {
      const [columna, valor] = Object.entries(filtros)[0];
      const valorCorregido = await buscarCoincidenciaAproximada(tabla, valor);
      const { data, error } = await supabase
        .from(tabla)
        .select("*")
        .eq(columna, valorCorregido);
      if (error) throw error;
      return { data, coincidencia: valorCorregido };
    }
  } catch (err) {
    return { error: err.message };
  }
}
