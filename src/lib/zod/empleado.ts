import { z } from 'zod';
export const UsuarioSchema = z.object({
	rol_id: z
		.string()
		.uuid({
			message: 'El rol_id debe ser un UUID válido'
		})
		.optional(),
	name_user: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres').optional(),
	email: z.string().email('Email inválido').optional(),
	password: z
		.string()
		.min(8, 'La contraseña debe tener al menos 8 caracteres')
		.regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
		.regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
		.regex(/[0-9]/, 'Debe contener al menos un número')
		.optional()
});

export const EmpleadoRegisterSchema = z.object({
	ci: z.string().min(6, 'CI inválido').max(15, 'CI demasiado largo'),

	nombre: z.string().min(2, 'Nombre muy corto'),
	apellido_paterno: z.string().min(2, 'Apellido paterno muy corto'),
	apellido_materno: z.string().min(2, 'Apellido materno muy corto'),

	cargo: z.string().min(3, 'Cargo inválido'),

	fecha_nacimiento: z
		.preprocess(
			(val) => (typeof val === 'string' || val instanceof Date ? new Date(val) : val),
			z.date({
				message: 'La fecha de nacimiento es obligatoria'
			})
		)
		.refine((val) => !isNaN(Date.parse(val.toString())), {
			message: 'La fecha debe ser una fecha válida'
		}),

	fecha_contratacion: z
		.preprocess(
			(val) => (typeof val === 'string' || val instanceof Date ? new Date(val) : val),
			z.date({
				message: 'La fecha de nacimiento es obligatoria'
			})
		)
		.refine((val) => !isNaN(Date.parse(val.toString())), {
			message: 'La fecha debe ser una fecha válida'
		}),

	salario_base: z.number().positive('El salario debe ser mayor a 0'),

	telefono: z.string().min(7, 'Teléfono inválido').max(15, 'Teléfono inválido'),

	direccion: z.string().min(5, 'Dirección muy corta')

	// usuario: UsuarioSchema.optional()
});
