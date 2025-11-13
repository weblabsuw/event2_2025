#!/usr/bin/env node
/**
 * generate-surveillance-data.js
 *
 * Generates surveillance monitoring logs for the 7 SPIDER suspects.
 * Each suspect gets 12-18 pages of surveillance data (10 entries per page).
 * One entry per suspect contains a suspicious weapon purchase from a unique manufacturer.
 *
 * Output: src/lib/api/surveillance-data.json
 */

import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuration
const RANDOM_SEED = 42;
const ENTRIES_PER_PAGE = 10;
const MIN_PAGES = 12;
const MAX_PAGES = 18;
const START_DATE = new Date('2025-09-01T00:00:00Z');
const END_DATE = new Date('2025-11-13T23:59:59Z');

// The 7 suspect UUIDs from spider-data.ts
const SUSPECTS = [
  { uuid: '5e2cb2bd-477c-41e5-a1e2-200f5d5bbd8a', name: 'Alice Johnson' },
  { uuid: '21d04141-0934-4066-b832-c66c674bcbb5', name: 'Jacob Smith' },
  { uuid: 'd278c792-e153-4b73-8c84-a9a732c04d50', name: 'Sarah Johnson' },
  { uuid: 'a581c267-a027-4599-abef-7c8f4fd4bbbb', name: 'Emma Ingraham' },
  { uuid: '20008085-019b-41f3-87f1-8e4db70a691d', name: 'David Wilson' },
  { uuid: 'ee4038bd-0b9c-4a95-971d-08d14fd01852', name: 'Emily Davis' },
  { uuid: '7c62549c-3f57-4bd6-a176-ec48d43c2b34', name: 'Tunnel Bob' }
];

// Weapon manufacturers (one per suspect)
const MANUFACTURERS = [
  'Phantom Arms Ltd',
  'Shadow Tech Industries',
  'Obsidian Defense Corp',
  'Nightfall Armaments',
  'Apex Tactical Solutions',
  'Viper Munitions Group',
  'Eclipse Security Systems'
];

// Surveillance activity observations (simple 2-4 word descriptions)
const ACTIVITIES = [
  'jogging in park',
  'reading newspaper',
  'buying coffee',
  'checking mailbox',
  'walking dog',
  'grocery shopping',
  'pumping gas',
  'at gym',
  'eating lunch',
  'library visit',
  'bank transaction',
  'phone call',
  'watching movie',
  'restaurant dinner',
  'hair appointment',
  'dry cleaning pickup',
  'pharmacy visit',
  'park bench sitting',
  'window shopping',
  'subway commute',
  'taxi ride',
  'waiting bus',
  'car wash',
  'post office',
  'doctor appointment',
  'meeting friend',
  'browsing bookstore',
  'buying flowers',
  'picking up mail',
  'street vendor purchase',
  'market browsing',
  'parking car',
  'entering building',
  'exiting building',
  'crossing street',
  'waiting intersection',
  'smoking cigarette',
  'making phone call',
  'hailing taxi',
  'sitting cafe'
];

// Seeded random number generator (Mulberry32)
class SeededRandom {
  constructor(seed) {
    this.state = seed;
  }

  next() {
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice(array) {
    return array[this.nextInt(0, array.length - 1)];
  }

  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

// Format timestamp as ISO 8601
function formatTimestamp(date) {
  return date.toISOString();
}

// Generate random timestamp between start and end dates
function randomTimestamp(rng, start, end) {
  const startMs = start.getTime();
  const endMs = end.getTime();
  const randomMs = startMs + rng.next() * (endMs - startMs);
  return new Date(randomMs);
}

// Generate surveillance entries for a single suspect
function generateSurveillanceForSuspect(suspect, suspectIndex, rng) {
  const numPages = rng.nextInt(MIN_PAGES, MAX_PAGES);
  const totalEntries = numPages * ENTRIES_PER_PAGE;
  const manufacturer = MANUFACTURERS[suspectIndex];

  // Choose random position for suspicious activity (not on first page)
  const suspiciousIndex = rng.nextInt(ENTRIES_PER_PAGE, totalEntries - 1);

  console.log(`  ${suspect.name}: ${numPages} pages (${totalEntries} entries), suspicious at index ${suspiciousIndex}`);

  const entries = [];

  // Generate timestamps in chronological order
  const timestamps = [];
  for (let i = 0; i < totalEntries; i++) {
    timestamps.push(randomTimestamp(rng, START_DATE, END_DATE));
  }
  timestamps.sort((a, b) => a - b);

  // Create entries
  for (let i = 0; i < totalEntries; i++) {
    const isSuspicious = i === suspiciousIndex;

    const entry = {
      timestamp: formatTimestamp(timestamps[i]),
      activity: isSuspicious ? 'weapons transaction' : rng.choice(ACTIVITIES),
      suspicious: isSuspicious
    };

    // Add manufacturer only to suspicious entry
    if (isSuspicious) {
      entry.manufacturer = manufacturer;
    }

    entries.push(entry);
  }

  return {
    uuid: suspect.uuid,
    name: suspect.name,
    pages: numPages,
    entries
  };
}

// Main generation function
function generateSurveillanceData() {
  console.log('Generating surveillance data for SPIDER suspects...\n');

  const rng = new SeededRandom(RANDOM_SEED);
  const data = {};

  SUSPECTS.forEach((suspect, index) => {
    const surveillance = generateSurveillanceForSuspect(suspect, index, rng);
    data[suspect.uuid] = {
      name: surveillance.name,
      pages: surveillance.pages,
      entries: surveillance.entries
    };
  });

  return data;
}

// Write output file
function writeOutput(data) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const outputPath = join(__dirname, '..', 'src', 'lib', 'api', 'surveillance-data.json');

  const json = JSON.stringify(data, null, 2);
  writeFileSync(outputPath, json, 'utf8');

  console.log(`\n✓ Surveillance data written to: ${outputPath}`);
  console.log(`  Total suspects: ${Object.keys(data).length}`);
  console.log(`  Total entries: ${Object.values(data).reduce((sum, s) => sum + s.entries.length, 0)}`);
}

// Run the generator
try {
  const data = generateSurveillanceData();
  writeOutput(data);
} catch (error) {
  console.error('Error generating surveillance data:', error);
  process.exit(1);
}
