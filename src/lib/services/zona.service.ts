import { apiAvicor } from '$lib/config/apiAvicor.config';
import type {
	Zona,
	ZonasResponse,
	ZonaFilters,
	CreateZonaDto,
	UpdateZonaDto
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class ZonasService {
	async getZonas(filters: ZonaFilters = {}): Promise<ZonasResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);

		const response = await apiAvicor.get<ZonasResponse>(`/zonas?${params.toString()}`);
		return response.data;
	}

	async getZonaById(id: string): Promise<Zona> {
		const response = await apiAvicor.get<ApiResponse<Zona>>(`/zonas/${id}`);
		return response.data;
	}

	async createZona(zona: CreateZonaDto): Promise<Zona> {
		const response = await apiAvicor.post<ApiResponse<Zona>>('/zonas', zona);
		return response.data;
	}

	async updateZona(id: string, zona: UpdateZonaDto): Promise<Zona> {
		const response = await apiAvicor.put<ApiResponse<Zona>>(`/zonas/${id}`, zona);
		return response.data;
	}

	async deleteZona(id: string): Promise<void> {
		await apiAvicor.delete(`/zonas/${id}`);
	}
}

export const zonasService = new ZonasService();

// import { apiAvicor } from '$lib/config/apiAvicor.config';
// import type { ZonasResponse } from '$lib/interfaces';

// class ZonasService {
// 	async getZonas(): Promise<ZonasResponse['data']> {
// 		const zonaResponse = await apiAvicor.get<ZonasResponse>('/zonas/');
// 		return zonaResponse.data;
// 	}
// }
// export const zonasService = new ZonasService();
