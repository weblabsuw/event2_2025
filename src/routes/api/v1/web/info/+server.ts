import { apiResponse } from '$lib/api/utils';
import type { RequestHandler } from './$types';

/**
 * W.E.B. Protocol Information Endpoint
 * Public endpoint that explains the surveillance monitoring system
 */
export const GET: RequestHandler = async () => {
	return apiResponse({
		system: 'W.E.B. Protocol',
		name: 'Worldwide Evidence Bureau',
		description:
			'This system provides surveillance monitoring logs for agents of interest. Use suspect UUIDs to retrieve paginated surveillance data.',
		authentication: {
			type: 'None required',
			note: 'All endpoints are publicly accessible for investigation purposes'
		},
		endpoints: {
			'/api/v1/web/info': 'This endpoint - public system information',
			'/api/v1/web/suspects': 'List all suspects under surveillance',
			'/api/v1/web/surveillance/{uuid}': 'Get paginated surveillance logs for a specific suspect'
		},
		pagination: {
			entries_per_page: 10,
			page_parameter: 'page (1-indexed)',
			example: 'GET /api/v1/web/surveillance/{uuid}?page=1'
		},
		data_encoding: {
			format: 'Base64',
			note: 'Surveillance data is Base64-encoded. Decode the "data" field to get JSON array of entries.',
			decoding_example: {
				javascript: 'JSON.parse(atob(response.data))',
				python: 'json.loads(base64.b64decode(response["data"]))'
			}
		},
		workflow:
			'1. Get suspect UUIDs from /api/v1/web/suspects\n2. For each UUID, paginate through surveillance logs\n3. Decode Base64 data to JSON\n4. Look for entries with suspicious=true',
		note: 'Each suspect has 12-18 pages of surveillance data. Students should write scripts to paginate through all pages for all suspects.'
	});
};
