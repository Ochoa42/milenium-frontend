<script lang="ts">
	import { onMount } from 'svelte';
	import type { Rol } from '$lib/interfaces';
	import { goto } from '$app/navigation';
	import { rolesService } from '$lib/services';
	import { CrearRolModal } from '$lib/components/features/roles';
	import { Button } from '$lib/components/ui';
	import { PlusIcon } from '$lib/icons/outline';

	let roles: Rol[] = [];
	let loading = true;
	let error = '';
	let showCrearModal = false;
	let currentPage = 1;
	let perPage = 10;
	let totalPages = 1;
	let total = 0;
	let searchTerm = '';
	let searchTimeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		loadRoles();
	});

	async function loadRoles() {
		try {
			loading = true;
			error = '';
			const response = await rolesService.getRoles({
				page: currentPage,
				perPage,
				search: searchTerm || undefined
			});

			roles = response;
		} catch (err) {
			error = 'Error al cargar los roles';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			currentPage = 1;
			loadRoles();
		}, 500);
	}

	function handlePageChange(page: number) {
		currentPage = page;
		loadRoles();
	}

	function openCrearModal() {
		showCrearModal = true;
	}

	function closeCrearModal() {
		showCrearModal = false;
	}

	async function handleRolCreated() {
		closeCrearModal();
		await loadRoles();
	}

	async function handleDelete(id: string) {
		if (!confirm('¿Está seguro de eliminar este rol?')) return;

		try {
			await rolesService.deleteRol(id);
			await loadRoles();
		} catch (err) {
			alert('Error al eliminar el rol');
			console.error(err);
		}
	}

	function handleEdit(id: string) {
		goto(`/roles/${id}/editar`);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-gray-900">Gestión de Roles</h1>
		</div>

		<div class="mb-6 rounded-lg bg-white p-6 shadow">
			<div class="flex items-center justify-between gap-4">
				<div class="max-w-md flex-1">
					<div class="relative">
						<input
							type="text"
							placeholder="Buscar por nombre o código..."
							bind:value={searchTerm}
							on:input={handleSearch}
							class="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						/>
						<svg
							class="absolute top-2.5 left-3 h-5 w-5 text-gray-400"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</div>
				</div>

				<Button onclick={openCrearModal} variant="primary">
					{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
					Nuevo Rol
				</Button>
			</div>
		</div>

		<div class="overflow-hidden rounded-lg bg-white shadow">
			{#if loading}
				<div class="p-12 text-center">
					<div
						class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
					></div>
					<p class="mt-4 text-gray-600">Cargando roles...</p>
				</div>
			{:else if error}
				<div class="p-12 text-center">
					<p class="text-red-600">{error}</p>
					<button
						on:click={loadRoles}
						class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Reintentar
					</button>
				</div>
			{:else if roles.length === 0}
				<div class="p-12 text-center">
					<svg
						class="mx-auto h-12 w-12 text-gray-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
						/>
					</svg>
					<p class="mt-4 text-gray-600">No se encontraron roles</p>
					<Button onclick={openCrearModal} variant="primary">
						{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
						Crear primer rol
					</Button>
				</div>
			{:else}
				<table class="min-w-full divide-y divide-light-four">
					<thead class="bg-light-two text-light-one">
						<tr>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
								Código
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
								Nombre
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
								Descripción
							</th>
							<th class="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
								Fecha Creación
							</th>
							<!-- <th class="px-6 py-3 text-right text-xs font-medium tracking-wider uppercase">
								Acciones
							</th> -->
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 bg-white">
						{#each roles as rol}
							<tr class="transition-colors hover:bg-gray-50">
								<td class="px-6 py-4 whitespace-nowrap">
									<span
										class="inline-flex rounded-full bg-light-four px-2 text-xs leading-5 font-semibold text-light-two"
									>
										{rol.code_rol}
									</span>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm font-medium text-gray-900">{rol.nombre_rol}</div>
								</td>
								<td class="px-6 py-4">
									<div class="text-sm text-gray-600">{rol.descripcion}</div>
								</td>
								<td class="px-6 py-4 whitespace-nowrap">
									<div class="text-sm text-gray-500">{formatDate(rol.createdAt)}</div>
								</td>
								<!-- <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
									<div class="flex justify-end gap-2">
										<button
											on:click={() => handleEdit(rol.id)}
											class="rounded p-2 text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-900"
											title="Editar"
										>
											<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
												/>
											</svg>
										</button>
										<button
											on:click={() => handleDelete(rol.id)}
											class="rounded p-2 text-red-600 transition-colors hover:bg-red-50 hover:text-red-900"
											title="Eliminar"
										>
											<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
												/>
											</svg>
										</button>
									</div>
								</td> -->
							</tr>
						{/each}
					</tbody>
				</table>

				<!-- Paginación -->
				{#if totalPages > 1}
					<div class="border-t border-gray-200 bg-white px-6 py-4">
						<div class="flex items-center justify-between">
							<div class="text-sm text-gray-700">
								Mostrando
								<span class="font-medium">{(currentPage - 1) * perPage + 1}</span>
								a
								<span class="font-medium">{Math.min(currentPage * perPage, total)}</span>
								de
								<span class="font-medium">{total}</span>
								resultados
							</div>
							<div class="flex gap-2">
								<button
									on:click={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
									class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Anterior
								</button>
								{#each Array.from({ length: totalPages }, (_, i) => i + 1) as page}
									{#if page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)}
										<button
											on:click={() => handlePageChange(page)}
											class="rounded-lg border px-4 py-2 text-sm font-medium transition-colors {page ===
											currentPage
												? 'border-blue-600 bg-blue-600 text-white'
												: 'border-gray-300 text-gray-700 hover:bg-gray-50'}"
										>
											{page}
										</button>
									{:else if page === currentPage - 2 || page === currentPage + 2}
										<span class="px-2 py-2 text-gray-500">...</span>
									{/if}
								{/each}
								<button
									on:click={() => handlePageChange(currentPage + 1)}
									disabled={currentPage === totalPages}
									class="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
								>
									Siguiente
								</button>
							</div>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<!-- Modal Crear Rol -->
{#if showCrearModal}
	<CrearRolModal on:close={closeCrearModal} on:created={handleRolCreated} />
{/if}
