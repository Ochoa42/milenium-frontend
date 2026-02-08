<script lang="ts">
	import { BellIcon, SettingsIcon } from '$lib/icons/outline';
	import type { DropdownOption } from '$lib/interfaces';
	import { authStore } from '$lib/stores/auth.store';
	import DropdownMenu from './dropdownMenu.svelte';

	interface Props {
		onToggleSidebar: () => void;
	}

	let { onToggleSidebar }: Props = $props();

	interface User {
		name: string;
		avatar: string;
	}

	const user: User = {
		name: 'Manuel Medrano',
		avatar: '/api/placeholder/32/32'
	};

	let isDropdownOpen = $state(false);
	let width: number = $state(150);

	const options: DropdownOption[] = [
		{
			id: 'delete',
			label: 'Cerrar Sesión',
			icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-logout"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 8v-2a2 2 0 0 0 -2 -2h-7a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2 -2v-2" /><path d="M9 12h12l-3 -3" /><path d="M18 15l3 -3" /></svg>`,
			action: () => logout(),
			divider: true,
			disabled: false
		}
	];

	const logout = () => {
		authStore.logout();
	};
</script>

<header class="bg-light-two text-light-one shadow-lg">
	<div class="flex items-center justify-between px-4 py-3">
		<button
			class="rounded-md p-2 transition-colors md:hidden"
			onclick={onToggleSidebar}
			aria-label="Toggle sidebar"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>

		<div class="flex-1 md:flex-none">
			<h1 class="text-lg font-semibold">¡Hola {user.name}!</h1>
			<p class="hidden text-sm sm:block">
				Lorem ipsum, dolor sit amet consectetur adipisicing elit.
			</p>
		</div>

		<div class="flex items-center gap-2">
			<button class="rounded-full p-2 transition-colors" aria-label="Notifications">
				<BellIcon />
			</button>

			<button class="rounded-full p-2 transition-colors" aria-label="Settings">
				<SettingsIcon />
			</button>
			<div class="relative">
				<button
					class="flex items-center gap-2 rounded-full p-1 transition-colors"
					onclick={() => (isDropdownOpen = !isDropdownOpen)}
				>
					<img
						src="/images/user-perfil.webp"
						alt="Avatar de {user.name}"
						class="h-8 w-8 rounded-full object-cover"
					/>
				</button>
				<DropdownMenu {options} {width} isOpen={isDropdownOpen} class="absolute top-full right-0" />
			</div>
		</div>
	</div>
</header>

<!-- <script lang="ts">
	export let onToggleSidebar: () => void;

	interface User {
		name: string;
		avatar: string;
	}

	const user: User = {
		name: 'Manuel Medrano',
		avatar: '/api/placeholder/32/32'
	};
</script>

<header class="bg-light-two text-light-one shadow-lg">
	<div class="flex items-center justify-between px-4 py-3">
		<button
			class="rounded-md p-2 transition-colors md:hidden"
			onclick={onToggleSidebar}
			aria-label="Toggle sidebar"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 6h16M4 12h16M4 18h16"
				/>
			</svg>
		</button>

		<div class="flex-1 md:flex-none">
			<h1 class="text-lg font-semibold">¡Hola {user.name}!</h1>
			<p class="hidden text-sm sm:block">
				Lorem ipsum, dolor sit amet consectetur adipisicing elit.
			</p>
		</div>

		<div class="flex items-center gap-2">
			<button class="rounded-full p-2 transition-colors" aria-label="Notifications">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
					/>
				</svg>
			</button>

			<button class="rounded-full p-2 transition-colors" aria-label="Settings">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
					/>
				</svg>
			</button>

			<button class="flex items-center gap-2 rounded-full p-1 transition-colors">
				<img
					src="/images/user-perfil.webp"
					alt="Avatar de {user.name}"
					class="h-8 w-8 rounded-full object-cover"
				/>
			</button>
		</div>
	</div>
</header> -->
