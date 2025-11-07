import { json } from '@sveltejs/kit';
import type { NumericRange } from '@sveltejs/kit';

/**
 * Create a standardized JSON response
 */
export function apiResponse<T>(
	data: T,
	status: NumericRange<200, 599> = 200,
	headers?: Record<string, string>
) {
	return json(data, {
		status,
		headers: {
			'Content-Type': 'application/json',
			...headers
		}
	});
}

/**
 * Create an error response
 */
export function apiError(message: string, status: NumericRange<400, 599> = 400) {
	return apiResponse(
		{
			error: message,
			status
		},
		status
	);
}

/**
 * Validate S.P.I.D.E.R. API key from request headers
 */
export function validateSpiderKey(request: Request, validKey: string): boolean {
	const providedKey = request.headers.get('X-SPIDER-Key');
	return providedKey === validKey;
}

/**
 * Check if request has valid JSON body
 */
export async function parseJsonBody<T>(request: Request): Promise<T | null> {
	try {
		const body = await request.json();
		return body as T;
	} catch {
		return null;
	}
}
