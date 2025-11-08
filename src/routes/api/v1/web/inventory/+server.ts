import { apiResponse, apiError } from '$lib/api/utils';
import { CITIES, getCityInventory, getCityItemCount } from '$lib/api/web-data';
import type { RequestHandler } from './$types';

const ITEMS_PER_PAGE = 10;

/**
 * W.E.B. Inventory Endpoint
 * Returns paginated inventory for a specific city
 * All weapon data is Base64 encoded (students must decode in JavaScript)
 */
export const GET: RequestHandler = async ({ url }) => {
	// Get query parameters
	const city = url.searchParams.get('city');
	const pageParam = url.searchParams.get('page');
	const page = pageParam ? parseInt(pageParam, 10) : 1;

	// Validate city parameter
	if (!city) {
		return apiError(
			'Missing required parameter: city. Example: /api/web/inventory?city=Seattle',
			400
		);
	}

	// Check if city exists in inventory
	if (!CITIES.includes(city)) {
		return apiError(
			`City "${city}" not found in inventory database. Use /api/web/cities to see available cities.`,
			404
		);
	}

	// Get inventory for this city (dynamically generated with Base64 encoding)
	const cityInventory = getCityInventory(city);
	const totalItems = getCityItemCount(city);
	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	// Validate page number
	if (page < 1 || page > totalPages) {
		return apiError(`Invalid page number. Must be between 1 and ${totalPages}.`, 400);
	}

	// Calculate pagination
	const startIndex = (page - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const items = cityInventory.slice(startIndex, endIndex);

	// Build next/prev URLs
	const baseUrl = url.origin + url.pathname;
	const nextPage = page < totalPages ? `${baseUrl}?city=${city}&page=${page + 1}` : null;
	const prevPage = page > 1 ? `${baseUrl}?city=${city}&page=${page - 1}` : null;

	return apiResponse({
		city,
		page,
		per_page: ITEMS_PER_PAGE,
		total_pages: totalPages,
		total_items: totalItems,
		items,
		next_page: nextPage,
		prev_page: prevPage,
		note: 'All weapon data is Base64 encoded. Decode in JavaScript using atob() or Buffer.from(data, "base64")'
	});
};
