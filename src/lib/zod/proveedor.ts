import { z } from 'zod';

export const ProveedorRegisterSchema = z.object({
	nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),

	apellido_paterno: z.string().min(2, 'El apellido paterno es muy corto'),

	apellido_materno: z.string().min(2, 'El apellido materno es muy corto'),

	empresa: z.string().min(2, 'El nombre de la empresa es muy corto'),

	zona_id: z.string().uuid('La zona debe ser un UUID válido'),

	telefono: z.string().min(7, 'Teléfono inválido').max(15, 'Teléfono inválido'),

	direccion: z.string().min(5, 'La dirección es muy corta')
});
