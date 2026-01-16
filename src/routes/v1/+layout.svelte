<script lang="ts">
	import Sidebar from '$lib/components/ui/sidebar.svelte';
	import Header from '$lib/components/ui/header.svelte';

	let sidebarOpen: boolean = $state(false);

	const toggleSidebar = () => {
		sidebarOpen = !sidebarOpen;
	};

	let { children } = $props();
</script>

<div class="flex h-screen bg-gray-100">
	<Sidebar isOpen={sidebarOpen} isCollapsed={false} />
	<div class="flex flex-1 flex-col overflow-hidden transition-all duration-300">
		<Header onToggleSidebar={toggleSidebar} />

		<main class="flex-1 overflow-y-auto p-6">
			{@render children?.()}
		</main>
	</div>
</div>
