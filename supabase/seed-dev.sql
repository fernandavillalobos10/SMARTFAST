-- SMARTFAST - DATOS DE DESARROLLO (opcional)
-- Ejecutar después de smartfast.sql, migrations/001_mvp_schema.sql y rls.sql.
-- Idempotente: no duplica restaurantes ni productos si ya existen por nombre.
--
-- Para tener un PROPIETARIO: regístrate en la app con el correo de v_correo_propietario
-- (o cámbialo abajo) y vuelve a ejecutar este script.

DO $$
DECLARE
    v_correo_propietario TEXT := 'propietario@smartfast.test';
    v_burger BIGINT;
    v_tacos BIGINT;
BEGIN
    SELECT id_restaurante INTO v_burger FROM restaurantes WHERE nombre = 'Smart Burger';
    IF v_burger IS NULL THEN
        INSERT INTO restaurantes (nombre, descripcion, direccion, telefono, costo_envio_base)
        VALUES ('Smart Burger', 'Hamburguesas al carbón y papas crujientes', 'Av. Central 120', '5550001111', 35)
        RETURNING id_restaurante INTO v_burger;
    END IF;

    SELECT id_restaurante INTO v_tacos FROM restaurantes WHERE nombre = 'Taquería Fast';
    IF v_tacos IS NULL THEN
        INSERT INTO restaurantes (nombre, descripcion, direccion, telefono, costo_envio_base)
        VALUES ('Taquería Fast', 'Tacos al pastor, de suadero y más', 'Calle 5 de Mayo 45', '5550002222', 25)
        RETURNING id_restaurante INTO v_tacos;
    END IF;

    INSERT INTO productos (id_restaurante, nombre, descripcion, precio, stock, categoria)
    SELECT v.id_restaurante, v.nombre, v.descripcion, v.precio, v.stock, v.categoria
    FROM (VALUES
        (v_burger, 'Smart Clásica', 'Carne de res, queso cheddar, lechuga y tomate', 129.00, 25, 'Hamburguesas'),
        (v_burger, 'Doble Bacon', 'Doble carne, tocino y salsa de la casa', 169.00, 15, 'Hamburguesas'),
        (v_burger, 'Papas Fast', 'Papas a la francesa con sal de mar', 49.00, 40, 'Complementos'),
        (v_burger, 'Malteada de vainilla', '400 ml', 65.00, 3, 'Bebidas'),
        (v_tacos, 'Orden de pastor', '5 tacos con piña, cebolla y cilantro', 95.00, 30, 'Tacos'),
        (v_tacos, 'Orden de suadero', '5 tacos de suadero', 90.00, 20, 'Tacos'),
        (v_tacos, 'Agua de horchata', '1 litro', 35.00, 0, 'Bebidas')
    ) AS v(id_restaurante, nombre, descripcion, precio, stock, categoria)
    WHERE NOT EXISTS (
        SELECT 1 FROM productos p WHERE p.id_restaurante = v.id_restaurante AND p.nombre = v.nombre
    );

    UPDATE usuarios
    SET rol = 'PROPIETARIO', id_restaurante = v_burger
    WHERE correo = v_correo_propietario;
END $$;
