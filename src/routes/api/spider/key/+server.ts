import { apiResponse, apiError, parseJsonBody } from '$lib/api/utils';
import { SPIDER_API_KEY, VALID_KEY_REQUEST } from '$lib/api/spider-data';
import type { RequestHandler } from './$types';

type KeyRequest = {
	agent_id: string;
	clearance: string;
};

/**
 * S.P.I.D.E.R. Protocol Key Request Endpoint
 * POST with correct credentials to receive API key
 */
export const POST: RequestHandler = async ({ request }) => {
	const body = await parseJsonBody<KeyRequest>(request);

	if (!body) {
		return apiError('Invalid JSON body. Expected: { "agent_id": string, "clearance": string }', 400);
	}

	if (!body.agent_id || !body.clearance) {
		return apiError(
			'Missing required fields. Expected: { "agent_id": "investigation_team", "clearance": "omega" }',
			400
		);
	}

	// Validate credentials
	if (body.agent_id !== VALID_KEY_REQUEST.agent_id) {
		return apiError('Invalid agent_id. Access denied.', 401);
	}

	if (body.clearance !== VALID_KEY_REQUEST.clearance) {
		return apiError('Insufficient clearance level. Access denied.', 403);
	}

	// Success - return API key
	return apiResponse({
		message: 'Access granted. Use this key in the X-SPIDER-Key header.',
		key: SPIDER_API_KEY,
		usage: 'Include this key as a header: X-SPIDER-Key: ' + SPIDER_API_KEY
	});
};
