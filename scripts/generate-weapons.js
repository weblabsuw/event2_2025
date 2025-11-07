#!/usr/bin/env node

/**
 * Generate weapons.json for W.E.B. Inventory System
 *
 * Creates 250 weapons with random types and clearance lists
 * Run: node scripts/generate-weapons.js
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Pool of weapon types (sci-fi spy theme)
const WEAPON_TYPES = [
	'Particle Beam Pistol',
	'Plasma Rifle',
	'EMP Grenade',
	'Sonic Disruptor',
	'Neural Stunner',
	'Photon Blade',
	'Quantum Disintegrator',
	'Cryogenic Projector',
	'Gravity Wave Emitter',
	'Neurotoxin Dart Gun',
	'Electromagnetic Pulse Device',
	'Laser Carbine',
	'Molecular Destabilizer',
	'Phase Shifter',
	'Kinetic Accelerator',
	'Bio-Electric Stunner',
	'Microwave Emitter',
	'Railgun Pistol',
	'Antimatter Charge',
	'Holographic Decoy Projector',
	'Nano-Swarm Launcher',
	'Temporal Displacer',
	'Ion Cannon',
	'Stealth Field Generator',
	'Mind Control Device',
	'Atomic Disassembler',
	'Vortex Generator',
	'Energy Shield Breaker',
	'Subspace Bomb',
	'Dark Matter Injector'
];

// Pool of agent SSNs (excluding the SPIDER triggered agents)
const AGENT_SSN_POOL = [
	'111-11-1111',
	'222-22-2222',
	'333-33-3333',
	'444-44-4444',
	'555-55-5555',
	'666-66-6666',
	'777-77-7777',
	'888-88-8888',
	'999-99-9999',
	'100-20-3040',
	'200-30-4050',
	'300-40-5060',
	'400-50-6070',
	'500-60-7080',
	'600-70-8090',
	'700-80-9010',
	'800-90-0120',
	'900-10-1230',
	'123-98-7654',
	'234-87-6543',
	'345-76-5432',
	'456-65-4321',
	'567-54-3210',
	'678-43-2109',
	'789-32-1098',
	'890-21-0987',
	'901-10-9876'
];

/**
 * Generate a random SSN (for additional variety)
 */
function generateRandomSSN() {
	const area = Math.floor(Math.random() * 899 + 100); // 100-999
	const group = Math.floor(Math.random() * 90 + 10); // 10-99
	const serial = Math.floor(Math.random() * 9000 + 1000); // 1000-9999
	return `${area}-${group}-${serial}`;
}

/**
 * Get random items from array
 */
function getRandomItems(arr, count) {
	const shuffled = [...arr].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count);
}

/**
 * Generate weapon data
 */
function generateWeapon(index) {
	// Pick random weapon type
	const weaponType = WEAPON_TYPES[Math.floor(Math.random() * WEAPON_TYPES.length)];

	// Generate clearance list (2-5 random SSNs)
	const clearanceCount = Math.floor(Math.random() * 4) + 2; // 2-5
	const clearance = [];

	// 70% chance to use pool SSNs, 30% chance to generate random
	for (let i = 0; i < clearanceCount; i++) {
		if (Math.random() < 0.7 && AGENT_SSN_POOL.length > 0) {
			const randomIndex = Math.floor(Math.random() * AGENT_SSN_POOL.length);
			clearance.push(AGENT_SSN_POOL[randomIndex]);
		} else {
			clearance.push(generateRandomSSN());
		}
	}

	return {
		weapon_type: weaponType,
		clearance: [...new Set(clearance)] // Remove duplicates
	};
}

/**
 * Main generation function
 */
function main() {
	console.log('Generating 250 weapons for W.E.B. Inventory System...');

	const weapons = [];

	for (let i = 0; i < 250; i++) {
		weapons.push(generateWeapon(i));

		if ((i + 1) % 50 === 0) {
			console.log(`Generated ${i + 1}/250 weapons...`);
		}
	}

	// Write to file
	const outputPath = join(__dirname, '..', 'src', 'lib', 'api', 'weapons.json');
	writeFileSync(outputPath, JSON.stringify(weapons, null, 2), 'utf-8');

	console.log(`✓ Successfully generated weapons.json at ${outputPath}`);
	console.log(`✓ Total weapons: ${weapons.length}`);
	console.log(
		`\nNote: The special murder weapon (Nano-Toxin Injector) will be injected at runtime for New York on page 16.`
	);
}

main();
