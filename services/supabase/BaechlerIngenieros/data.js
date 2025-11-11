// data.js - Datos estáticos y configuración
export const CONFIG = {
  // Configuración de servicios
  SERVICES: {
    SUPABASE: {
      URL: process.env.SUPABASE_URL,
      KEY: process.env.SUPABASE_KEY
    },
    OPENAI: {
      API_KEY: process.env.OPENAI_API_KEY,
      MODEL: "gpt-4o-mini",
      TEMPERATURE: 0.1,
      MAX_TOKENS: 500
    }
  },

  // Comportamientos generales
  BEHAVIORS: {
    SALUDOS: [
      'hola', 'hi', 'hello', 'buenos días', 'buenas tardes', 'buenas noches',
      'hey', 'qué tal', 'cómo estás', 'saludos', 'buen día'
    ],
    DESPEDIDAS: [
      'adiós', 'bye', 'chao', 'hasta luego', 'nos vemos', 'hasta pronto',
      'hasta la vista', 'que tengas buen día', 'gracias', 'thanks'
    ],
    CAPACIDADES: [
      'qué puedes hacer', 'qué sabes hacer', 'cuáles son tus funciones',
      'ayuda', 'help', 'funciones', 'capacidades', 'qué ofreces'
    ]
  },

  // Configuración de componentes
  COMPONENTS: {
    FIELD_DEFINITIONS: {
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
    },

    NOMBRES: {
      SINGULAR: {
        user: 'usuario',
        empresa: 'empresa',
        planta: 'planta',
        maquina: 'máquina',
        encargado: 'encargado',
        reporte_servicio: 'reporte de servicio',
        reporte_visita: 'reporte de visita'
      },
      PLURAL: {
        user: 'usuarios',
        empresa: 'empresas',
        planta: 'plantas',
        maquina: 'máquinas',
        encargado: 'encargados',
        reporte_servicio: 'reportes de servicio',
        reporte_visita: 'reportes de visita'
      }
    },

    SALUDOS: [
      "¡Hola! 👋 Soy tu asistente de gestión empresarial.",
      "¡Bienvenido! Estoy aquí para ayudarte con tu sistema de gestión.",
      "¡Hola! 🤖 Listo para asistirte con empresas, plantas, máquinas y reportes."
    ],

    DESPEDIDAS: [
      "¡Hasta luego! 👋 Fue un gusto ayudarte.",
      "¡Que tengas un excelente día! 🌟",
      "¡Nos vemos! 🤖 No dudes en consultarme cuando lo necesites."
    ]
  },

  // Acciones ejecutables automáticamente
  ACCIONES_AUTOMATICAS: [
    // User
    'searchUsers', 'listUsers', 'getUserById',
    // Empresa
    'searchEmpresas', 'listEmpresas', 'getEmpresaById',
    // Planta
    'searchPlantas', 'listPlantas', 'getPlantaById',
    // Máquina
    'searchMaquinas', 'listMaquinas', 'getMaquinaById',
    // Encargado
    'searchEncargados', 'listEncargados', 'getEncargadoById',
    // Reporte Servicio
    'searchReporteServicio', 'listReporteServicio', 'getReporteServicioById',
    // Reporte Visita
    'searchReporteVisita', 'listReporteVisita', 'getReporteVisitaById',
    // Configuración
    'listConfigs', 'getConfig'
  ],

  // Métodos disponibles por servicio
  METODOS_SERVICIOS: {
    USER: [
      'searchUsers', 'listUsers', 'getUserById', 'createUser', 'updateUser', 
      'deleteUser', 'validateLogin', 'resetPassword'
    ],
    EMPRESA: [
      'searchEmpresas', 'listEmpresas', 'getEmpresaById', 'createEmpresa', 
      'updateEmpresa', 'deleteEmpresa'
    ],
    PLANTA: [
      'searchPlantas', 'listPlantas', 'getPlantaById', 'createPlanta', 
      'updatePlanta', 'deletePlanta'
    ],
    MAQUINA: [
      'searchMaquinas', 'listMaquinas', 'getMaquinaById', 'createMaquina', 
      'updateMaquina', 'deleteMaquina'
    ],
    ENCARGADO: [
      'searchEncargados', 'listEncargados', 'getEncargadoById', 'createEncargado', 
      'updateEncargado', 'deleteEncargado', 'validateLoginEncargado', 'resetPasswordEncargado'
    ],
    REPORTE_SERVICIO: [
      'searchReporteServicio', 'listReporteServicio', 'getReporteServicioById', 
      'createReporteServicio', 'updateReporteServicio', 'deleteReporteServicio'
    ],
    REPORTE_VISITA: [
      'searchReporteVisita', 'listReporteVisita', 'getReporteVisitaById', 
      'createReporteVisita', 'updateReporteVisita', 'deleteReporteVisita'
    ],
    CONFIGURACION: [
      'getConfig', 'listConfigs', 'createConfig', 'updateConfig', 'deleteConfig'
    ]
  },

  // Prompt del sistema para IA
  SYSTEM_PROMPT: `Eres un ORQUESTADOR de consultas para un sistema de gestión. Analiza la consulta y determina:

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
- searchReporteServicio (búsqueda con filtros: por id, código_reporte, nombre_usuario, encargado, empresa, serie, marca_maquina, linea, serie_maquina, modelo_maquina, planta, máquina, fechas, estados)
- listReporteServicio (listar todos sin filtros)
- getReporteServicioById (obtener reporte específico por ID)
- createReporteServicio (crear nuevo reporte)
- updateReporteServicio (actualizar reporte)
- deleteReporteServicio (eliminar reporte)

REPORTE_VISITA:
- searchReporteVisita (búsqueda con filtros: por id, cliente, encargado, operador, planta,  empresa, serie, marca, linea, modelo, fechas, condiciones técnicas)
- listReporteVisita (listar todos sin filtros)
- getReporteVisitaById (obtener reporte específico por ID)
- createReporteVisita (crear nuevo reporte)
- updateReporteVisita (actualizar reporte)
- deleteReporteVisita (eliminar reporte)

CONFIGURACIÓN:
- getConfig, listConfigs, createConfig, updateConfig, deleteConfig

IMPORTANTE: Responde SOLO con JSON válido, sin markdown, sin texto adicional.

RESPONDE EXCLUSIVAMENTE en formato JSON:
{
  "categoria": "user" | "empresa" | "planta" | "maquina" | "encargado" | "reporte_servicio" | "reporte_visita" | "configuracion",
  "acciones": ["accion_especifica"],
  "parametros_sugeridos": { "parametro": "valor" },
  "explicacion": "Explicación breve"
}`
};