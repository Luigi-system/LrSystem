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
import * as reporteServicio from "./reporteServicio.js"; // ✅ NUEVO
import * as reporteVisita from "./reporteVisita.js"; // ✅ NUEVO

dotenv.config();
const router = express.Router();

// 🧩 Inicializar clientes externos
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🎯 CONSTRUCTOR DE COMPONENTES PARA EL CHATBOT - AGENTE PROFESIONAL Y AVANZADO
class ComponentBuilder {
  /**
   * Construye un componente para el chatbot basado en los datos obtenidos
   */
  static buildComponent(categoria, datos, identificacion) {
    // Si no hay datos o hay error, retornar null
    if (!datos || datos.length === 0 || (datos[0] && datos[0].error)) {
      return null;
    }

    const datosReales = Array.isArray(datos[0]) ? datos[0] : datos;

    // Si solo hay un elemento, mostrar como registro individual
    if (datosReales.length === 1) {
      return this.buildSingleRecordComponent(categoria, datosReales[0], identificacion);
    }

    // Si hay múltiples elementos, mostrar como tabla
    return this.buildTableComponent(categoria, datosReales, identificacion);
  }

  /**
   * Construye componente para un solo registro
   */
  static buildSingleRecordComponent(categoria, registro, identificacion) {
    const campos = this.getFieldsForCategory(categoria);

    const fields = campos.map(campo => ({
      label: campo.label,
      value: registro[campo.key] !== undefined && registro[campo.key] !== null
        ? String(registro[campo.key])
        : 'No disponible'
    })).filter(field => field.value !== 'No disponible');

    return {
      displayText: `Se encontró ${this.getSingularName(categoria)}:`,
      recordView: {
        fields: fields,
        editable: false
      },
      suggestions: this.generateSuggestions(categoria, registro, identificacion)
    };
  }

  /**
   * Construye componente de tabla para múltiples registros
   */
  static buildTableComponent(categoria, registros, identificacion) {
    const campos = this.getFieldsForCategory(categoria);

    const columns = campos.map(campo => ({
      header: campo.label,
      accessor: campo.key
    }));

    return {
      displayText: `Se encontraron ${registros.length} ${this.getPluralName(categoria)}:`,
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

  /**
   * Define los campos a mostrar por categoría
   */
  static getFieldsForCategory(categoria) {
    const fieldDefinitions = {
      user: [
        { key: 'nombres', label: 'Nombre' },
        { key: 'email', label: 'Email' },
        { key: 'rol', label: 'Rol' },
        { key: 'dni', label: 'DNI' },
        { key: 'celular', label: 'Celular' },
        { key: 'estado', label: 'Estado' }
      ],
      empresa: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'ruc', label: 'RUC' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'distrito', label: 'Distrito' },
        { key: 'estado', label: 'Estado' }
      ],
      planta: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'direccion', label: 'Dirección' },
        { key: 'nombreempresa', label: 'Empresa' },
        { key: 'estado', label: 'Estado' }
      ],
      maquina: [
        { key: 'marca', label: 'Marca' },
        { key: 'modelo', label: 'Modelo' },
        { key: 'serie', label: 'Serie' },
        { key: 'linea', label: 'Línea' },
        { key: 'nombreplanta', label: 'Planta' },
        { key: 'nombreempresa', label: 'Empresa' },
        { key: 'estado', label: 'Estado' }
      ],
      encargado: [
        { key: 'nombre', label: 'Nombre' },
        { key: 'apellido', label: 'Apellido' },
        { key: 'email', label: 'Email' },
        { key: 'celular', label: 'Celular' },
        { key: 'cargo', label: 'Cargo' },
        { key: 'nombreEmpresa', label: 'Empresa' },
        { key: 'nombrePlanta', label: 'Planta' }
      ],
      reporte_servicio: [
        { key: 'codigo_reporte', label: 'Código' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'nombre_empresa', label: 'Empresa' },
        { key: 'nombre_planta', label: 'Planta' },
        { key: 'marca_maquina', label: 'Máquina' },
        { key: 'estado', label: 'Estado' },
        { key: 'con_garantia', label: 'Con Garantía' }
      ],
      reporte_visita: [
        { key: 'cliente', label: 'Cliente' },
        { key: 'planta', label: 'Planta' },
        { key: 'fecha', label: 'Fecha' },
        { key: 'nombre_encargado', label: 'Encargado' },
        { key: 'operador', label: 'Operador' },
        { key: 'voltaje_establecido', label: 'Voltaje Establecido' }
      ]
    };

    return fieldDefinitions[categoria] || [
      { key: 'id', label: 'ID' },
      { key: 'nombre', label: 'Nombre' }
    ];
  }

  /**
   * Genera sugerencias contextuales
   */
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

  /**
   * Genera acciones para tablas
   */
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

  /**
   * Helper para nombres en singular
   */
  static getSingularName(categoria) {
    const names = {
      user: 'usuario',
      empresa: 'empresa',
      planta: 'planta',
      maquina: 'máquina',
      encargado: 'encargado',
      reporte_servicio: 'reporte de servicio',
      reporte_visita: 'reporte de visita'
    };
    return names[categoria] || 'registro';
  }

  /**
   * Helper para nombres en plural
   */
  static getPluralName(categoria) {
    const names = {
      user: 'usuarios',
      empresa: 'empresas',
      planta: 'plantas',
      maquina: 'máquinas',
      encargado: 'encargados',
      reporte_servicio: 'reportes de servicio',
      reporte_visita: 'reportes de visita'
    };
    return names[categoria] || 'registros';
  }
}

