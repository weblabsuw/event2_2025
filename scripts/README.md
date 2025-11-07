# Scripts

## generate-weapons.js

Generates the `src/lib/api/weapons.json` file containing 250 weapons for the W.E.B. Inventory System.

### Usage

```bash
pnpm generate:weapons
```

### What it does

- Creates 250 weapons with random types from a pool of sci-fi spy weapons
- Assigns 2-5 random agent SSNs to each weapon's clearance list
- Outputs to `src/lib/api/weapons.json`

### How the data is used

1. The base list of 250 weapons is loaded from `weapons.json`
2. For **New York** city only, a special murder weapon (Nano-Toxin Injector) is injected at index 155 (page 16, item 6)
3. All weapon data is Base64 encoded at runtime when served through the API
4. Students must decode the Base64 data in JavaScript to find the weapon with the matching agent SSN

### The Murder Mystery Flow

1. Student gets refined suspect list from S.P.I.D.E.R. API (7 agent SSNs)
2. Student queries W.E.B. inventory for New York, page 16
3. Student decodes Base64 weapon data to find clearance lists
4. Student cross-references: which agent from S.P.I.D.E.R. has clearance for the murder weapon?
5. Answer: **324-26-8712** (has clearance for Nano-Toxin Injector)
