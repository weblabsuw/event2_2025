import { apiResponse } from '$lib/api/utils';
import { CITIES } from '$lib/api/web-data';
import type { RequestHandler } from './$types';

/**
 * W.E.B. Inventory Information Endpoint
 * Public endpoint that explains the inventory system
 */
export const GET: RequestHandler = async () => {
	return apiResponse({
		system: 'W.E.B. Inventory System',
		name: 'Wow! Everything Box',
		description:
			'Backup inventory database recovered from secure storage. All weapon data is Base64 encoded to save space in the backup.',
		available_cities: CITIES,
		endpoints: {
			'/api/v1/web/info': 'This endpoint - public system information',
			'/api/v1/web/cities': 'List of cities with inventory data',
			'/api/v1/web/inventory': 'View inventory for a specific city (requires city and page params)'
		},
		usage: {
			inventory_query: 'GET /api/v1/web/inventory?city={city}&page={page}',
			example: 'GET /api/v1/web/inventory?city=New%20York&page=1'
		},
		note: 'Each city has 250 weapons in inventory (251 for New York). Weapons are paginated with 10 items per page.'
	});
};
