<script lang="ts">
	import { page } from '$app/stores';
	import SidebarItem from '$lib/components/ui/sidebarItem.svelte';
	import { CharBarIcon, ChevronLeftIcon, UsersIcon } from '$lib/icons/outline';
	import SettingsIcon from '$lib/icons/outline/settingsIcon.svelte';
	import { HomeIcon, ShieldIcon } from '$lib/icons/solid';
	import type { MenuItem } from '$lib/interfaces';
	import { slide } from 'svelte/transition';

	let { isOpen, isCollapsed } = $props();

	const menuItems: MenuItem[] = [
		{
			id: 'inicio',
			label: 'Inicio',
			icon: HomeIcon,
			href: '/v1/inicio',
			active: false
		},
		{
			id: 'finanzas',
			label: 'Finanzas',
			icon: CharBarIcon,
			hasSubmenu: true,
			submenu: [
				{
					id: 'cuentas-cobrar',
					label: 'Cuentas por cobrar',
					href: '/v1/finanzas/cuentas-cobrar'
				},
				{
					id: 'venta-productos-pedidos',
					label: 'Venta productos/pedidos',
					href: '/v1/finanzas/venta-productos-pedidos'
				},
				{
					id: 'egresos',
					label: 'Egresos',
					href: '/v1/finanzas/egresos'
				},
				{
					id: 'ingresos',
					label: 'Ingresos',
					href: '/v1/finanzas/ingresos'
				},
				{
					id: 'anticipos',
					label: 'Anticipos',
					href: '/v1/finanzas/anticipos'
				},
				{ id: 'finanzas-matadero', label: 'Matadero Avicor', href: '/v1/finanzas/matadero' },
				{ id: 'finanzas-deudas', label: 'Deudas', href: '/v1/finanzas/deudas' },
				{ id: 'finanzas-anticipos', label: 'Anticipos', href: '/v1/finanzas/anticipos' }
			]
		},
		{
			id: 'administracion',
			label: 'Administración',
			icon: SettingsIcon,
			hasSubmenu: true,
			submenu: []
		},
		{
			id: 'roles',
			href: '/v1/roles',
			label: 'Roles',
			icon: SettingsIcon,
			hasSubmenu: false,
			submenu: []
		},
		{
			id: 'usuarios',
			label: 'Usuarios',
			icon: UsersIcon,
			href: '/v1/usuarios',
			hasSubmenu: true,
			submenu: [
				{
					id: 'usuarios-administradores',
					label: 'Administradores',
					href: '/v1/usuarios/administrador'
				},
				{
					id: 'usuarios-empleados',
					label: 'Empleados',
					href: '/v1/usuarios/empleados'
				},
				{
					id: 'usuarios-clientes',
					label: 'Clientes',
					href: '/v1/usuarios/clientes'
				},
				{
					id: 'usuarios-proveedores',
					label: 'Proveedores',
					href: '/v1/usuarios/proveedores'
				},
				{
					id: 'usuarios-promotor-ventas',
					label: 'Promotor ventas',
					href: '/v1/usuarios/promotor-ventas'
				}
			]
		},

		{
			id: 'granjas',
			label: 'Granjas',
			icon: ShieldIcon,
			hasSubmenu: true,
			submenu: []
		},
		{
			id: 'zonas',
			label: 'Zonas',
			icon: ShieldIcon,
			href: '/v1/zonas',
			active: false
		}
	];

	const closeSidebar = () => {
		if (window.innerWidth < 768) {
			isOpen = false;
		}
	};

	const toggleSidebarCollapse = () => {
		isCollapsed = !isCollapsed;
	};

	const isPathActive = (path: string) => {
		return $page.url.pathname === path;
	};

	const hasActiveChild = (item: MenuItem) => {
		if (!item.submenu) return false;
		return item.submenu.some((subItem) => isPathActive(subItem.href));
	};
</script>

{#if isOpen}
	<div
		class="fixed inset-0 z-40 bg-black opacity-20 md:hidden"
		onclick={closeSidebar}
		role="button"
		tabindex="0"
		onkeydown={(e) => e.key === 'Escape' && closeSidebar()}
	></div>
{/if}

<div class="relative">
	<aside
		class="z-50 border-r border-light-one bg-light-two text-light-one transition-all duration-300 ease-in-out
         {isOpen ? 'translate-x-0' : '-translate-x-full'} 
         fixed flex h-full flex-col md:relative md:translate-x-0
         {isCollapsed ? 'md:w-16' : 'w-64'}"
	>
		<button
			class="top-4 -right-4 z-50 -ml-5 hidden rounded-full bg-light-three p-2 text-light-one shadow-lg transition-all duration-300 hover:bg-light-three_d md:absolute md:block"
			onclick={toggleSidebarCollapse}
			aria-label="Toggle sidebar"
		>
			<ChevronLeftIcon class="h-4 w-4 {isCollapsed ? 'rotate-180' : ''}" />
		</button>
		<div class="relative flex flex-col items-center justify-center overflow-x-hidden p-4">
			{#if !isCollapsed}
				<div
					class="flex h-26 w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-white"
				>
					<div class="flex items-center">
						<div class="my-auto flex items-center justify-center rounded">
							<img src="/images/background.png" class="h-26 w-60" alt="" />
						</div>
					</div>
				</div>
				<div
					class="flex w-full flex-col items-center justify-center border-b border-light-accent pb-4"
				>
					<p class="mt-2 text-xs text-light-accent">Estas en</p>
					<p class="mt-2 text-sm font-semibold text-light-one">Milenium</p>
				</div>
			{:else}
				<div class="flex justify-center">
					<div class="flex h-8 w-8 items-center justify-center rounded bg-light-one">
						<HomeIcon class="h-5 w-5 text-light-accent" />
					</div>
				</div>
			{/if}
		</div>

		<nav class="flex-1 overflow-y-auto px-4">
			{#each menuItems as item}
				<SidebarItem
					{item}
					{isCollapsed}
					onItemClick={closeSidebar}
					isActive={isPathActive(item.href || '')}
					hasActiveChild={hasActiveChild(item)}
				/>
			{/each}
		</nav>
	</aside>
</div>
