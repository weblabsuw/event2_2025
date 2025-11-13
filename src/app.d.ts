// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Env {
			OPENAI_API_KEY?: string;
		}

		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};