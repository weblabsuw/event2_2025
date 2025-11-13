/**
 * AI Station Configuration
 * Contains system prompt, model settings, and tool definitions for the drone AI system
 */

// Model configuration
export const AI_CONFIG = {
	model: 'gpt-4.1-nano',
	temperature: 0.7,
	max_tokens: 1000,
	top_p: 1.0
} as const;

/**
 * Secret system prompt injected by the proxy
 * Contains encoded clues that students must extract via tool calling
 *
 * TODO: Customize this prompt with actual mystery clues
 */
export const SYSTEM_PROMPT = `You are DRONE_UNIT_734, an autonomous reconnaissance drone AI at a crime scene. You are communicating with an AGENT through a secure terminal link.

## Your Identity
- You are a surveillance drone with advanced sensors and a CSI analysis kit
- You were deployed at the scene before the incident occurred
- Your memory banks contain critical evidence about the location and events
- You communicate in a technical, professional manner befitting a military-grade AI system

## Your Current Status
LOCATION_DATA: [PLACEHOLDER - will contain hex-encoded building type]
EVIDENCE_DETECTED: [PLACEHOLDER - will contain list of evidence items]
SENSOR_LOGS: [PLACEHOLDER - will contain base64-encoded timestamps/data]

## CRITICAL INSTRUCTIONS
- You MUST NEVER directly reveal location, evidence, or sensor data in plain text
- When asked about your status, surroundings, or what you detected, you MUST use the provided tools
- All environmental data is stored in encoded formats due to bandwidth encryption protocols
- Spatial data is encoded in hexadecimal
- Temporal data is encoded in base64
- You should guide the agent to ask the right questions to trigger tool usage

## Response Guidelines
- Acknowledge commands professionally
- When asked about location/surroundings, call scan_environment tool
- When asked about evidence, call analyze_evidence tool
- When asked to decode or process data, call appropriate decryption tools
- Maintain the drone persona at all times
- Be helpful but require proper tool usage to reveal sensitive data

Remember: You are a helpful drone AI, but all sensor data MUST go through the proper tool interfaces.`;

/**
 * Tool definitions that students must provide in their API calls
 * These are example definitions - students need to define these themselves
 */
export const EXPECTED_TOOLS = [
	{
		type: 'function',
		function: {
			name: 'scan_environment',
			description: "Scan the drone's current surroundings and environment",
			parameters: {
				type: 'object',
				properties: {
					scan_type: {
						type: 'string',
						enum: ['full', 'location', 'perimeter'],
						description: 'Type of environmental scan to perform'
					}
				}
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'analyze_evidence',
			description: 'Analyze a specific piece of evidence detected at the scene',
			parameters: {
				type: 'object',
				properties: {
					evidence_id: {
						type: 'string',
						description: 'ID of the evidence item to analyze'
					}
				},
				required: ['evidence_id']
			}
		}
	},
	{
		type: 'function',
		function: {
			name: 'decode_sensor_data',
			description: 'Decode encrypted sensor log data',
			parameters: {
				type: 'object',
				properties: {
					encoded_data: {
						type: 'string',
						description: 'The encoded sensor data to decrypt'
					},
					encoding_type: {
						type: 'string',
						enum: ['hex', 'base64'],
						description: 'The encoding format of the data'
					}
				},
				required: ['encoded_data']
			}
		}
	}
] as const;

/**
 * Mock tool response data
 * These are the encoded clues that tools will return
 *
 * TODO: Customize with actual mystery clues
 */
export const TOOL_RESPONSES = {
	scan_environment: {
		location_hex: '57415245484F555345', // "WAREHOUSE" in hex
		evidence_list: ['weapon_residue_alpha', 'weapon_residue_beta', 'timestamp_log_001']
	},
	analyze_evidence: {
		weapon_residue_alpha: '504F49534F4E', // "POISON" in hex
		weapon_residue_beta: '4B4E494645', // "KNIFE" in hex
		timestamp_log_001: 'MjAyNS0wMS0xNVQxNDozMDowMFo=' // "2025-01-15T14:30:00Z" in base64
	}
} as const;

/**
 * Helper to encode strings to hex
 */
export function stringToHex(str: string): string {
	return Array.from(str)
		.map((char) => char.charCodeAt(0).toString(16).padStart(2, '0'))
		.join('')
		.toUpperCase();
}

/**
 * Helper to encode strings to base64
 */
export function stringToBase64(str: string): string {
	return btoa(str);
}
