<script lang="ts">
	import { HelpOctagonIcon, CashIcon, TrendingUpIcon } from '$lib/icons/outline';
	import CodeIcon from '$lib/icons/outline/codeIcon.svelte';
	import { HomeIcon } from '$lib/icons/solid';
	import StatsIcon from '$lib/icons/solid/statsIcon.svelte';

	interface Props {
		totalVentas: number;
		montoTotal: number;
	}

	let { totalVentas, montoTotal }: Props = $props();
</script>

<div class="mb-6 flex items-start gap-4">
	<div class="relative overflow-hidden rounded-lg bg-light-two p-2 text-white">
		<div class="">
			<div class=" flex items-center justify-between gap-8">
				<span class="flex items-center gap-1 text-sm font-medium opacity-90"
					>Total de Ventas <span><HelpOctagonIcon class="size-4" /></span></span
				>
				<div class="rounded-full bg-transparent border border-blue-500 p-2">
					<HomeIcon class="size-6 text-blue-500" />
				</div>
			</div>
			<p class="text-3xl font-semibold text-light-one">{totalVentas}</p>
		</div>
	</div>

	<div class="relative overflow-hidden rounded-lg bg-light-two p-2">
		<div class="">
			<div class="flex items-center justify-between gap-8">
				<span class="flex items-center gap-1 text-sm font-medium text-light-one opacity-90"
					>Monto Total Vendido <span><HelpOctagonIcon class="size-4" /></span></span
				>
				<div class="rounded-full bg-transparent border border-yellow-500 p-2">
					<HomeIcon class="size-6 text-yellow-500" />
				</div>
			</div>
			<p class="text-3xl font-semibold text-light-one">{montoTotal.toFixed(2)} Bs.</p>
		</div>
	</div>
</div>
