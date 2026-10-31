import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey)

if (!supabaseConfigurado) {
  console.error(
    'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. Copia .env.example a .env y completa los valores.',
  )
}

export const supabase = supabaseConfigurado ? createClient(supabaseUrl, supabaseAnonKey) : null
