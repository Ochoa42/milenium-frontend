export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString('es-ES', {
		day: '2-digit',
		month: 'short',
		year: 'numeric'
	});
}
