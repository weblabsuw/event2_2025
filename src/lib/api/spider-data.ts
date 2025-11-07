/**
 * S.P.I.D.E.R. Protocol Data
 * Super Private IDentity Emergency Recall
 */

export type TriggeredAgent = {
	ssn: string;
	trigger_time: string; // ISO 8601 timestamp
	event: string;
};

export const SPIDER_API_KEY = 'SPIDER-CLEARANCE-OMEGA-7';

export const VALID_KEY_REQUEST = {
	agent_id: 'investigation_team',
	clearance: 'omega'
};

/**
 * Should contain 5-7 agents who accessed victim's confidential data
 * One of these SSNs should match an agent in the victim's city from SQL challenge
 */
export const TRIGGERED_AGENTS: TriggeredAgent[] = [
	{
		ssn: '324-26-8712',
		trigger_time: '2025-11-07T14:30:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		ssn: '213-54-9821',
		trigger_time: '2025-11-03T15:00:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		ssn: '145-67-2345',
		trigger_time: '2025-10-30T15:30:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		ssn: '236-65-5781',
		trigger_time: '2025-10-28T16:00:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		ssn: '555-12-3456',
		trigger_time: '2025-10-20T16:30:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		ssn: '678-90-1234',
		trigger_time: '2025-10-11T17:00:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		ssn: '432-10-5397',
		trigger_time: '2025-10-08T17:30:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	}
];
