<script lang="ts">
	import { ChevronLeftIcon } from '$lib/icons/outline';
	import ChevronRightIcon from '$lib/icons/outline/chevronRightIcon.svelte';

	interface Props {
		currentPage: number;
		totalPages: number;
		perPage: number;
		total: number;
		onPageChange: (page: number) => void;
		maxVisiblePages?: number;
	}

	let {
		currentPage,
		totalPages,
		perPage,
		total,
		onPageChange,
		maxVisiblePages = 5
	}: Props = $props();

	function getVisiblePages(): number[] {
		const pages: number[] = [];

		if (totalPages <= maxVisiblePages) {
			// Mostrar todas las páginas si son pocas
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			// Lógica para mostrar páginas con puntos suspensivos
			const halfVisible = Math.floor(maxVisiblePages / 2);
			let startPage = Math.max(currentPage - halfVisible, 1);
			let endPage = Math.min(startPage + maxVisiblePages - 1, totalPages);

			// Ajustar si estamos cerca del final
			if (endPage - startPage < maxVisiblePages - 1) {
				startPage = Math.max(endPage - maxVisiblePages + 1, 1);
			}

			// Siempre mostrar primera página
			if (startPage > 1) {
				pages.push(1);
				if (startPage > 2) {
					pages.push(-1); // -1 representa "..."
				}
			}

			// Páginas del medio
			for (let i = startPage; i <= endPage; i++) {
				pages.push(i);
			}

			// Siempre mostrar última página
			if (endPage < totalPages) {
				if (endPage < totalPages - 1) {
					pages.push(-1); // -1 representa "..."
				}
				pages.push(totalPages);
			}
		}

		return pages;
	}

	function handlePageClick(page: number) {
		if (page === currentPage || page < 1 || page > totalPages) return;
		onPageChange(page);
	}

	function goToFirstPage() {
		if (currentPage !== 1) {
			onPageChange(1);
		}
	}

	function goToLastPage() {
		if (currentPage !== totalPages) {
			onPageChange(totalPages);
		}
	}

	function goToPreviousPage() {
		if (currentPage > 1) {
			onPageChange(currentPage - 1);
		}
	}

	function goToNextPage() {
		if (currentPage < totalPages) {
			onPageChange(currentPage + 1);
		}
	}

	let startItem = $derived((currentPage - 1) * perPage + 1);
	let endItem = $derived(Math.min(currentPage * perPage, total));
	let visiblePages = $derived(getVisiblePages());
</script>

<div
	class="flex items-center justify-between rounded-lg border border-light-four/20 bg-light-one px-4 py-3"
>
	<!-- Info de resultados -->
	<div class="flex items-center gap-4">
		<p class="text-sm text-light-two">
			Mostrando <span class="font-medium text-light-two_d">{startItem}</span> a
			<span class="font-medium text-light-two_d">{endItem}</span> de
			<span class="font-medium text-light-two_d">{total}</span> resultados
		</p>
	</div>

	<div class="flex items-center gap-2">
		<!-- <button
			onclick={goToFirstPage}
			disabled={currentPage === 1}
			class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-light-four bg-light-one text-sm font-medium text-light-two_d transition-colors hover:bg-light-one_d disabled:cursor-not-allowed disabled:opacity-40"
			title="Primera página"
		>
			page 1
		</button> -->
		<button
			onclick={goToPreviousPage}
			disabled={currentPage === 1}
			class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-light-four bg-light-one text-sm font-medium text-light-two_d transition-colors hover:bg-light-one_d disabled:cursor-not-allowed disabled:opacity-40"
			title="Página anterior"
		>
			<ChevronLeftIcon />
		</button>

		<div class="flex items-center gap-1">
			{#each visiblePages as page (page)}
				{#if page === -1}
					<span class="inline-flex h-9 w-9 items-center justify-center text-light-two"> ⋯ </span>
				{:else}
					<button
						onclick={() => handlePageClick(page)}
						class="inline-flex h-9 min-w-[2.25rem] items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors {page ===
						currentPage
							? 'border-light-three bg-light-three text-light-one'
							: 'border-light-four bg-light-one text-light-two_d hover:bg-light-one_d'}"
					>
						{page}
					</button>
				{/if}
			{/each}
		</div>
		<button
			onclick={goToNextPage}
			disabled={currentPage === totalPages}
			class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-light-four bg-light-one text-sm font-medium text-light-two_d transition-colors hover:bg-light-one_d disabled:cursor-not-allowed disabled:opacity-40"
			title="Página siguiente"
		>
			<ChevronRightIcon />
		</button>

		<!-- <button
			onclick={goToLastPage}
			disabled={currentPage === totalPages}
			class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-light-four bg-light-one text-sm font-medium text-light-two_d transition-colors hover:bg-light-one_d disabled:cursor-not-allowed disabled:opacity-40"
			title="Última página"
		>
			page {totalPages}
		</button> -->
	</div>
</div>
