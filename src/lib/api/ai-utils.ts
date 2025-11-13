/**
 * AI Utilities
 * Helper functions for OpenAI API integration
 */

import OpenAI from 'openai';
import type { ChatCompletionMessageParam, ChatCompletionTool } from 'openai/resources/chat';
import { AI_CONFIG, SYSTEM_PROMPT } from './ai-config';

/**
 * Create OpenAI client instance
 */
export function createOpenAIClient(apiKey: string): OpenAI {
	return new OpenAI({
		apiKey
	});
}

/**
 * Chat request parameters from the frontend
 */
export type ChatRequest = {
	messages: ChatCompletionMessageParam[];
	tools?: ChatCompletionTool[];
	model?: string;
	temperature?: number;
	max_tokens?: number;
};

/**
 * Validate chat request format
 */
export function validateChatRequest(body: unknown): body is ChatRequest {
	if (!body || typeof body !== 'object') return false;

	const req = body as Partial<ChatRequest>;

	// Messages array is required
	if (!Array.isArray(req.messages) || req.messages.length === 0) {
		return false;
	}

	// Validate each message has role and content
	for (const msg of req.messages) {
		if (!msg.role || typeof msg.role !== 'string') return false;
		// Content can be string, array, or null for assistant messages with tool calls
		if (msg.content !== null && typeof msg.content !== 'string' && !Array.isArray(msg.content)) {
			return false;
		}
	}

	// Tools must be an array if provided
	if (req.tools !== undefined && !Array.isArray(req.tools)) {
		return false;
	}

	return true;
}

/**
 * Inject system prompt into messages array
 * Adds the secret system prompt at the beginning if not already present
 */
export function injectSystemPrompt(messages: ChatCompletionMessageParam[]): ChatCompletionMessageParam[] {
	// Check if there's already a system message
	const hasSystemMessage = messages.some((msg) => msg.role === 'system');

	if (hasSystemMessage) {
		// Replace existing system message with our injected one
		return messages.map((msg) =>
			msg.role === 'system'
				? {
						role: 'system',
						content: SYSTEM_PROMPT
					}
				: msg
		);
	}

	// Add system message at the beginning
	return [
		{
			role: 'system',
			content: SYSTEM_PROMPT
		},
		...messages
	];
}

/**
 * Call OpenAI Chat Completions API with injected system prompt
 */
export async function chatCompletion(client: OpenAI, request: ChatRequest) {
	// Inject system prompt
	const messagesWithSystem = injectSystemPrompt(request.messages);

	// Call OpenAI API
	const response = await client.chat.completions.create({
		model: request.model || AI_CONFIG.model,
		messages: messagesWithSystem,
		tools: request.tools,
		temperature: request.temperature ?? AI_CONFIG.temperature,
		max_tokens: request.max_tokens ?? AI_CONFIG.max_tokens,
		top_p: AI_CONFIG.top_p
	});

	return response;
}

/**
 * Format OpenAI API errors for response
 */
export function formatOpenAIError(error: unknown): { message: string; status: number } {
	// OpenAI SDK errors
	if (error && typeof error === 'object' && 'status' in error) {
		const openAIError = error as { status?: number; message?: string; error?: { message?: string } };

		return {
			message: openAIError.error?.message || openAIError.message || 'OpenAI API error',
			status: openAIError.status || 500
		};
	}

	// Generic errors
	if (error instanceof Error) {
		return {
			message: error.message,
			status: 500
		};
	}

	return {
		message: 'Unknown error occurred',
		status: 500
	};
}
