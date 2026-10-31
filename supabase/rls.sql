-- SMARTFAST - ROW LEVEL SECURITY
-- Ejecutar DESPUÉS de smartfast.sql y supabase/migrations/001_mvp_schema.sql.
-- Idempotente: borra y recrea sus propias políticas.
--
-- Modelo:
--   * auth.uid() se vincula con usuarios.auth_id (helpers fn_* de la migración 001).
--   * Invitados (anon): leen restaurantes/productos publicados y crean pedidos vía crear_pedido().
--   * CLIENTE: solo su perfil, su fila de clientes y sus pedidos.
--   * PROPIETARIO: solo datos de su id_restaurante.
--   * pedidos, detalle_pedido, entregas e historial_estado_pedido NO se escriben
--     directamente: solo a través de crear_pedido() y cambiar_estado_pedido()
--     (SECURITY DEFINER), que aplican las reglas de negocio.

-- ============================================================
-- 1. HABILITAR RLS
-- ============================================================

ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE entregas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historial_estado_pedido ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. PRIVILEGIOS POR TABLA / COLUMNA
-- (Supabase concede ALL a anon y authenticated por defecto; aquí se recorta.)
-- ============================================================

REVOKE INSERT, UPDATE, DELETE ON
    restaurantes, usuarios, clientes, productos,
    pedidos, detalle_pedido, entregas, historial_estado_pedido
FROM anon, authenticated;

REVOKE SELECT ON usuarios, clientes, pedidos, detalle_pedido, entregas, historial_estado_pedido FROM anon;

GRANT SELECT ON restaurantes, productos TO anon;
GRANT SELECT ON
    restaurantes, usuarios, clientes, productos,
    pedidos, detalle_pedido, entregas, historial_estado_pedido
TO authenticated;

-- El usuario solo puede crear su perfil como CLIENTE y editar nombre/teléfono:
-- rol, id_restaurante e id_cliente no se pueden tocar desde el navegador.
GRANT INSERT (auth_id, nombre, correo, telefono) ON usuarios TO authenticated;
GRANT UPDATE (nombre, telefono) ON usuarios TO authenticated;
GRANT UPDATE (nombre, telefono, direccion) ON clientes TO authenticated;
-- El propietario no puede activar/desactivar su restaurante (lo hace un admin).
GRANT UPDATE (nombre, descripcion, direccion, telefono, costo_envio_base) ON restaurantes TO authenticated;
GRANT INSERT, UPDATE ON productos TO authenticated;

-- ============================================================
-- 3. POLÍTICAS
-- ============================================================

-- restaurantes ------------------------------------------------
DROP POLICY IF EXISTS restaurantes_select ON restaurantes;
CREATE POLICY restaurantes_select ON restaurantes
    FOR SELECT TO anon, authenticated
    USING (activo OR id_restaurante = fn_restaurante_actual());

DROP POLICY IF EXISTS restaurantes_update_propietario ON restaurantes;
CREATE POLICY restaurantes_update_propietario ON restaurantes
    FOR UPDATE TO authenticated
    USING (id_restaurante = fn_restaurante_actual())
    WITH CHECK (id_restaurante = fn_restaurante_actual());

-- usuarios ----------------------------------------------------
DROP POLICY IF EXISTS usuarios_select_propio ON usuarios;
CREATE POLICY usuarios_select_propio ON usuarios
    FOR SELECT TO authenticated
    USING (auth_id = auth.uid());

DROP POLICY IF EXISTS usuarios_insert_propio ON usuarios;
CREATE POLICY usuarios_insert_propio ON usuarios
    FOR INSERT TO authenticated
    WITH CHECK (auth_id = auth.uid() AND rol = 'CLIENTE' AND id_restaurante IS NULL AND id_cliente IS NULL);

DROP POLICY IF EXISTS usuarios_update_propio ON usuarios;
CREATE POLICY usuarios_update_propio ON usuarios
    FOR UPDATE TO authenticated
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- clientes ----------------------------------------------------
DROP POLICY IF EXISTS clientes_select ON clientes;
CREATE POLICY clientes_select ON clientes
    FOR SELECT TO authenticated
    USING (
        id_cliente = fn_cliente_actual()
        OR EXISTS (
            SELECT 1 FROM pedidos p
            WHERE p.id_cliente = clientes.id_cliente
              AND p.id_restaurante = fn_restaurante_actual()
        )
    );

DROP POLICY IF EXISTS clientes_update_propio ON clientes;
CREATE POLICY clientes_update_propio ON clientes
    FOR UPDATE TO authenticated
    USING (id_cliente = fn_cliente_actual())
    WITH CHECK (id_cliente = fn_cliente_actual());

-- productos ---------------------------------------------------
DROP POLICY IF EXISTS productos_select_publico ON productos;
CREATE POLICY productos_select_publico ON productos
    FOR SELECT TO anon, authenticated
    USING (
        activo AND disponible
        AND EXISTS (SELECT 1 FROM restaurantes r WHERE r.id_restaurante = productos.id_restaurante AND r.activo)
    );

DROP POLICY IF EXISTS productos_select_propietario ON productos;
CREATE POLICY productos_select_propietario ON productos
    FOR SELECT TO authenticated
    USING (id_restaurante = fn_restaurante_actual());

-- Para que el detalle de pedidos antiguos muestre productos ya retirados
DROP POLICY IF EXISTS productos_select_en_mis_pedidos ON productos;
CREATE POLICY productos_select_en_mis_pedidos ON productos
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM detalle_pedido d JOIN pedidos p ON p.id_pedido = d.id_pedido
            WHERE d.id_producto = productos.id_producto AND p.id_usuario = fn_usuario_actual_id()
        )
    );

DROP POLICY IF EXISTS productos_insert_propietario ON productos;
CREATE POLICY productos_insert_propietario ON productos
    FOR INSERT TO authenticated
    WITH CHECK (id_restaurante = fn_restaurante_actual());

DROP POLICY IF EXISTS productos_update_propietario ON productos;
CREATE POLICY productos_update_propietario ON productos
    FOR UPDATE TO authenticated
    USING (id_restaurante = fn_restaurante_actual())
    WITH CHECK (id_restaurante = fn_restaurante_actual());

-- pedidos -----------------------------------------------------
DROP POLICY IF EXISTS pedidos_select ON pedidos;
CREATE POLICY pedidos_select ON pedidos
    FOR SELECT TO authenticated
    USING (id_usuario = fn_usuario_actual_id() OR id_restaurante = fn_restaurante_actual());

-- Tablas hijas: visibles si el pedido es visible (la subconsulta aplica la RLS de pedidos)
DROP POLICY IF EXISTS detalle_pedido_select ON detalle_pedido;
CREATE POLICY detalle_pedido_select ON detalle_pedido
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM pedidos p WHERE p.id_pedido = detalle_pedido.id_pedido));

DROP POLICY IF EXISTS entregas_select ON entregas;
CREATE POLICY entregas_select ON entregas
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM pedidos p WHERE p.id_pedido = entregas.id_pedido));

DROP POLICY IF EXISTS historial_select ON historial_estado_pedido;
CREATE POLICY historial_select ON historial_estado_pedido
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM pedidos p WHERE p.id_pedido = historial_estado_pedido.id_pedido));
