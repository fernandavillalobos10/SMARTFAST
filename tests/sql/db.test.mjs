import { PGlite } from '@electric-sql/pglite'
import { readFileSync, existsSync } from 'node:fs'
import assert from 'node:assert/strict'

// Ejecuta smartfast.sql + migraciones + RLS sobre PGlite (Postgres en WASM)
// con stubs mínimos de Supabase (auth.users, auth.uid(), roles anon/authenticated).
const root = process.argv[2] ?? process.cwd()
const db = new PGlite()
const read = (p) => readFileSync(`${root}/${p}`, 'utf8')

// Supabase stubs
await db.exec(`
  CREATE SCHEMA auth;
  CREATE TABLE auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
  CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS
    $$ SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  CREATE ROLE anon; CREATE ROLE authenticated;
  GRANT USAGE ON SCHEMA public, auth TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
  ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
  GRANT EXECUTE ON FUNCTION auth.uid() TO anon, authenticated;
`)

await db.exec(read('smartfast.sql'))
// legacy row must survive
await db.exec(`INSERT INTO clientes (nombre) VALUES ('legacy');
  INSERT INTO pedidos (id_cliente, estado) VALUES (1, 'Pendiente');`)
await db.exec(read('supabase/migrations/001_mvp_schema.sql'))
await db.exec(read('supabase/migrations/001_mvp_schema.sql')) // idempotent
const hasRls = existsSync(`${root}/supabase/rls.sql`)
if (hasRls) {
  await db.exec(read('supabase/rls.sql'))
  await db.exec(read('supabase/rls.sql'))
}

const U = {
  cli: '00000000-0000-0000-0000-000000000001',
  own: '00000000-0000-0000-0000-000000000002',
  own2: '00000000-0000-0000-0000-000000000003',
}

async function as(uid, fn, role = uid ? 'authenticated' : 'anon') {
  await db.exec('BEGIN')
  try {
    await db.query(`SELECT set_config('request.jwt.claim.sub', $1, true)`, [uid ?? ''])
    await db.exec(`SET LOCAL ROLE ${role}`)
    const r = await fn()
    await db.exec('COMMIT')
    return r
  } catch (e) {
    await db.exec('ROLLBACK')
    throw e
  }
}
const one = async (sql, params) => (await db.query(sql, params)).rows[0]
const rejects = async (p, re) => {
  try { await p } catch (e) { assert.match(e.message, re); return }
  assert.fail(`expected error ${re}`)
}

// signup trigger
await db.exec(`
  INSERT INTO auth.users VALUES
   ('${U.cli}', 'cli@x.com', '{"nombre":"Ana","telefono":"555","rol":"PROPIETARIO"}'),
   ('${U.own}', 'own@x.com', '{}'),
   ('${U.own2}', 'own2@x.com', '{}');
  INSERT INTO restaurantes (nombre, costo_envio_base) VALUES ('R1', 30), ('R2', 10);
  UPDATE usuarios SET rol='PROPIETARIO', id_restaurante=1 WHERE auth_id='${U.own}';
  UPDATE usuarios SET rol='PROPIETARIO', id_restaurante=2 WHERE auth_id='${U.own2}';
  INSERT INTO productos (nombre, precio, stock, id_restaurante) VALUES
   ('Taco', 20, 5, 1), ('Agua', 10, 1, 1), ('Pizza', 100, 3, 2);
  INSERT INTO productos (nombre, precio, stock, id_restaurante, disponible) VALUES ('Oculto', 1, 9, 1, false);
`)
const cli = await one(`SELECT * FROM usuarios WHERE auth_id='${U.cli}'`)
assert.equal(cli.rol, 'CLIENTE', 'role never taken from metadata')
assert.equal(cli.nombre, 'Ana')
assert.ok(cli.id_cliente)
const owner = await one(`SELECT * FROM usuarios WHERE auth_id='${U.own}'`)
assert.equal(owner.nombre, 'own')

const crear = (uid, rest, tipo, dir, items) => as(uid, () => one(
  `SELECT crear_pedido($1, $2, 'Ana', '555', $3, null, $4::jsonb) AS id`,
  [rest, tipo, dir, JSON.stringify(items)]))

// validations
await rejects(crear(U.cli, 1, 'DOMICILIO', '  ', [{ id_producto: 1, cantidad: 1 }]), /dirección/)
await rejects(crear(U.cli, 1, 'RECOGER', null, [{ id_producto: 3, cantidad: 1 }]), /mismo restaurante/)
await rejects(crear(U.cli, 1, 'RECOGER', null, [{ id_producto: 4, cantidad: 1 }]), /no está disponible/)
await rejects(crear(U.cli, 1, 'RECOGER', null, []), /no tiene productos/)
await rejects(crear(U.cli, 1, 'RECOGER', null, [{ id_producto: 2, cantidad: 2 }]), /Stock insuficiente/)

// domicilio order by registered client
const p1 = (await crear(U.cli, 1, 'DOMICILIO', 'Calle 1', [{ id_producto: 1, cantidad: 2 }, { id_producto: 2, cantidad: 1 }])).id
let ped = await one(`SELECT * FROM pedidos WHERE id_pedido=$1`, [p1])
assert.equal(ped.estado, 'CREADO')
assert.equal(Number(ped.subtotal), 50)
assert.equal(Number(ped.total), 80)
assert.equal(ped.id_cliente, cli.id_cliente)
assert.equal(ped.id_usuario, cli.id_usuario)
assert.equal((await one(`SELECT estado_entrega FROM entregas WHERE id_pedido=$1`, [p1])).estado_entrega, 'PENDIENTE')
assert.equal((await one(`SELECT stock FROM productos WHERE id_producto=1`)).stock, 5, 'no stock change on create')

