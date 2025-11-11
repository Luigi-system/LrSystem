// supabaseService.js
import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import OpenAI from "openai";
import { empresaFunctions } from "./empresas.js";
import * as usuarios from "./usuarios.js";
import * as empresas from "./empresas.js";
import * as configuraciones from "./configuraciones.js";
import * as plantas from "./plantas.js";
import * as maquinas from "./maquinas.js";
import * as encargados from "./encargados.js";
import * as reporteServicio from "./reporteServicio.js";
import * as reporteVisita from "./reporteVisita.js";

import { CONFIG } from './data.js';

dotenv.config();
const router = express.Router();

// 🧩 Inicializar clientes externos
const supabase = createClient(CONFIG.SERVICES.SUPABASE.URL, CONFIG.SERVICES.SUPABASE.KEY);

const openai = new OpenAI({
  apiKey: CONFIG.SERVICES.OPENAI.API_KEY,
});

// 🎯 DETECTOR DE COMPORTAMIENTO GENERAL
class BehaviorDetector {
  static detectGeneralBehavior(query) {
    const lowerQuery = query.toLowerCase().trim();

    if (CONFIG.BEHAVIORS.SALUDOS.some(saludo => lowerQuery.includes(saludo))) {
      return { tipo: 'saludo', prioridad: 1 };
    }

    if (CONFIG.BEHAVIORS.DESPEDIDAS.some(despedida => lowerQuery.includes(despedida))) {
      return { tipo: 'despedida', prioridad: 1 };
    }

    if (CONFIG.BEHAVIORS.CAPACIDADES.some(capacidad => lowerQuery.includes(capacidad))) {
      return { tipo: 'capacidades', prioridad: 1 };
    }

    return { tipo: 'consulta_normal', prioridad: 0 };
  }
}

// 🎯 CONSTRUCTOR DE COMPONENTES PARA EL CHATBOT
class ComponentBuilder {
  static buildComponent(categoria, datos, identificacion) {
    if (!datos || datos.length === 0 || (datos[0] && datos[0].error)) {
      return null;
    }

    const datosReales = Array.isArray(datos[0]) ? datos[0] : datos;

    if (datosReales.length === 1) {
      return this.buildSingleRecordComponent(categoria, datosReales[0], identificacion);
    }

    return this.buildTableComponent(categoria, datosReales, identificacion);
  }

  static buildSaludoComponent() {
    const saludoAleatorio = CONFIG.COMPONENTS.SALUDOS[
      Math.floor(Math.random() * CONFIG.COMPONENTS.SALUDOS.length)
    ];

    return {
      displayText: saludoAleatorio,
      suggestions: [
        "Buscar información de una empresa",
        "Listar todas las plantas",
        "Ver reportes de servicio recientes",
        "Consultar máquinas disponibles"
      ],
      quickActions: [
        {
          label: "📊 Ver Empresas",
          prompt: "Listar todas las empresas"
        },
        {
          label: "🏭 Ver Plantas",
          prompt: "Listar todas las plantas"
        },
        {
          label: "🔧 Ver Máquinas",
          prompt: "Listar todas las máquinas"
        },
        {
          label: "📋 Ver Reportes",
          prompt: "Mostrar reportes recientes"
        }
      ]
    };
  }

  static buildDespedidaComponent() {
    return {
      displayText: CONFIG.COMPONENTS.DESPEDIDAS[
        Math.floor(Math.random() * CONFIG.COMPONENTS.DESPEDIDAS.length)
      ],
      statusDisplay: {
        icon: 'success',
        title: '¡Hasta pronto!',
        message: 'Gracias por usar nuestro servicio'
      }
    };
  }

