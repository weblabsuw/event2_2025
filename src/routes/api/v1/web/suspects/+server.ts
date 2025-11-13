import { apiResponse } from '$lib/api/utils';
import { getAllSuspects } from '$lib/api/web-data';
import type { RequestHandler } from './$types';

/**
 * W.E.B. Suspects List Endpoint
 * Returns all suspects currently under surveillance
 */
export const GET: RequestHandler = async () => {
	const suspects = getAllSuspects();

	return apiResponse({
		message: 'Surveillance targets retrieved successfully',
		count: suspects.length,
		suspects: suspects.map((s) => ({
			uuid: s.uuid,
			name: s.name,
			pages: s.pages
		})),
		note: 'Use the uuid to query /api/v1/web/surveillance/{uuid}?page=N for surveillance logs'
	});
};
