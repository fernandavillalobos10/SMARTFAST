import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { LOCALE, MONEDA } from './constants'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const currency = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: MONEDA })

export function formatMoney(value) {
  return currency.format(Number(value ?? 0))
}

// Las columnas del esquema son TIMESTAMP sin zona y Supabase las guarda en UTC;
// sin el sufijo Z el navegador las interpretaría como hora local.
export function toDate(value) {
  if (value instanceof Date) return value
  const texto = String(value)
  return new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(texto) ? texto : `${texto}Z`)
}

export function formatFecha(value, pattern = 'd MMM yyyy, HH:mm') {
  if (!value) return '—'
  return format(toDate(value), pattern, { locale: es })
}

export function haceCuanto(value) {
  if (!value) return ''
  return formatDistanceToNow(toDate(value), { addSuffix: true, locale: es })
}

// Supabase devuelve los errores de RAISE EXCEPTION en error.message
export function mensajeError(error, fallback = 'Ocurrió un error inesperado') {
  if (!error) return fallback
  const msg = error.message || String(error)
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos'
  if (msg.includes('User already registered')) return 'Ya existe una cuenta con ese correo'
  if (msg.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión'
  if (msg.includes('Failed to fetch')) return 'No se pudo conectar con el servidor'
  return msg
}
