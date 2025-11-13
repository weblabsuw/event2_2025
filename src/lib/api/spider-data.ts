/**
 * S.P.I.D.E.R. Protocol Data
 * Super Private IDentity Emergency Recall
 */

export type TriggeredAgent = {
	name: string;
	trigger_time: string; // ISO 8601 timestamp
	uuid: string;
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
		uuid: '5e2cb2bd-477c-41e5-a1e2-200f5d5bbd8a',
		trigger_time: '2025-10-07T14:22:31Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "Jacob Smith",
		uuid: '21d04141-0934-4066-b832-c66c674bcbb5',
		trigger_time: '2025-10-03T11:15:45Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "Sarah Johnson",
		uuid: 'd278c792-e153-4b73-8c84-a9a732c04d50',
		trigger_time: '2025-09-30T09:34:23Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "Emma Ingraham",
		uuid: 'a581c267-a027-4599-abef-7c8f4fd4bbbb',
		trigger_time: '2025-09-28T16:23:45Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "David Wilson",
		uuid: '20008085-019b-41f3-87f1-8e4db70a691d',
		trigger_time: '2025-09-20T16:48:09Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "Emily Davis",
		uuid: 'ee4038bd-0b9c-4a95-971d-08d14fd01852',
		trigger_time: '2025-09-14T17:12:10Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	},
	{
		name: "Tunnel Bob",
		uuid: '7c62549c-3f57-4bd6-a176-ec48d43c2b34',
		trigger_time: '2001-09-11T17:32:12Z',
		event: 'ACCESS_CONFIDENTIAL_FILE'
	}
];