  static buildCapacidadesComponent() {
    return {
      displayText: "🔧 **Mis Capacidades como Asistente de Gestión**",
      recordView: {
        fields: [
          { label: "👥 Gestión de Usuarios", value: "Buscar, listar y gestionar usuarios del sistema" },
          { label: "🏢 Gestión de Empresas", value: "Consultar empresas por nombre, RUC, ubicación" },
          { label: "🏭 Gestión de Plantas", value: "Administrar plantas industriales y sus datos" },
          { label: "🔧 Gestión de Máquinas", value: "Controlar inventario de máquinas y equipos" },
          { label: "👨‍💼 Gestión de Encargados", value: "Gestionar personal a cargo de plantas/máquinas" },
          { label: "📋 Reportes de Servicio", value: "Consultar y generar reportes técnicos" },
          { label: "📊 Reportes de Visita", value: "Revisar reportes de visitas técnicas" }
        ],
        editable: false
      },
      suggestions: [
        "Mostrar empresas disponibles",
        "Ver plantas de una empresa específica",
        "Consultar máquinas por marca o modelo",
        "Generar reporte de servicio"
      ]
    };
  }

  static buildNoResultsComponent(identificacion) {
    const categoria = identificacion?.categoria;
    const parametros = identificacion?.parametros_sugeridos || {};

    let mensajePrincipal = "No se encontraron resultados para tu búsqueda.";
    let sugerenciasEspecificas = [];

    if (categoria && Object.keys(parametros).length > 0) {
      const nombreCategoria = this.getSingularName(categoria);
      mensajePrincipal = `No se encontraron ${this.getPluralName(categoria)} con los criterios especificados.`;

      sugerenciasEspecificas = [
        `Verificar los parámetros de búsqueda para ${nombreCategoria}`,
        `Intentar con términos más generales`,
        `Listar todos los ${this.getPluralName(categoria)} disponibles`
      ];
    }

    return {
      displayText: mensajePrincipal,
      statusDisplay: {
        icon: 'info',
        title: 'Sin resultados',
        message: 'Prueba con otros criterios de búsqueda'
      },
      suggestions: [
        ...sugerenciasEspecificas,
        "Realizar una búsqueda más amplia",
        "Verificar la ortografía de los términos",
        "Contactar con soporte si el problema persiste"
      ]
    };
  }

  static buildErrorComponent(error, consultaOriginal = "") {
    const erroresComunes = {
      "Error interno del servidor": "El servidor está experimentando problemas temporales.",
      "Error de conexión": "No se pudo conectar con la base de datos.",
      "Timeout": "La consulta tardó demasiado tiempo en procesarse.",
      "Sin permisos": "No tienes permisos para realizar esta acción."
    };

    const mensajeError = erroresComunes[error] || error;

    return {
      displayText: `❌ **Error en la consulta**\n\n${mensajeError}`,
      statusDisplay: {
        icon: 'error',
        title: 'Error del Sistema',
        message: `No se pudo procesar: "${consultaOriginal}"`
      },
      suggestions: [
        "Intentar nuevamente en unos momentos",
        "Verificar la conexión a internet",
        "Contactar al administrador del sistema",
        "Probar con una consulta diferente"
      ],
      actions: [
        {
          label: "🔄 Reintentar",
          prompt: consultaOriginal,
          style: "primary"
        },
        {
          label: "🏠 Volver al Inicio",
          prompt: "Hola",
          style: "secondary"
        }
      ]
    };
  }

  static buildSingleRecordComponent(categoria, registro, identificacion) {
    const campos = this.getFieldsForCategory(categoria);

    const fields = campos.map(campo => ({
      label: campo.label,
      value: registro[campo.key] !== undefined && registro[campo.key] !== null
        ? String(registro[campo.key])
        : 'No disponible'
    })).filter(field => field.value !== 'No disponible');

    return {
      displayText: `✅ **Se encontró ${this.getSingularName(categoria)}**`,
      recordView: {
        fields: fields,
        editable: false
      },
      suggestions: this.generateSuggestions(categoria, registro, identificacion)
    };
  }

  static buildTableComponent(categoria, registros, identificacion) {
    const campos = this.getFieldsForCategory(categoria);

    const columns = campos.map(campo => ({
      header: campo.label,
      accessor: campo.key
    }));

    return {
      displayText: `📊 **Se encontraron ${registros.length} ${this.getPluralName(categoria)}**`,
      tableComponent: {
        columns: columns,
        data: registros,
        pagination: registros.length > 10,
        actions: this.generateTableActions(categoria, identificacion)
      },
      suggestions: [
        `Mostrar más detalles de un ${this.getSingularName(categoria)} específico`,
        `Filtrar ${this.getPluralName(categoria)} por criterios específicos`,
        `Exportar esta lista de ${this.getPluralName(categoria)}`
      ]
    };
  }

