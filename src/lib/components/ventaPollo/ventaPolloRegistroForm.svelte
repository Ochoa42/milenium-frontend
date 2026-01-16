<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui';
	import { CheckIcon } from '$lib/icons/outline';
	import { LockIcon } from '$lib/icons/solid';
	import { clientesService } from '$lib/services/cliente.service';
	import { ventasPollosService } from '$lib/services/ventaPollos.service';
	import { despachosService } from '$lib/services/despacho.service';
	import type { 
		Cliente, 
		InventarioItem, 
		LoteDisponible,
		DespachoExtraData 
	} from '$lib/interfaces';
	import { alert } from '$lib/utils';
	import PlusIcon from '$lib/icons/outline/plusIcon.svelte';
	import XIcon from '$lib/icons/outline/xIcon.svelte';

	// Props
	interface Props {
		despachos: DespachoExtraData[];
		onSubmit: (data: any) => void;
		onCancel: () => void;
	}

	let {
		despachos = [],
		onSubmit,
		onCancel
	}: Props = $props();


	let clientes: Cliente[] = $state([]);
	let inventarioItems: InventarioItem[] = $state([]);

	let clienteSeleccionado = $state('');
	let despachoSeleccionadoId = $state(''); 
	let itemSeleccionado: InventarioItem | null = $state(null);
	
	let loteSeleccionadoId = $state('');
	let cantidadPeso = $state(0);
	let precio = $state(0);
	let descuento = $state(0);
	let montoPagado = $state(0);

	let productosVenta = $state<any[]>([]);



	function getRemainingStock(loteId: string, metodoCobro: string): number {
		const lote = itemSeleccionado?.lotes_disponibles.find(l => l.id === loteId);
		if (!lote) return 0;
		const usedAmount = productosVenta
			.filter(p => p.detalle.loteId === loteId)
			.reduce((acc, p) => acc + p.cantidad, 0);
		const totalStock = metodoCobro === 'POR_PESO' ? lote.peso_neto : lote.unidades;
		
		return totalStock - usedAmount;
	}

	//  calcular el stock restante total de un producto (todos sus lotes)
	function getRemainingProductStock(item: InventarioItem): number {
		// Calcular el total usado de este producto en productosVenta
		const usedAmount = productosVenta
			.filter(p => p.detalle.productoId === item.producto_id)
			.reduce((acc, p) => acc + p.cantidad, 0);
		
		// El stock total disponible del producto
		const totalAvailable = item.metodo_cobro === 'POR_PESO' 
			? item.disponible_peso 
			: item.disponible_unid;
		
		return totalAvailable - usedAmount;
	}

	
	function isProductFullyAllocated(item: InventarioItem): boolean {
		return getRemainingProductStock(item) <= 0;
	}



	let subtotal = $derived(productosVenta.reduce((acc, item) => acc + item.total, 0));
	
	let montoDescuento = $derived((subtotal * descuento) / 100);
	let totalPagar = $derived(subtotal - montoDescuento);
	

	onMount(async () => {
		await loadClientes();

	});

	async function loadClientes() {
		try {
			const res = await clientesService.getClientes();
			clientes = res.clientes;
		} catch (error) {
			console.error('Error loading clients:', error);
		}
	}

	async function handleDespachoChange() {
		if (!despachoSeleccionadoId) {
			inventarioItems = [];
			itemSeleccionado = null;
			return;
		}

		try {
			const res = await despachosService.getInventario(despachoSeleccionadoId);
			if (res.success && res.data) {
				inventarioItems = res.data.inventario;
			}
		} catch (error) {
			console.error('Error loading inventory:', error);
			inventarioItems = [];
		}
	}

	function selectItem(item: InventarioItem) {
		itemSeleccionado = item;
		cantidadPeso = 0;
		precio = item.precio_sugerido || 0;
		loteSeleccionadoId = '';

		if (item.metodo_cobro === 'POR_UNIDAD' && item.lotes_disponibles.length > 0) {
			const primerLote = item.lotes_disponibles[0];
			loteSeleccionadoId = primerLote.id;
			const remainingStock = getRemainingStock(primerLote.id, item.metodo_cobro);
			cantidadPeso = remainingStock;
		}
	}
	function handleLoteChange() {
		if (!loteSeleccionadoId || !itemSeleccionado) {
			cantidadPeso = 0;
			return;
		}

		const lote = itemSeleccionado.lotes_disponibles.find(l => l.id === loteSeleccionadoId);
		if (!lote) {
			cantidadPeso = 0;
			return;
		}

		const remainingStock = getRemainingStock(loteSeleccionadoId, itemSeleccionado.metodo_cobro);
		
		if (itemSeleccionado.metodo_cobro === 'POR_PESO') {
			cantidadPeso = remainingStock;
		} else {
			cantidadPeso = remainingStock;
		}
	}

	function addProducto() {
		if (!itemSeleccionado) return;
		if (!loteSeleccionadoId) return;

		const lote = itemSeleccionado.lotes_disponibles.find(l => l.id === loteSeleccionadoId);
		if (!lote) return;

		if (cantidadPeso <= 0) {
			alert("error", "No se puede agregar un lote con cantidad o peso cero");
			return;
		}

		const remainingStock = getRemainingStock(loteSeleccionadoId, itemSeleccionado.metodo_cobro);

		if (cantidadPeso > remainingStock) {
			const unit = itemSeleccionado.metodo_cobro === 'POR_PESO' ? 'Kg' : 'Und';
			alert("error", `Error: La cantidad ingresada (${cantidadPeso} ${unit}) excede el stock disponible del lote (${remainingStock} ${unit})`);
			return;
		}

		const total = cantidadPeso * precio;

		const nuevoProducto = {
			producto: itemSeleccionado.producto_nombre,
			pesoNeto: itemSeleccionado.metodo_cobro === 'POR_PESO' ? cantidadPeso : 0, 
			cantidad: cantidadPeso, 
			precio: precio,
			total: Number(total.toFixed(2)),
			detalle: {
				productoId: itemSeleccionado.producto_id,
				loteId: lote.id,
				metodoCobro: itemSeleccionado.metodo_cobro
			}
		};

		productosVenta = [...productosVenta, nuevoProducto];
		
		// Reset inputs y actualizar el lote seleccionado
		cantidadPeso = 0;
		
		// Si el lote se agotó, limpiar la selección
		if (getRemainingStock(loteSeleccionadoId, itemSeleccionado.metodo_cobro) <= 0) {
			loteSeleccionadoId = '';
		}
		
		// Si el producto se agotó completamente, deseleccionarlo
		if (isProductFullyAllocated(itemSeleccionado)) {
			itemSeleccionado = null;
			loteSeleccionadoId = '';
		}
	}

	function removeProducto(index: number) {
		const newProductos = [...productosVenta];
		newProductos.splice(index, 1);
		productosVenta = newProductos;
	}

	async function handleFormSubmit() {
        if (!clienteSeleccionado || !despachoSeleccionadoId || productosVenta.length === 0) {
            alert("error","Por favor complete todos los campos requeridos");
            return;
        }

		const payload = {
			despacho_id: despachoSeleccionadoId,
			cliente_id: clienteSeleccionado,
            fecha_venta: new Date().toISOString().split('T')[0], 
			descuento_porcentaje: Number(descuento), 
			monto_cobrado: Number(montoPagado),
			detalles: productosVenta.map(p => ({
				detalle_despacho_id: p.detalle.loteId,
				cantidad: Number(p.cantidad),
				precio_unitario_venta: Number(p.precio)
			}))
		};

        try {
            const res = await ventasPollosService.createVenta(payload);
            if (res.status === 'success') {
                alert("success",res.data.message || 'Venta registrada correctamente');
                onSubmit(res.data); 
            }
        } catch (error) {
            console.error('Error creating venta:', error);
            alert("error","Ocurrió un error al registrar la venta.");
        }
	}
