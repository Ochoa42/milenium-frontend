<script lang="ts">
	import { onMount } from 'svelte';
	import { categoriaService, marcaService } from '$lib/services';
	import type {
		Marca,
		MarcaFilters,
		CreateMarcaDto,
		Categoria,
		CategoriaFilters
	} from '$lib/interfaces';

	import { Button, ModalConfirm, Pagination } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { alert } from '$lib/utils';
	import { MarcaTableSkeleton } from '$lib/components/skeletons';
	import { MarcaCard, MarcaFormModal } from '$lib/components/features/marca';
	import { CategoriaCard, CategoriaFormModal } from '$lib/components/features/categoria';

	let categorias = $state<Categoria[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);

	let filters = $state<CategoriaFilters>({
		page: 1,
		perPage: 15,
		search: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let selectedCategoria = $state<Categoria | null>(null);
	let categoriaToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadCategorias()]);
		isLoading = false;
	});

	async function loadCategorias() {
		try {
			const response = await categoriaService.getCategorias(filters);
			categorias = response.categorias;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar categorias');
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
			loadCategorias();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadCategorias();
	}

	function openCreateModal() {
		selectedCategoria = null;
		isFormModalOpen = true;
	}

	function openEditModal(categoria: Categoria) {
		selectedCategoria = categoria;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		categoriaToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitCategoria(data: CreateMarcaDto) {
		try {
			if (selectedCategoria) {
				await categoriaService.updateCategoria(selectedCategoria.id, data);
				alert('success', 'Categoria actualizada exitosamente');
			} else {
				await categoriaService.createCategoria(data);
				alert('success', 'Categoria creada exitosamente');
			}
			await loadCategorias();
			isFormModalOpen = false;
		} catch (error) {
			alert(
				'error',
				selectedCategoria ? 'Error al actualizar Categoria' : 'Error al crear Categoria'
			);
			console.error(error);
		}
	}

	async function handleDelete() {
		if (!categoriaToDelete) return;

		try {
			isDeleting = true;
			await categoriaService.deleteCategoria(categoriaToDelete);
			alert('success', 'Categoria eliminada exitosamente');
			await loadCategorias();
		} catch (error) {
			alert('error', 'Error al eliminar Categoria');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			categoriaToDelete = null;
		}
	}
</script>

<div class="container mx-auto">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-light-two">Categorías</h1>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nueva Categoría
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
	{:else if categorias.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-lg border border-light-four bg-light-one p-12"
		>
			<span class="mb-4 block text-6xl text-light-two"><FilePencilIcon class="size-24" /></span>
			<h3 class="mb-2 text-lg font-medium text-light-two_d">No hay categorías</h3>
			<p class="text-sm text-light-two">
				{filters.search
					? 'No se encontraron categorías con los filtros aplicados'
					: 'Comienza agregando tu primera categoría'}
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
					{#each categorias as categoria (categoria.id)}
						<CategoriaCard {categoria} onEdit={openEditModal} onDelete={openDeleteConfirm} />
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && categorias.length > 0}
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

<CategoriaFormModal
	bind:isOpen={isFormModalOpen}
	categoria={selectedCategoria}
	onSubmit={handleSubmitCategoria}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar esta marca? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
