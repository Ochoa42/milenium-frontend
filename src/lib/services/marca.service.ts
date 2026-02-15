import { apiAvicor } from '$lib/config/apiAvicor.config';
import type {
	MarcaResponse,
	MarcaFilters,
	Marca,
	CreateMarcaDto,
	UpdateMarcaDto
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class MarcaService {
	async getMarcas(filters: MarcaFilters = {}): Promise<MarcaResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);

		const response = await apiAvicor.get<MarcaResponse>(`/marcas?${params.toString()}`);
		return response.data;
	}

	async getMarcaById(id: string): Promise<Marca> {
		const response = await apiAvicor.get<ApiResponse<Marca>>(`/marcas/${id}`);
		return response.data;
	}

	async createMarca(marca: CreateMarcaDto): Promise<Marca> {
		const response = await apiAvicor.post<ApiResponse<Marca>>('/marcas', marca);
		return response.data;
	}

	async updateMarca(id: string, marca: UpdateMarcaDto): Promise<Marca> {
		const response = await apiAvicor.put<ApiResponse<Marca>>(`/marcas/${id}`, marca);
		return response.data;
	}

	async deleteMarca(id: string): Promise<void> {
		await apiAvicor.delete(`/marcas/${id}`);
	}
}

export const marcaService = new MarcaService();
