import { supabase } from '../config/supabase'
import { TIPOS_ENTREGA } from '../lib/constants'

const DETALLE_SELECT =
  '*, restaurante:restaurantes(id_restaurante, nombre, direccion, telefono), ' +
  'detalle_pedido(id_detalle, cantidad, precio_unitario, producto:productos(id_producto, nombre, imagen_url)), ' +
  'entrega:entregas(*), historial:historial_estado_pedido(*)'

const TARJETA_SELECT =
  'id_pedido, fecha_pedido, estado, tipo_entrega, nombre_contacto, telefono_contacto, direccion_entrega, notas, total, ' +
  'detalle_pedido(id_detalle, cantidad, producto:productos(nombre))'

// Inserta pedidos + detalle_pedido + entregas + historial en una sola transacción
// (función crear_pedido). El stock NO se descuenta aquí, sino al aceptar.
export async function crearPedido({ idRestaurante, tipoEntrega, nombreContacto, telefonoContacto, direccionEntrega, notas, items }) {
  const { data, error } = await supabase.rpc('crear_pedido', {
    p_id_restaurante: idRestaurante,
    p_tipo_entrega: tipoEntrega,
    p_nombre_contacto: nombreContacto,
    p_telefono_contacto: telefonoContacto,
    p_direccion_entrega: tipoEntrega === TIPOS_ENTREGA.DOMICILIO ? direccionEntrega : null,
    p_notas: notas || null,
    p_items: items.map(({ id_producto, cantidad }) => ({ id_producto, cantidad })),
  })
  if (error) throw error
  return data
}

// Descuenta/devuelve stock, sincroniza entregas e inserta historial (cambiar_estado_pedido).
export async function cambiarEstadoPedido(idPedido, estado, comentario = null) {
  const { data, error } = await supabase.rpc('cambiar_estado_pedido', {
    p_id_pedido: idPedido,
    p_estado_nuevo: estado,
    p_comentario: comentario,
  })
  if (error) throw error
  return data
}

export async function listarMisPedidos(idUsuario) {
  const { data, error } = await supabase
    .from('pedidos')
    .select('id_pedido, fecha_pedido, estado, tipo_entrega, total, restaurante:restaurantes(nombre), detalle_pedido(cantidad)')
    .eq('id_usuario', idUsuario)
    .order('fecha_pedido', { ascending: false })
  if (error) throw error
  return data
}

export async function obtenerPedido(idPedido) {
  const { data, error } = await supabase
    .from('pedidos')
    .select(DETALLE_SELECT)
    .eq('id_pedido', idPedido)
    .maybeSingle()
  if (error) throw error
  data?.historial?.sort((a, b) => a.id_historial - b.id_historial)
  return data
}

export async function listarPedidosRestaurante(idRestaurante, { estados, ascendente = false, limite = 100 } = {}) {
  let query = supabase
    .from('pedidos')
    .select(TARJETA_SELECT)
    .eq('id_restaurante', idRestaurante)
    .order('fecha_pedido', { ascending: ascendente })
    .limit(limite)
  if (estados) query = query.in('estado', estados)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function listarEntregas(idRestaurante, { estado } = {}) {
  let query = supabase
    .from('entregas')
    .select(
      '*, pedido:pedidos!inner(id_pedido, id_restaurante, fecha_pedido, estado, tipo_entrega, nombre_contacto, telefono_contacto, total)',
    )
    .eq('pedido.id_restaurante', idRestaurante)
    .order('id_entrega', { ascending: false })
  if (estado) query = query.eq('estado_entrega', estado)
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function obtenerEntrega(idEntrega) {
  const { data, error } = await supabase.from('entregas').select('id_entrega, id_pedido').eq('id_entrega', idEntrega).maybeSingle()
  if (error) throw error
  return data
}

// Escucha cambios de pedidos del restaurante (requiere Realtime activado en la tabla pedidos).
export function suscribirPedidosRestaurante(idRestaurante, alCambiar) {
  const canal = supabase
    .channel(`pedidos-restaurante-${idRestaurante}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'pedidos', filter: `id_restaurante=eq.${idRestaurante}` },
      alCambiar,
    )
    .subscribe()
  return () => supabase.removeChannel(canal)
}
