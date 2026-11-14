# SmartFast MVP Inicial - Auth + Flujo Básico de Pedidos

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir un MVP funcional de SmartFast con React + Vite + Supabase, respetando al 100% el esquema de `smartfast.sql`. Incluir autenticación, panel de restaurante, módulo de cocina, módulo de clientes, módulo de entregas, integración con BD existente, diseño responsive y RLS.

**Architecture:** Frontend SPA con React + Vite + TailwindCSS. Autenticación y base de datos con Supabase (Auth + Postgres). Multi-restaurante con un solo restaurante por pedido. Control de stock al aceptar/cancelar. Estados de pedido sincronizados con entregas.

**Tech Stack:** React 19, Vite, react-router-dom, @supabase/supabase-js, react-hook-form, zod, tailwindcss, lucide-react, clsx, tailwind-merge, date-fns

**Spec:** Ver conversación con usuario + `smartfast.sql`

**Rama Gitflow:** `feature/mvp-inicial-auth-pedidos` desde `develop`

## Objetivos del MVP

1. Autenticación: inicio de sesión y registro de usuarios
2. Panel de restaurante: gestión de productos, precios, inventario y pedidos
3. Módulo de cocina: visualizar pedidos recibidos y actualizar estados
4. Módulo de clientes: consultar productos, realizar pedidos y ver su estado
5. Módulo de entregas: consultar entregas pendientes y actualizar su estado
6. Integración con tablas existentes respetando claves primarias/foráneas
7. Diseño moderno, profesional, responsive con identidad SmartFast
8. Políticas RLS en Supabase por usuario/rol/restaurante

## Estructura del proyecto

```text
src/
├── assets/
├── components/
│   ├── ui/        # Button, Input, Card, Badge, Table, Alert, Spinner
│   ├── layout/    # Navbar, Sidebar, AppLayout, AuthLayout
│   └── shared/
├── config/        # supabase.js
├── context/       # AuthContext, CartContext
├── hooks/         # useAuth, useRole, useRestaurant
├── lib/           # utils, constants
├── pages/
│   ├── auth/      # Login, Register
│   ├── cliente/   # Catalogo, Carrito, Checkout, MisPedidos
│   ├── restaurante/ # Productos, Pedidos, Cocina
│   ├── entregas/  # EntregasList, EntregaDetalle
│   └── landing/
├── routes/        # AppRouter, ProtectedRoute, RoleGuard
├── services/      # auth.service, productos.service, pedidos.service, restaurante.service
├── styles/        # index.css
└── utils/         # validators
supabase/
├── rls.sql
└── seed-dev.sql
```

## Reglas de negocio críticas

- **Un solo restaurante por pedido**: No mezclar productos de distintos restaurantes en el mismo carrito/pedido
- **Invitados permitidos**: `pedidos.id_usuario` puede ser NULL. Guardar `nombre_contacto`, `telefono_contacto` obligatorios
- **DOMICILIO vs RECOGER**: Si es DOMICILIO, `direccion_entrega` obligatoria. Si es RECOGER, `direccion_entrega` debe ser NULL
- **Stock**: Descontar al pasar a `ACEPTADO`. Devolver al pasar a `CANCELADO` solo si ya fue aceptado previamente
- **Estados**: `CREADO -> ACEPTADO -> EN_PREPARACION -> EN_CAMINO -> ENTREGADO` (+ `CANCELADO`)
- **Trazabilidad**: Registrar cambios en `historial_estado_pedido`
- **Entregas**: Sincronizar `entregas` con estado del pedido
- **Precio histórico**: Usar `precio_unitario` desde producto al momento de crear detalle_pedido

## Tareas de implementación

