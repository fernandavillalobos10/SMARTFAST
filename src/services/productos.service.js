import { supabase } from '../config/supabase'

export async function listarRestaurantesActivos() {
  const { data, error } = await supabase
    .from('restaurantes')
    .select('id_restaurante, nombre, descripcion, costo_envio_base')
    .eq('activo', true)
    .order('nombre')
  if (error) throw error
  return data
}

// Solo productos disponible=true AND activo=true de restaurantes activos.
// Cada producto incluye `restaurante` (lo necesita CartContext).
export async function listarCatalogo() {
  const { data, error } = await supabase
    .from('productos')
    .select(
      'id_producto, nombre, descripcion, precio, stock, categoria, imagen_url, id_restaurante, ' +
        'restaurante:restaurantes!inner(id_restaurante, nombre, costo_envio_base, activo)',
    )
    .eq('disponible', true)
    .eq('activo', true)
    .eq('restaurantes.activo', true)
    .order('nombre')
  if (error) throw error
  return data
}
