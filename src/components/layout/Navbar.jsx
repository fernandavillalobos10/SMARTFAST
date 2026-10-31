import { LogOut, Menu, ShoppingCart, Store, UtensilsCrossed, X, ClipboardList } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useRole } from '../../hooks/useRole'
import { cn } from '../../lib/utils'
import { Logo } from '../shared/Logo'
import { Button } from '../ui'
import { LINKS_RESTAURANTE, SidebarLink } from './Sidebar'

function linksPorRol({ esCliente, esPropietario }) {
  const links = [{ to: '/catalogo', label: 'Menú', icon: UtensilsCrossed }]
  if (esCliente) links.push({ to: '/mis-pedidos', label: 'Mis pedidos', icon: ClipboardList })
  if (esPropietario) links.push({ to: '/restaurante', label: 'Mi restaurante', icon: Store })
  return links
}

export function Navbar() {
  const { session, perfil, signOut } = useAuth()
  const role = useRole()
  const { cantidadTotal } = useCart()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const links = linksPorRol(role)
  const enPanel = role.esPropietario && pathname.startsWith('/restaurante')

  const salir = async () => {
    setAbierto(false)
    await signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Principal">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'text-brand-600' : 'text-slate-600 hover:text-slate-900',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/carrito"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label={`Carrito (${cantidadTotal} productos)`}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {cantidadTotal > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 text-[11px] font-bold text-white">
                {cantidadTotal}
              </span>
            )}
          </Link>

          {session ? (
            <div className="hidden items-center gap-3 md:flex">
              <span className="max-w-40 truncate text-sm font-medium text-slate-700">{perfil?.nombre}</span>
              <Button variant="ghost" size="sm" onClick={salir}>
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Salir
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button as={Link} to="/login" variant="ghost" size="sm">
                Iniciar sesión
              </Button>
              <Button as={Link} to="/registro" size="sm">
                Registrarse
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setAbierto((v) => !v)}
            aria-expanded={abierto}
            aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          >
            {abierto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {abierto && (
        <div className="border-t border-slate-100 bg-white px-4 pb-4 pt-2 md:hidden">
          <nav className="space-y-1" aria-label="Menú móvil">
            {(enPanel ? LINKS_RESTAURANTE : links).map((link) => (
              <SidebarLink key={link.to} {...link} onClick={() => setAbierto(false)} />
            ))}
            {enPanel && <SidebarLink to="/catalogo" label="Menú" icon={UtensilsCrossed} onClick={() => setAbierto(false)} />}
          </nav>
          <div className="mt-3 border-t border-slate-100 pt-3">
            {session ? (
              <div className="flex items-center justify-between">
                <span className="truncate text-sm font-medium text-slate-700">{perfil?.nombre}</span>
                <Button variant="ghost" size="sm" onClick={salir}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Salir
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button as={Link} to="/login" variant="secondary" onClick={() => setAbierto(false)}>
                  Iniciar sesión
                </Button>
                <Button as={Link} to="/registro" onClick={() => setAbierto(false)}>
                  Registrarse
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
