<script lang="ts">
	import { onMount } from 'svelte';
	import { proveedoresService, zonasService } from '$lib/services';
	import type { Proveedor, ProveedorFilters, CreateProveedorDto, Zona } from '$lib/interfaces';

	import { ProveedorCard } from '$lib/components/features/proveedor';
	// import { Provee } from '$lib/components/proveedor';

	import { Button, ModalConfirm, Pagination, Select } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { ProveedorTableSkeleton } from '$lib/components/skeletons';
	import ProveedorFormModal from '$lib/components/features/proveedor/proveedorFormModal.svelte';

	let proveedores = $state<Proveedor[]>([]);
	let zonas = $state<Zona[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	let filters = $state<ProveedorFilters>({
		page: 1,
		perPage: 15,
		search: '',
		zona_id: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let selectedProveedor = $state<Proveedor | null>(null);
	let proveedorToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadProveedores(), loadZonas()]);
		isLoading = false;
	});

	async function loadProveedores() {
		try {
			const response = await proveedoresService.getProveedores(filters);
			proveedores = response.proveedores;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar proveedores');
			console.error('Error:', error);
		}
	}

	async function loadZonas() {
		try {
			const response = await zonasService.getZonas();
			zonas = response.zonas;
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
			loadProveedores();
		}, 500);
	}

	function handleZonaChange(id: string) {
		filters.zona_id = id;
		filters.page = 1;
		loadProveedores();
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadProveedores();
	}

	function openCreateModal() {
		selectedProveedor = null;
		isFormModalOpen = true;
	}

	function openEditModal(proveedor: Proveedor) {
		selectedProveedor = proveedor;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		proveedorToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitProveedor(data: CreateProveedorDto) {
		try {
			if (selectedProveedor) {
				await proveedoresService.updateProveedor(selectedProveedor.id, data);
				alert('success', 'Proveedor actualizado exitosamente');
			} else {
				await proveedoresService.createProveedor(data);
				alert('success', 'Proveedor creado exitosamente');
			}
			await loadProveedores();
			isFormModalOpen = false;
		} catch (error) {
			alert(
				'error',
				selectedProveedor ? 'Error al actualizar Proveedor' : 'Error al crear Proveedor'
			);
			console.error(error);
		}
	}

	async function handleDelete() {
		if (!proveedorToDelete) return;

		try {
			isDeleting = true;
			await proveedoresService.deleteProveedor(proveedorToDelete);
			alert('success', 'Proveedor eliminado exitosamente');
			await loadProveedores();
		} catch (error) {
			alert('error', 'Error al eliminar Proveedor');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			proveedorToDelete = null;
		}
	}
</script>

<div class="container mx-auto">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-light-two">Proveedores</h1>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nuevo Proveedor
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
						placeholder="Buscar por nombre y apellidos"
						class="w-full rounded-md border border-light-four bg-light-one px-4 py-2 pl-10 text-light-two_d focus:border-light-two focus:ring-1 focus:ring-light-two focus:outline-none"
					/>
					<span class="absolute top-1/2 left-3 -translate-y-1/2 text-light-two"><ZoomIcon /></span>
				</div>
			</div>

			<div class="w-48">
				<Select
					id="zona_filter"
					value={filters.zona_id}
					onchange={(e) => handleZonaChange((e.target as HTMLSelectElement).value)}
				>
					<option value="">Todas las zonas</option>
					{#each zonas as zona}
						<option value={zona.id}>{zona.nombre}</option>
					{/each}
				</Select>
			</div>
		</div>
	</div>

	{#if isLoading}
		<ProveedorTableSkeleton />
	{:else if proveedores.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-lg border border-light-four bg-light-one p-12"
		>
			<span class="mb-4 block text-6xl text-light-two"><FilePencilIcon class="size-24" /></span>
			<h3 class="mb-2 text-lg font-medium text-light-two_d">No hay proveedores</h3>
			<p class="text-sm text-light-two">
				{filters.search || filters.zona_id
					? 'No se encontraron proveedores con los filtros aplicados'
					: 'Comienza agregando tu primer proveedor'}
			</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-light-four bg-light-one">
			<table class="min-w-full divide-y divide-light-four">
				<thead class="bg-light-two">
					<tr>
						<!-- <th class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase">
                            CI / NIT
                        </th> -->
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Nombre Completo
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Empresa
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Teléfono
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Zona
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Direccion
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each proveedores as proveedor (proveedor.id)}
						<ProveedorCard {proveedor} onEdit={openEditModal} onDelete={openDeleteConfirm} />
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && proveedores.length > 0}
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

<ProveedorFormModal
	bind:isOpen={isFormModalOpen}
	proveedor={selectedProveedor}
	{zonas}
	onSubmit={handleSubmitProveedor}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar este proveedor? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
