import { useAuth } from './useAuth'

export function useRestaurant() {
  const { restaurante, refrescarPerfil } = useAuth()
  return {
    restaurante,
    idRestaurante: restaurante?.id_restaurante ?? null,
    refrescarRestaurante: refrescarPerfil,
  }
}
