import { supabase } from '../config/supabase'

const PERFIL_SELECT = '*, restaurante:restaurantes(*)'

export async function signIn({ correo, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: correo, password })
  if (error) throw error
  return data
}

// El trigger fn_crear_usuario_desde_auth crea usuarios + clientes con rol CLIENTE.
// Si el proyecto exige confirmar el correo, data.session viene en null.
export async function signUp({ nombre, correo, telefono, password }) {
  const { data, error } = await supabase.auth.signUp({
    email: correo,
    password,
    options: { data: { nombre, telefono: telefono || null } },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfile(authId) {
  const { data, error } = await supabase
    .from('usuarios')
    .select(PERFIL_SELECT)
    .eq('auth_id', authId)
    .maybeSingle()
  if (error) throw error
  return data
}

// Actualiza nombre/teléfono del perfil propio; si no existe (cuentas creadas antes
// de la migración) lo crea como CLIENTE. El rol y el restaurante nunca se envían.
export async function upsertProfile(user, { nombre, telefono } = {}) {
  const cambios = {
    nombre: nombre || user.user_metadata?.nombre || user.email.split('@')[0],
    telefono: telefono ?? user.user_metadata?.telefono ?? null,
  }

  const { data: actualizado, error: errorUpdate } = await supabase
    .from('usuarios')
    .update(cambios)
    .eq('auth_id', user.id)
    .select(PERFIL_SELECT)
    .maybeSingle()
  if (errorUpdate) throw errorUpdate
  if (actualizado) return actualizado

  const { data, error } = await supabase
    .from('usuarios')
    .insert({ auth_id: user.id, correo: user.email, ...cambios })
    .select(PERFIL_SELECT)
    .single()
  if (error) throw error
  return data
}
