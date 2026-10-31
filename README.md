# SMARTFAST

Proyecto SMARTFAST - Gestión de pedidos, productos, clientes y entregas.

MVP con React + Vite + TailwindCSS y Supabase (Auth + Postgres + RLS).

## Módulos

- **Clientes** (`/catalogo`, `/carrito`, `/checkout`, `/mis-pedidos`): menú, carrito de un solo
  restaurante, pedidos a domicilio o para recoger (también como invitado) y seguimiento del estado.
- **Restaurante** (`/restaurante`): resumen del día, datos del restaurante, productos, precios e inventario.
- **Cocina** (`/restaurante/cocina`): tablero por estado `CREADO → ACEPTADO → EN_PREPARACION → EN_CAMINO → ENTREGADO`.
- **Entregas** (`/restaurante/entregas`): entregas a domicilio sincronizadas con el pedido.

## Puesta en marcha

1. Crea un proyecto en [Supabase](https://supabase.com) y ejecuta en el SQL Editor, en orden:
   `smartfast.sql`, `supabase/migrations/001_mvp_schema.sql`, `supabase/rls.sql` y
   (opcional) `supabase/seed-dev.sql`. Detalles en [supabase/README_RLS.md](supabase/README_RLS.md).
2. Configura las variables de entorno:

   ```bash
   cp .env.example .env
   ```

   y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Project Settings → API).
3. Instala y arranca:

   ```bash
   npm install
   npm run dev
   ```

4. Regístrate en la app. Para entrar al panel de restaurante, convierte tu usuario en propietario
   (ver *Crear un propietario* en `supabase/README_RLS.md`).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | oxlint |
| `npm run test:sql` | Prueba esquema, reglas de negocio y RLS sobre Postgres en memoria (PGlite) |

## Estructura

```text
src/
├── components/  ui/ (Button, Input, Card, Badge, Table, Alert, Spinner...), layout/, shared/
├── config/      supabase.js
├── context/     AuthContext, CartContext
├── hooks/       useAuth, useRole, useRestaurant, useCart, useAsync
├── lib/         constants (estados, transiciones), utils
├── pages/       auth/, cliente/, restaurante/, entregas/, landing/
├── routes/      AppRouter, ProtectedRoute, RoleGuard
├── services/    auth, productos, pedidos, restaurante
└── utils/       validators (zod)
supabase/        migrations/, rls.sql, seed-dev.sql
tests/sql/       pruebas de BD con PGlite
```

Flujo de ramas: ver [docs/GITFLOW.md](docs/GITFLOW.md).
