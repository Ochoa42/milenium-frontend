<script lang="ts">
	import { onMount } from 'svelte';
	import { marcaService, unidadMedidaService } from '$lib/services';
	import type {
		Marca,
		MarcaFilters,
		CreateMarcaDto,
		UnidadMedida,
		UnidadMedidaFilters,
		CreateUnidadMedidaDto
	} from '$lib/interfaces';

	import { Button, ModalConfirm, Pagination } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { UnidadMedidaTableSkeleton } from '$lib/components/skeletons';
	import { UnidadMedidaCard, UnidadMedidaFormModal } from '$lib/components/features/unidadMedida';

	let unidadMedidas: UnidadMedida[] = $state([]);
	let isLoading: boolean = $state(true);
	let total: number = $state(0);
	let totalPages: number = $state(1);

	let filters = $state<UnidadMedidaFilters>({
		page: 1,
		perPage: 15,
		search: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let selectedUnidadMedida = $state<UnidadMedida | null>(null);
	let unidadMedidaToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await loadUnidadMedidas();
		isLoading = false;
	});

	async function loadUnidadMedidas() {
		try {
			const response = await unidadMedidaService.getUnidadMedidas(filters);
			unidadMedidas = response.unidadMedidas;
			console.log('response', response);
			console.log('unidadMedidas', unidadMedidas);
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar unidad de medida');
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
			loadUnidadMedidas();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadUnidadMedidas();
	}

	function openCreateModal() {
		selectedUnidadMedida = null;
		isFormModalOpen = true;
	}

	function openEditModal(unidadMedida: UnidadMedida) {
		selectedUnidadMedida = unidadMedida;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		unidadMedidaToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitUnidadMedida(data: CreateUnidadMedidaDto) {
		try {
			if (selectedUnidadMedida) {
				await unidadMedidaService.updateUnidadMedida(selectedUnidadMedida.id, data);
				alert('success', 'Unidad de medida actualizada exitosamente');
			} else {
				await unidadMedidaService.createUnidadMedida(data);
				alert('success', 'Unidad de medida creada exitosamente');
			}
			await loadUnidadMedidas();
			isFormModalOpen = false;
		} catch (error) {
			alert(
				'error',
				selectedUnidadMedida
					? 'Error al actualizar Unidad de medida'
					: 'Error al crear Unidad de medida'
			);
			console.error(error);
		}
	}

	async function handleDelete() {
		if (!unidadMedidaToDelete) return;

		try {
			isDeleting = true;
			await unidadMedidaService.deleteUnidadMedida(unidadMedidaToDelete);
			alert('success', 'Unidad de medida eliminada exitosamente');
			await loadUnidadMedidas();
		} catch (error) {
			alert('error', 'Error al eliminar unidad de medida');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			unidadMedidaToDelete = null;
		}
	}
</script>

<div class="container mx-auto">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-light-two">Unidades de Medida</h1>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nueva Unidad de Medida
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
		<UnidadMedidaTableSkeleton />
	{:else if unidadMedidas.length === 0}
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
							Abreviatura
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Acciones
						</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-light-four bg-light-one">
					{#each unidadMedidas as unidadMedida (unidadMedida.id)}
						<UnidadMedidaCard {unidadMedida} onEdit={openEditModal} onDelete={openDeleteConfirm} />
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && unidadMedidas.length > 0}
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

<UnidadMedidaFormModal
	bind:isOpen={isFormModalOpen}
	unidadMedida={selectedUnidadMedida}
	onSubmit={handleSubmitUnidadMedida}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar esta unidad de medida? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
