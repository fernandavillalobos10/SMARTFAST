export const ROLES = {
  CLIENTE: 'CLIENTE',
  PROPIETARIO: 'PROPIETARIO',
}

export const TIPOS_ENTREGA = {
  DOMICILIO: 'DOMICILIO',
  RECOGER: 'RECOGER',
}

export const TIPO_ENTREGA_LABEL = {
  DOMICILIO: 'A domicilio',
  RECOGER: 'Recoger en local',
}

// Valores exactos de pedidos.estado (ver supabase/migrations/001_mvp_schema.sql)
export const ESTADOS_PEDIDO = {
  CREADO: { label: 'Recibido', tone: 'blue' },
  ACEPTADO: { label: 'Aceptado', tone: 'indigo' },
  EN_PREPARACION: { label: 'En preparación', tone: 'amber' },
  EN_CAMINO: { label: 'En camino', tone: 'purple' },
  ENTREGADO: { label: 'Entregado', tone: 'green' },
  CANCELADO: { label: 'Cancelado', tone: 'red' },
}

export const ESTADOS_ENTREGA = {
  PENDIENTE: { label: 'Pendiente', tone: 'slate' },
  EN_PREPARACION: { label: 'En preparación', tone: 'amber' },
  EN_CAMINO: { label: 'En camino', tone: 'purple' },
  ENTREGADO: { label: 'Entregado', tone: 'green' },
  CANCELADO: { label: 'Cancelado', tone: 'red' },
}

export const ESTADOS_ACTIVOS = ['CREADO', 'ACEPTADO', 'EN_PREPARACION', 'EN_CAMINO']

// Debe coincidir con las transiciones permitidas en cambiar_estado_pedido()
export function siguienteEstado(pedido) {
  switch (pedido.estado) {
    case 'CREADO':
      return 'ACEPTADO'
    case 'ACEPTADO':
      return 'EN_PREPARACION'
    case 'EN_PREPARACION':
      return pedido.tipo_entrega === TIPOS_ENTREGA.DOMICILIO ? 'EN_CAMINO' : 'ENTREGADO'
    case 'EN_CAMINO':
      return 'ENTREGADO'
    default:
      return null
  }
}

export const ACCION_ESTADO = {
  ACEPTADO: 'Aceptar',
  EN_PREPARACION: 'Preparar',
  EN_CAMINO: 'Enviar',
  ENTREGADO: 'Marcar entregado',
}

export function puedeCancelar(estado) {
  return ['CREADO', 'ACEPTADO', 'EN_PREPARACION'].includes(estado)
}

export const STOCK_BAJO = 5

export const LOCALE = 'es-MX'
export const MONEDA = 'MXN'
