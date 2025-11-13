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
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load names from SQLite database
const dbPath = join(__dirname, '..', 'static', 'data.sqlite');
const db = new Database(dbPath, { readonly: true });
const AGENT_NAMES = db.prepare('SELECT name FROM who').all().map(row => row.name);
db.close();

console.log(`Loaded ${AGENT_NAMES.length} names from database`);

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

	// Generate clearance list (2-5 random names)
	const clearanceCount = Math.floor(Math.random() * 4) + 2; // 2-5
	const clearance = [];

	// Pick random names from the database
	for (let i = 0; i < clearanceCount; i++) {
		const randomIndex = Math.floor(Math.random() * AGENT_NAMES.length);
		clearance.push(AGENT_NAMES[randomIndex]);
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
