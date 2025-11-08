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
			'This system tracks unauthorized access attempts to confidential agent files. Access to triggered agent logs requires proper clearance.',
		authentication: {
			type: 'API Key',
			header: 'X-SPIDER-Key',
			how_to_obtain: 'POST to /api/spider/key with proper credentials'
		},
		endpoints: {
			'/api/spider/info': 'This endpoint - public system information',
			'/api/spider/key': 'Obtain API key (requires POST with credentials)',
			'/api/spider/agents': 'View triggered agent logs (requires API key)'
		},
		note: 'All agents who triggered the protocol accessed confidential information about the victim. One of these agents is likely the perpetrator.'
	});
};
