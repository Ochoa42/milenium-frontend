<script lang="ts">
	import { onMount } from 'svelte';
	import type { Usuario, Rol } from '$lib/interfaces';
	import { goto } from '$app/navigation';
	import { rolesService, usuariosService } from '$lib/services';
	import { CrearUsuarioModal } from '$lib/components/features/usuario';
	import { Button } from '$lib/components/ui';
	import { PlusIcon } from '$lib/icons/outline';

	let usuarios: Usuario[] = [];
	let roles: Rol[] = [];
	let loading = true;
	let error = '';
	let showCrearModal = false;

	// Búsqueda y filtros
	let searchTerm = '';
	let selectedRol = '';
	let selectedEstado = '';
	let searchTimeout: ReturnType<typeof setTimeout>;

	onMount(() => {
		loadData();
	});

	async function loadData() {
		await Promise.all([loadUsuarios(), loadRoles()]);
	}

	async function loadUsuarios() {
		try {
			loading = true;
			error = '';
			usuarios = await usuariosService.getUsuarios({
				search: searchTerm || undefined,
				rol_id: selectedRol || undefined,
				esta_activo: selectedEstado === '' ? undefined : selectedEstado === 'true'
			});
		} catch (err) {
			error = 'Error al cargar los usuarios';
			console.error(err);
		} finally {
			loading = false;
		}
	}

	async function loadRoles() {
		try {
			const response = await rolesService.getRoles({ perPage: 100 });
			roles = response;
		} catch (err) {
			console.error('Error al cargar roles:', err);
		}
	}

	function handleSearch() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			loadUsuarios();
		}, 500);
	}

	function handleFilterChange() {
		loadUsuarios();
	}

	function openCrearModal() {
		showCrearModal = true;
	}

	function closeCrearModal() {
		showCrearModal = false;
	}

	async function handleUsuarioCreated() {
		closeCrearModal();
		await loadUsuarios();
	}

	async function handleToggleEstado(id: string, currentEstado: boolean) {
		try {
			await usuariosService.toggleEstado(id, !currentEstado);
			await loadUsuarios();
		} catch (err) {
			alert('Error al cambiar el estado del usuario');
			console.error(err);
		}
	}

	async function handleDelete(id: string) {
		if (!confirm('¿Está seguro de eliminar este usuario?')) return;

		try {
			await usuariosService.deleteUsuario(id);
			await loadUsuarios();
		} catch (err) {
			alert('Error al eliminar el usuario');
			console.error(err);
		}
	}

	function handleEdit(id: string) {
		goto(`/usuarios/${id}/editar`);
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('es-ES', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getRolNombre(usuario: Usuario): string {
		if (usuario.rol) return usuario.rol.nombre_rol;
		const rol = roles.find((r) => r.id === usuario.rol_id);
		return rol?.nombre_rol || 'Sin rol';
	}

	function getRolCode(usuario: Usuario): string {
		if (usuario.rol) return usuario.rol.code_rol;
		const rol = roles.find((r) => r.id === usuario.rol_id);
		return rol?.code_rol || 'N/A';
	}

	function clearFilters() {
		searchTerm = '';
		selectedRol = '';
		selectedEstado = '';
		loadUsuarios();
	}
</script>

<div class="">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8">
			<h1 class="text-3xl font-bold text-light-black">Gestión de Usuarios</h1>
		</div>
		<div class="mb-6 rounded-lg bg-white p-6 shadow">
			<div class="space-y-4">
				<div class="flex items-center justify-between gap-4">
					<div class="max-w-md flex-1">
						<div class="relative">
							<input
								type="text"
								placeholder="Buscar por nombre o email..."
								bind:value={searchTerm}
								on:input={handleSearch}
								class="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-light-three"
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
						Nuevo Usuario
					</Button>
				</div>
				<div class="flex items-center gap-4">
					<div class="max-w-xs flex-1">
						<label for="filter-rol" class="mb-1 block text-sm font-medium text-gray-700">
							Filtrar por Rol
						</label>
						<select
							id="filter-rol"
							bind:value={selectedRol}
							on:change={handleFilterChange}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Todos los roles</option>
							{#each roles as rol}
								<option value={rol.id}>{rol.nombre_rol}</option>
							{/each}
						</select>
					</div>
					<div class="max-w-xs flex-1">
						<label for="filter-estado" class="mb-1 block text-sm font-medium text-gray-700">
							Filtrar por Estado
						</label>
						<select
							id="filter-estado"
							bind:value={selectedEstado}
							on:change={handleFilterChange}
							class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
						>
							<option value="">Todos</option>
							<option value="true">Activos</option>
							<option value="false">Inactivos</option>
						</select>
					</div>

					<!-- Botón limpiar filtros -->
					{#if searchTerm || selectedRol || selectedEstado}
						<div class="max-w-xs flex-1">
							<label class="mb-1 block text-sm font-medium text-transparent">Acciones</label>
							<button
								on:click={clearFilters}
								class="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
								Limpiar filtros
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
		<div class="overflow-hidden rounded-lg bg-white shadow">
			{#if loading}
				<div class="p-12 text-center">
					<div
						class="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"
					></div>
					<p class="mt-4 text-gray-600">Cargando usuarios...</p>
				</div>
			{:else if error}
				<div class="p-12 text-center">
					<p class="text-red-600">{error}</p>
					<button
						on:click={loadUsuarios}
						class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Reintentar
					</button>
				</div>
			{:else if usuarios.length === 0}
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
							d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
						/>
					</svg>
					<p class="mt-4 text-gray-600">No se encontraron usuarios</p>
					<Button onclick={openCrearModal} variant="secondary">Crear primer usuario</Button>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-light-two text-light-one">
							<tr>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
									Usuario
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
									Email
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
									Rol
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
									Estado
								</th>
								<th class="px-6 py-3 text-left text-xs font-medium tracking-wider uppercase">
									Fecha Creación
								</th>
								<!-- <th
									class="px-6 py-3 text-right text-xs font-medium tracking-wider uppercase"
								>
									Acciones
								</th> -->
							</tr>
						</thead>
						<tbody class="divide-y divide-light-four">
							{#each usuarios as usuario}
								<tr class="transition-colors hover:bg-gray-50">
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="flex items-center">
											<div class="h-10 w-10 flex-shrink-0">
												<div
													class="flex h-10 w-10 items-center justify-center rounded-full bg-light-four"
												>
													<span class="text-sm font-medium text-light-two">
														{usuario.name_user.substring(0, 2).toUpperCase()}
													</span>
												</div>
											</div>
											<div class="ml-4">
												<div class="text-sm font-medium text-gray-900">{usuario.name_user}</div>
											</div>
										</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm text-gray-900">{usuario.email}</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<span
											class="inline-flex rounded-full bg-light-accent px-2 text-xs leading-5 font-semibold text-light-two"
										>
											{getRolCode(usuario)}
										</span>
										<div class="mt-1 text-xs text-gray-500">{getRolNombre(usuario)}</div>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<button
											on:click={() => handleToggleEstado(usuario.id, usuario.esta_activo)}
											class="relative inline-flex items-center"
										>
											<span
												class="inline-flex rounded-full px-2 text-xs leading-5 font-semibold {usuario.esta_activo
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'}"
											>
												{usuario.esta_activo ? 'Activo' : 'Inactivo'}
											</span>
										</button>
									</td>
									<td class="px-6 py-4 whitespace-nowrap">
										<div class="text-sm text-gray-500">{formatDate(usuario.createdAt)}</div>
									</td>
									<!-- <td class="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
										<div class="flex justify-end gap-2">
											<button
												on:click={() => handleEdit(usuario.id)}
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
												on:click={() => handleDelete(usuario.id)}
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
				</div>

				<!-- Contador de resultados -->
				<div class="border-t border-gray-200 bg-gray-50 px-6 py-4">
					<div class="text-sm text-gray-700">
						Total: <span class="font-medium">{usuarios.length}</span> usuarios
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

{#if showCrearModal}
	<CrearUsuarioModal {roles} on:close={closeCrearModal} on:created={handleUsuarioCreated} />
{/if}
