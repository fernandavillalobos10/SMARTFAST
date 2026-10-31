import { ROLES } from '../lib/constants'
import { useAuth } from './useAuth'

export function rutaInicio(rol) {
  return rol === ROLES.PROPIETARIO ? '/restaurante' : '/catalogo'
}

export function useRole() {
  const { rol } = useAuth()
  return {
    rol,
    esPropietario: rol === ROLES.PROPIETARIO,
    esCliente: rol === ROLES.CLIENTE,
    rutaInicio: rutaInicio(rol),
  }
}
