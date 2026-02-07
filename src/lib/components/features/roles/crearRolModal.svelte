<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CreateRolDto } from '$lib/interfaces';
	import { rolesService } from '$lib/services';
	import { PlusIcon } from '$lib/icons/outline';
	import { Button } from '$lib/components/ui';

	const dispatch = createEventDispatcher();

	let formData: CreateRolDto = {
		nombre_rol: '',
		code_rol: '',
		descripcion: ''
	};

	let errors: Record<string, string> = {};
	let loading = false;
	let generalError = '';

	function validateForm(): boolean {
		errors = {};

		if (!formData.nombre_rol.trim()) {
			errors.nombre_rol = 'El nombre del rol es requerido';
		}

		if (!formData.code_rol.trim()) {
			errors.code_rol = 'El código del rol es requerido';
		} else if (formData.code_rol.length > 10) {
			errors.code_rol = 'El código no puede tener más de 10 caracteres';
		}

		if (!formData.descripcion.trim()) {
			errors.descripcion = 'La descripción es requerida';
		}

		return Object.keys(errors).length === 0;
	}

	async function handleSubmit() {
		if (!validateForm()) return;

		try {
			loading = true;
			generalError = '';
			await rolesService.createRol(formData);
			dispatch('created');
		} catch (err: any) {
			generalError = err.response?.data?.message || 'Error al crear el rol';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function handleClose() {
		dispatch('close');
	}

	function handleCodeInput() {
		formData.code_rol = formData.code_rol.toUpperCase();
	}
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
	<div class="w-full max-w-2xl rounded-lg bg-white shadow-xl">
		<div class="flex items-center justify-between border-b border-gray-200 p-6">
			<h2 class="text-2xl font-bold text-gray-900">Crear Nuevo Rol</h2>
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

		<form on:submit|preventDefault={handleSubmit} class="p-6">
			{#if generalError}
				<div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
					<p class="text-sm text-red-800">{generalError}</p>
				</div>
			{/if}

			<div class="space-y-6">
				<div>
					<label for="nombre_rol" class="mb-2 block text-sm font-medium text-gray-700">
						Nombre del Rol <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="nombre_rol"
						bind:value={formData.nombre_rol}
						class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.nombre_rol
							? 'border-red-500'
							: ''}"
						placeholder="Ej: Administrador"
						disabled={loading}
					/>
					{#if errors.nombre_rol}
						<p class="mt-1 text-sm text-red-600">{errors.nombre_rol}</p>
					{/if}
				</div>

				<div>
					<label for="code_rol" class="mb-2 block text-sm font-medium text-gray-700">
						Código del Rol <span class="text-red-500">*</span>
					</label>
					<input
						type="text"
						id="code_rol"
						bind:value={formData.code_rol}
						on:input={handleCodeInput}
						maxlength="10"
						class="w-full rounded-lg border border-gray-300 px-4 py-2 uppercase focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.code_rol
							? 'border-red-500'
							: ''}"
						placeholder="Ej: ADM"
						disabled={loading}
					/>
					{#if errors.code_rol}
						<p class="mt-1 text-sm text-red-600">{errors.code_rol}</p>
					{:else}
						<p class="mt-1 text-sm text-gray-500">
							Máximo 10 caracteres (se convertirá a mayúsculas)
						</p>
					{/if}
				</div>

				<div>
					<label for="descripcion" class="mb-2 block text-sm font-medium text-gray-700">
						Descripción <span class="text-red-500">*</span>
					</label>
					<textarea
						id="descripcion"
						bind:value={formData.descripcion}
						rows="4"
						class="w-full resize-none rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 {errors.descripcion
							? 'border-red-500'
							: ''}"
						placeholder="Describe las responsabilidades y alcance del rol..."
						disabled={loading}
					/>
					{#if errors.descripcion}
						<p class="mt-1 text-sm text-red-600">{errors.descripcion}</p>
					{/if}
				</div>
			</div>

			<div class="mt-8 flex justify-end gap-3 border-t border-gray-200 pt-6">
				<Button type="button" onclick={handleClose} variant="secondary" disabled={loading}>
					Cancelar
				</Button>
				<Button type="submit" variant="primary" disabled={loading}>
					{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
					Crear Rol
				</Button>
			</div>
		</form>
	</div>
</div>
