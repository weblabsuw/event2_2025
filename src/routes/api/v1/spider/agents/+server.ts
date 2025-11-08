import { apiResponse, apiError, validateSpiderKey } from '$lib/api/utils';
import { SPIDER_API_KEY, TRIGGERED_AGENTS } from '$lib/api/spider-data';
import type { RequestHandler } from './$types';

/**
 * S.P.I.D.E.R. Protocol Agents Endpoint
 * Returns list of agents who triggered the protocol (accessed victim's confidential data)
 * Requires valid API key in X-SPIDER-Key header
 */
export const GET: RequestHandler = async ({ request }) => {
	// Validate API key
	if (!validateSpiderKey(request, SPIDER_API_KEY)) {
		return apiError(
			'Missing or invalid API key. Include X-SPIDER-Key header with valid key.',
			401
		);
	}

	// Return triggered agents (refined suspect list)
	return apiResponse({
		message: 'S.P.I.D.E.R. Protocol Triggered Agents',
		description:
			'These agents accessed confidential files about the victim shortly before they went dark.',
		count: TRIGGERED_AGENTS.length,
		triggered_agents: TRIGGERED_AGENTS
	});
};
