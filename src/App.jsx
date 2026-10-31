import { Alert } from './components/ui'
import { supabaseConfigurado } from './config/supabase'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { AppRouter } from './routes/AppRouter'

function ConfiguracionFaltante() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4">
      <Alert type="warning" title="Falta configurar Supabase">
        Copia <code className="font-mono">.env.example</code> a <code className="font-mono">.env</code>, completa{' '}
        <code className="font-mono">VITE_SUPABASE_URL</code> y <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> y
        reinicia <code className="font-mono">npm run dev</code>.
      </Alert>
    </main>
  )
}

function App() {
  if (!supabaseConfigurado) return <ConfiguracionFaltante />
  return (
    <AuthProvider>
      <CartProvider>
        <AppRouter />
      </CartProvider>
    </AuthProvider>
  )
}

export default App
