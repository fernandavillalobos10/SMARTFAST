import { ChefHat, LayoutDashboard, Package, Truck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useRestaurant } from '../../hooks/useRestaurant'
import { cn } from '../../lib/utils'

export const LINKS_RESTAURANTE = [
  { to: '/restaurante', label: 'Resumen', icon: LayoutDashboard, end: true },
  { to: '/restaurante/cocina', label: 'Cocina', icon: ChefHat },
  { to: '/restaurante/productos', label: 'Productos', icon: Package },
  { to: '/restaurante/entregas', label: 'Entregas', icon: Truck },
]

export function SidebarLink({ to, label, icon: Icon, end, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        )
      }
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </NavLink>
  )
}

export function Sidebar() {
  const { restaurante } = useRestaurant()
  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-20 space-y-6">
        <div className="rounded-2xl bg-slate-900 p-4 text-white">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Tu restaurante</p>
          <p className="mt-1 truncate font-display font-semibold">{restaurante?.nombre}</p>
        </div>
        <nav className="space-y-1" aria-label="Panel del restaurante">
          {LINKS_RESTAURANTE.map((link) => (
            <SidebarLink key={link.to} {...link} />
          ))}
        </nav>
      </div>
    </aside>
  )
}
