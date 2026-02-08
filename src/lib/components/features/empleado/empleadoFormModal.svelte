<script lang="ts">
	import { Button } from '$lib/components/ui';
	import type { CreateEmpleadoDto, EmpleadoData, Rol, Zona } from '$lib/interfaces';
	import { validateSchema } from '$lib/utils';
	import { EmpleadoRegisterSchema } from '$lib/zod';

	interface Props {
		isOpen: boolean;
		empleado?: EmpleadoData | null;
		roles: Rol[];
		onSubmit: (data: CreateEmpleadoDto) => Promise<void>;
		onClose: () => void;
	}

	let { isOpen = $bindable(), empleado = null, roles, onSubmit, onClose }: Props = $props();

	let formData: CreateEmpleadoDto = {
		ci: '',
		nombre: '',
		apellido_paterno: '',
		apellido_materno: '',
		cargo: '',
		fecha_nacimiento: '',
		fecha_contratacion: '',
		salario_base: 0,
		telefono: '',
		direccion: '',
		usuario: {
			rol_id: '',
			name_user: '',
			email: '',
			password: ''
		}
	};

	let confirmPassword = $state('');
	let errors: Record<string, string> = $state({});
	let loading = $state(false);
	let generalError = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let currentStep = $state(1);

	const CARGOS = [
		'Gerente',
		'Supervisor',
		'Ayudante',
		'Operador',
		'Técnico',
		'Administrativo',
		'Contador',
		'Vendedor',
		'Chofer',
		'Almacenero'
	];

	function validateStep1(): boolean {
		const stepErrors: Record<string, string> = {};

		if (!formData.ci.trim()) {
			stepErrors.ci = 'El CI es requerido';
		} else if (!/^\d{7,10}$/.test(formData.ci)) {
			stepErrors.ci = 'El CI debe tener entre 7 y 10 dígitos';
		}

		if (!formData.nombre.trim()) {
			stepErrors.nombre = 'El nombre es requerido';
		}

		if (!formData.apellido_paterno.trim()) {
			stepErrors.apellido_paterno = 'El apellido paterno es requerido';
		}

		if (!formData.apellido_materno.trim()) {
			stepErrors.apellido_materno = 'El apellido materno es requerido';
		}

		if (!formData.fecha_nacimiento) {
			stepErrors.fecha_nacimiento = 'La fecha de nacimiento es requerida';
		} else {
			const birthDate = new Date(formData.fecha_nacimiento);
			const today = new Date();
			const age = today.getFullYear() - birthDate.getFullYear();
			if (age < 18) {
				stepErrors.fecha_nacimiento = 'El empleado debe ser mayor de 18 años';
			}
		}

		if (!formData.telefono.trim()) {
			stepErrors.telefono = 'El teléfono es requerido';
		} else if (!/^\d{7,10}$/.test(formData.telefono)) {
			stepErrors.telefono = 'El teléfono debe tener entre 7 y 10 dígitos';
		}

		if (!formData.direccion.trim()) {
			stepErrors.direccion = 'La dirección es requerida';
		}

		errors = stepErrors;
		return Object.keys(stepErrors).length === 0;
	}

	function validateStep2(): boolean {
		const stepErrors: Record<string, string> = {};

		if (!formData.cargo) {
			stepErrors.cargo = 'El cargo es requerido';
		}

		if (!formData.fecha_contratacion) {
			stepErrors.fecha_contratacion = 'La fecha de contratación es requerida';
		}

		if (!formData.salario_base || formData.salario_base <= 0) {
			stepErrors.salario_base = 'El salario base debe ser mayor a 0';
		}

		errors = stepErrors;
		return Object.keys(stepErrors).length === 0;
	}

	function validateStep3(): boolean {
		const stepErrors: Record<string, string> = {};

		if (!formData.usuario.name_user.trim()) {
			stepErrors.name_user = 'El nombre de usuario es requerido';
		} else if (formData.usuario.name_user.length < 3) {
			stepErrors.name_user = 'El nombre de usuario debe tener al menos 3 caracteres';
		}

		if (!formData.usuario.email.trim()) {
			stepErrors.email = 'El email es requerido';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.usuario.email)) {
			stepErrors.email = 'El email no es válido';
		}

		if (!formData.usuario.rol_id) {
			stepErrors.rol_id = 'Debe seleccionar un rol';
		}

		if (!formData.usuario.password) {
			stepErrors.password = 'La contraseña es requerida';
		} else if (formData.usuario.password.length < 8) {
			stepErrors.password = 'La contraseña debe tener al menos 8 caracteres';
		}

		if (!confirmPassword) {
			stepErrors.confirmPassword = 'Debe confirmar la contraseña';
		} else if (formData.usuario.password !== confirmPassword) {
			stepErrors.confirmPassword = 'Las contraseñas no coinciden';
		}

		errors = stepErrors;
		return Object.keys(stepErrors).length === 0;
	}

	function nextStep() {
		if (currentStep === 1 && !validateStep1()) return;
		if (currentStep === 2 && !validateStep2()) return;
		currentStep++;
	}

	function prevStep() {
		currentStep--;
		errors = {};
	}

	function formatDateForAPI(dateString: string): string {
		const [year, month, day] = dateString.split('-');
		return `${day}-${month}-${year}`;
	}

	let isSubmitting = $state(false);
	let validationErrors: Record<string, string> = $state({});

	async function handleSubmit(e: Event) {
		if (!validateStep3()) return;
		e.preventDefault();

		console.log('formData: ', formData);
		const validation = validateSchema(EmpleadoRegisterSchema, formData);

		if (!validation.success) {
			validationErrors = validation.errors;
			console.log('validationErrors: ', validationErrors);
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit(formData);
			handleClose();
		} catch (error) {
			console.error('Error al guardar cliente:', error);
		} finally {
			isSubmitting = false;
			validationErrors = {};
		}
	}

	function handleClose() {
		onClose();
	}

	function togglePasswordVisibility() {
		showPassword = !showPassword;
	}

	function toggleConfirmPasswordVisibility() {
		showConfirmPassword = !showConfirmPassword;
	}
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
		<div class="w-full bg-light-one shadow-xl">
			<!-- Header -->
			<div
				class="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6"
			>
				<div>
					<h2 class="text-2xl font-bold text-gray-900">Crear Nuevo Empleado</h2>
				</div>
				<button
					on:click={handleClose}
					class="text-gray-400 transition-colors hover:text-gray-600"
					disabled={loading}
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Form -->
			<form on:submit|preventDefault={handleSubmit} class="p-6">
				{#if generalError}
					<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
						<div class="flex">
							<svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
									clip-rule="evenodd"
								/>
							</svg>
							<p class="ml-3 text-sm text-red-800">{generalError}</p>
						</div>
					</div>
				{/if}
				<div class="space-y-6">
					<div class="grid grid-cols-2 gap-6">
						<!-- CI -->
						<div>
							<label for="ci" class="mb-2 block text-sm font-medium text-gray-700">
								CI <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="ci"
								bind:value={formData.ci}
								maxlength="10"
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.ci
									? 'border-red-500'
									: ''}"
								placeholder="Ej: 12345678"
							/>
							{#if errors.ci}
								<p class="mt-1 text-sm text-red-600">{errors.ci}</p>
							{/if}
						</div>

						<!-- Teléfono -->
						<div>
							<label for="telefono" class="mb-2 block text-sm font-medium text-gray-700">
								Teléfono <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="telefono"
								bind:value={formData.telefono}
								maxlength="10"
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.telefono
									? 'border-red-500'
									: ''}"
								placeholder="Ej: 72472244"
							/>
							{#if errors.telefono}
								<p class="mt-1 text-sm text-red-600">{errors.telefono}</p>
							{/if}
						</div>
					</div>

					<div class="grid grid-cols-3 gap-6">
						<!-- Nombre -->
						<div>
							<label for="nombre" class="mb-2 block text-sm font-medium text-gray-700">
								Nombre <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="nombre"
								bind:value={formData.nombre}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.nombre
									? 'border-red-500'
									: ''}"
								placeholder="Ej: Pedro"
							/>
							{#if errors.nombre}
								<p class="mt-1 text-sm text-red-600">{errors.nombre}</p>
							{/if}
						</div>

						<!-- Apellido Paterno -->
						<div>
							<label for="apellido_paterno" class="mb-2 block text-sm font-medium text-gray-700">
								Apellido Paterno <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="apellido_paterno"
								bind:value={formData.apellido_paterno}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.apellido_paterno
									? 'border-red-500'
									: ''}"
								placeholder="Ej: Aguirre"
							/>
							{#if errors.apellido_paterno}
								<p class="mt-1 text-sm text-red-600">{errors.apellido_paterno}</p>
							{/if}
						</div>

						<!-- Apellido Materno -->
						<div>
							<label for="apellido_materno" class="mb-2 block text-sm font-medium text-gray-700">
								Apellido Materno <span class="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="apellido_materno"
								bind:value={formData.apellido_materno}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.apellido_materno
									? 'border-red-500'
									: ''}"
								placeholder="Ej: Gutierrez"
							/>
							{#if errors.apellido_materno}
								<p class="mt-1 text-sm text-red-600">{errors.apellido_materno}</p>
							{/if}
						</div>
					</div>

					<!-- Fecha de Nacimiento -->
					<div>
						<label for="fecha_nacimiento" class="mb-2 block text-sm font-medium text-gray-700">
							Fecha de Nacimiento <span class="text-red-500">*</span>
						</label>
						<input
							type="date"
							id="fecha_nacimiento"
							bind:value={formData.fecha_nacimiento}
							max={new Date().toISOString().split('T')[0]}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.fecha_nacimiento
								? 'border-red-500'
								: ''}"
						/>
						{#if errors.fecha_nacimiento}
							<p class="mt-1 text-sm text-red-600">{errors.fecha_nacimiento}</p>
						{/if}
					</div>

					<!-- Dirección -->
					<div>
						<label for="direccion" class="mb-2 block text-sm font-medium text-gray-700">
							Dirección <span class="text-red-500">*</span>
						</label>
						<textarea
							id="direccion"
							bind:value={formData.direccion}
							rows="3"
							class="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.direccion
								? 'border-red-500'
								: ''}"
							placeholder="Ej: B/los angeles, calle 123"
						/>
						{#if errors.direccion}
							<p class="mt-1 text-sm text-red-600">{errors.direccion}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-6">
					<!-- Cargo -->
					<div>
						<label for="cargo" class="mb-2 block text-sm font-medium text-gray-700">
							Cargo <span class="text-red-500">*</span>
						</label>
						<select
							id="cargo"
							bind:value={formData.cargo}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.cargo
								? 'border-red-500'
								: ''}"
						>
							<option value="">Seleccione un cargo</option>
							{#each CARGOS as cargo}
								<option value={cargo}>{cargo}</option>
							{/each}
						</select>
						{#if errors.cargo}
							<p class="mt-1 text-sm text-red-600">{errors.cargo}</p>
						{/if}
					</div>

					<!-- Fecha de Contratación -->
					<div>
						<label for="fecha_contratacion" class="mb-2 block text-sm font-medium text-gray-700">
							Fecha de Contratación <span class="text-red-500">*</span>
						</label>
						<input
							type="date"
							id="fecha_contratacion"
							bind:value={formData.fecha_contratacion}
							max={new Date().toISOString().split('T')[0]}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.fecha_contratacion
								? 'border-red-500'
								: ''}"
						/>
						{#if errors.fecha_contratacion}
							<p class="mt-1 text-sm text-red-600">{errors.fecha_contratacion}</p>
						{/if}
					</div>

					<!-- Salario Base -->
					<div>
						<label for="salario_base" class="mb-2 block text-sm font-medium text-gray-700">
							Salario Base (Bs.) <span class="text-red-500">*</span>
						</label>
						<input
							type="number"
							id="salario_base"
							bind:value={formData.salario_base}
							step="0.01"
							min="0"
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.salario_base
								? 'border-red-500'
								: ''}"
							placeholder="Ej: 2500.00"
						/>
						{#if errors.salario_base}
							<p class="mt-1 text-sm text-red-600">{errors.salario_base}</p>
						{/if}
					</div>
				</div>

				<div class="space-y-6">
					<!-- Nombre de Usuario -->
					<div>
						<label for="name_user" class="mb-2 block text-sm font-medium text-gray-700">
							Nombre de Usuario <span class="text-red-500">*</span>
						</label>
						<input
							type="text"
							id="name_user"
							bind:value={formData.usuario.name_user}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.name_user
								? 'border-red-500'
								: ''}"
							placeholder="Ej: pedro.aguirre"
							disabled={loading}
						/>
						{#if errors.name_user}
							<p class="mt-1 text-sm text-red-600">{errors.name_user}</p>
						{:else}
							<p class="mt-1 text-sm text-gray-500">Mínimo 3 caracteres</p>
						{/if}
					</div>

					<!-- Email -->
					<div>
						<label for="email" class="mb-2 block text-sm font-medium text-gray-700">
							Email <span class="text-red-500">*</span>
						</label>
						<input
							type="email"
							id="email"
							bind:value={formData.usuario.email}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.email
								? 'border-red-500'
								: ''}"
							placeholder="ejemplo@correo.com"
							disabled={loading}
						/>
						{#if errors.email}
							<p class="mt-1 text-sm text-red-600">{errors.email}</p>
						{/if}
					</div>

					<!-- Rol -->
					<div>
						<label for="rol_id" class="mb-2 block text-sm font-medium text-gray-700">
							Rol <span class="text-red-500">*</span>
						</label>
						<select
							id="rol_id"
							bind:value={formData.usuario.rol_id}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.rol_id
								? 'border-red-500'
								: ''}"
							disabled={loading}
						>
							<option value="">Seleccione un rol</option>
							{#each roles as rol}
								<option value={rol.id}>{rol.nombre_rol} ({rol.code_rol})</option>
							{/each}
						</select>
						{#if errors.rol_id}
							<p class="mt-1 text-sm text-red-600">{errors.rol_id}</p>
						{/if}
					</div>

					<!-- Contraseña -->
					<div>
						<label for="password" class="mb-2 block text-sm font-medium text-gray-700">
							Contraseña <span class="text-red-500">*</span>
						</label>
						<div class="relative">
							<input
								type={showPassword ? 'text' : 'password'}
								id="password"
								bind:value={formData.usuario.password}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.password
									? 'border-red-500'
									: ''}"
								placeholder="Ingrese la contraseña"
								disabled={loading}
							/>
							<button
								type="button"
								on:click={togglePasswordVisibility}
								class="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
								tabindex="-1"
							>
								{#if showPassword}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										/>
									</svg>
								{:else}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
						</div>
						{#if errors.password}
							<p class="mt-1 text-sm text-red-600">{errors.password}</p>
						{:else}
							<p class="mt-1 text-sm text-gray-500">Mínimo 8 caracteres</p>
						{/if}
					</div>

					<!-- Confirmar Contraseña -->
					<div>
						<label for="confirmPassword" class="mb-2 block text-sm font-medium text-gray-700">
							Confirmar Contraseña <span class="text-red-500">*</span>
						</label>
						<div class="relative">
							<input
								type={showConfirmPassword ? 'text' : 'password'}
								id="confirmPassword"
								bind:value={confirmPassword}
								class="w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.confirmPassword
									? 'border-red-500'
									: ''}"
								placeholder="Confirme la contraseña"
								disabled={loading}
							/>
							<button
								type="button"
								on:click={toggleConfirmPasswordVisibility}
								class="absolute top-2.5 right-3 text-gray-400 hover:text-gray-600"
								tabindex="-1"
							>
								{#if showConfirmPassword}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
										/>
									</svg>
								{:else}
									<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
										/>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
										/>
									</svg>
								{/if}
							</button>
						</div>
						{#if errors.confirmPassword}
							<p class="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
						{/if}
					</div>
				</div>

				<div class="mt-8 flex justify-between gap-3 border-t border-gray-200 pt-6">
					<div class="flex gap-3">
						<Button type="button" on:click={handleClose} disabled={loading} variant="secondary">
							Cancelar
						</Button>

						<Button type="submit" disabled={loading} {loading}>Crear Empleado</Button>
					</div>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- <script lang="ts">
	import type { Cliente, CreateClienteDto } from '$lib/interfaces';
	import type { Zona } from '$lib/interfaces';
	import { clickOutside, validateSchema, type ValidationResult } from '$lib/utils';
	import { clienteRegisterSchema } from '$lib/zod';
	import { fade, scale } from 'svelte/transition';
	import { Button, Input, Select, TextArea } from '$lib/components/ui';

	interface Props {
		isOpen: boolean;
		cliente?: Cliente | null;
		zonas: Zona[];
		onSubmit: (data: CreateClienteDto) => Promise<void>;
		onClose: () => void;
	}

	let { isOpen = $bindable(), cliente = null, zonas, onSubmit, onClose }: Props = $props();

	let formData = $state<CreateClienteDto>({
		ci: '',
		zona_id: '',
		nombre: '',
		apellido_paterno: '',
		apellido_materno: '',
		correo_electronico: '',
		fecha_nacimiento: '',
		telefono: '',
		direccion: '',
		genero: 'M',
		tipo_cliente: 'MIN'
	});

	let isSubmitting = $state(false);
	let validationErrors: Record<string, string> = $state({});

	$effect(() => {
		if (cliente) {
			formData = {
				ci: cliente.ci,
				zona_id: cliente.zona_id,
				nombre: cliente.nombre,
				apellido_paterno: cliente.apellido_paterno,
				apellido_materno: cliente.apellido_materno,
				correo_electronico: cliente.correo_electronico,
				fecha_nacimiento: cliente.fecha_nacimiento.split('T')[0],
				telefono: cliente.telefono,
				direccion: cliente.direccion,
				genero: cliente.genero,
				tipo_cliente: cliente.tipo_cliente
			};
		} else {
			resetForm();
		}
	});

	function resetForm() {
		formData = {
			ci: '',
			zona_id: '',
			nombre: '',
			apellido_paterno: '',
			apellido_materno: '',
			correo_electronico: '',
			fecha_nacimiento: '',
			telefono: '',
			direccion: '',
			genero: 'M',
			tipo_cliente: 'MIN'
		};
		validationErrors = {};
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		console.log('formData: ', formData);
		const validation = validateSchema(clienteRegisterSchema, formData);

		if (!validation.success) {
			validationErrors = validation.errors;
			console.log('validationErrors: ', validationErrors);
			return;
		}

		isSubmitting = true;
		try {
			await onSubmit(formData);
			handleClose();
		} catch (error) {
			console.error('Error al guardar cliente:', error);
		} finally {
			isSubmitting = false;
			validationErrors = {};
		}
	}

	function handleClose() {
		resetForm();
		onClose();
	}
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		transition:fade={{ duration: 200 }}
	>
		<div
			use:clickOutside={handleClose}
			class="w-full max-w-3xl rounded-lg bg-light-one shadow-xl"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<div class="border-b border-light-four px-6 py-4">
				<h2 class="text-xl font-semibold text-light-two_d">
					{cliente ? 'Editar Cliente' : 'Nuevo Cliente'}
				</h2>
			</div>

			<form onsubmit={handleSubmit} class="p-6">
				<div class="grid grid-cols-2 gap-4">
					<div>
						<Input
							type="text"
							id="ci"
							label="CI"
							bind:value={formData.ci}
							placeholder="Ingrese el CI"
							required
							error={validationErrors.ci}
						/>
					</div>

					<div>
						<Select
							id="zona_id"
							bind:value={formData.zona_id}
							label="Zona"
							required
							error={validationErrors.zona_id}
							placeholder="Seleccione una zona"
						>
							<option value="">Seleccione una zona</option>
							{#each zonas as zona}
								<option value={zona.id}>{zona.nombre}</option>
							{/each}
						</Select>
					</div>

					<div>
						<Input
							type="text"
							id="nombre"
							label="Nombre"
							bind:value={formData.nombre}
							error={validationErrors.nombre}
							required
							placeholder="Nombre"
						/>
					</div>

					<div>
						<Input
							type="text"
							id="apellido_paterno"
							label="Apellido Paterno"
							bind:value={formData.apellido_paterno}
							error={validationErrors.apellido_paterno}
							required
							placeholder="Apellido Paterno"
						/>
					</div>

					<div>
						<Input
							type="text"
							id="apellido_materno"
							label="Apellido Materno"
							bind:value={formData.apellido_materno}
							error={validationErrors.apellido_materno}
							placeholder="Apellido Materno"
						/>
					</div>

					<div>
						<Input
							type="email"
							id="correo_electronico"
							label="Correo Electrónico"
							bind:value={formData.correo_electronico}
							error={validationErrors.correo_electronico}
							required
							placeholder="correo@ejemplo.com"
						/>
					</div>

					<div>
						<Input
							type="tel"
							id="telefono"
							label="Teléfono"
							bind:value={formData.telefono}
							error={validationErrors.telefono}
							required
							placeholder="Teléfono"
						/>
					</div>

					<div>
						<Input
							type="date"
							id="fecha_nacimiento"
							label="Fecha de Nacimiento"
							bind:value={formData.fecha_nacimiento}
							error={validationErrors.fecha_nacimiento}
							required
							placeholder="Fecha de Nacimiento"
						/>
					</div>

					<div>
						<Select
							id="genero"
							label="Género"
							bind:value={formData.genero}
							error={validationErrors.genero}
							required
							placeholder="Género"
						>
							<option value="M">Masculino</option>
							<option value="F">Femenino</option>
						</Select>
					</div>

					<div>
						<Select
							id="tipo_cliente"
							label="Tipo de Cliente"
							bind:value={formData.tipo_cliente}
							error={validationErrors.tipo_cliente}
							required
							placeholder="Tipo de Cliente"
						>
							<option value="MIN">Minorista</option>
							<option value="MAY">Mayorista</option>
						</Select>
					</div>
					<div class="col-span-2">
						<TextArea
							id="direccion"
							label="Dirección"
							bind:value={formData.direccion}
							error={validationErrors.direccion}
							required
							rows={3}
							placeholder="Dirección"
						/>
					</div>
				</div>

				<div class="mt-6 flex justify-end gap-3">
					<Button
						type="button"
						onclick={handleClose}
						disabled={isSubmitting}
						variant="secondary"
						size="md"
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={isSubmitting}
						variant="primary"
						size="md"
						loading={isSubmitting}
					>
						{cliente ? 'Actualizar' : 'Crear'}
					</Button>
				</div>
			</form>
		</div>
	</div>
{/if} -->
