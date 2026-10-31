import { ArrowRight, ChefHat, ClipboardList, ShoppingBag, Truck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui'
import { useAuth } from '../../hooks/useAuth'

const modulos = [
  {
    icon: ShoppingBag,
    titulo: 'Para clientes',
    texto: 'Explora el menú, arma tu pedido y síguelo en tiempo real. Sin cuenta también puedes pedir.',
  },
  {
    icon: ChefHat,
    titulo: 'Para cocinas',
    texto: 'Tablero por estados para aceptar, preparar y despachar pedidos con control automático de stock.',
  },
  {
    icon: Truck,
    titulo: 'Para entregas',
    texto: 'Lista de entregas pendientes con dirección y contacto, sincronizada con cada pedido.',
  },
]

const pasos = ['Elige un restaurante', 'Añade tus productos', 'Confirma y recibe']

export default function Landing() {
  const { session } = useAuth()
  return (
    <div className="space-y-16 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 text-white sm:px-12 sm:py-20">
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-500/40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-brand-600/20 blur-3xl" aria-hidden="true" />
        <div className="relative max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-brand-200">
            <ClipboardList className="h-3.5 w-3.5" aria-hidden="true" /> Pedidos, cocina y entregas en un solo lugar
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Tu comida favorita, <span className="text-brand-400">más rápido</span>.
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            SmartFast conecta a clientes con restaurantes: pide en segundos y deja que la cocina haga el resto.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button as={Link} to="/catalogo" size="lg">
              Ver menú <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            {!session && (
              <Button as={Link} to="/registro" size="lg" variant="secondary">
                Crear cuenta
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {modulos.map(({ icon: Icon, titulo, texto }) => (
          <article key={titulo} className="rounded-2xl bg-white p-6 shadow-card ring-1 ring-slate-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-500">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-semibold">{titulo}</h2>
            <p className="mt-1.5 text-sm text-slate-600">{texto}</p>
          </article>
        ))}
      </section>

      <section className="text-center">
        <h2 className="text-2xl font-bold">Así de fácil</h2>
        <ol className="mx-auto mt-8 grid max-w-3xl gap-6 sm:grid-cols-3">
          {pasos.map((paso, i) => (
            <li key={paso} className="flex flex-col items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 font-display text-lg font-bold text-white">
                {i + 1}
              </span>
              <span className="font-medium text-slate-700">{paso}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
