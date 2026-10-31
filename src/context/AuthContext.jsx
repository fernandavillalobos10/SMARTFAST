import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../config/supabase'
import * as authService from '../services/auth.service'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [perfil, setPerfil] = useState(null)
  const [errorPerfil, setErrorPerfil] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setCargandoSesion(false)
    })
    // No se llama a Supabase dentro del callback (puede bloquear el cliente);
    // el perfil se carga en el efecto que depende del id de usuario.
    const { data } = supabase.auth.onAuthStateChange((_event, nuevaSesion) => {
      setSession(nuevaSesion)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const user = session?.user ?? null
  const userId = user?.id

  const cargarPerfil = useCallback(async (authUser) => {
    setErrorPerfil(null)
    try {
      const encontrado = await authService.getProfile(authUser.id)
      setPerfil(encontrado ?? (await authService.upsertProfile(authUser)))
    } catch (error) {
      setPerfil(null)
      setErrorPerfil(error)
    }
  }, [])

  useEffect(() => {
    if (!userId) {
      setPerfil(null)
      setErrorPerfil(null)
      return
    }
    cargarPerfil(session.user)
    // Solo recargar cuando cambia el usuario, no en cada refresco del token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, cargarPerfil])

  // Derivado para evitar un render intermedio con sesión pero sin perfil
  const cargandoPerfil = Boolean(userId) && perfil?.auth_id !== userId && !errorPerfil

  const value = useMemo(
    () => ({
      session,
      user,
      perfil: perfil?.auth_id === userId ? perfil : null,
      restaurante: perfil?.auth_id === userId ? (perfil.restaurante ?? null) : null,
      rol: perfil?.auth_id === userId ? perfil.rol : null,
      loading: cargandoSesion || cargandoPerfil,
      errorPerfil,
      signIn: authService.signIn,
      signUp: authService.signUp,
      signOut: authService.signOut,
      refrescarPerfil: () => user && cargarPerfil(user),
      actualizarPerfil: async (datos) => setPerfil(await authService.upsertProfile(user, datos)),
    }),
    [session, user, userId, perfil, cargandoSesion, cargandoPerfil, errorPerfil, cargarPerfil],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
