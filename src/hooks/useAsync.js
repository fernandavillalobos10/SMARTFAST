import { useCallback, useEffect, useRef, useState } from 'react'

// Ejecuta `fn` al montar y cuando cambian `deps`. `recargar({ silencioso })`
// vuelve a pedir los datos sin mostrar el estado de carga.
export function useAsync(fn, deps) {
  const [estado, setEstado] = useState({ data: null, error: null, loading: true })
  const ultimaPeticion = useRef(0)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const ejecutar = useCallback(fn, deps)

  const recargar = useCallback(
    async ({ silencioso = false } = {}) => {
      const id = ++ultimaPeticion.current
      if (!silencioso) setEstado((s) => ({ ...s, loading: true, error: null }))
      try {
        const data = await ejecutar()
        if (id === ultimaPeticion.current) setEstado({ data, error: null, loading: false })
      } catch (error) {
        if (id === ultimaPeticion.current) setEstado((s) => ({ ...s, error, loading: false }))
      }
    },
    [ejecutar],
  )

  useEffect(() => {
    recargar()
  }, [recargar])

  const setData = useCallback(
    (valor) => setEstado((s) => ({ ...s, data: typeof valor === 'function' ? valor(s.data) : valor })),
    [],
  )

  return { ...estado, recargar, setData }
}
