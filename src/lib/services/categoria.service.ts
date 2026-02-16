import { apiAvicor } from '$lib/config/apiAvicor.config';
import type {
	CategoriaFilters,
	CategoriaResponse,
	Categoria,
	UpdateCategoriaDto,
	CreateCategoriaDto
} from '$lib/interfaces';

interface ApiResponse<T> {
	status: string;
	data: T;
}

class CategoriaService {
	async getCategorias(filters: CategoriaFilters = {}): Promise<CategoriaResponse['data']> {
		const params = new URLSearchParams();

		if (filters.page) params.append('page', filters.page.toString());
		if (filters.perPage) params.append('perPage', filters.perPage.toString());
		if (filters.search) params.append('search', filters.search);

		const response = await apiAvicor.get<CategoriaResponse>(`/categorias?${params.toString()}`);
		return response.data;
	}

	async getCategoriaById(id: string): Promise<Categoria> {
		const response = await apiAvicor.get<ApiResponse<Categoria>>(`/categorias/${id}`);
		return response.data;
	}

	async createCategoria(categoria: CreateCategoriaDto): Promise<Categoria> {
		const response = await apiAvicor.post<ApiResponse<Categoria>>('/categorias', categoria);
		return response.data;
	}

	async updateCategoria(id: string, categoria: UpdateCategoriaDto): Promise<Categoria> {
		const response = await apiAvicor.put<ApiResponse<Categoria>>(`/categorias/${id}`, categoria);
		return response.data;
	}

	async deleteCategoria(id: string): Promise<void> {
		await apiAvicor.delete(`/categorias/${id}`);
	}
}

export const categoriaService = new CategoriaService();
