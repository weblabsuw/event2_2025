import { apiResponse } from '$lib/api/utils';
import { CITIES } from '$lib/api/web-data';
import type { RequestHandler } from './$types';

/**
 * W.E.B. Cities Endpoint
 * Returns list of cities with inventory data
 */
export const GET: RequestHandler = async () => {
	return apiResponse({
		system: 'W.E.B. Inventory System',
		name: 'Wow! Everything Box',
		description: 'Backup inventory database recovered from secure storage.',
		note: 'All weapon data is Base64 encoded to save space in the backup.',
		available_cities: CITIES,
		usage: 'Query /api/web/inventory?city={city}&page={page} to view inventory for a specific city'
	});
};
