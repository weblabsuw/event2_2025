import { apiResponse, apiError, validateSpiderKey } from '$lib/api/utils';
import { SPIDER_API_KEY, TRIGGERED_AGENTS, BUCKINGHAM_WEB_UUID } from '$lib/api/spider-data';
import type { RequestHandler } from './$types';

/**
 * S.P.I.D.E.R. Protocol Agent Logs Endpoint
 * Returns access logs for a specific agent UUID
 * Requires valid API key in X-SPIDER-Key header
 */
export const GET: RequestHandler = async ({ request, params }) => {
	// Validate API key
	if (!validateSpiderKey(request, SPIDER_API_KEY)) {
		return apiError(
			'Missing or invalid API key. Include X-SPIDER-Key header with valid key.',
			401
		);
	}

	const { uuid } = params;

	// Check if UUID is valid (only Buckingham Web has logs)
	if (uuid !== BUCKINGHAM_WEB_UUID) {
		return apiError(
			`No logs found for agent UUID: ${uuid}. This agent either does not exist or has no recorded access violations.`,
			404
		);
	}

	// Return triggered agents (these are the suspects who accessed victim's files)
	return apiResponse({
		message: 'S.P.I.D.E.R. Protocol Access Logs',
		agent_uuid: uuid,
		agent_name: 'Buckingham Web',
		description:
			'These agents accessed confidential files about the victim shortly before they went dark.',
		count: TRIGGERED_AGENTS.length,
		access_logs: TRIGGERED_AGENTS
	});
};