  static getFieldsForCategory(categoria) {
    return CONFIG.COMPONENTS.FIELD_DEFINITIONS[categoria] || [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Nombre' }
    ];
  }

  static generateSuggestions(categoria, registro, identificacion) {
    const baseSuggestions = {
      user: [
        `Actualizar información de ${registro.nombres}`,
        `Ver reportes de ${registro.nombres}`,
        `Cambiar rol de ${registro.nombres}`
      ],
      empresa: [
        `Ver plantas de ${registro.nombre}`,
        `Ver máquinas de ${registro.nombre}`,
        `Ver encargados de ${registro.nombre}`,
        `Ver reportes de ${registro.nombre}`
      ],
      planta: [
        `Ver máquinas de la planta ${registro.nombre}`,
        `Ver encargados de ${registro.nombre}`,
        `Ver reportes de ${registro.nombre}`
      ],
      maquina: [
        `Ver historial de reportes de ${registro.marca} ${registro.modelo}`,
        `Actualizar información de la máquina`,
        `Ver planta ${registro.nombreplanta}`
      ],
      encargado: [
        `Ver reportes de ${registro.nombre}`,
        `Actualizar información de ${registro.nombre}`,
        `Ver empresa ${registro.nombreEmpresa}`
      ],
      reporte_servicio: [
        `Ver detalles completos del reporte ${registro.codigo_reporte}`,
        `Generar PDF del reporte`,
        `Ver más reportes de ${registro.nombre_empresa}`
      ],
      reporte_visita: [
        `Ver detalles completos de la visita`,
        `Generar PDF del reporte`,
        `Ver más visitas a ${registro.cliente}`
      ]
    };

    return baseSuggestions[categoria] || [
      'Ver más detalles',
      'Realizar otra búsqueda'
    ];
  }

  static generateTableActions(categoria, identificacion) {
    const baseActions = {
      user: [
        {
          label: 'Ver Detalles',
          prompt: `Mostrar detalles completos del usuario {nombres}`,
          style: 'primary'
        }
      ],
      empresa: [
        {
          label: 'Ver Plantas',
          prompt: `Mostrar plantas de la empresa {nombre}`,
          style: 'primary'
        },
        {
          label: 'Ver Detalles',
          prompt: `Mostrar información completa de {nombre}`,
          style: 'secondary'
        }
      ],
      planta: [
        {
          label: 'Ver Máquinas',
          prompt: `Mostrar máquinas de la planta {nombre}`,
          style: 'primary'
        }
      ],
      maquina: [
        {
          label: 'Ver Reportes',
          prompt: `Mostrar reportes de la máquina {serie}`,
          style: 'primary'
        }
      ],
      encargado: [
        {
          label: 'Ver Detalles',
          prompt: `Mostrar información completa de {nombre}`,
          style: 'primary'
        }
      ],
      reporte_servicio: [
        {
          label: 'Ver Detalles',
          prompt: `Mostrar detalles completos del reporte {codigo_reporte}`,
          style: 'primary'
        }
      ],
      reporte_visita: [
        {
          label: 'Ver Detalles',
          prompt: `Mostrar detalles completos de la visita`,
          style: 'primary'
        }
      ]
    };

    return baseActions[categoria] || [
      {
        label: 'Ver Detalles',
        prompt: `Mostrar detalles de {nombre}`,
        style: 'primary'
      }
    ];
  }

  static getSingularName(categoria) {
    return CONFIG.COMPONENTS.NOMBRES.SINGULAR[categoria] || 'registro';
  }

  static getPluralName(categoria) {
    return CONFIG.COMPONENTS.NOMBRES.PLURAL[categoria] || 'registros';
  }
}