// guest pickup order
const p2 = (await crear(null, 1, 'RECOGER', 'ignored', [{ id_producto: 1, cantidad: 1 }])).id
ped = await one(`SELECT * FROM pedidos WHERE id_pedido=$1`, [p2])
assert.equal(ped.id_usuario, null)
assert.equal(ped.direccion_entrega, null)
assert.equal(Number(ped.costo_envio), 0)
assert.ok(ped.id_cliente)
assert.equal((await one(`SELECT count(*)::int c FROM entregas WHERE id_pedido=$1`, [p2])).c, 0)

const estado = (uid, id, e) => as(uid, () => one(`SELECT cambiar_estado_pedido($1, $2) AS e`, [id, e]))
const stock = async (id) => (await one(`SELECT stock FROM productos WHERE id_producto=$1`, [id])).stock

// permissions
await rejects(estado(U.cli, p1, 'ACEPTADO'), /permiso/)
await rejects(estado(U.own2, p1, 'ACEPTADO'), /permiso/)
await rejects(estado(null, p1, 'CANCELADO'), /iniciar sesión|permission denied/)
await rejects(estado(U.own, p1, 'EN_CAMINO'), /Transición/)

// accept -> stock discounted
await estado(U.own, p1, 'ACEPTADO')
assert.equal(await stock(1), 3)
assert.equal(await stock(2), 0)
await rejects(estado(U.cli, p1, 'CANCELADO'), /permiso/, 'client cannot cancel after accept')

// p3 cannot be accepted now (Agua stock 0) -> rollback keeps Taco stock
const p3 = (await crear(U.cli, 1, 'RECOGER', null, [{ id_producto: 1, cantidad: 1 }, { id_producto: 1, cantidad: 1 }])).id
await db.exec(`UPDATE productos SET stock = 1 WHERE id_producto = 1`)
await rejects(estado(U.own, p3, 'ACEPTADO'), /Stock insuficiente/)
assert.equal(await stock(1), 1)
await db.exec(`UPDATE productos SET stock = 3 WHERE id_producto = 1`)
// client cancels own CREADO order -> no stock returned
await estado(U.cli, p3, 'CANCELADO')
assert.equal(await stock(1), 3)

// full domicilio flow
await estado(U.own, p1, 'EN_PREPARACION')
assert.equal((await one(`SELECT estado_entrega FROM entregas WHERE id_pedido=$1`, [p1])).estado_entrega, 'EN_PREPARACION')
await estado(U.own, p1, 'EN_CAMINO')
let ent = await one(`SELECT * FROM entregas WHERE id_pedido=$1`, [p1])
assert.equal(ent.estado_entrega, 'EN_CAMINO'); assert.ok(ent.fecha_salida)
await estado(U.own, p1, 'ENTREGADO')
ent = await one(`SELECT * FROM entregas WHERE id_pedido=$1`, [p1])
assert.equal(ent.estado_entrega, 'ENTREGADO'); assert.ok(ent.fecha_entrega)
await rejects(estado(U.own, p1, 'CANCELADO'), /Transición/)
const hist = (await db.query(`SELECT estado_anterior, estado_nuevo FROM historial_estado_pedido WHERE id_pedido=$1 ORDER BY id_historial`, [p1])).rows
assert.deepEqual(hist.map((h) => h.estado_nuevo), ['CREADO', 'ACEPTADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO'])

// pickup: accept, prepare, cancel -> stock returned
await estado(U.own, p2, 'ACEPTADO')
assert.equal(await stock(1), 2)
await estado(U.own, p2, 'EN_PREPARACION')
await rejects(estado(U.own, p2, 'EN_CAMINO'), /Transición/)
await estado(U.own, p2, 'CANCELADO')
assert.equal(await stock(1), 3)
assert.equal((await one(`SELECT stock_descontado FROM pedidos WHERE id_pedido=$1`, [p2])).stock_descontado, false)

// legacy row intact
assert.equal((await one(`SELECT estado FROM pedidos WHERE id_pedido=1`)).estado, 'Pendiente')

if (hasRls) {
  const { runRlsTests } = await import('./rls-tests.mjs')
  await runRlsTests({ db, as, one, rejects, U, p1, p2, p3, cli, owner })
}

if (existsSync(`${root}/supabase/seed-dev.sql`)) {
  await db.exec(`INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000009', 'propietario@smartfast.test', '{}')`)
  await db.exec(read('supabase/seed-dev.sql'))
  await db.exec(read('supabase/seed-dev.sql'))
  const seeded = await one(`SELECT count(*)::int c FROM productos p JOIN restaurantes r USING (id_restaurante) WHERE r.nombre IN ('Smart Burger','Taquería Fast')`)
  assert.equal(seeded.c, 7, 'seed idempotent')
  const prop = await one(`SELECT rol, id_restaurante FROM usuarios WHERE correo='propietario@smartfast.test'`)
  assert.equal(prop.rol, 'PROPIETARIO')
  console.log('seed ok')
}

console.log('ALL SQL TESTS PASSED' + (hasRls ? ' (incl. RLS)' : ''))
