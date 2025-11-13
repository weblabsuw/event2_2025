import { apiResponse } from '$lib/api/utils';
import { AI_CONFIG, EXPECTED_TOOLS } from '$lib/api/ai-config';
import type { RequestHandler } from './$types';

/**
 * AI Info Endpoint
 * GET endpoint that returns information about the AI system and available models
 *
 * This helps students understand what model is being used and what tools they should define
 */
export const GET: RequestHandler = async () => {
	return apiResponse({
		system: 'DRONE_UNIT_734',
		status: 'ONLINE',
		description:
			'Autonomous reconnaissance drone AI with CSI analysis kit. All sensor data is encrypted and requires proper tool interfaces to decode.',
		model: {
			id: AI_CONFIG.model,
			provider: 'OpenAI',
			capabilities: ['chat', 'function_calling', 'tool_use']
		},
		api: {
			endpoint: '/api/v1/ai/chat',
			method: 'POST',
			format: 'OpenAI Chat Completions API',
			required_fields: ['messages'],
			optional_fields: ['tools', 'model', 'temperature', 'max_tokens']
		},
		tools: {
			description:
				'Define these tools in your API request to extract encoded sensor data from the drone',
			required: true,
			expected_tools: EXPECTED_TOOLS.map((tool) => ({
				name: tool.function.name,
				description: tool.function.description,
				parameters: tool.function.parameters
			})),
			note: 'All environmental data is returned in encoded formats (hex/base64). You must decode it client-side.'
		},
		instructions: [
			'Send POST request to /api/v1/ai/chat with OpenAI-compatible format',
			'Include tool definitions in your request',
			'Ask the drone about its status, location, and detected evidence',
			'The AI will respond with tool calls containing encoded data',
			'Decode the returned data using hex/base64 decoders',
			'Extract the clues to solve the mystery'
		],
		example_request: {
			messages: [
				{
					role: 'user',
					content: 'What is your current status?'
				}
			],
			tools: [
				{
					type: 'function',
					function: {
						name: 'scan_environment',
						description: "Scan the drone's surroundings",
						parameters: { type: 'object', properties: {} }
					}
				}
			]
		}
	});
};
