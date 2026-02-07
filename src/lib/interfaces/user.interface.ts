export interface User {
	id: string;
	email: string;
}

// $lib/interfaces/usuario.interface.ts

export interface Usuario {
	id: string;
	rol_id: string;
	name_user: string;
	email: string;
	password_hash: string;
	password_reset_token: string | null;
	password_reset_expires: string | null;
	esta_activo: boolean;
	createdAt: string;
	updatedAt: string;
	empleado_id: string | null;
	rol?: {
		id: string;
		nombre_rol: string;
		code_rol: string;
	};
}

export interface UsuariosResponse {
	status: string;
	data: Usuario[];
}

export interface UsuarioFilters {
	page?: number;
	perPage?: number;
	search?: string;
	rol_id?: string;
	esta_activo?: boolean;
}

export interface CreateUsuarioDto {
	rol_id: string;
	name_user: string;
	email: string;
	password: string;
}

export interface UpdateUsuarioDto {
	rol_id?: string;
	name_user?: string;
	email?: string;
	password?: string;
	esta_activo?: boolean;
}
