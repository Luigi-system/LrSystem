-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Configuracion (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  key text,
  value text,
  id_usuario bigint,
  CONSTRAINT Configuracion_pkey PRIMARY KEY (id),
  CONSTRAINT Configuracion_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.Usuarios(id)
);
CREATE TABLE public.Detalle_Visitas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id_maquina bigint,
  id_visita bigint,
  detalle text,
  CONSTRAINT Detalle_Visitas_pkey PRIMARY KEY (id),
  CONSTRAINT Detalle_Visitas_id_maquina_fkey FOREIGN KEY (id_maquina) REFERENCES public.Maquinas(id),
  CONSTRAINT Detalle_Visitas_id_visita_fkey FOREIGN KEY (id_visita) REFERENCES public.Visitas(id)
);
CREATE TABLE public.Empresa (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre text,
  direccion text,
  distrito text,
  ruc text,
  estado boolean,
  CONSTRAINT Empresa_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Encargado (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre text,
  apellido text,
  dni text,
  nacimiento date,
  email text,
  pass text,
  foto bytea,
  id_planta bigint,
  celular integer,
  cargo text,
  CONSTRAINT Encargado_pkey PRIMARY KEY (id),
  CONSTRAINT encargado_id_planta_fkey FOREIGN KEY (id_planta) REFERENCES public.Planta(id)
);
CREATE TABLE public.Maquinas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  marca text,
  linea text,
  serie text,
  modelo text,
  id_planta bigint,
  foto bytea,
  estado boolean,
  id_empresa bigint,
  detalles text,
  CONSTRAINT Maquinas_pkey PRIMARY KEY (id),
  CONSTRAINT Maquinas_id_planta_fkey FOREIGN KEY (id_planta) REFERENCES public.Planta(id),
  CONSTRAINT Maquinas_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.Empresa(id)
);
CREATE TABLE public.Planta (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre text,
  direccion text,
  estado boolean,
  id_empresa bigint,
  CONSTRAINT Planta_pkey PRIMARY KEY (id),
  CONSTRAINT planta_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.Empresa(id)
);
CREATE TABLE public.Reporte_Servicio (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  codigo_reporte text,
  sin_garantia boolean,
  facturado boolean,
  fecha timestamp with time zone,
  id_encargado bigint,
  serie_maquina text,
  linea_maquina text,
  marca_maquina text,
  modelo_maquina text,
  en_prueba boolean,
  no_facturado boolean,
  problemas_encontrados text,
  fotos_problemas_encontrados ARRAY,
  id_empresa bigint,
  fotos_observaciones ARRAY,
  foto_firma bytea,
  acciones_realizadas text,
  observaciones text,
  fotos_acciones_realizadas ARRAY,
  operativo boolean,
  salida time without time zone,
  url_pdf text,
  inoperativo boolean,
  nombre_planta text,
  entrada time without time zone,
  con_garantia boolean,
  id_usuario bigint,
  nombre_usuario text,
  celular_usuario text,
  estado boolean,
  CONSTRAINT Reporte_Servicio_pkey PRIMARY KEY (id),
  CONSTRAINT Reporte_Servicio_id_encargado_fkey FOREIGN KEY (id_encargado) REFERENCES public.Encargado(id),
  CONSTRAINT Reporte_Servicio_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.Empresa(id),
  CONSTRAINT Reporte_Servicio_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.Usuarios(id)
);
CREATE TABLE public.Roles (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre text,
  CONSTRAINT Roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.Usuarios (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  email text,
  pass bigint,
  usuario text,
  dni bigint,
  nombres text,
  celular bigint,
  fotoPerfil text,
  rol bigint,
  estado boolean,
  CONSTRAINT Usuarios_pkey PRIMARY KEY (id),
  CONSTRAINT Usuarios_rol_fkey FOREIGN KEY (rol) REFERENCES public.Roles(id)
);
CREATE TABLE public.Visitas (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  descripcion text,
  fecha timestamp with time zone,
  id_planta bigint,
  id_usuario bigint,
  CONSTRAINT Visitas_pkey PRIMARY KEY (id),
  CONSTRAINT Visitas_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.Usuarios(id),
  CONSTRAINT Visitas_id_planta_fkey FOREIGN KEY (id_planta) REFERENCES public.Planta(id)
);
CREATE TABLE public.empresa (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  nombre text,
  direccion text,
  distrito text,
  ruc text,
  CONSTRAINT empresa_pkey PRIMARY KEY (id)
);
CREATE TABLE public.role_permissions (
  role_id bigint NOT NULL,
  permission_name text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_name),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.Roles(id)
);