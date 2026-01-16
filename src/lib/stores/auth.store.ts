import { writable, derived } from 'svelte/store';
import { AuthService } from '../services/auth.service';
import type { User } from '$lib/interfaces';

export const user = writable<User | null>(AuthService.getUser());
export const isAuthenticated = derived(user, ($user) => $user !== null);
export const isLoading = writable<boolean>(false);

export const authStore = {
	setUser: (userData: User) => {
		user.set(userData);
		AuthService.setUser(userData);
	},

	clearUser: () => {
		user.set(null);
		AuthService.clearToken();
	},

	setLoading: (loading: boolean) => {
		isLoading.set(loading);
	}
};
