<script lang="ts">
	import { goto } from '$app/navigation';
	import backgroundImg from '$lib/assets/images/background1.png';
	import { Button, Heading, Image, Text } from '$lib/components/ui';
	import {
		EyeIcon,
		EyeOffIcon,
		FacebookIcon,
		InstagramIcon,
		LinkedinIcon,
		MailIcon
	} from '$lib/icons/outline';
	import { LockIcon } from '$lib/icons/solid';
	import { ErrorType, type LoginCredentials } from '$lib/interfaces';
	import { AppError } from '$lib/services';
	import { AuthService } from '$lib/services/auth.service';
	import { authStore, isLoading } from '$lib/stores/auth.store';
	import { validateLoginForm } from '$lib/utils/validation';

	let email: string = '';
	let password: string = '';
	let showPassword: boolean = false;
	let errors: string[] = [];
	let loginError: string = '';

	$: if (email || password) {
		errors = [];
		loginError = '';
	}

	const handleLogin = async (event: Event): Promise<void> => {
		event.preventDefault();
		await goto('/v1/inicio');
		errors = [];
		loginError = '';
		const validation = validateLoginForm(email, password);
		if (!validation.isValid) {
			errors = validation.errors;
			return;
		}

		const credentials: LoginCredentials = {
			email: email.trim(),
			password: password
		};

		authStore.setLoading(true);

		try {
			const response = await AuthService.login(credentials);

			authStore.setUser(response.data);

			await goto('/v1/inicio');
		} catch (error) {
			console.error('Error durante el login:', error);

			if (error instanceof AppError) {
				switch (error.type) {
					case ErrorType.AUTHENTICATION:
						loginError = 'Credenciales incorrectas. Verifica tu email y contraseña.';
						break;
					case ErrorType.NETWORK:
						loginError = 'Error de conexión. Verifica tu conexión a internet.';
						break;
					case ErrorType.SERVER:
						loginError = 'Error del servidor. Intenta nuevamente en unos minutos.';
						break;
					default:
						loginError = error.message || 'Error desconocido durante el login.';
				}
			} else {
				loginError = 'Error inesperado. Intenta nuevamente.';
			}
		} finally {
			authStore.setLoading(false);
		}
	};

	// Función para manejar el toggle de password
	const togglePassword = (): void => {
		showPassword = !showPassword;
	};
</script>

<main class="relative flex min-h-screen items-center justify-center overflow-hidden">
	<div class="absolute inset-0 z-0">
		<Image src={backgroundImg} alt="Background" class="h-full w-full object-cover" />
	</div>

	<div class="absolute top-6 left-6 z-20">
		<div class="flex h-36 w-48 items-center justify-center">
			<Image objectFit="contain" src="/images/logo_transparent.png" alt="" />
		</div>
	</div>

	<div
		class="z-10 w-full max-w-sm rounded-lg border-8 border-light-one_d bg-light-one p-8 shadow-lg"
	>
		<div class="mb-8 text-center">
			<Heading level="h2" class="text-light-three">Sign in</Heading>
		</div>

		<!-- Mostrar errores generales -->
		{#if loginError}
			<div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
				{loginError}
			</div>
		{/if}

		<!-- Mostrar errores de validación -->
		{#if errors.length > 0}
			<div class="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3">
				{#each errors as error}
					<p class="text-sm text-red-700">{error}</p>
				{/each}
			</div>
		{/if}

		<form on:submit={handleLogin} class="space-y-6">
			<div class="space-y-1">
				<label for="email" class="text-sm font-medium text-light-three">Email</label>
				<div class="relative">
					<span class="absolute top-3 left-0 text-light-four"><MailIcon /></span>
					<input
						id="email"
						type="email"
						bind:value={email}
						placeholder="Type your email"
						class="border-g w-full border-t-0 border-r-0 border-b border-l-0 bg-transparent py-3 pl-8 text-light-three placeholder-light-four outline-0 transition-colors duration-200 outline-none focus:border-b-light-four_d focus:ring-0 focus:outline-0"
						disabled={$isLoading}
						required
					/>
				</div>
			</div>

			<div class="space-y-1">
				<label for="password" class="text-sm font-medium text-light-three">Password</label>
				<div class="relative">
					<span class="absolute top-3 left-0 text-light-four"><LockIcon /></span>
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						placeholder="Type your password"
						class="w-full border-t-0 border-r-0 border-b border-l-0 border-light-four bg-transparent py-3 pr-12 pl-8 text-light-three placeholder-light-four transition-colors duration-200 outline-none focus:border-b-light-four_d focus:ring-0 focus:outline-0"
						disabled={$isLoading}
						required
					/>
					<button
						type="button"
						on:click={togglePassword}
						class="absolute top-3 right-0 text-gray-400 transition-colors hover:text-gray-600"
						disabled={$isLoading}
					>
						{#if showPassword}
							<EyeIcon />
						{:else}
							<EyeOffIcon />
						{/if}
					</button>
				</div>
				<div class="pt-2 text-right">
					<a
						href="/forgot-password"
						class="text-xs text-light-four transition-colors hover:text-light-four_d"
					>
						Forgot password?
					</a>
				</div>
			</div>

			<div class="pt-4">
				<Button type="submit" variant="primary" fullWidth size="md" loading={$isLoading}>
					LOGIN
				</Button>
			</div>

			<div class="pt-6 pb-4 text-center">
				<Text variant="body-xs">Or Sign Up Using</Text>
			</div>

			<div class="flex justify-center space-x-4">
				<Button type="button" variant="ghost" disabled={$isLoading}>
					<FacebookIcon />
				</Button>
				<Button type="button" variant="ghost" disabled={$isLoading}>
					<InstagramIcon />
				</Button>
				<Button type="button" variant="ghost" disabled={$isLoading}>
					<LinkedinIcon />
				</Button>
			</div>
		</form>
	</div>
</main>