### Task 1: Scaffolding con Vite + React + Tailwind
**Files:**
- Create: `package.json`, `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, `index.html`, `src/main.jsx`, `src/App.jsx`, `src/index.css`
- Create: estructura de carpetas
- Create: `.env.example`

**Pasos:**
- [ ] Ejecutar `npm create vite@latest . -- --template react` (o inicializar)
- [ ] Instalar dependencias: `@supabase/supabase-js react-router-dom react-hook-form zod @hookform/resolvers lucide-react clsx tailwind-merge date-fns`
- [ ] Instalar devDependencies: `tailwindcss postcss autoprefixer`
- [ ] `npx tailwindcss init -p`
- [ ] Crear estructura de carpetas
- [ ] Crear `.env.example` con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- [ ] Limpiar boilerplate

**Commit:** `chore: scaffold react + vite + tailwind base`

### Task 2: Cliente Supabase + Variables de entorno
**Files:**
- Create: `src/config/supabase.js`
- Create: `.env.example` (actualizar)

**Pasos:**
- [ ] Crear `src/config/supabase.js` con `createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)`
- [ ] Añadir validación básica
- [ ] Asegurar `.env` en `.gitignore` (ya existe)

**Commit:** `feat: add supabase client`

### Task 3: Autenticación + Contexto de Auth
**Files:**
- Create: `src/services/auth.service.js`
- Create: `src/context/AuthContext.jsx`
- Create: `src/hooks/useAuth.js`
- Create: `src/pages/auth/Login.jsx`
- Create: `src/pages/auth/Register.jsx`
- Create: `src/components/layout/AuthLayout.jsx`

**Lógica:**
- `signUp`: crear usuario en Auth + insertar/actualizar en `usuarios` con `auth_id`, `correo`, `nombre`, `rol='CLIENTE'`
- `signIn`: autenticar con Supabase
- `onAuthStateChange`: cargar perfil desde `usuarios` + `restaurantes` si tiene `id_restaurante`
- Redirección por rol tras login

**Pasos:**
- [ ] Implementar `auth.service.js` (`getProfile`, `upsertProfile`, `signIn`, `signUp`, `signOut`)
- [ ] Implementar `AuthContext` con estado completo
- [ ] Crear páginas Login/Register con validación
- [ ] Crear AuthLayout
- [ ] Probar flujo básico

**Commit:** `feat: auth with supabase and user profile mapping`

### Task 4: Rutas protegidas + Guards por rol
**Files:**
- Create: `src/routes/ProtectedRoute.jsx`
- Create: `src/routes/RoleGuard.jsx`
- Create: `src/routes/AppRouter.jsx`
- Create: `src/components/layout/AppLayout.jsx`
- Create: `src/components/layout/Navbar.jsx`
- Create: `src/components/layout/Sidebar.jsx`

**Pasos:**
- [ ] Implementar guards
- [ ] Crear layouts responsive
- [ ] Definir rutas base por rol
- [ ] Navegación dinámica por rol
- [ ] Redirección inteligente

**Commit:** `feat: protected routes and role guards`

### Task 5: Catálogo + Carrito (Cliente)
**Files:**
- Create: `src/context/CartContext.jsx`
- Create: `src/services/productos.service.js`
- Create: `src/pages/cliente/Catalogo.jsx`
- Create: `src/pages/cliente/Carrito.jsx`
- Create: `src/components/shared/RestaurantSelector.jsx` (si aplica)

**Reglas:**
- Solo productos `disponible=true AND activo=true`
- **Un solo restaurante por pedido**: validar al añadir producto
- Calcular totales con `costo_envio_base` del restaurante
- Mostrar stock

**Pasos:**
- [ ] CartContext con validación de restaurante único
- [ ] Catalogo con grid responsive
- [ ] Carrito con resumen y tipo entrega
- [ ] Validaciones

**Commit:** `feat: product catalog and cart with single-restaurant rule`

### Task 6: Checkout + Creación de pedido
**Files:**
- Create: `src/services/pedidos.service.js`
- Create: `src/pages/cliente/Checkout.jsx`
- Create: `src/pages/cliente/MisPedidos.jsx`
- Create: `src/pages/cliente/DetallePedidoCliente.jsx`

**Flujo:**
- Validar carrito
- Si DOMICILIO: requerir dirección
- Crear `pedidos` (id_usuario nullable)
- Crear `detalle_pedido` con `precio_unitario` actual
- Crear `entregas` con estado PENDIENTE
- NO descontar stock
- Limpiar carrito y redirigir

**Pasos:**
- [ ] Formulario checkout
- [ ] Servicio crearPedido con inserts encadenados
- [ ] Crear entregas
- [ ] MisPedidos con estados
- [ ] Confirmación

**Commit:** `feat: checkout and order creation respecting schema`

### Task 7: Panel Restaurante - Gestión de Productos
**Files:**
- Create: `src/services/restaurante.service.js`
- Create: `src/pages/restaurante/Productos.jsx`
- Create: `src/pages/restaurante/ProductoForm.jsx`
- Create: `src/pages/restaurante/Dashboard.jsx`

**Reglas:**
- Solo PROPIETARIO con id_restaurante
- Filtrar por id_restaurante
- CRUD completo

**Pasos:**
- [ ] Listado con filtros
- [ ] Formulario crear/editar
- [ ] Toggle disponible/activo
- [ ] Ajuste stock

**Commit:** `feat: restaurant product management`

### Task 8: Módulo Cocina / Gestión de Pedidos
**Files:**
- Create: `src/pages/restaurante/PedidosCocina.jsx`
- Create: `src/pages/restaurante/DetallePedidoRestaurante.jsx`

**Flujo de estados con lógica:**
- ACEPTADO: **descontar stock** por cada item. Validar stock suficiente. Insertar en `historial_estado_pedido`
- EN_PREPARACION: actualizar pedido + entregas
- EN_CAMINO: actualizar pedido + `entregas.estado_entrega='EN_CAMINO'` + fecha
- ENTREGADO: actualizar pedido + `entregas.estado_entrega='ENTREGADO'` + `fecha_entregado`
- CANCELADO: si ya fue aceptado (stock descontado), **devolver stock**. Insertar historial

**Pasos:**
- [ ] Tablero Kanban por estado
- [ ] Botones con validaciones
- [ ] Lógica stock
- [ ] Historial
- [ ] Sincronización con entregas

**Commit:** `feat: kitchen/order management with state flow and stock control`

### Task 9: Módulo Entregas
**Files:**
- Create: `src/pages/entregas/EntregasList.jsx`
- Create: `src/pages/entregas/EntregaDetalle.jsx`

**Pasos:**
- [ ] Listado de entregas del restaurante
- [ ] Filtros por estado
- [ ] Acciones: marcar EN_PREPARACION/EN_CAMINO/ENTREGADO
- [ ] Sincronizar con pedidos
- [ ] Actualizar historial

**Commit:** `feat: deliveries module`

### Task 10: Políticas RLS en Supabase
**Files:**
- Create: `supabase/rls.sql`
- Create: `supabase/README_RLS.md`

**Políticas clave:**
- Habilitar RLS en todas las tablas
- Usar `auth.uid()` vinculado a `usuarios.auth_id`
- Clientes: solo sus datos/pedidos
- Propietarios: solo datos de su `id_restaurante`
- Productos: público lectura si disponible/activo, propietario CRUD
- Pedidos/detalle/entregas/historial: filtrados por rol/restaurante

**Pasos:**
- [ ] Crear `rls.sql` completo
- [ ] Documentar aplicación en Supabase SQL Editor
- [ ] Checklist de verificación

**Commit:** `security: add row level security policies`

### Task 11: Diseño UI + Branding SmartFast
**Files:**
- Modify: `tailwind.config.js`, `src/index.css`
- Create: `src/components/ui/*` (Button, Input, Card, Badge, Table, Alert, Spinner)
- Create: `src/lib/utils.js`
- Create: `src/lib/constants.js`

**Pasos:**
- [ ] Configurar paleta SmartFast
- [ ] Componentes UI reutilizables
- [ ] Aplicar a todas las vistas
- [ ] Responsive mobile-first
- [ ] Estados vacíos y loading

**Commit:** `style: modern responsive UI with SmartFast branding`

### Task 12: Integración y pruebas básicas
**Pasos:**
- [ ] Probar registro/login
- [ ] Probar flujo cliente completo
- [ ] Probar panel restaurante + cocina
- [ ] Probar módulo entregas
- [ ] Validar RLS
- [ ] Validar 1 restaurante por pedido
- [ ] Validar descuento/devolución stock
- [ ] Validar estados y sincronización

**Commit:** `test: basic mvp flow validation`

## Notas importantes

- **NO modificar destructivamente** `smartfast.sql`. Solo integrarse
- **Respetar nombres exactos** de tablas/columnas
- **Usar ENUMs/valores** tal como están definidos
- **RLS obligatorio**
- **Stock solo al ACEPTAR / devolver solo al CANCELAR tras aceptación**
- **Un solo restaurante por pedido SIEMPRE**
- **Primero auth + flujo básico de pedidos**

## Comandos para empezar

```bash
# Crear feature branch
git checkout develop
git pull
git checkout -b feature/mvp-inicial-auth-pedidos

# Instalar dependencias (después de scaffolding)
npm install

# Desarrollo
npm run dev
```

**Plan completo listo para ejecutar con `writing-plans` + `subagent-driven-development` o `executing-plans`.**
