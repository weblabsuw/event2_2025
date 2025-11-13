import { apiResponse, apiError, validateSpiderKey } from '$lib/api/utils';
import { SPIDER_API_KEY, BUCKINGHAM_WEB_UUID } from '$lib/api/spider-data';
import type { RequestHandler } from './$types';

/**
 * S.P.I.D.E.R. Protocol Agent Search Endpoint
 * Search for agent UUIDs by name
 * Requires valid API key in X-SPIDER-Key header
 */
export const GET: RequestHandler = async ({ request, url }) => {
	// Validate API key
	if (!validateSpiderKey(request, SPIDER_API_KEY)) {
		return apiError(
			'Missing or invalid API key. Include X-SPIDER-Key header with valid key.',
			401
		);
	}

	const query = url.searchParams.get('query');

	if (!query) {
		return apiError('Missing required query parameter. Usage: /api/v1/spider/agents?query="agent name"', 400);
	}

	// Hardcoded search - only returns Buckingham Web if query includes "web"
	if (query.toLowerCase().includes('web')) {
		return apiResponse({
			message: 'Agent found',
			query: query,
			agent: {
				uuid: BUCKINGHAM_WEB_UUID,
				name: 'Buckingham Web'
			},
			usage: `Use this UUID to query logs: GET /api/v1/spider/logs/${BUCKINGHAM_WEB_UUID}`
		});
	}

	// No match found
	return apiError(
		`No agent found matching query: "${query}". The agent may not exist in the system.`,
		404
	);
};
