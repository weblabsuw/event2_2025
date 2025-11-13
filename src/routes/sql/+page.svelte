<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, minimalSetup } from 'codemirror';
	import { sql } from '@codemirror/lang-sql';
	import { abcdef } from '@fsegurai/codemirror-theme-abcdef';
	import initSqlJs, { type Database, type QueryExecResult } from 'sql.js';
	import Header from '$lib/components/Header.svelte';

	let db = $state<Database | null>(null);
	let sqlQuery = $state('SELECT * FROM sqlite_master WHERE type="table";');
	let results = $state<QueryExecResult[] | null>(null);
	let error = $state<string | null>(null);
	let loading = $state(false);
	let executionTime = $state<number | null>(null);
	let editorContainer: HTMLDivElement;
	let editorView: EditorView | null = null;

	async function loadDatabase() {
		error = null;

		try {
			const SQL = await initSqlJs({
				locateFile: (file: string) => `https://sql.js.org/dist/${file}`
			});

			const response = await fetch('/data.sqlite');
			if (!response.ok) {
				throw new Error(`Failed to load database: ${response.statusText}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			const uint8Array = new Uint8Array(arrayBuffer);
			db = new SQL.Database(uint8Array);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			db = null;
		}
	}

	function executeQuery() {
		if (!db) {
			error = 'Database not loaded. Please refresh the page.';
			return;
		}

		if (!sqlQuery.trim()) {
			error = 'Please enter a SQL query';
			return;
		}

		loading = true;
		error = null;
		const startTime = performance.now();

		try {
			const queryResults = db.exec(sqlQuery);
			const endTime = performance.now();

			results = queryResults;
			executionTime = Math.round(endTime - startTime);

			// If no results, might be a successful non-SELECT query
			if (queryResults.length === 0) {
				// Check if it was a modification query
				results = [];
			}
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			results = null;
			executionTime = null;
		} finally {
			loading = false;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			executeQuery();
		}
	}

	onMount(() => {
		// Load the database
		loadDatabase();

		// Initialize CodeMirror editor with SQL syntax highlighting
		editorView = new EditorView({
			doc: sqlQuery,
			extensions: [
				minimalSetup,
				sql(),
				abcdef,
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						sqlQuery = update.state.doc.toString();
					}
				}),
				EditorView.theme({
					'&': {
						backgroundColor: '#0003 !important',
						height: '72px',
						fontSize: '14px'
					},
					'.cm-scroller': {
						overflow: 'auto'
					}
				})
			],
			parent: editorContainer
		});

		return () => {
			editorView?.destroy();
			db?.close();
		};
	});
</script>

<div class="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-hidden">
	<div class="layout-container flex h-full grow flex-col">
		<Header />
		<main class="flex flex-1 justify-center p-4 lg:p-10">
			<div
				class="@container flex min-h-[600px] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-[#23482f]"
			>
				<div class="flex items-center border-b border-solid border-[#23482f] px-4 py-2">
					<h3 class="font-pixel text-lg leading-tight font-bold tracking-[-0.015em] text-primary">
						SQLITE_QUERY_TERMINAL // INTEL_DATABASE
					</h3>
				</div>
				<div class="flex flex-1 flex-col">
					<div class="space-y-4 p-4">

						<!-- SQL Query editor -->
						<div class="flex flex-col gap-2">
							<div class="flex items-center gap-2">
								<h4 class="font-pixel text-lg text-primary">QUERY_INPUT</h4>
								<div class="h-px flex-1 bg-[#23482f]"></div>
							</div>
							<div class="flex gap-2">
								<div class="grow overflow-hidden rounded-lg border border-[#23482f]">
									<div bind:this={editorContainer}></div>
								</div>
								<button
									onclick={executeQuery}
									onkeydown={handleKeyDown}
									disabled={loading || !db}
									class="flex max-w-[480px] min-w-[84px] cursor-pointer items-center justify-center self-stretch overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-[#112217] disabled:cursor-not-allowed disabled:opacity-50"
								>
									<span class="truncate">{loading ? 'EXECUTING...' : 'EXECUTE QUERY'}</span>
								</button>
							</div>
						</div>
					</div>

					<!-- Error display -->
					{#if error}
						<div class="mx-4 mb-4 rounded-lg border border-red-500/30 bg-red-950/20 p-3">
							<p class="font-pixel text-sm text-red-400">ERROR: {error}</p>
						</div>
					{/if}

					<!-- Results section -->
					{#if results !== null}
						<div class="flex min-h-0 flex-1 flex-col">
							<div class="flex items-center border-y border-[#23482f] px-4 py-2">
								<h4 class="font-pixel text-lg text-primary">QUERY_RESULTS</h4>
								{#if results.length > 0}
									<span class="ml-auto font-pixel text-sm text-gray-400">
										RESULT_SETS: {results.length}
									</span>
								{/if}
								{#if executionTime !== null}
									<span class="font-pixel text-sm text-gray-400">
										EXEC_TIME: {executionTime}ms
									</span>
								{/if}
							</div>
							<div class="min-h-0 flex-1 overflow-auto p-4">
								{#if results.length === 0}
									<p class="font-pixel text-sm text-gray-400">
										Query executed successfully. No rows returned.
									</p>
								{:else}
									{#each results as result, idx}
										<div class="mb-6 last:mb-0">
											{#if results.length > 1}
												<h5 class="mb-2 font-pixel text-base text-primary">
													Result Set {idx + 1}
												</h5>
											{/if}
											<div class="overflow-x-auto">
												<table
													class="w-full border-collapse overflow-hidden rounded-lg border border-[#23482f]"
												>
													<thead>
														<tr class="bg-[#23482f]">
															{#each result.columns as column}
																<th
																	class="border-r border-[#0c1a10] px-4 py-2 text-left font-pixel text-sm text-primary uppercase last:border-r-0"
																>
																	{column}
																</th>
															{/each}
														</tr>
													</thead>
													<tbody>
														{#each result.values as row}
															<tr
																class="border-t border-[#23482f] transition-colors hover:bg-[#0c1a10]"
															>
																{#each row as cell}
																	<td
																		class="border-r border-[#23482f]/30 px-4 py-2 font-mono text-sm text-white last:border-r-0"
																	>
																		{cell === null ? '(null)' : cell}
																	</td>
																{/each}
															</tr>
														{/each}
													</tbody>
												</table>
											</div>
											<p class="mt-2 font-pixel text-xs text-gray-400">
												{result.values.length} row{result.values.length !== 1 ? 's' : ''}
												returned
											</p>
										</div>
									{/each}
								{/if}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</main>
	</div>
</div>

<style>
	:global(.cm-editor) {
		font-size: 14px;
	}

	:global(.cm-scroller) {
		overflow: auto;
	}
</style>
