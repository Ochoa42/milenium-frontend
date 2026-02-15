<script lang="ts">
	import { onMount } from 'svelte';
	import { marcaService } from '$lib/services';
	import type { Marca, MarcaFilters, CreateMarcaDto } from '$lib/interfaces';

	import { Button, ModalConfirm, Pagination } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { MarcaTableSkeleton } from '$lib/components/skeletons';
	import { MarcaCard, MarcaFormModal } from '$lib/components/features/marca';

	let marcas = $state<Marca[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	let filters = $state<MarcaFilters>({
		page: 1,
		perPage: 15,
		search: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let selectedMarca = $state<Marca | null>(null);
	let marcaToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadMarcas()]);
		isLoading = false;
	});

	async function loadMarcas() {
		try {
			const response = await marcaService.getMarcas(filters);
			marcas = response.marcas;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar marcas');
			console.error('Error:', error);
		}
	}

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value;
			filters.page = 1;
			loadMarcas();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadMarcas();
	}

	function openCreateModal() {
		selectedMarca = null;
		isFormModalOpen = true;
	}

	function openEditModal(marca: Marca) {
		selectedMarca = marca;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		marcaToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitMarca(data: CreateMarcaDto) {
		try {
			if (selectedMarca) {
				await marcaService.updateMarca(selectedMarca.id, data);
				alert('success', 'Marca actualizada exitosamente');
			} else {
				await marcaService.createMarca(data);
				alert('success', 'Marca creada exitosamente');
			}
			await loadMarcas();
			isFormModalOpen = false;
		} catch (error) {
			alert('error', selectedMarca ? 'Error al actualizar Marca' : 'Error al crear Marca');
			console.error(error);
		}
	}

	async function handleDelete() {
		if (!marcaToDelete) return;

		try {
			isDeleting = true;
			await marcaService.deleteMarca(marcaToDelete);
			alert('success', 'Marca eliminada exitosamente');
			await loadMarcas();
		} catch (error) {
			alert('error', 'Error al eliminar Marca');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			marcaToDelete = null;
		}
	}
</script>

<div class="container mx-auto">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-light-two">Marcas</h1>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nueva Marca
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
		</div>
	</div>

	{#if isLoading}
		<MarcaTableSkeleton />
	{:else if marcas.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-lg border border-light-four bg-light-one p-12"
		>
			<span class="mb-4 block text-6xl text-light-two"><FilePencilIcon class="size-24" /></span>
			<h3 class="mb-2 text-lg font-medium text-light-two_d">No hay marcas</h3>
			<p class="text-sm text-light-two">
				{filters.search
					? 'No se encontraron marcas con los filtros aplicados'
					: 'Comienza agregando tu primer marca'}
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
							Nombre
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Descripción
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each marcas as marca (marca.id)}
						<MarcaCard {marca} onEdit={openEditModal} onDelete={openDeleteConfirm} />
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && marcas.length > 0}
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

<MarcaFormModal
	bind:isOpen={isFormModalOpen}
	marca={selectedMarca}
	onSubmit={handleSubmitMarca}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar esta marca? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
