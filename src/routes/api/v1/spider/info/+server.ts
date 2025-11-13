import { apiResponse } from '$lib/api/utils';
import type { RequestHandler } from './$types';

/**
 * S.P.I.D.E.R. Protocol Information Endpoint
 * Public endpoint that explains how to authenticate
 */
export const GET: RequestHandler = async () => {
	return apiResponse({
		system: 'S.P.I.D.E.R. Protocol',
		name: 'Super Private IDentity Emergency Recall',
		description:
			'This system tracks unauthorized access attempts to confidential agent files. Access to agent logs requires proper clearance.',
		authentication: {
			type: 'API Key',
			header: 'X-SPIDER-Key',
			how_to_obtain: 'POST to /api/v1/spider/key with proper credentials'
		},
		endpoints: {
			'/api/v1/spider/info': 'This endpoint - public system information',
			'/api/v1/spider/key': 'Obtain API key (requires POST with credentials)',
			'/api/v1/spider/agents': 'Search for agent UUIDs by name (requires API key and query param)',
			'/api/v1/spider/logs/{uuid}': 'View access logs for a specific agent (requires API key)'
		},
		usage: {
			search_agents: 'GET /api/v1/spider/agents?query="agent name"',
			view_logs: 'GET /api/v1/spider/logs/{uuid}'
		},
		note: 'Search for agents by name to get their UUID, then use that UUID to view their access logs.'
	});
};
