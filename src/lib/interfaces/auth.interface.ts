export interface LoginCredentials {
	email: string;
	password: string;
}

export interface LoginResponse {
	status: string;
	token: string;
	data: {
		id: string;
		email: string;
	};
}
