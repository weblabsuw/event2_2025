import { env } from '$env/dynamic/private';
import { apiResponse, apiError, parseJsonBody } from '$lib/api/utils';
import {
	createOpenAIClient,
	validateChatRequest,
	chatCompletion,
	formatOpenAIError,
	type ChatRequest
} from '$lib/api/ai-utils';
import type { RequestHandler } from './$types';

/**
 * AI Chat Endpoint
 * POST endpoint that proxies requests to OpenAI with injected system prompt
 *
 * This endpoint accepts OpenAI-compatible chat completion requests and injects
 * a secret system prompt containing clues for the murder mystery game.
 */
export const POST: RequestHandler = async ({ request, platform }) => {
	// Get OpenAI API key from environment
	// Try platform.env first (Cloudflare), then fall back to process env
	const apiKey = platform?.env?.OPENAI_API_KEY || env.OPENAI_API_KEY;

	if (!apiKey) {
		return apiError(
			'DRONE_UNIT_734 offline. System configuration error: API key not found.',
			500
		);
	}

	// Parse request body
	const body = await parseJsonBody<ChatRequest>(request);

	if (!body) {
		return apiError(
			'Invalid transmission format. Expected JSON body with messages array.',
			400
		);
	}

	// Validate request format
	if (!validateChatRequest(body)) {
		return apiError(
			'Invalid chat request format. Required: { messages: [...], tools?: [...] }',
			400
		);
	}

	try {
		// Create OpenAI client
		const client = createOpenAIClient(apiKey);

		// Call OpenAI with injected system prompt
		const response = await chatCompletion(client, body);

		// Return OpenAI response as-is (OpenAI format)
		return apiResponse(response);
	} catch (error) {
		console.error('OpenAI API error:', error);

		const { message, status } = formatOpenAIError(error);

		return apiError(
			`DRONE_UNIT_734 communication error: ${message}`,
			status as 400 | 401 | 403 | 404 | 500
		);
	}
};

/**
 * OPTIONS handler for CORS preflight
 */
export const OPTIONS: RequestHandler = async () => {
	return new Response(null, {
		status: 204,
		headers: {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization'
		}
	});
};
