# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit application for a murder mystery game that teaches students about databases, REST APIs, and AI function calling. The app is configured for deployment to Cloudflare Workers/Pages and uses:
- **SvelteKit 2.x** with Svelte 5 (runes mode)
- **Tailwind CSS v4** (via Vite plugin)
- **Cloudflare adapter** for edge deployment
- **TypeScript** for type safety
- **pnpm** as the package manager
- **CodeMirror** for SQL and code editing
- **sql.js** for in-browser SQLite queries
- **OpenAI API** (gpt-4.1-nano) for AI station

## Development Commands

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build locally (builds and runs with wrangler)
pnpm preview

# Type checking
pnpm check
pnpm check:watch  # with watch mode

# Code formatting
pnpm format       # format all files
pnpm lint         # check formatting

# Deploy to Cloudflare
pnpm deploy

# Generate Cloudflare Worker types
pnpm cf-typegen

# Generate weapons data for W.E.B. inventory
pnpm generate:weapons
```

## Game Architecture

### Murder Mystery Concept
Students solve a murder mystery by discovering **location** (city + building type), **weapon** (type + instance), and **murderer** (SSN/name) through three API stations:

1. **SQL Station** (`/sql`) - SQLite database analysis
   - Part 1: Find victim's city at time of death (flight logs)
   - Part 2: Find agents in same city (location tracking)
   - Database: `static/data.sqlite` (served at `/data.sqlite`)

2. **REST Station** (`/rest`) - REST API interactions
   - **S.P.I.D.E.R. API** (`/api/v1/spider/*`) - Agents with motive
     - `/info` - Protocol information
     - `/key` - API key retrieval (requires specific JSON body)
     - `/agents` - Triggered agents list (requires `X-SPIDER-Key` header)
   - **W.E.B. Inventory API** (`/api/v1/web/*`) - Base64-encoded weapons
     - `/cities` - List of cities with inventory
     - `/inventory?city={city}&page={page}` - Paginated weapon data

3. **AI Station** (`/ai`) - OpenAI function calling
   - Proxy endpoint: `/api/v1/ai/chat`
   - Injects secret system prompt with hex/base64 encoded clues
   - Students define tools: `scan_environment`, `analyze_evidence`, `decode_sensor_data`
   - Returns encoded building type and weapon type via function calls

### Critical Game Data Files

- **`src/lib/api/spider-data.ts`** - S.P.I.D.E.R. protocol data
  - `SPIDER_API_KEY`: API key students must obtain
  - `TRIGGERED_AGENTS`: 7 agents who accessed victim's confidential data
  - Key agent SSN: `324-26-8712` (has clearance for murder weapon)

- **`src/lib/api/web-data.ts`** - W.E.B. inventory system
  - 250 base weapons from `weapons.json`
  - Special weapon for New York: Nano-Toxin Injector (index 155, page 16)
  - `getCityInventory(city)`: Returns Base64-encoded weapon data
  - Clearance lists link agents to weapons

- **`src/lib/api/ai-config.ts`** - AI station configuration
  - `SYSTEM_PROMPT`: Secret prompt injected by proxy
  - `TOOL_RESPONSES`: Hex/Base64 encoded clues
  - Location hex: `57415245484F555345` → "WAREHOUSE"

### API Utilities

- **`src/lib/api/utils.ts`** - Shared API helpers
  - `apiResponse()`: Standard JSON response wrapper
  - `apiError()`: Error response with status codes
  - `validateSpiderKey()`: Validates `X-SPIDER-Key` header
  - `parseJsonBody()`: Safe JSON body parsing

## Architecture

### Deployment Target
Configured to deploy to Cloudflare Workers with custom domain `event2.weblabs.club` (wrangler.jsonc:22). Requires `OPENAI_API_KEY` secret for AI station:
- **Production**: `wrangler secret put OPENAI_API_KEY`
- **Local dev**: Create `.dev.vars` file with `OPENAI_API_KEY=sk-proj-...`

### SvelteKit Structure
- `src/routes/` - File-based routing with API routes under `/api/v1/`
- `src/lib/` - Reusable components (RestClient, CodeEditor, Header) and API logic
- `src/app.css` - Global styles (imports Tailwind)
- `static/` - Static assets including `data.sqlite` database

### Platform Integration
Access Cloudflare features via `event.platform.env`, `event.platform.cf`, and `event.platform.ctx` (app.d.ts). The `worker-configuration.d.ts` file contains auto-generated types - regenerate with `pnpm cf-typegen` after modifying bindings.

### Svelte 5 Runes
Uses Svelte 5 runes syntax: `$props()`, `$state()`, `$derived()`. Layout uses `{@render children?.()}` for slot rendering.

### Styling
Tailwind CSS v4 via `@tailwindcss/vite` plugin. Import with `@import 'tailwindcss';` in CSS files.

## Important Configuration Files

- **wrangler.jsonc** - Cloudflare Workers config with `nodejs_als` compatibility, assets binding, custom domain routing, and secrets documentation
- **svelte.config.js** - Uses `@sveltejs/adapter-cloudflare` for edge deployment
- **vite.config.ts** - Configures SvelteKit and Tailwind CSS v4 plugins
- **SPEC.md** - Complete game mechanics and station design
- **AI_STATION_DESIGN.md** - Detailed AI function calling implementation
- **scripts/README.md** - Weapons generation and murder mystery flow
