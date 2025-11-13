<script lang="ts">
	import { onMount, tick } from 'svelte';
	import initSqlJs, { type Database } from 'sql.js';
	import Header from '$lib/components/Header.svelte';
	import SqlTerminal from '$lib/components/SqlTerminal.svelte';

	let db = $state<Database | null>(null);
	let error = $state<string | null>(null);
	let part1Solved = $state(false);
	let part2Solved = $state(false);
	let part2Element: HTMLElement;
	let successElement: HTMLElement;

	const PART1_ANSWER_HASH = '3F0214FEB4E0C5D2BD49E2E5B208469170D1CE1BA189BBA78835673F6C89C08D'.toLowerCase();
	const PART2_ANSWER_HASH = '5D09E7544B3869EAF4DAF14D4411D77D4C2F903113BF39ED92AC9BA7622B8AAD'.toLowerCase();

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

	async function handlePart1Solved() {
		part1Solved = true;
		// Wait for DOM to update
		await tick();
		// Small delay to allow fade-in animation to start
		setTimeout(() => {
			part2Element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);
	}

	async function handlePart2Solved() {
		part2Solved = true;
		// Wait for DOM to update
		await tick();
		// Small delay to allow fade-in animation to start
		setTimeout(() => {
			successElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);
	}

	onMount(() => {
		loadDatabase();

		return () => {
			db?.close();
		};
	});
</script>

<div class="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-hidden">
	<div class="layout-container flex h-full grow flex-col">
		<Header />
		<main class="flex flex-1 flex-col items-center gap-8 p-4 lg:p-10">
			<!-- Database Loading Error -->
			{#if error}
				<div class="w-full max-w-5xl rounded-lg border border-red-500/30 bg-red-950/20 p-4">
					<p class="font-pixel text-sm text-red-400">DATABASE ERROR: {error}</p>
					<p class="mt-2 font-pixel text-xs text-gray-400">Please refresh the page to try again.</p>
				</div>
			{/if}

			<!-- Part 1 Section -->
			<section class="w-full max-w-5xl space-y-6">
				<!-- Part 1 Prose -->
				<div class="rounded-lg border border-[#23482f] bg-[#0c1a10]/50 p-6">
					<h2 class="mb-4 font-pixel text-xl text-primary">MISSION BRIEFING // PART 1</h2>
					<div class="space-y-3 font-mono text-sm text-gray-300">
						<p>
							[TODO: Add challenge description for Part 1]
						</p>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Use the SQL terminal below to investigate the database and find the answer to the first question.
						</p>
						<p class="text-primary">
							→ Submit your answer to unlock Part 2
						</p>
					</div>
				</div>

				<!-- Part 1 Terminal -->
				<SqlTerminal
					{db}
					partNumber={1}
					answerHash={PART1_ANSWER_HASH}
					onSolved={handlePart1Solved}
				/>
			</section>

			<!-- Part 2 Section (only shown after Part 1 is solved) -->
			{#if part1Solved}
				<section bind:this={part2Element} class="w-full max-w-5xl space-y-6 animate-fadeIn">
					<!-- Part 2 Prose -->
					<div class="rounded-lg border border-[#23482f] bg-[#0c1a10]/50 p-6">
						<h2 class="mb-4 font-pixel text-xl text-primary">MISSION BRIEFING // PART 2</h2>
						<div class="space-y-3 font-mono text-sm text-gray-300">
							<p>
								[TODO: Add challenge description for Part 2]
							</p>
							<p>
								Excellent work on Part 1! Now dig deeper into the database to uncover the next piece of intelligence.
							</p>
							<p class="text-primary">
								→ Submit your final answer to complete the mission
							</p>
						</div>
					</div>

					<!-- Part 2 Terminal -->
					<SqlTerminal
						{db}
						partNumber={2}
						answerHash={PART2_ANSWER_HASH}
						onSolved={handlePart2Solved}
					/>
				</section>
			{/if}

			<!-- Success Message (only shown after Part 2 is solved) -->
			{#if part2Solved}
				<section bind:this={successElement} class="w-full max-w-5xl animate-fadeIn">
					<div class="rounded-lg border border-green-500/50 bg-green-950/30 p-8 text-center">
						<h2 class="mb-4 font-pixel text-2xl text-green-400">
							✓ MISSION COMPLETE
						</h2>
						<div class="space-y-3 font-mono text-sm text-gray-300">
							<p>
								Congratulations, Agent! You have successfully extracted all critical intelligence from the database.
							</p>
							<p class="text-green-400">
								[TODO: Add final success message and any additional flavor text]
							</p>
							<p class="text-gray-400 italic">
								Your findings have been transmitted to headquarters. Well done.
							</p>
						</div>
					</div>
				</section>
			{/if}
		</main>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.animate-fadeIn) {
		animation: fadeIn 1.2s ease-out forwards;
	}
</style>