// 🎯 ORQUESTADOR DE SERVICIOS
const serviceOrchestrator = {
  services: {
    user: usuarios.usuarioFunctions,
    empresa: empresas.empresaFunctions,
    configuracion: configuraciones.configuracionFunctions,
    planta: plantas.plantaFunctions,
    maquina: maquinas.maquinaFunctions,
    encargado: encargados.encargadoFunctions,
    reporte_servicio: reporteServicio.reporteServicioFunctions,
    reporte_visita: reporteVisita.reporteVisitaFunctions
  },

  puedeEjecutarAutomaticamente(acciones) {
    return acciones &&
      acciones.length > 0 &&
      acciones.every(accion => CONFIG.ACCIONES_AUTOMATICAS.includes(accion));
  },

  async ejecutarAcciones(consultaAIResult, params = {}) {
    const resultados = [];
    const { acciones, categoria } = consultaAIResult;
    const servicio = this.services[categoria];

    if (!servicio) {
      return [{
        accion: 'unknown',
        categoria,
        status: 400,
        data: { error: `Servicio '${categoria}' no disponible` }
      }];
    }

    for (const accion of acciones) {
      try {
        if (!servicio[accion]) {
          resultados.push({
            accion,
            categoria,
            status: 400,
            data: { error: `Acción '${accion}' no disponible en servicio '${categoria}'` }
          });
          continue;
        }

        let resultadoData = null;
        let statusCode = 200;

        const mockRes = {
          _data: null,
          _status: 200,
          json: function (data) {
            this._data = data;
            return this;
          },
          status: function (code) {
            this._status = code;
            return this;
          }
        };

        await servicio[accion](supabase, params, mockRes);
        resultadoData = mockRes._data;
        statusCode = mockRes._status;

        resultados.push({
          accion,
          categoria,
          status: statusCode,
          data: resultadoData || { error: "No se pudo obtener datos de la acción" }
        });

      } catch (error) {
        resultados.push({
          accion,
          categoria,
          status: 500,
          data: { error: `Error ejecutando ${accion}: ${error.message}` }
        });
      }
    }

    return resultados;
  }
};

