import assert from 'node:assert/strict'

export async function runRlsTests({ db, as, rejects, U, p1, p2, p3, cli }) {
  const rows = async (uid, sql, params) => as(uid, async () => (await db.query(sql, params)).rows)
  const ids = (r, k = 'id_pedido') => r.map((x) => x[k]).sort((a, b) => a - b)

  // ---- anon
  const prodAnon = await rows(null, 'SELECT nombre FROM productos ORDER BY id_producto')
  assert.deepEqual(prodAnon.map((p) => p.nombre), ['Taco', 'Agua', 'Pizza'], 'anon sees only published products')
  assert.equal((await rows(null, 'SELECT * FROM restaurantes')).length, 2)
  await rejects(rows(null, 'SELECT * FROM pedidos'), /permission denied/)
  await rejects(rows(null, `INSERT INTO pedidos (id_cliente) VALUES (1)`), /permission denied/)
  await rejects(rows(null, `UPDATE productos SET stock = 999`), /permission denied/)
  // invitado puede crear pedidos vía RPC
  const g = await rows(null, `SELECT crear_pedido(1, 'RECOGER', 'Inv', '555', null, null, '[{"id_producto":1,"cantidad":1}]') AS id`)
  assert.ok(g[0].id)

  // inactive restaurant hides its products
  await db.exec(`UPDATE restaurantes SET activo = false WHERE id_restaurante = 2`)
  assert.equal((await rows(null, 'SELECT * FROM productos WHERE id_restaurante = 2')).length, 0)
  assert.equal((await rows(U.own2, 'SELECT * FROM productos WHERE id_restaurante = 2')).length, 1, 'owner still sees own')
  assert.equal((await rows(U.own2, 'SELECT * FROM restaurantes WHERE id_restaurante = 2')).length, 1)
  await db.exec(`UPDATE restaurantes SET activo = true WHERE id_restaurante = 2`)

  // ---- cliente
  assert.deepEqual(ids(await rows(U.cli, 'SELECT id_pedido FROM pedidos')), [p1, p3].sort((a, b) => a - b))
  assert.equal((await rows(U.cli, 'SELECT * FROM usuarios')).length, 1, 'only own profile')
  assert.equal((await rows(U.cli, 'SELECT * FROM clientes')).length, 1)
  assert.ok((await rows(U.cli, 'SELECT * FROM detalle_pedido')).every((d) => [p1, p3].includes(d.id_pedido)))
  assert.deepEqual(ids(await rows(U.cli, 'SELECT id_pedido FROM entregas')), [p1])
  assert.ok((await rows(U.cli, 'SELECT * FROM historial_estado_pedido')).every((h) => [p1, p3].includes(h.id_pedido)))
  // the hidden product (Oculto) is not visible; products from own orders are
  await db.exec(`UPDATE productos SET activo = false WHERE id_producto = 2`)
  assert.equal((await rows(U.cli, 'SELECT * FROM productos WHERE id_producto = 2')).length, 1, 'retired product visible in own order')
  assert.equal((await rows(null, 'SELECT * FROM productos WHERE id_producto = 2')).length, 0)
  await db.exec(`UPDATE productos SET activo = true WHERE id_producto = 2`)

  const upd = await rows(U.cli, `UPDATE usuarios SET nombre = 'Ana B' WHERE auth_id = $1 RETURNING nombre`, [U.cli])
  assert.equal(upd[0].nombre, 'Ana B')
  await rejects(rows(U.cli, `UPDATE usuarios SET rol = 'PROPIETARIO', id_restaurante = 1`), /permission denied/)
  assert.equal((await rows(U.cli, `UPDATE usuarios SET nombre = 'x' WHERE auth_id <> $1 RETURNING 1`, [U.cli])).length, 0)
  await rejects(rows(U.cli, `UPDATE pedidos SET estado = 'ENTREGADO'`), /permission denied/)
  assert.equal((await rows(U.cli, `UPDATE productos SET stock = 0 RETURNING 1`)).length, 0, 'client cannot edit products')
  await rejects(rows(U.cli, `INSERT INTO productos (nombre, precio, id_restaurante) VALUES ('x', 1, 1)`), /row-level security/)

  // self-insert profile (fallback) only as CLIENTE
  await db.exec(`DELETE FROM usuarios WHERE auth_id = '00000000-0000-0000-0000-000000000004'`)
  await db.exec(`ALTER TABLE auth.users DISABLE TRIGGER trg_auth_crear_usuario;
    INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000004', 'new@x.com', '{}');
    ALTER TABLE auth.users ENABLE TRIGGER trg_auth_crear_usuario;`)
  const nuevo = '00000000-0000-0000-0000-000000000004'
  await rejects(rows(nuevo, `INSERT INTO usuarios (auth_id, nombre, correo, rol) VALUES ($1, 'n', 'new@x.com', 'PROPIETARIO')`, [nuevo]), /permission denied/)
  await rejects(rows(nuevo, `INSERT INTO usuarios (auth_id, nombre, correo) VALUES ($1, 'n', 'new@x.com')`, [U.cli]), /row-level security|duplicate/)
  const ins = await rows(nuevo, `INSERT INTO usuarios (auth_id, nombre, correo) VALUES ($1, 'n', 'new@x.com') RETURNING rol`, [nuevo])
  assert.equal(ins[0].rol, 'CLIENTE')

  // ---- propietario
  const own = await rows(U.own, 'SELECT id_pedido FROM pedidos')
  assert.ok(ids(own).includes(p1) && ids(own).includes(p2) && ids(own).includes(p3))
  assert.equal((await rows(U.own2, 'SELECT id_pedido FROM pedidos')).length, 0)
  assert.equal((await rows(U.own2, 'SELECT * FROM entregas')).length, 0)
  assert.equal((await rows(U.own2, 'SELECT * FROM detalle_pedido')).length, 0)
  assert.ok((await rows(U.own, 'SELECT * FROM clientes')).length >= 2, 'owner sees clients of its orders')
  assert.equal((await rows(U.own2, 'SELECT * FROM clientes')).length, 1, 'only own clientes row')

  const nuevoProd = await rows(U.own, `INSERT INTO productos (nombre, precio, stock, id_restaurante) VALUES ('Nuevo', 5, 1, 1) RETURNING id_producto`)
  assert.ok(nuevoProd[0].id_producto)
  await rejects(rows(U.own, `INSERT INTO productos (nombre, precio, id_restaurante) VALUES ('x', 1, 2)`), /row-level security/)
  assert.equal((await rows(U.own, `UPDATE productos SET stock = 0 WHERE id_restaurante = 2 RETURNING 1`)).length, 0)
  await rejects(rows(U.own, `UPDATE productos SET id_restaurante = 2 WHERE id_producto = $1`, [nuevoProd[0].id_producto]), /row-level security/)
  await rejects(rows(U.own, `DELETE FROM productos WHERE id_producto = $1`, [nuevoProd[0].id_producto]), /permission denied/)
  const allOwn = await rows(U.own, 'SELECT nombre FROM productos WHERE id_restaurante = 1')
  assert.ok(allOwn.some((p) => p.nombre === 'Oculto'), 'owner sees unavailable products')

  const r = await rows(U.own, `UPDATE restaurantes SET costo_envio_base = 40 RETURNING id_restaurante`)
  assert.deepEqual(r.map((x) => x.id_restaurante), [1], 'owner updates only own restaurant')
  await rejects(rows(U.own, `UPDATE restaurantes SET activo = false WHERE id_restaurante = 1`), /permission denied/)
  await rejects(rows(U.own, `UPDATE pedidos SET estado = 'ENTREGADO' WHERE id_pedido = $1`, [p2]), /permission denied/)
  await rejects(rows(U.own, `INSERT INTO historial_estado_pedido (id_pedido, estado_nuevo) VALUES ($1, 'X')`, [p2]), /permission denied/)

  // state change RPC still works under RLS for the owner
  const g2 = g[0].id
  await rows(U.own, `SELECT cambiar_estado_pedido($1, 'ACEPTADO')`, [g2])
  assert.equal((await rows(U.cli, 'SELECT * FROM pedidos WHERE id_pedido = $1', [g2])).length, 0, 'client cannot see guest order')

  void cli
  console.log('rls ok')
}
