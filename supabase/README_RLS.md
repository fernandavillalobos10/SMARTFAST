# Base de datos y RLS en Supabase

## Orden de ejecución (SQL Editor de Supabase)

1. `smartfast.sql` — esquema base (no se modifica).
2. `supabase/migrations/001_mvp_schema.sql` — migración **aditiva**: crea `restaurantes`, `usuarios`,
   `historial_estado_pedido`, añade columnas nuevas, el trigger de alta de usuarios y las funciones
   `crear_pedido()` y `cambiar_estado_pedido()`.
3. `supabase/rls.sql` — habilita RLS, recorta privilegios y crea las políticas.
4. (Opcional) `supabase/seed-dev.sql` — restaurantes y productos de ejemplo.

Los tres scripts son idempotentes: se pueden volver a ejecutar sin duplicar nada.

## Cómo encaja con `smartfast.sql`

| Necesidad del MVP | Solución sin romper el esquema |
| --- | --- |
| Pedidos de invitados | `pedidos.id_cliente` sigue `NOT NULL`: cada pedido crea/reutiliza una fila en `clientes`. `pedidos.id_usuario` (nuevo) es `NULL` para invitados. |
| Estados nuevos | `pedidos.estado` cambia su *default* a `CREADO`; el `CHECK` es `NOT VALID`, así que filas antiguas (`'Pendiente'`) se conservan. |
| `entregas.direccion_entrega NOT NULL` | Solo se crea fila en `entregas` para pedidos `DOMICILIO`. `fecha_entrega` guarda el momento de la entrega; `fecha_salida` (nueva) la salida. |
| Productos sin restaurante | Las filas antiguas de `productos` quedan con `id_restaurante NULL` y no aparecen en el menú hasta asignarles uno. |

## Modelo de permisos

| Tabla | anon (invitado) | CLIENTE | PROPIETARIO |
| --- | --- | --- | --- |
| `restaurantes` | leer activos | leer activos | leer el suyo; editar nombre, descripción, dirección, teléfono y costo de envío |
| `productos` | leer `disponible AND activo` de restaurantes activos | igual + productos de sus pedidos | leer/crear/editar los de su restaurante (sin borrar: se desactiva con `activo=false`) |
| `usuarios` | — | leer su fila; editar `nombre`, `telefono` | igual |
| `clientes` | — | leer/editar su fila | + clientes con pedidos en su restaurante |
| `pedidos`, `detalle_pedido`, `entregas`, `historial_estado_pedido` | — | leer los suyos | leer los de su restaurante |

**Nadie escribe directamente** en `pedidos`, `detalle_pedido`, `entregas` ni `historial_estado_pedido`.
Toda escritura pasa por funciones `SECURITY DEFINER` que validan las reglas:

- `crear_pedido(...)` (anon y authenticated): un solo restaurante, productos disponibles, precio
  histórico en `detalle_pedido.precio_unitario`, dirección obligatoria solo en `DOMICILIO`, crea
  `entregas` e historial. **No descuenta stock.**
- `cambiar_estado_pedido(id, estado, comentario)` (authenticated): solo el propietario del restaurante
  (o el cliente, para cancelar su pedido mientras está `CREADO`). Descuenta stock al `ACEPTADO`
  (falla si no alcanza), lo devuelve al `CANCELADO` si ya se había descontado, sincroniza `entregas`
  e inserta en `historial_estado_pedido`.

El rol nunca se toma del navegador: el trigger crea a todos como `CLIENTE`, y las columnas `rol`,
`id_restaurante` e `id_cliente` no tienen permiso de escritura para `authenticated`.

## Crear un propietario

Regístrate en la app y ejecuta en el SQL Editor:

```sql
UPDATE usuarios
SET rol = 'PROPIETARIO', id_restaurante = 1  -- id del restaurante
WHERE correo = 'tu-correo@ejemplo.com';
```

(`seed-dev.sql` hace esto automáticamente para `propietario@smartfast.test`.)

## Tiempo real (opcional)

El tablero de cocina se refresca cada 30 s. Para que se actualice al instante:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
```

## Checklist de verificación

Automatizado con `npm run test:sql` (PGlite, sin Supabase). Manualmente en Supabase:

- [ ] Sin sesión, `select * from pedidos` vía API devuelve error de permisos.
- [ ] Un invitado puede hacer un pedido y no puede leerlo después.
- [ ] Un cliente solo ve sus pedidos en *Mis pedidos*.
- [ ] Un cliente no puede cambiar su `rol` (`update usuarios set rol=...` → *permission denied*).
- [ ] Un propietario solo ve pedidos/productos/entregas de su restaurante.
- [ ] Un propietario no puede crear productos con otro `id_restaurante`.
- [ ] Aceptar un pedido descuenta stock; cancelarlo después lo devuelve; cancelar uno `CREADO` no toca stock.
- [ ] Aceptar sin stock suficiente muestra el error y no cambia nada.
- [ ] Al pasar a `EN_CAMINO`/`ENTREGADO` la entrega cambia de estado y fecha.
- [ ] Cada cambio aparece en el historial del pedido.
