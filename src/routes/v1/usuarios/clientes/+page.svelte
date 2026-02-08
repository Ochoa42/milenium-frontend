<script lang="ts">
	import { onMount } from 'svelte';
	import { clientesService } from '$lib/services';
	import { zonasService } from '$lib/services';
	import type { Cliente, ClienteFilters, CreateClienteDto } from '$lib/interfaces';
	import type { Zona } from '$lib/interfaces';
	import { ClienteTableSkeleton } from '$lib/components/skeletons';
	import { Button, ModalConfirm, Pagination, Select } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { ClienteCard, ClienteFormModal } from '$lib/components/features/cliente';

	// Estados principales
	let clientes = $state<Cliente[]>([]);
	let zonas = $state<Zona[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	// Filtros
	let filters = $state<ClienteFilters>({
		page: 1,
		perPage: 15,
		search: '',
		tipo_cliente: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Modales y estados UI
	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let selectedCliente = $state<Cliente | null>(null);
	let clienteToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadClientes(), loadZonas()]);
		isLoading = false;
	});

	async function loadClientes() {
		try {
			// isLoading = true;
			const response = await clientesService.getClientes(filters);
			clientes = response.clientes;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar clientes');
			console.error('Error:', error);
		}
		// finally {
		// 	isLoading = false;
		// }
	}

	async function loadZonas() {
		try {
			zonas = (await zonasService.getZonas()).zonas;
			//console.log('zonas', zonas);
		} catch (error) {
			alert('error', 'Error al cargar zonas');
			console.error('Error al cargar zonas:', error);
		}
	}

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value;
			filters.page = 1;
			loadClientes();
		}, 500);
	}

	function handleTipoClienteChange(tipo: string) {
		filters.tipo_cliente = tipo as 'MIN' | 'MAY' | '';
		filters.page = 1;
		loadClientes();
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadClientes();
	}

	function openCreateModal() {
		selectedCliente = null;
		isFormModalOpen = true;
	}

	function openEditModal(cliente: Cliente) {
		selectedCliente = cliente;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		clienteToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitCliente(data: CreateClienteDto) {
		try {
			console.log('data submit: ', data);
			if (selectedCliente) {
				await clientesService.updateCliente(selectedCliente.id, data);
				alert('success', 'Cliente actualizado exitosamente');
			} else {
				await clientesService.createCliente(data);
				alert('success', 'Cliente creado exitosamente');
			}
			await loadClientes();
		} catch (error) {
			alert('error', selectedCliente ? 'Error al actualizar cliente' : 'Error al crear cliente');
			throw error;
		}
	}

	async function handleDelete() {
		if (!clienteToDelete) return;

		try {
			isDeleting = true;
			await clientesService.deleteCliente(clienteToDelete);
			alert('success', 'Cliente eliminado exitosamente');
			await loadClientes();
		} catch (error) {
			alert('error', 'Error al eliminar cliente');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			clienteToDelete = null;
		}
	}
</script>

<div class="container mx-auto">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-light-two">Clientes</h1>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nuevo Cliente
			</Button>
		</div>
	</div>

	<div class="mb-6">
		<div class="flex gap-4">
			<div class="flex-1">
				<div class="relative">
					<input
						type="text"
						value={searchInput}
						oninput={handleSearchInput}
						placeholder="Buscar por nombre, apellido, CI..."
						class="w-full rounded-md border border-light-four bg-light-one px-4 py-2 pl-10 text-light-two_d focus:border-light-two focus:ring-1 focus:ring-light-two focus:outline-none"
					/>
					<span class="absolute top-1/2 left-3 -translate-y-1/2 text-light-two"><ZoomIcon /></span>
				</div>
			</div>

			<div class="w-48">
				<Select
					id="tipo_cliente"
					value={filters.tipo_cliente}
					onchange={(e) => handleTipoClienteChange((e.target as HTMLSelectElement).value)}
				>
					<option value="">Todos los tipos</option>
					<option value="MIN">Minorista</option>
					<option value="MAY">Mayorista</option>
				</Select>
			</div>
		</div>
	</div>

	{#if isLoading}
		<ClienteTableSkeleton />
	{:else if clientes.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-lg border border-light-four bg-light-one p-12"
		>
			<span class="mb-4 block text-6xl text-light-two"><FilePencilIcon class="size-24" /></span>
			<h3 class="mb-2 text-lg font-medium text-light-two_d">No hay clientes</h3>
			<p class="text-sm text-light-two">
				{filters.search || filters.tipo_cliente
					? 'No se encontraron clientes con los filtros aplicados'
					: 'Comienza agregando tu primer cliente'}
			</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-light-four bg-light-one">
			<table class="min-w-full divide-y divide-light-four">
				<thead class="bg-light-two">
					<tr>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							CI
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Nombre Completo
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Correo
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Teléfono
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Fecha nacimiento
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Puntos
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Tipo
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Dirección
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each clientes as cliente (cliente.id)}
						<ClienteCard {cliente} onEdit={openEditModal} onDelete={openDeleteConfirm} />
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && clientes.length > 0}
		<div class="mt-6">
			<Pagination
				currentPage={filters.page!}
				{totalPages}
				perPage={filters.perPage!}
				{total}
				onPageChange={handlePageChange}
			/>
		</div>
	{/if}
</div>

<ClienteFormModal
	bind:isOpen={isFormModalOpen}
	cliente={selectedCliente}
	{zonas}
	onSubmit={handleSubmitCliente}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar este cliente? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
