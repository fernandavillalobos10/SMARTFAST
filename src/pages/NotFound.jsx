import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, EmptyState } from '../components/ui'

export default function NotFound() {
  return (
    <EmptyState
      icon={Compass}
      title="Página no encontrada"
      description="La dirección que buscas no existe o fue movida."
      action={
        <Button as={Link} to="/">
          Ir al inicio
        </Button>
      }
    />
  )
}
