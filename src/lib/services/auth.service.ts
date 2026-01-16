import { apiAvicor } from '$lib/config/apiAvicor.config';
import type { LoginCredentials, LoginResponse, User } from '$lib/interfaces';

export class AuthService {
	private static readonly TOKEN_KEY = 'auth_token';
	private static readonly TOKEN_EXPIRY_KEY = 'auth_token_expiry';
	private static readonly USER_KEY = 'user_data';

	static getToken(): string | null {
		try {
			const token = localStorage.getItem(this.TOKEN_KEY);
			const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY);

			if (!token) {
				return null;
			}

			if (expiry && new Date().getTime() > parseInt(expiry)) {
				this.clearToken();
				return null;
			}

			return token;
		} catch (error) {
			console.warn('Error accediendo al localStorage:', error);
			return null;
		}
	}

	static setToken(token: string, expiryInMs?: number): void {
		try {
			localStorage.setItem(this.TOKEN_KEY, token);

			if (expiryInMs) {
				const expiryTime = new Date().getTime() + expiryInMs;
				localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryTime.toString());
			}
		} catch (error) {
			console.warn('Error guardando token en localStorage:', error);
		}
	}

	static getUser(): User | null {
		try {
			const userData = localStorage.getItem(this.USER_KEY);
			return userData ? JSON.parse(userData) : null;
		} catch (error) {
			console.warn('Error obteniendo datos del usuario:', error);
			return null;
		}
	}

	static setUser(user: User): void {
		try {
			localStorage.setItem(this.USER_KEY, JSON.stringify(user));
		} catch (error) {
			console.warn('Error guardando datos del usuario:', error);
		}
	}

	static clearToken(): void {
		try {
			localStorage.removeItem(this.TOKEN_KEY);
			localStorage.removeItem(this.TOKEN_EXPIRY_KEY);
			localStorage.removeItem(this.USER_KEY);
		} catch (error) {
			console.warn('Error limpiando datos de autenticación:', error);
		}
	}

	static isAuthenticated(): boolean {
		return this.getToken() !== null;
	}

	// Método para login
	static async login(credentials: LoginCredentials): Promise<LoginResponse> {
		try {
			const response = await apiAvicor.postPublic<LoginResponse>('/auth/login', credentials);
			const expiryInMs = 24 * 60 * 60 * 1000; // 24 horas
			this.setToken(response.token, expiryInMs);
			this.setUser(response.data);

			return response;
		} catch (error) {
			this.clearToken();
			throw error;
		}
	}

	// Método para logout
	static async logout(): Promise<void> {
		try {
			this.clearToken();
		} catch (error) {
			this.clearToken();
			console.warn('Error durante el logout:', error);
		}
	}
}
