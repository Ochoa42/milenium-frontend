<script lang="ts">
	import { onMount } from 'svelte';
	import { empleadosService, rolesService } from '$lib/services';
	import type {
		CreateEmpleadoDto,
		CreateZonaDto,
		Empleado,
		EmpleadoData,
		Rol,
		Zona,
		ZonaFilters
	} from '$lib/interfaces';
	import { EmpleadoTableSkeleton } from '$lib/components/skeletons';
	import { Button, ModalConfirm, Pagination } from '$lib/components/ui';
	import { PlusIcon, ZoomIcon } from '$lib/icons/outline';
	import FilePencilIcon from '$lib/icons/solid/filePencilIcon.svelte';
	import { EmpleadoCard, EmpleadoFormModal } from '$lib/components/features/empleado';
	import { alert } from '$lib/utils';

	// Estados principales
	let empleados = $state<EmpleadoData[]>([]);
	let isLoading = $state(true);
	let total = $state(0);
	let totalPages = $state(1);
	let roles: Rol[] = $state([]);

	// Filtros
	let filters = $state<ZonaFilters>({
		page: 1,
		perPage: 15,
		search: ''
	});

	let searchInput = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Modales y estados UI
	let isFormModalOpen = $state(false);
	let isConfirmModalOpen = $state(false);
	let selectedEmpleado = $state<EmpleadoData | null>(null);
	let empleadoToDelete = $state<string | null>(null);
	let isDeleting = $state(false);

	onMount(async () => {
		isLoading = true;
		await Promise.all([loadEmpleados(), loadRoles()]);
		isLoading = false;
	});

	async function loadEmpleados() {
		try {
			const response = await empleadosService.getEmpleados(filters);
			empleados = response.empleados;
			total = response.total;
			totalPages = response.totalPages;
		} catch (error) {
			alert('error', 'Error al cargar empleados');
			console.error('Error:', error);
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

	function handleSearchInput(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		searchInput = value;

		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			filters.search = value;
			filters.page = 1;
			loadEmpleados();
		}, 500);
	}

	function handlePageChange(page: number) {
		filters.page = page;
		loadEmpleados();
	}

	function openCreateModal() {
		selectedEmpleado = null;
		isFormModalOpen = true;
	}

	function openEditModal(empleado: EmpleadoData) {
		selectedEmpleado = empleado;
		isFormModalOpen = true;
	}

	function openDeleteConfirm(id: string) {
		empleadoToDelete = id;
		isConfirmModalOpen = true;
	}

	async function handleSubmitEmpleado(data: CreateEmpleadoDto) {
		try {
			//console.log('data submit: ', data);
			if (selectedEmpleado) {
				await empleadosService.updateEmpleado(selectedEmpleado.id, data);
				alert('success', 'Empleado actualizado exitosamente');
			} else {
				await empleadosService.createEmpleado(data);
				alert('success', 'Empleado creado exitosamente');
			}
			await loadEmpleados();
		} catch (error) {
			alert('error', selectedEmpleado ? 'Error al actualizar empleado' : 'Error al crear empleado');
			throw error;
		}
	}

	async function handleDelete() {
		if (!empleadoToDelete) return;

		try {
			isDeleting = true;
			await empleadosService.deleteEmpleado(empleadoToDelete);
			alert('success', 'Empleado eliminado exitosamente');
			await loadEmpleados();
		} catch (error) {
			alert('error', 'Error al eliminar empleado');
			console.error('Error:', error);
		} finally {
			isDeleting = false;
			isConfirmModalOpen = false;
			empleadoToDelete = null;
		}
	}
</script>

<div class="container mx-auto">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold text-light-two">Empleados</h1>
		</div>
		<div class="flex items-center gap-3">
			<Button onclick={openCreateModal} variant="primary">
				{#snippet leftIcon()}<PlusIcon class="size-5" />{/snippet}
				Nuevo Empleado
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
		</div>
	</div>

	{#if isLoading}
		<EmpleadoTableSkeleton rows={filters.perPage} />
	{:else if empleados.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-lg border border-light-four bg-light-one p-12"
		>
			<span class="mb-4 block text-6xl text-light-two"><FilePencilIcon class="size-24" /></span>
			<h3 class="mb-2 text-lg font-medium text-light-two_d">No hay empleados</h3>
			<p class="text-sm text-light-two">
				{filters.search
					? 'No se encontraron empleados con los filtros aplicados'
					: 'Comienza agregando tu primer empleado'}
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
							Nombre
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Cargo
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Fecha nacimiento
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Fecha contratación
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Salario
						</th>
						<th
							class="px-6 py-3 text-left text-xs font-medium tracking-wider text-light-one uppercase"
						>
							Telefono
						</th>
						<th
							class="px-6 py-3 text-right text-xs font-medium tracking-wider text-light-one uppercase"
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
					{#each empleados as empleado (empleado.id)}
						<EmpleadoCard {empleado} onEdit={openEditModal} onDelete={openDeleteConfirm} />
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	{#if !isLoading && empleados.length > 0}
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

<EmpleadoFormModal
	bind:isOpen={isFormModalOpen}
	empleado={null}
	{roles}
	onSubmit={handleSubmitEmpleado}
	onClose={() => (isFormModalOpen = false)}
/>

<ModalConfirm
	isOpen={isConfirmModalOpen}
	message="¿Estás seguro de que quieres eliminar esta zona? Esta acción no se puede deshacer."
	loading={isDeleting}
	onConfirm={handleDelete}
	onCancel={() => (isConfirmModalOpen = false)}
/>
