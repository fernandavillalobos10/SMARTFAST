import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { AuthLayout } from '../components/layout/AuthLayout'
import { ROLES } from '../lib/constants'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import Carrito from '../pages/cliente/Carrito'
import Catalogo from '../pages/cliente/Catalogo'
import Checkout from '../pages/cliente/Checkout'
import DetallePedidoCliente from '../pages/cliente/DetallePedidoCliente'
import MisPedidos from '../pages/cliente/MisPedidos'
import PedidoConfirmado from '../pages/cliente/PedidoConfirmado'
import EntregaDetalle from '../pages/entregas/EntregaDetalle'
import EntregasList from '../pages/entregas/EntregasList'
import Landing from '../pages/landing/Landing'
import NotFound from '../pages/NotFound'
import Dashboard from '../pages/restaurante/Dashboard'
import DetallePedidoRestaurante from '../pages/restaurante/DetallePedidoRestaurante'
import PedidosCocina from '../pages/restaurante/PedidosCocina'
import ProductoForm from '../pages/restaurante/ProductoForm'
import Productos from '../pages/restaurante/Productos'
import { ProtectedRoute } from './ProtectedRoute'
import { HomeRedirect, RoleGuard } from './RoleGuard'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />
        </Route>

        <Route path="/inicio" element={<HomeRedirect />} />

        {/* Público: los invitados pueden ver el menú y hacer pedidos */}
        <Route element={<AppLayout />}>
          <Route index element={<Landing />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido-confirmado/:id" element={<PedidoConfirmado />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<RoleGuard roles={[ROLES.CLIENTE]} />}>
              <Route path="/mis-pedidos" element={<MisPedidos />} />
              <Route path="/mis-pedidos/:id" element={<DetallePedidoCliente />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard roles={[ROLES.PROPIETARIO]} />}>
            <Route path="/restaurante" element={<AppLayout withSidebar />}>
              <Route index element={<Dashboard />} />
              <Route path="cocina" element={<PedidosCocina />} />
              <Route path="pedidos/:id" element={<DetallePedidoRestaurante />} />
              <Route path="productos" element={<Productos />} />
              <Route path="productos/nuevo" element={<ProductoForm />} />
              <Route path="productos/:id" element={<ProductoForm />} />
              <Route path="entregas" element={<EntregasList />} />
              <Route path="entregas/:id" element={<EntregaDetalle />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
