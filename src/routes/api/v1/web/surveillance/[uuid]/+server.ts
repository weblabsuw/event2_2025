import { apiResponse, apiError } from '$lib/api/utils';
import { getSurveillancePageEncoded, getSuspectInfo } from '$lib/api/web-data';
import type { RequestHandler } from './$types';

/**
 * W.E.B. Surveillance Logs Endpoint
 * Returns paginated surveillance entries for a specific suspect
 * Data is Base64-encoded and must be decoded by the client
 */
export const GET: RequestHandler = async ({ params, url }) => {
	const { uuid } = params;
	const pageParam = url.searchParams.get('page');

	// Validate page parameter
	if (!pageParam) {
		return apiError('Missing required query parameter: page', 400);
	}

	const page = parseInt(pageParam, 10);
	if (isNaN(page) || page < 1) {
		return apiError('Invalid page number. Must be a positive integer.', 400);
	}

	// Get suspect info to validate UUID
	const suspectInfo = getSuspectInfo(uuid);
	if (!suspectInfo) {
		return apiError('Suspect UUID not found in surveillance system', 404);
	}

	// Get the requested page (Base64 encoded)
	const pageData = getSurveillancePageEncoded(uuid, page);
	if (!pageData) {
		return apiError(
			`Invalid page number. Suspect has ${suspectInfo.pages} pages (requested page ${page})`,
			400
		);
	}

	return apiResponse({
		suspect: {
			uuid,
			name: suspectInfo.name
		},
		pagination: {
			current_page: pageData.current_page,
			total_pages: pageData.total_pages,
			entries_per_page: 10,
			has_next: pageData.current_page < pageData.total_pages,
			has_previous: pageData.current_page > 1
		},
		data: pageData.encoded_data,
		encoding: 'base64',
		note: 'Data is Base64-encoded. Decode to JSON, then look for entries with suspicious=true'
	});
};