// 🧠 Consulta con IA
async function consultaAI(prompt) {
  try {
    if (!prompt || typeof prompt !== "string") {
      return { error: "El parámetro 'query' debe ser texto" };
    }

    const completion = await openai.chat.completions.create({
      model: CONFIG.SERVICES.OPENAI.MODEL,
      messages: [
        {
          role: "system",
          content: CONFIG.SYSTEM_PROMPT
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: CONFIG.SERVICES.OPENAI.TEMPERATURE,
      max_tokens: CONFIG.SERVICES.OPENAI.MAX_TOKENS,
      response_format: { type: "json_object" }
    });

    const respuesta = completion.choices?.[0]?.message?.content?.trim();
    if (!respuesta) return { error: "Respuesta vacía de la IA" };

    try {
      let respuestaLimpia = respuesta;
      if (respuestaLimpia.startsWith('```json')) {
        respuestaLimpia = respuestaLimpia.replace('```json', '').replace('```', '').trim();
      } else if (respuestaLimpia.startsWith('```')) {
        respuestaLimpia = respuestaLimpia.replace('```', '').replace('```', '').trim();
      }

      const parsedResponse = JSON.parse(respuestaLimpia);

      if (!parsedResponse.categoria || !Array.isArray(parsedResponse.acciones)) {
        return {
          error: "La IA no pudo identificar la consulta correctamente",
          respuestaRaw: respuesta
        };
      }

      return parsedResponse;
    } catch (parseError) {
      console.error("❌ Error parseando JSON de IA:", parseError);
      console.error("📄 Respuesta cruda:", respuesta);
      return {
        error: "La respuesta de la IA no tiene formato JSON válido",
        respuestaRaw: respuesta
      };
    }
  } catch (err) {
    console.error("❌ Error en consulta AI:", err);
    return { error: "Error interno en la consulta AI" };
  }
}

// 🧩 Helper para respuestas uniformes
function responder(res, status, data) {
  return res.status(status).json({
    status: status === 200 ? "success" : "error",
    timestamp: new Date().toISOString(),
    data,
  });
}

// ✅ ENDPOINT PRINCIPAL MEJORADO CON COMPORTAMIENTO GENERAL
router.post("/", async (req, res) => {
  try {
    const { service, content } = req.body;

    if (!service) return responder(res, 400, { error: "Falta el campo 'service'" });
    if (!content) return responder(res, 400, { error: "Falta el campo 'content'" });

    const { action, params = {}, query } = content;

    console.log(`🔍 [${service}] Acción: ${action || "consultaAI"} | Query: ${query || "-"}`);

    // 💬 DETECCIÓN DE COMPORTAMIENTO GENERAL
    const comportamiento = BehaviorDetector.detectGeneralBehavior(query);

    // Comportamientos especiales (saludos, despedidas, etc.)
    if (comportamiento.tipo !== 'consulta_normal') {
      let component;

      switch (comportamiento.tipo) {
        case 'saludo':
          component = ComponentBuilder.buildSaludoComponent();
          break;
        case 'despedida':
          component = ComponentBuilder.buildDespedidaComponent();
          break;
        case 'capacidades':
          component = ComponentBuilder.buildCapacidadesComponent();
          break;
      }

      return responder(res, 200, {
        comportamiento: comportamiento.tipo,
        component,
        mensaje: "Comportamiento general detectado"
      });
    }

    // 💬 SERVICIO IA CON ORQUESTADOR Y CONSTRUCCIÓN DE COMPONENTES
    if (service === "consultaAI") {
      const identificacion = await consultaAI(query);

      if (identificacion.error) {
        const errorComponent = ComponentBuilder.buildErrorComponent(
          identificacion.error,
          query
        );
        return responder(res, 400, {
          error: identificacion.error,
          component: errorComponent
        });
      }

      // Combinar parámetros (IA + proporcionados)
      const parametrosCombinados = {
        ...identificacion.parametros_sugeridos,
        ...params
      };

      // Verificar si podemos ejecutar automáticamente
      const puedeEjecutar = serviceOrchestrator.puedeEjecutarAutomaticamente(identificacion.acciones);

      if (identificacion.acciones && identificacion.acciones.length > 0 && puedeEjecutar) {
        const resultadosEjecucion = await serviceOrchestrator.ejecutarAcciones(identificacion, parametrosCombinados);

        const datos = resultadosEjecucion.map(item => item.data);

        // Verificar si hay resultados
        const tieneResultados = datos && datos.length > 0 &&
          datos[0] &&
          !datos[0].error &&
          (!Array.isArray(datos[0]) || datos[0].length > 0);

        if (!tieneResultados) {
          // No hay resultados
          const noResultsComponent = ComponentBuilder.buildNoResultsComponent(identificacion);
          return responder(res, 200, {
            identificacion: {
              categoria: identificacion.categoria,
              acciones: identificacion.acciones,
              explicacion: identificacion.explicacion,
              parametros_utilizados: parametrosCombinados
            },
            datos: [],
            component: noResultsComponent
          });
        }

        // ✅ CONSTRUIR COMPONENTE PARA EL CHATBOT
        const component = ComponentBuilder.buildComponent(
          identificacion.categoria,
          datos,
          identificacion
        );

        return responder(res, 200, {
          identificacion: {
            categoria: identificacion.categoria,
            acciones: identificacion.acciones,
            explicacion: identificacion.explicacion,
            parametros_utilizados: parametrosCombinados
          },
          datos,
          component
        });
      }

      // Solo identificación (necesita parámetros adicionales)
      return responder(res, 200, {
        identificacion: {
          categoria: identificacion.categoria,
          acciones: identificacion.acciones,
          explicacion: identificacion.explicacion,
          parametros_sugeridos: identificacion.parametros_sugeridos
        },
        mensaje: "Consulta identificada. Proporciona parámetros adicionales si es necesario."
      });
    }

    // ⚙️ SERVICIOS DIRECTOS (para uso específico)
    const servicio = serviceOrchestrator.services[service];
    if (servicio && servicio[action]) {
      return servicio[action](supabase, params, res);
    }

    return responder(res, 400, {
      error: `Servicio '${service}' o acción '${action}' no válidos`
    });

  } catch (err) {
    console.error("💥 Error en endpoint /supabase:", err);
    const errorComponent = ComponentBuilder.buildErrorComponent(
      "Error interno del servidor",
      req.body?.content?.query || "Consulta no especificada"
    );
    return responder(res, 500, {
      error: "Error interno del servidor",
      component: errorComponent
    });
  }
});

export default router;