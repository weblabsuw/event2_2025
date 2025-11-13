/**
 * W.E.B. Protocol Data
 * Worldwide Evidence Bureau
 *
 * Provides surveillance monitoring data for SPIDER suspects.
 * Each suspect has paginated surveillance logs containing routine
 * observations and one suspicious weapon purchase.
 */

import surveillanceData from './surveillance-data.json';

export type SurveillanceEntry = {
	timestamp: string;
	activity: string;
	suspicious: boolean;
	manufacturer?: string; // Only present when suspicious=true
};

export type SuspectSurveillance = {
	name: string;
	pages: number;
	entries: SurveillanceEntry[];
};

export const ENTRIES_PER_PAGE = 10;

// W.E.B. API Key (for consistency with SPIDER protocol)
export const WEB_API_KEY = 'WEB-CLEARANCE-BETA-3';

/**
 * Get list of all suspect UUIDs in the surveillance system
 */
export function getSuspectUUIDs(): string[] {
	return Object.keys(surveillanceData);
}

/**
 * Get surveillance info for a specific suspect
 */
export function getSuspectInfo(uuid: string): { name: string; pages: number } | null {
	const data = surveillanceData[uuid as keyof typeof surveillanceData];
	if (!data) return null;

	return {
		name: data.name,
		pages: data.pages
	};
}

/**
 * Get a specific page of surveillance entries for a suspect
 * Pages are 1-indexed (page 1 is the first page)
 */
export function getSurveillancePage(
	uuid: string,
	page: number
): { entries: SurveillanceEntry[]; total_pages: number; current_page: number } | null {
	const data = surveillanceData[uuid as keyof typeof surveillanceData];
	if (!data) return null;

	const startIndex = (page - 1) * ENTRIES_PER_PAGE;
	const endIndex = startIndex + ENTRIES_PER_PAGE;

	// Validate page number
	if (page < 1 || page > data.pages) {
		return null;
	}

	const entries = data.entries.slice(startIndex, endIndex);

	return {
		entries,
		total_pages: data.pages,
		current_page: page
	};
}

/**
 * Get all suspects with their basic info
 */
export function getAllSuspects(): Array<{ uuid: string; name: string; pages: number }> {
	return Object.entries(surveillanceData).map(([uuid, data]) => ({
		uuid,
		name: data.name,
		pages: data.pages
	}));
}