// 🎯 ORQUESTADOR DE SERVICIOS ACTUALIZADO
const serviceOrchestrator = {
  // Servicios disponibles (agregar reportes)
  services: {
    user: usuarios.usuarioFunctions,
    empresa: empresas.empresaFunctions,
    configuracion: configuraciones.configuracionFunctions,
    planta: plantas.plantaFunctions,
    maquina: maquinas.maquinaFunctions,
    encargado: encargados.encargadoFunctions,
    reporte_servicio: reporteServicio.reporteServicioFunctions, // ✅ NUEVO
    reporte_visita: reporteVisita.reporteVisitaFunctions // ✅ NUEVO
  },

  // Acciones que se pueden ejecutar automáticamente sin parámetros adicionales
  accionesEjecutablesAutomaticamente: [
    // User
    'searchUsers', 'listUsers', 'getUserById', // ✅ TODAS DISPONIBLES
    // Empresa
    'searchEmpresas', 'listEmpresas', 'getEmpresaById', // ✅ AGREGADOS

    // Planta
    'searchPlantas', 'listPlantas', 'getPlantaById', // ✅ AGREGADOS
    // Máquina
    'searchMaquinas', 'listMaquinas', 'getMaquinaById', // ✅ AGREGADOS
    // Encargado
    'searchEncargados', 'listEncargados', 'getEncargadoById', // ✅ AGREGADOS
    // Reporte Servicio ✅ NUEVO
    'searchReporteServicio', 'listReporteServicio', 'getReporteServicioById', // ✅ AGREGADOS
    // Reporte Visita ✅ NUEVO
    'searchReporteVisita', 'listReporteVisita', 'getReporteVisitaById', // ✅ AGREGADOS
    // Configuración
    'listConfigs', 'getConfig'
  ],

  puedeEjecutarAutomaticamente(acciones) {
    return acciones &&
      acciones.length > 0 &&
      acciones.every(accion => this.accionesEjecutablesAutomaticamente.includes(accion));
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

// 🧠 Consulta con IA - CON TODOS LOS MÉTODOS Y 10 EJEMPLOS POR CATEGORÍA
async function consultaAI(prompt) {
  try {
    if (!prompt || typeof prompt !== "string") {
      return { error: "El parámetro 'query' debe ser texto" };
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un ORQUESTADOR de consultas para un sistema de gestión. Analiza la consulta y determina:

SERVICIOS DISPONIBLES:
1. "user": Gestión de usuarios
2. "empresa": Gestión de empresas  
3. "planta": Gestión de plantas (instalaciones/ubicaciones de empresas)
4. "maquina": Gestión de máquinas (equipos en plantas)
5. "encargado": Gestión de encargados (personas a cargo de plantas/máquinas)
6. "reporte_servicio": Reportes de servicio técnico
7. "reporte_visita": Reportes de visitas técnicas
8. "configuracion": Configuraciones del sistema

TODOS LOS MÉTODOS DISPONIBLES POR SERVICIO:

USER:
- searchUsers (búsqueda con filtros: por id, nombres, email, rol, estado)
- listUsers (listar todos sin filtros)
- getUserById (obtener usuario específico por ID)
- createUser (crear nuevo usuario)
- updateUser (actualizar usuario)
- deleteUser (eliminar usuario)
- validateLogin (validar credenciales)
- resetPassword (resetear contraseña)

EMPRESA:
- searchEmpresas (búsqueda con filtros: por id, nombre, ruc, distrito, estado)
- listEmpresas (listar todas las empresas sin filtros)
- getEmpresaById (obtener empresa específica por ID)
- createEmpresa (crear nueva empresa)
- updateEmpresa (actualizar empresa)
- deleteEmpresa (eliminar empresa)

PLANTA:
- searchPlantas (búsqueda con filtros: por id, nombre, id_empresa, nombreempresa, dirección, estado)
- listPlantas (listar todas sin filtros)
- getPlantaById (obtener planta específica por ID)
- createPlanta (crear nueva planta)
- updatePlanta (actualizar planta)
- deletePlanta (eliminar planta)

MAQUINA:
- searchMaquinas (búsqueda con filtros: por id, marca, línea, serie, modelo, id_planta, id_empresa, nombreplanta, nombreempresa, estado)
- listMaquinas (listar todas sin filtros)
- getMaquinaById (obtener máquina específica por ID)
- createMaquina (crear nueva máquina)
- updateMaquina (actualizar máquina)
- deleteMaquina (eliminar máquina)

ENCARGADO:
- searchEncargados (búsqueda con filtros: por id, nombre, apellido, dni, email, cargo, nombreEmpresa, nombrePlanta)
- listEncargados (listar todos sin filtros)
- getEncargadoById (obtener encargado específico por ID)
- createEncargado (crear nuevo encargado)
- updateEncargado (actualizar encargado)
- deleteEncargado (eliminar encargado)
- validateLoginEncargado (validar credenciales encargado)
- resetPasswordEncargado (resetear contraseña encargado)

REPORTE_SERVICIO:
- searchReporteServicio (búsqueda con filtros: por id, código_reporte, nombre_usuario, encargado, empresa, planta, máquina, fechas, estados)
- listReporteServicio (listar todos sin filtros)
- getReporteServicioById (obtener reporte específico por ID)
- createReporteServicio (crear nuevo reporte)
- updateReporteServicio (actualizar reporte)
- deleteReporteServicio (eliminar reporte)

REPORTE_VISITA:
- searchReporteVisita (búsqueda con filtros: por id, cliente, encargado, operador, planta, empresa, fechas, condiciones técnicas)
- listReporteVisita (listar todos sin filtros)
- getReporteVisitaById (obtener reporte específico por ID)
- createReporteVisita (crear nuevo reporte)
- updateReporteVisita (actualizar reporte)
- deleteReporteVisita (eliminar reporte)

CONFIGURACIÓN:
- getConfig, listConfigs, createConfig, updateConfig, deleteConfig

10 EJEMPLOS POR CATEGORÍA:

USUARIOS (10 ejemplos):
1. "crear usuario nuevo" → user → createUser
2. "actualizar usuario 123" → user → updateUser → {id: 123, ...campos}
3. "eliminar usuario 456" → user → deleteUser → {id: 456}
4. "validar login usuario" → user → validateLogin → {usuario: "admin", pass: "123"}
5. "resetear contraseña usuario 789" → user → resetPassword → {id: 789, newPass: "nueva123"}
6. "obtener usuario con ID 100" → user → getUserById → {id: 100}
7. "listar todos los usuarios" → user → listUsers → {}
8. "buscar usuarios llamados Carlos" → user → searchUsers → {nombres: "Carlos"}
9. "usuarios con email gmail" → user → searchUsers → {email: "gmail"}
10. "usuarios con rol administrador" → user → searchUsers → {rol: "admin"}

EMPRESAS (10 ejemplos):
11. "crear empresa nueva" → empresa → createEmpresa
12. "actualizar empresa 5" → empresa → updateEmpresa → {id: 5, ...campos}
13. "eliminar empresa 10" → empresa → deleteEmpresa → {id: 10}
14. "obtener empresa con ID 15" → empresa → getEmpresaById → {id: 15}
15. "listar todas las empresas" → empresa → listEmpresas → {}
16. "buscar empresas en Lima" → empresa → searchEmpresas → {distrito: "Lima"}
17. "empresa Gloria" → empresa → searchEmpresas → {nombre: "Gloria"}
18. "empresa con RUC 20123456789" → empresa → searchEmpresas → {ruc: "20123456789"}
19. "empresas activas" → empresa → searchEmpresas → {estado: true}
20. "buscar empresa Tech" → empresa → searchEmpresas → {search: "Tech"}

PLANTAS (10 ejemplos):
21. "crear planta nueva" → planta → createPlanta
22. "actualizar planta 3" → planta → updatePlanta → {id: 3, ...campos}
23. "eliminar planta 7" → planta → deletePlanta → {id: 7}
24. "obtener planta con ID 12" → planta → getPlantaById → {id: 12}
25. "listar todas las plantas" → planta → listPlantas → {}
26. "plantas de la empresa Gloria" → planta → searchPlantas → {nombreempresa: "Gloria"}
27. "plantas en Lurín" → planta → searchPlantas → {direccion: "Lurín"}
28. "planta Central" → planta → searchPlantas → {nombre: "Central"}
29. "plantas activas" → planta → searchPlantas → {estado: true}
30. "plantas de la empresa 5" → planta → searchPlantas → {id_empresa: 5}

MÁQUINAS (10 ejemplos):
31. "crear máquina nueva" → maquina → createMaquina
32. "actualizar máquina 8" → maquina → updateMaquina → {id: 8, ...campos}
33. "eliminar máquina 15" → maquina → deleteMaquina → {id: 15}
34. "obtener máquina con ID 20" → maquina → getMaquinaById → {id: 20}
35. "listar todas las máquinas" → maquina → listMaquinas → {}
36. "máquinas de la planta Central" → maquina → searchMaquinas → {nombreplanta: "Central"}
37. "máquina marca Caterpillar" → maquina → searchMaquinas → {marca: "Caterpillar"}
38. "máquinas con serie ABC123" → maquina → searchMaquinas → {serie: "ABC123"}
39. "máquinas modelo 2023" → maquina → searchMaquinas → {modelo: "2023"}
40. "máquinas activas" → maquina → searchMaquinas → {estado: true}

ENCARGADOS (10 ejemplos):
41. "crear encargado nuevo" → encargado → createEncargado
42. "actualizar encargado 4" → encargado → updateEncargado → {id: 4, ...campos}
43. "eliminar encargado 9" → encargado → deleteEncargado → {id: 9}
44. "validar login encargado" → encargado → validateLoginEncargado → {email: "encargado@empresa.com", pass: "123"}
45. "resetear contraseña encargado 6" → encargado → resetPasswordEncargado → {id: 6, newPass: "nueva456"}
46. "obtener encargado con ID 11" → encargado → getEncargadoById → {id: 11}
47. "listar todos los encargados" → encargado → listEncargados → {}
48. "encargados de la empresa Gloria" → encargado → searchEncargados → {nombreEmpresa: "Gloria"}
49. "encargado llamado Juan Pérez" → encargado → searchEncargados → {nombre: "Juan", apellido: "Pérez"}
50. "encargados con cargo supervisor" → encargado → searchEncargados → {cargo: "supervisor"}

REPORTES SERVICIO (10 ejemplos):
51. "crear reporte de servicio" → reporte_servicio → createReporteServicio
52. "actualizar reporte servicio 25" → reporte_servicio → updateReporteServicio → {id: 25, ...campos}
53. "eliminar reporte servicio 30" → reporte_servicio → deleteReporteServicio → {id: 30}
54. "obtener reporte servicio con ID 35" → reporte_servicio → getReporteServicioById → {id: 35}
55. "listar todos los reportes de servicio" → reporte_servicio → listReporteServicio → {}
56. "reportes del usuario Luigi" → reporte_servicio → searchReporteServicio → {nombre_usuario: "Luigi"}
57. "reportes de la empresa Gloria" → reporte_servicio → searchReporteServicio → {nombre_empresa: "Gloria"}
58. "reportes de la planta Lurín" → reporte_servicio → searchReporteServicio → {nombre_planta: "Lurín"}
59. "reportes con garantía" → reporte_servicio → searchReporteServicio → {con_garantia: true}
60. "reportes de esta semana" → reporte_servicio → searchReporteServicio → {fecha_desde: "2024-01-01", fecha_hasta: "2024-01-07"}

REPORTES VISITA (10 ejemplos):
61. "crear reporte de visita" → reporte_visita → createReporteVisita
62. "actualizar reporte visita 40" → reporte_visita → updateReporteVisita → {id: 40, ...campos}
63. "eliminar reporte visita 45" → reporte_visita → deleteReporteVisita → {id: 45}
64. "obtener reporte visita con ID 50" → reporte_visita → getReporteVisitaById → {id: 50}
65. "listar todos los reportes de visita" → reporte_visita → listReporteVisita → {}
66. "reportes de visita del cliente ABC Corp" → reporte_visita → searchReporteVisita → {cliente: "ABC Corp"}
67. "reportes de visita del encargado María" → reporte_visita → searchReporteVisita → {nombre_encargado: "María"}
68. "reportes de visita con voltaje establecido" → reporte_visita → searchReporteVisita → {voltaje_establecido: true}
69. "reportes de visita de la planta Central" → reporte_visita → searchReporteVisita → {planta: "Central"}
70. "último reporte de visita" → reporte_visita → searchReporteVisita → {orden: "desc", limite: 1, campo_orden: "fecha"}

IMPORTANTE: Responde SOLO con JSON válido, sin markdown, sin texto adicional.

RESPONDE EXCLUSIVAMENTE en formato JSON:
{
  "categoria": "user" | "empresa" | "planta" | "maquina" | "encargado" | "reporte_servicio" | "reporte_visita" | "configuracion",
  "acciones": ["accion_especifica"],
  "parametros_sugeridos": { "parametro": "valor" },
  "explicacion": "Explicación breve"
}`
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 500,
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

// ✅ ENDPOINT PRINCIPAL MEJORADO CON CONSTRUCCIÓN DE COMPONENTES
router.post("/", async (req, res) => {
  try {
    const { service, content } = req.body;

    if (!service) return responder(res, 400, { error: "Falta el campo 'service'" });
    if (!content) return responder(res, 400, { error: "Falta el campo 'content'" });

    const { action, params = {}, query } = content;

    console.log(`🔍 [${service}] Acción: ${action || "consultaAI"} | Query: ${query || "-"}`);

    // 💬 SERVICIO IA CON ORQUESTADOR Y CONSTRUCCIÓN DE COMPONENTES
    if (service === "consultaAI") {
      const identificacion = await consultaAI(query);

      if (identificacion.error) {
        return responder(res, 400, identificacion);
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
          component // ✅ NUEVO: Componente construido automáticamente
        });
      }

      // Solo identificación
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
    return responder(res, 500, { error: "Error interno del servidor" });
  }
});

export default router;