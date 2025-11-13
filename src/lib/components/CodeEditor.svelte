<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { javascript } from '@codemirror/lang-javascript';
	import { abcdef } from '@fsegurai/codemirror-theme-abcdef';

	let editorContainer: HTMLDivElement;
	let editorView: EditorView | null = null;
	let output = $state<string>('');
	let hasError = $state(false);
	let executing = $state(false);

	const initialCode = `// Example: Fetch and decode surveillance data
const response = await fetch('/api/v1/web/suspects');
const data = await response.json();
console.log(data.suspects);

// Example: Decode Base64 data
const encoded = "eyJ0aW1lc3RhbXAiOiIyMDI1LTA5LTAxVDA2OjQ5OjMwLjI5M1oiLCJhY3Rpdml0eSI6InB1bXBpbmcgZ2FzIiwic3VzcGljaW91cyI6ZmFsc2V9";
const decoded = JSON.parse(atob(encoded));
console.log('Decoded entry:', decoded);`;

	async function executeCode() {
		if (!editorView) return;

		executing = true;
		hasError = false;
		output = '';

		const code = editorView.state.doc.toString();

		// Capture console.log output
		const logs: string[] = [];
		const originalLog = console.log;
		const originalError = console.error;
		const originalWarn = console.warn;

		// Override console methods
		console.log = (...args) => {
			logs.push(args.map((arg) => formatValue(arg)).join(' '));
			originalLog.apply(console, args);
		};

		console.error = (...args) => {
			logs.push('ERROR: ' + args.map((arg) => formatValue(arg)).join(' '));
			originalError.apply(console, args);
		};

		console.warn = (...args) => {
			logs.push('WARN: ' + args.map((arg) => formatValue(arg)).join(' '));
			originalWarn.apply(console, args);
		};

		try {
			// Wrap code in an async function to support await
			const AsyncFunction = async function () {}.constructor as FunctionConstructor;
			const asyncFn = AsyncFunction(code);

			// Execute the async code and wait for completion
			const result = await asyncFn();

			// Restore console methods
			console.log = originalLog;
			console.error = originalError;
			console.warn = originalWarn;

			// Build output
			let outputText = '';

			if (logs.length > 0) {
				outputText += logs.join('\n');
			}

			// If there's a return value and no console logs, show it
			if (result !== undefined && logs.length === 0) {
				outputText += formatValue(result);
			}

			output = outputText || '(no output)';
			hasError = false;
		} catch (error) {
			// Restore console methods
			console.log = originalLog;
			console.error = originalError;
			console.warn = originalWarn;

			const errorMessage = error instanceof Error ? error.message : String(error);
			output = `Error: ${errorMessage}\n\nStack:\n${error instanceof Error ? error.stack : ''}`;
			hasError = true;
		} finally {
			executing = false;
		}
	}

	function formatValue(value: unknown): string {
		if (value === null) return 'null';
		if (value === undefined) return 'undefined';
		if (typeof value === 'string') return value;
		if (typeof value === 'function') return value.toString();

		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return String(value);
		}
	}

	function clearOutput() {
		output = '';
		hasError = false;
	}

	onMount(() => {
		// Initialize CodeMirror editor
		editorView = new EditorView({
			doc: initialCode,
			extensions: [
				basicSetup,
				javascript(),
				abcdef,
				EditorView.lineWrapping,
				EditorView.theme({
					'&': { backgroundColor: '#0003 !important' } // semi-transparent background
				}),
				// Add keyboard shortcut for Cmd/Ctrl+Enter to execute
				EditorView.domEventHandlers({
					keydown: (event) => {
						if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
							event.preventDefault();
							executeCode();
							return true;
						}
						return false;
					}
				})
			],
			parent: editorContainer
		});

		return () => {
			editorView?.destroy();
		};
	});
</script>

<div
	class="flex min-h-[600px] flex-col overflow-hidden rounded-lg border border-[#23482f] lg:min-h-0"
>
	<div class="flex items-center border-b border-solid border-[#23482f] px-4 py-2">
		<h3 class="font-pixel text-lg leading-tight font-bold tracking-[-0.015em] text-primary">
			SCRIPTING_MODULE // JS_RUNTIME
		</h3>
	</div>

	<!-- Code Editor -->
	<div class="flex-1 flex flex-col min-h-0">
		<div class="flex-1 overflow-auto" bind:this={editorContainer}></div>
	</div>

	<!-- Output Section -->
	{#if output}
		<div class="border-t border-[#23482f]">
			<div class="flex items-center justify-between px-4 py-2 bg-[#0c1a10] border-b border-[#23482f]">
				<span class="font-pixel text-sm text-primary">OUTPUT</span>
				<button
					onclick={clearOutput}
					class="text-xs text-gray-400 hover:text-white transition-colors"
				>
					CLEAR
				</button>
			</div>
			<div class="max-h-48 overflow-auto bg-[#0c1a10] p-4">
				<pre
					class="font-mono text-sm whitespace-pre-wrap {hasError ? 'text-red-400' : 'text-green-400'}"
				><code>{output}</code></pre>
			</div>
		</div>
	{/if}

	<!-- Action Buttons -->
	<div class="flex items-center justify-end gap-4 border-t border-[#23482f] p-4">
		<button
			onclick={executeCode}
			disabled={executing}
			class="flex h-10 max-w-[480px] min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-[#112217] disabled:opacity-50 disabled:cursor-not-allowed"
		>
			<span class="truncate">{executing ? 'EXECUTING...' : 'EXECUTE SCRIPT'}</span>
		</button>
	</div>
</div>

<style>
	:global(.cm-editor) {
		height: 100%;
		font-size: 14px;
	}

	:global(.cm-scroller) {
		overflow: auto;
	}
</style>
