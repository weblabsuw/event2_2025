/**
 * S.P.I.D.E.R. Protocol Data
 * Super Private IDentity Emergency Recall
 */

export type TriggeredAgent = {
	name: string;
	trigger_time: string; // ISO 8601 timestamp
	event: string;
};

export type Agent = {
	uuid: string;
	name: string;
};

export const SPIDER_API_KEY = 'SPIDER-CLEARANCE-OMEGA-7';

export const VALID_KEY_REQUEST = {
	agent_id: 'investigation_team',
	clearance: 'omega'
};

export const BUCKINGHAM_WEB_UUID = '6c1dd13f-1eda-4e18-913c-7e0adb20f971';

export const AGENTS: Agent[] = [
	{
		uuid: BUCKINGHAM_WEB_UUID,
		name: 'Buckingham Web',
	}
];

export const TRIGGERED_AGENTS: TriggeredAgent[] = [
	{
		name: "Alice Johnson",
		trigger_time: '2025-11-07T14:30:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "Jacob Smith",
		trigger_time: '2025-11-03T15:00:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "Sarah Johnson",
		trigger_time: '2025-10-30T15:30:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "Michael Brown",
		trigger_time: '2025-10-28T16:00:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "David Wilson",
		trigger_time: '2025-10-20T16:30:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "Emily Davis",
		trigger_time: '2025-10-11T17:00:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "James Miller",
		trigger_time: '2025-10-08T17:30:00Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	}
];
