import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { TIPOS_ENTREGA } from '../lib/constants'

export const CartContext = createContext(null)

const STORAGE_KEY = 'smartfast:carrito'
const VACIO = { restaurante: null, items: [], tipoEntrega: TIPOS_ENTREGA.DOMICILIO }

function leerCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return guardado?.items ? { ...VACIO, ...guardado } : VACIO
  } catch {
    return VACIO
  }
}

function aItem(producto, cantidad) {
  return {
    id_producto: producto.id_producto,
    nombre: producto.nombre,
    precio: Number(producto.precio),
    stock: producto.stock,
    imagen_url: producto.imagen_url ?? null,
    cantidad: Math.min(cantidad, producto.stock),
  }
}

function aRestaurante(producto) {
  const r = producto.restaurante
  return { id_restaurante: r.id_restaurante, nombre: r.nombre, costo_envio_base: Number(r.costo_envio_base) }
}

// Regla de negocio: un pedido solo puede tener productos de un restaurante.
export function CartProvider({ children }) {
  const [carrito, setCarrito] = useState(leerCarrito)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito))
    } catch {
      // almacenamiento no disponible (modo privado): el carrito vive solo en memoria
    }
  }, [carrito])

  // producto debe incluir `restaurante` (ver productos.service#listarCatalogo)
  const agregar = useCallback(
    (producto, cantidad = 1) => {
      if (carrito.restaurante && carrito.restaurante.id_restaurante !== producto.id_restaurante) {
        return { ok: false, motivo: 'OTRO_RESTAURANTE', restauranteActual: carrito.restaurante.nombre }
      }
      const existente = carrito.items.find((i) => i.id_producto === producto.id_producto)
      const nuevaCantidad = (existente?.cantidad ?? 0) + cantidad
      if (producto.stock <= 0 || nuevaCantidad > producto.stock) {
        return { ok: false, motivo: 'SIN_STOCK' }
      }
      setCarrito((c) => ({
        ...c,
        restaurante: c.restaurante ?? aRestaurante(producto),
        items: existente
          ? c.items.map((i) => (i.id_producto === producto.id_producto ? aItem(producto, nuevaCantidad) : i))
          : [...c.items, aItem(producto, cantidad)],
      }))
      return { ok: true }
    },
    [carrito],
  )

  const reemplazarCon = useCallback((producto, cantidad = 1) => {
    setCarrito((c) => ({ ...VACIO, tipoEntrega: c.tipoEntrega, restaurante: aRestaurante(producto), items: [aItem(producto, cantidad)] }))
  }, [])

  const actualizarCantidad = useCallback((idProducto, cantidad) => {
    setCarrito((c) => {
      const items = c.items
        .map((i) => (i.id_producto === idProducto ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i))
        .filter((i) => i.cantidad > 0)
      return items.length ? { ...c, items } : { ...VACIO, tipoEntrega: c.tipoEntrega }
    })
  }, [])

  const quitar = useCallback((idProducto) => actualizarCantidad(idProducto, 0), [actualizarCantidad])

  const vaciar = useCallback(() => setCarrito((c) => ({ ...VACIO, tipoEntrega: c.tipoEntrega })), [])

  const setTipoEntrega = useCallback((tipoEntrega) => setCarrito((c) => ({ ...c, tipoEntrega })), [])

  const value = useMemo(() => {
    const subtotal = carrito.items.reduce((s, i) => s + i.precio * i.cantidad, 0)
    const costoEnvio =
      carrito.restaurante && carrito.tipoEntrega === TIPOS_ENTREGA.DOMICILIO ? carrito.restaurante.costo_envio_base : 0
    return {
      ...carrito,
      cantidadTotal: carrito.items.reduce((s, i) => s + i.cantidad, 0),
      subtotal,
      costoEnvio,
      total: subtotal + costoEnvio,
      agregar,
      reemplazarCon,
      actualizarCantidad,
      quitar,
      vaciar,
      setTipoEntrega,
    }
  }, [carrito, agregar, reemplazarCon, actualizarCantidad, quitar, vaciar, setTipoEntrega])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
