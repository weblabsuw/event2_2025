/**
 * W.E.B. Inventory System Data
 * Wow! Everything Box
 *
 * Stores one base list of 250 weapons, encodes to Base64 at runtime
 */

import baseWeapons from './weapons.json';

export type WeaponData = {
	weapon_type: string;
	clearance: string[]; // Array of agent SSNs with clearance for this weapon
};

export type InventoryItem = {
	id: string;
	data: string; // Base64 encoded JSON of WeaponData
};

export const CITIES = ['New York', 'Seattle', 'Portland', 'San Francisco', 'Los Angeles'];

// Special weapon that only appears in New York inventory
// This is the murder weapon - SSN should match one from SPIDER data
const NY_SPECIAL_WEAPON: WeaponData = {
	weapon_type: 'Nano-Toxin Injector',
	clearance: ['324-26-8712', '555-12-3456', '789-01-2345']
};

/**
 * Helper to encode weapon data to Base64
 */
export function encodeWeaponData(data: WeaponData): string {
	return btoa(JSON.stringify(data));
}

/**
 * Helper to decode weapon data from Base64
 * Students will implement this in JavaScript
 */
export function decodeWeaponData(encoded: string): WeaponData {
	return JSON.parse(atob(encoded));
}

/**
 * Get inventory for a specific city
 * For New York, injects special weapon at page 16 (index 155)
 */
export function getCityInventory(city: string): InventoryItem[] {
	const weapons = [...(baseWeapons as WeaponData[])];

	// For New York, inject the special weapon at index 155 (page 16, 6th item)
	if (city === 'New York') {
		weapons.splice(155, 0, NY_SPECIAL_WEAPON);
	}

	// Convert to inventory items with Base64 encoding
	return weapons.map((weapon, index) => {
		const cityCode = city
			.split(' ')
			.map((w) => w.substring(0, 3).toUpperCase())
			.join('');
		const itemId = `WPN-${cityCode}-${String(index + 1).padStart(4, '0')}`;

		return {
			id: itemId,
			data: encodeWeaponData(weapon)
		};
	});
}

/**
 * Get total items for a city
 */
export function getCityItemCount(city: string): number {
	// New York has one extra item (the special weapon)
	return city === 'New York' ? 251 : 250;
}
