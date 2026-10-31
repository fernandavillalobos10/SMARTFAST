import { ChefHat, ShoppingBag, Truck } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { Logo } from '../shared/Logo'

const puntos = [
  { icon: ShoppingBag, texto: 'Pide de tus restaurantes favoritos en segundos' },
  { icon: ChefHat, texto: 'Cocinas organizadas con pedidos en tiempo real' },
  { icon: Truck, texto: 'Sigue tu entrega hasta la puerta de tu casa' },
]

const ANIO = new Date().getFullYear()

export function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-brand-600/20 blur-3xl"
          aria-hidden="true"
        />
        <Logo className="relative text-white" />
        <div className="relative">
          <h2 className="max-w-md text-4xl font-bold leading-tight text-white">
            Comida rápida, gestión <span className="text-brand-400">inteligente</span>.
          </h2>
          <ul className="mt-8 space-y-4">
            {puntos.map(({ icon: Icon, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-slate-300">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-brand-300">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-slate-500">© {ANIO} SmartFast</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <Logo className="mb-8 lg:hidden" />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
