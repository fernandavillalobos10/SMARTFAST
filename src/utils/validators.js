import { z } from 'zod'

const telefono = z
  .string()
  .trim()
  .min(7, 'Teléfono inválido')
  .max(20, 'Teléfono inválido')
  .regex(/^[0-9+\-\s()]+$/, 'Solo números y + - ( )')

export const loginSchema = z.object({
  correo: z.string().trim().email('Correo inválido'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
})

export const registerSchema = z
  .object({
    nombre: z.string().trim().min(2, 'Ingresa tu nombre').max(100),
    correo: z.string().trim().email('Correo inválido').max(120),
    telefono: z.union([telefono, z.literal('')]),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmar: z.string(),
  })
  .refine((d) => d.password === d.confirmar, {
    path: ['confirmar'],
    message: 'Las contraseñas no coinciden',
  })

export const checkoutSchema = z
  .object({
    tipo_entrega: z.enum(['DOMICILIO', 'RECOGER']),
    nombre_contacto: z.string().trim().min(2, 'Ingresa un nombre').max(100),
    telefono_contacto: telefono,
    direccion_entrega: z.string().trim().max(200, 'Máximo 200 caracteres'),
    notas: z.string().trim().max(500, 'Máximo 500 caracteres'),
  })
  .superRefine((d, ctx) => {
    if (d.tipo_entrega === 'DOMICILIO' && d.direccion_entrega.length < 5) {
      ctx.addIssue({
        code: 'custom',
        path: ['direccion_entrega'],
        message: 'La dirección es obligatoria para entregas a domicilio',
      })
    }
  })

export const productoSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingresa un nombre').max(100),
  descripcion: z.string().trim().max(1000),
  categoria: z.string().trim().max(50),
  precio: z.coerce.number({ error: 'Precio inválido' }).positive('Debe ser mayor a 0').max(99999999),
  stock: z.coerce.number({ error: 'Stock inválido' }).int('Debe ser entero').min(0, 'No puede ser negativo'),
  imagen_url: z.union([z.string().trim().url('URL inválida'), z.literal('')]),
  disponible: z.boolean(),
  activo: z.boolean(),
})

export const restauranteSchema = z.object({
  nombre: z.string().trim().min(2, 'Ingresa un nombre').max(100),
  descripcion: z.string().trim().max(1000),
  direccion: z.string().trim().max(200),
  telefono: z.union([telefono, z.literal('')]),
  costo_envio_base: z.coerce.number({ error: 'Valor inválido' }).min(0, 'No puede ser negativo'),
})
