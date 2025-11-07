# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a SvelteKit application configured for deployment to Cloudflare Workers/Pages. The app uses:
- **SvelteKit 2.x** with Svelte 5 (runes mode)
- **Tailwind CSS v4** (via Vite plugin)
- **Cloudflare adapter** for edge deployment
- **TypeScript** for type safety
- **pnpm** as the package manager

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
```

## Architecture

### Deployment Target
The app is configured to deploy to Cloudflare Workers with the custom domain `event2.weblabs.club` (see wrangler.jsonc:22). The Cloudflare adapter outputs to `.svelte-kit/cloudflare/` with the worker entry at `.svelte-kit/cloudflare/_worker.js`.

### SvelteKit Structure
Standard SvelteKit structure with:
- `src/routes/` - File-based routing
- `src/lib/` - Reusable components and utilities
- `src/app.css` - Global styles (imports Tailwind)
- `src/app.d.ts` - TypeScript app-level type definitions
- `static/` - Static assets served at root

### Platform Integration
The app is configured to access Cloudflare platform features via `event.platform.env`, `event.platform.cf`, and `event.platform.ctx` (see app.d.ts). The `worker-configuration.d.ts` file contains auto-generated Cloudflare Worker types - regenerate with `pnpm cf-typegen` after modifying wrangler.jsonc bindings.

### Svelte 5 Runes
This project uses Svelte 5 with the new runes syntax. Component props use `$props()`, state uses `$state()`, and derived values use `$derived()`. The layout component demonstrates the new `{@render children?.()}` syntax for slot rendering.

### Styling
Tailwind CSS v4 is integrated via the `@tailwindcss/vite` plugin. Import Tailwind in `src/app.css` with `@import 'tailwindcss';` - no separate config file needed for v4.

## Important Configuration Files

- **wrangler.jsonc** - Cloudflare Workers configuration, including compatibility flags (`nodejs_als`), assets binding, custom domain routing, and observability settings
- **svelte.config.js** - Uses `@sveltejs/adapter-cloudflare` for edge deployment
- **vite.config.ts** - Configures both SvelteKit and Tailwind CSS v4 Vite plugins