</script>

<div class="min-h-dvh">
	<div class="mx-auto max-w-7xl">
		
		<div class="mb-6 rounded-lg bg-light-two p-4 shadow-lg">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-3">
					<svg class="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
					</svg>
					<div>
						<h1 class="text-xl font-bold text-white">Nueva Venta</h1>
						<p class="text-sm text-gray-200">
							{#if despachoSeleccionadoId}
								SKU: {despachos.find(d => d.id === despachoSeleccionadoId)?.sku}
							{:else}
								Seleccione Despacho
							{/if}
						</p>
					</div>
				</div>
				<div class="flex gap-4 justify-between3">
					<div>
						<label class="mb-1 block text-xs font-medium text-gray-200">SKU DESPACHO</label>
						<select 
                            bind:value={despachoSeleccionadoId} 
                            onchange={handleDespachoChange}
                            class="rounded bg-light-five py-2 text-gray-700 focus:outline-none"
                        >
							<option value="">--Seleccionar--</option>
                            {#each despachos as despacho}
                                <option value={despacho.id}>{despacho.sku} ({despacho.zona})</option>
                            {/each}
						</select>
					</div>
					<div class="w-full">
						<label class="mb-1 block text-xs font-medium text-light-one">CLIENTE</label>
						<select bind:value={clienteSeleccionado} class="rounded bg-light-five py-2 text-gray-700 focus:outline-none">
							<option value="">--Seleccionar--</option>
							{#each clientes as cliente}
								<option value={cliente.id}>{cliente.nombre} {cliente.apellido_paterno}</option>
							{/each}
						</select>
					</div>
				</div>
			</div>
		</div>

		<div class="grid grid-cols-3 gap-6">
			
			
			<div class="col-span-1">
				<div class="rounded-lg bg-light-two p-4 shadow-lg">
					<div class="mb-4 flex items-center gap-2 text-white">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
						</svg>
						<h2 class="text-lg font-semibold">Inventario</h2>
					</div>
					<div class="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
						<div>
						</div>
						{#each inventarioItems as item}
							{@const isFullyAllocated = isProductFullyAllocated(item)}
							{@const remainingStock = getRemainingProductStock(item)}
							
							<div 
                                class="relative rounded-lg p-3 transition-all" 
                                class:cursor-pointer={!isFullyAllocated}
                                class:hover:bg-light-three={!isFullyAllocated}
                                class:bg-light-four={!isFullyAllocated}
                                class:bg-light-three={itemSeleccionado === item && !isFullyAllocated}
                                class:opacity-50={isFullyAllocated}
                                class:cursor-not-allowed={isFullyAllocated}
                                class:bg-gray-600={isFullyAllocated}
                                onclick={() => !isFullyAllocated && selectItem(item)}
                            >
								{#if itemSeleccionado === item && !isFullyAllocated}
									<div class="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-sm bg-emerald-500">
										<svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
										</svg>
									</div>
								{/if}
								{#if isFullyAllocated}
									<div class="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-sm bg-red-500">
										<svg class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/>
										</svg>
									</div>
								{/if}
								<h3 class="text-sm font-medium text-white">{item.producto_nombre}</h3>
								<div class="flex items-center justify-between">
								<p class="text-xs text-gray-200">{item.metodo_cobro === 'POR_PESO' ? 'Por Peso' : 'Por Unidad'}</p>
								<p class="mt-1 text-xs font-medium" class:text-white={!isFullyAllocated} class:text-gray-400={isFullyAllocated}>
                                    Disp: {remainingStock} {item.metodo_cobro === 'POR_PESO' ? 'Kg' : 'Uni'}
                                    {#if isFullyAllocated}
                                        <span class="text-red-400 ml-1">(Agotado)</span>
                                    {/if}
                                </p>
																</div>
							</div>
                        {:else}
                            <p class="text-sm text-gray-300">Seleccione un despacho para ver inventario.</p>
						{/each}
					</div>
				</div>
			</div>

			<div class="col-span-2 space-y-6 rounded-lg bg-light-two">
		
				<div class="rounded-lg bg-light-two p-4 shadow-lg max-h-[calc(100vh-300px)]">
					
					<div class="space-y-4">
					
                        {#if itemSeleccionado?.metodo_cobro === 'POR_PESO'}
                            <div class="w-full">
                                <label class="mb-2 block text-sm font-medium text-white">Lote (Caja)</label>
                                <select bind:value={loteSeleccionadoId} onchange={handleLoteChange} class="w-full rounded bg-light-five py-2 text-gray-700 focus:outline-none">
                                    <option value="">--Seleccionar Lote--</option>
                                    {#each itemSeleccionado.lotes_disponibles as lote}
                                        {@const remaining = getRemainingStock(lote.id, itemSeleccionado.metodo_cobro)}
                                        <option value={lote.id} disabled={remaining <= 0}>
                                            Caja {lote.nro_caja} ({remaining} Kg disponible)
                                        </option>
                                    {/each}
                                </select>
                            </div>
                        {/if}
				
						<div class="flex items-end gap-4">
							<div class="flex-1">
								<label class="mb-2 block text-sm font-medium text-white">
									{itemSeleccionado?.metodo_cobro === 'POR_PESO' ? 'Peso (Kg)' : 'Cantidad'}
								</label>
								<input 
									type="number" 
									bind:value={cantidadPeso} 
									min="0"
									max={loteSeleccionadoId && itemSeleccionado ? getRemainingStock(loteSeleccionadoId, itemSeleccionado.metodo_cobro) : undefined}
									step={itemSeleccionado?.metodo_cobro === 'POR_PESO' ? '0.01' : '1'}
									class="w-full rounded bg-light-five px-4 py-2 text-gray-700 focus:outline-none" 
								/>
							</div>
							<div class="flex-1">
								<label class="mb-2 block text-sm font-medium text-white">Precio</label>
								<input type="number" step="0.01" bind:value={precio} class="w-full rounded bg-light-five px-4 py-2 text-gray-700 focus:outline-none" />
							</div>
							<button 
								type="button" 
								class="rounded bg-light-success px-4 py-2 font-bold text-white hover:bg-light-success/80 disabled:opacity-50"
								onclick={addProducto}
								disabled={!itemSeleccionado || !loteSeleccionadoId}
							>
								<PlusIcon />
							</button>
						</div>
					</div>
				</div>

				<div class="">
					<div class="overflow-x-auto  max-h-[calc(100vh-500px)] overflow-y-auto px-4">
						<table class="w-full">
							<thead>
								<tr class="border-b border-[#7A9380]">
									<th class="pb-2 text-left text-sm font-medium text-white">Producto</th>
									<th class="pb-2 text-center text-sm font-medium text-white">P. Neto</th>
									<th class="pb-2 text-center text-sm font-medium text-white">Cant.</th>
									<th class="pb-2 text-center text-sm font-medium text-white">Precio</th>
									<th class="pb-2 text-right text-sm font-medium text-white">Total</th>
                                    <th class="pb-2 text-right text-sm font-medium text-white"></th>
								</tr>
							</thead>
							<tbody>
								{#each productosVenta as item, index}
									<tr class="border-b border-[#7A9380]">
										<td class="py-2 text-sm text-white">{item.producto}</td>
										<td class="py-2 text-center text-sm text-white">{item.pesoNeto}</td>
										<td class="py-2 text-center text-sm text-white">{item.cantidad}</td>
										<td class="py-2 text-center text-sm text-white">{item.precio}</td>
										<td class="py-2 text-right text-sm text-white">{item.total}</td>
                                        <td class="py-2 text-right">
                                            <button class="text-red-400 hover:text-red-300" onclick={() => removeProducto(index)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
									</tr>
                                {:else}
                                    <tr>
                                        <td colspan="6" class="py-8 text-center text-gray-400">
                                            No hay productos agregados
                                        </td>
                                    </tr>
								{/each}
							</tbody>
						</table>
					</div>		
					<div class="mt-4 space-y-3 rounded bg-light-five  p-4">
						<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<span class="flex items-center gap-1 rounded bg-light-warning px-3 py-1 text-sm font-medium text-gray-800">
								<LockIcon class="h-4 w-4" />
								Descuento Autorizado (%)
							</span>
							<div class="relative">
								<input 
									type="number" 
									bind:value={descuento} 
									min="0" 
									max="100" 
									step="0.01"
									class="w-24 rounded bg-[#A8B9AC] px-3 py-1 pr-6 text-center text-gray-700 focus:outline-none" 
								/>
								<span class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 text-sm pointer-events-none">%</span>
							</div>
						</div>
						<div class="text-right">
							<p class="text-sm text-light-black">Subtotal</p>
							<p class="text-2xl font-bold text-light-black">Bs {subtotal.toFixed(2)}</p>
							{#if descuento > 0}
								<p class="text-xs text-red-600 mt-1">- Bs {montoDescuento.toFixed(2)} ({descuento}% desc.)</p>
							{/if}
						</div>
					</div>
						<div class=" border-t border-light-black pt-2 flex items-center justify-between">
							<div class="flex items-start flex-col">

								<label class="text-sm font-medium text-light-one">A Cuenta (Cobrado)</label>
								<input type="number" bind:value={montoPagado} class="w-32 rounded bg-transparent px-3 py-2 text-right text-light-one focus:outline-none mt-2" />
							</div>
							<div class="flex items-center flex-col">
							<p class="text-lg font-medium text-light-black">Total a Pagar</p>
							<p class="text-3xl font-bold text-light-black">Bs {totalPagar.toFixed(2)}</p>
						</div>
						</div>
						<div class="flex items-center gap-2">

						
						<Button variant="secondary" fullWidth onclick={onCancel} >
							{#snippet leftIcon()}
								<XIcon class="h-5 w-5"/>
							{/snippet}
						    Cancelar
					    </Button>
						
						<Button variant="primary" fullWidth onclick={handleFormSubmit} disabled={productosVenta.length === 0 || !clienteSeleccionado}>
							{#snippet leftIcon()}
								<CheckIcon class="h-5 w-5"/>
							{/snippet}
						    Confirmar Venta
					    </Button>
							</div>
					</div>			
				</div>
			</div>
		</div>
	</div>
</div>