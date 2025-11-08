<script lang="ts">
	import { onMount } from 'svelte';
	import { dev } from '$app/environment';
	import { EditorView, basicSetup, minimalSetup } from 'codemirror';
	import { json } from '@codemirror/lang-json';
	import { abcdef } from '@fsegurai/codemirror-theme-abcdef';

	type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

	type Header = {
		key: string;
		value: string;
	};

	type ResponseData = {
		status: number;
		statusText: string;
		time: number;
		size: number;
		body: string;
	} | null;

	let method = $state<HttpMethod>('GET');
	let url = $state('');
	let headers = $state<Header[]>([{ key: '', value: '' }]);
	let response = $state<ResponseData>(null);
	let loading = $state(false);
	let editorContainer: HTMLDivElement;
	let editorView: EditorView | null = null;

	const BASE_URL = dev ? 'http://localhost:5173' : 'https://event2.weblabs.club';

	function addHeader() {
		headers = [...headers, { key: '', value: '' }];
	}

	function removeHeader(index: number) {
		headers = headers.filter((_, i) => i !== index);
	}

	async function sendRequest() {
		if (!url) return;

		loading = true;
		const startTime = performance.now();

		try {
			// Prepend base URL to the path
			const fullUrl = url.startsWith('http')
				? url
				: `${BASE_URL}${url.startsWith('/') ? url : '/' + url}`;

			// Build headers object, filtering out empty headers
			const headerObj: Record<string, string> = {};
			headers.forEach((h) => {
				if (h.key.trim() && h.value.trim()) {
					headerObj[h.key.trim()] = h.value.trim();
				}
			});

			const res = await fetch(fullUrl, {
				method,
				headers: headerObj
			});

			const endTime = performance.now();
			const responseText = await res.text();

			// Try to parse as JSON for pretty printing
			let formattedBody = responseText;
			try {
				const parsed = JSON.parse(responseText);
				formattedBody = JSON.stringify(parsed, null, 2);
			} catch {
				// Not JSON, keep as-is
			}

			response = {
				status: res.status,
				statusText: res.statusText,
				time: Math.round(endTime - startTime),
				size: new Blob([responseText]).size,
				body: formattedBody
			};

			// Update CodeMirror editor
			if (editorView) {
				editorView.dispatch({
					changes: {
						from: 0,
						to: editorView.state.doc.length,
						insert: formattedBody
					}
				});
			}
		} catch (error) {
			const endTime = performance.now();
			const errorMessage = error instanceof Error ? error.message : String(error);

			response = {
				status: 0,
				statusText: 'Error',
				time: Math.round(endTime - startTime),
				size: 0,
				body: `Error: ${errorMessage}`
			};

			if (editorView) {
				editorView.dispatch({
					changes: {
						from: 0,
						to: editorView.state.doc.length,
						insert: `Error: ${errorMessage}`
					}
				});
			}
		} finally {
			loading = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			sendRequest();
		}
	}

	onMount(() => {
		// Initialize CodeMirror editor
		editorView = new EditorView({
			doc: 'Response will appear here...',
			extensions: [
				minimalSetup,
				json(),
				abcdef,
				EditorView.editable.of(false),
				EditorView.theme({
					'&': { backgroundColor: '#0003 !important' } // semi-transparent background
				})
			],
			parent: editorContainer
		});

		return () => {
			editorView?.destroy();
		};
	});

	function getStatusColor(status: number | undefined): string {
		if (!status) return 'text-red-500';
		if (status >= 200 && status < 300) return 'text-green-400';
		if (status >= 300 && status < 400) return 'text-yellow-400';
		if (status >= 400 && status < 500) return 'text-orange-400';
		return 'text-red-400';
	}

	function formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
	}
</script>

<div
	class="@container flex min-h-[600px] flex-col overflow-hidden rounded-lg border border-[#23482f] lg:min-h-0"
>
	<div class="flex items-center border-b border-solid border-[#23482f] px-4 py-2">
		<h3 class="font-pixel text-lg leading-tight font-bold tracking-[-0.015em] text-primary">
			REST_API_CLIENT // SECURE_CHANNEL
		</h3>
	</div>
	<div class="flex flex-1 flex-col">
		<div class="space-y-4 p-4">
			<!-- Method + URL + Send button -->
			<div class="flex flex-col gap-2 @md:flex-row">
				<div class="shrink-0">
					<select
						bind:value={method}
						class="h-12 w-full rounded-lg border-0 bg-[#23482f] px-3 font-pixel text-lg font-bold text-primary focus:ring-primary @md:w-32"
					>
						<option>GET</option>
						<option>POST</option>
						<option>PUT</option>
						<option>DELETE</option>
						<option>PATCH</option>
					</select>
				</div>
				<input
					bind:value={url}
					onkeydown={handleKeyDown}
					class="h-12 flex-1 rounded-lg border-0 bg-[#23482f] px-4 font-pixel text-lg text-white placeholder:text-gray-400 focus:ring-primary"
					placeholder="/api/v1/targets/..."
					type="text"
				/>
				<button
					onclick={sendRequest}
					disabled={loading || !url}
					class="flex h-12 max-w-[480px] min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-[#112217] disabled:cursor-not-allowed disabled:opacity-50"
				>
					<span class="truncate">{loading ? 'SENDING...' : 'TRANSMIT'}</span>
				</button>
			</div>

			<!-- Headers section -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-2">
					<h4 class="font-pixel text-lg text-primary">HEADERS</h4>
					<div class="h-px flex-1 bg-[#23482f]"></div>
					<button
						onclick={addHeader}
						class="text-sm font-bold text-primary transition-colors hover:text-white"
					>
						ADD
					</button>
				</div>

				{#each headers as header, i}
					<div class="flex items-center gap-2">
						<input
							bind:value={header.key}
							class="h-10 flex-1 rounded-lg border-0 bg-[#0c1a10] px-3 font-pixel text-base text-white placeholder:text-gray-500 focus:ring-primary"
							placeholder="Header-Name"
							type="text"
						/>
						<input
							bind:value={header.value}
							class="h-10 flex-1 rounded-lg border-0 bg-[#0c1a10] px-3 font-pixel text-base text-white placeholder:text-gray-500 focus:ring-primary"
							placeholder="value"
							type="text"
						/>
						<button
							onclick={() => removeHeader(i)}
							class="p-2 text-red-500/70 transition-colors hover:text-red-500"
						>
							<span class="material-symbols-outlined">delete</span>
						</button>
					</div>
				{/each}
			</div>
		</div>

		<!-- Response section -->
		<div class="flex min-h-0 flex-1 flex-col">
			<div class="flex items-center justify-between border-y border-[#23482f] px-4 py-2">
				<h4 class="font-pixel text-lg text-primary">RESPONSE</h4>
				{#if response}
					<div class="flex items-center gap-4 text-sm font-bold">
						<span class={getStatusColor(response.status)}>
							STATUS: {response.status}
							{response.statusText}
						</span>
						<span class="text-gray-400">TIME: {response.time}ms</span>
						<span class="text-gray-400">SIZE: {formatBytes(response.size)}</span>
					</div>
				{:else}
					<span class="text-sm text-gray-500">Ready to transmit...</span>
				{/if}
			</div>
			<div class="min-h-0 flex-1 overflow-auto">
				<div bind:this={editorContainer} class="h-full"></div>
			</div>
		</div>
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
