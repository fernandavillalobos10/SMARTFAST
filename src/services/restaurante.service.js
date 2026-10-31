import { startOfDay } from 'date-fns'
import { supabase } from '../config/supabase'
import { ESTADOS_ACTIVOS, STOCK_BAJO } from '../lib/constants'

const PRODUCTO_CAMPOS = ['nombre', 'descripcion', 'categoria', 'precio', 'stock', 'imagen_url', 'disponible', 'activo']

function limpiarProducto(datos) {
  const fila = {}
  for (const campo of PRODUCTO_CAMPOS) {
    if (campo in datos) fila[campo] = datos[campo] === '' ? null : datos[campo]
  }
  return fila
}

export async function actualizarRestaurante(idRestaurante, datos) {
  const { nombre, descripcion, direccion, telefono, costo_envio_base } = datos
  const { data, error } = await supabase
    .from('restaurantes')
    .update({
      nombre,
      descripcion: descripcion || null,
      direccion: direccion || null,
      telefono: telefono || null,
      costo_envio_base,
    })
    .eq('id_restaurante', idRestaurante)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function listarProductosRestaurante(idRestaurante) {
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id_restaurante', idRestaurante)
    .order('nombre')
  if (error) throw error
  return data
}

export async function obtenerProducto(idProducto) {
  const { data, error } = await supabase.from('productos').select('*').eq('id_producto', idProducto).maybeSingle()
  if (error) throw error
  return data
}

export async function crearProducto(idRestaurante, datos) {
  const { data, error } = await supabase
    .from('productos')
    .insert({ ...limpiarProducto(datos), id_restaurante: idRestaurante })
    .select()
    .single()
  if (error) throw error
  return data
}

// No hay borrado físico: detalle_pedido referencia productos. "Eliminar" = activo=false.
export async function actualizarProducto(idProducto, datos) {
  const { data, error } = await supabase
    .from('productos')
    .update(limpiarProducto(datos))
    .eq('id_producto', idProducto)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function resumenRestaurante(idRestaurante) {
  const desde = startOfDay(new Date()).toISOString()
  const [hoy, activos, stockBajo] = await Promise.all([
    supabase.from('pedidos').select('estado, total').eq('id_restaurante', idRestaurante).gte('fecha_pedido', desde),
    supabase.from('pedidos').select('estado').eq('id_restaurante', idRestaurante).in('estado', ESTADOS_ACTIVOS),
    supabase
      .from('productos')
      .select('id_producto, nombre, stock')
      .eq('id_restaurante', idRestaurante)
      .eq('activo', true)
      .lt('stock', STOCK_BAJO)
      .order('stock'),
  ])
  for (const r of [hoy, activos, stockBajo]) if (r.error) throw r.error

  const porEstado = Object.fromEntries(ESTADOS_ACTIVOS.map((e) => [e, 0]))
  for (const p of activos.data) porEstado[p.estado] += 1

  const entregadosHoy = hoy.data.filter((p) => p.estado === 'ENTREGADO')
  return {
    pedidosHoy: hoy.data.length,
    ventasHoy: entregadosHoy.reduce((s, p) => s + Number(p.total), 0),
    porEstado,
    stockBajo: stockBajo.data,
  }
}
