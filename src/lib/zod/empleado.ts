import { z } from 'zod';

const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;

export const UsuarioSchema = z.object({
	rol_id: z.string().uuid({
		message: 'El rol_id debe ser un UUID válido'
	}),
	name_user: z.string().min(3, 'El nombre de usuario debe tener al menos 3 caracteres'),
	email: z.string().email('Email inválido'),
	password: z
		.string()
		.min(8, 'La contraseña debe tener al menos 8 caracteres')
		.regex(/[A-Z]/, 'Debe contener al menos una letra mayúscula')
		.regex(/[a-z]/, 'Debe contener al menos una letra minúscula')
		.regex(/[0-9]/, 'Debe contener al menos un número')
});

export const EmpleadoRegisterSchema = z.object({
	ci: z.string().min(6, 'CI inválido').max(15, 'CI demasiado largo'),

	nombre: z.string().min(2, 'Nombre muy corto'),
	apellido_paterno: z.string().min(2, 'Apellido paterno muy corto'),
	apellido_materno: z.string().min(2, 'Apellido materno muy corto'),

	cargo: z.string().min(3, 'Cargo inválido'),

	fecha_nacimiento: z.string().regex(dateRegex, 'Formato de fecha inválido (DD-MM-YYYY)'),

	fecha_contratacion: z.string().regex(dateRegex, 'Formato de fecha inválido (DD-MM-YYYY)'),

	salario_base: z.number().positive('El salario debe ser mayor a 0'),

	telefono: z.string().min(7, 'Teléfono inválido').max(15, 'Teléfono inválido'),

	direccion: z.string().min(5, 'Dirección muy corta'),

	usuario: UsuarioSchema
});
