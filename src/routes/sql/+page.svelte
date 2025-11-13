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

	const PART1_ANSWER_HASH = 'E05DB9B6C2E45A34D0C63617C91F950E28FF4D2326E63AA10A91E86CDE2E2802'.toLowerCase();
	const PART2_ANSWER_HASH = '234D28249B180616D49E22FD57F26EE1ABE04B63565812D65470FF881E854683'.toLowerCase();

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
							To keep tabs on the whereabouts of our agents, we maintain a record of flight logs in the <b>Flight Ledger Yard</b>, or F.L.Y. for short.
							Each flight log in F.L.Y. contains the agent’s social security number, city, time of arrival, and time of departure to/from our major spy hubs.
							In addition to past flights, F.L.Y. also maintains data on upcoming flights so that we can manage the assignments of our agents, so you will need to be careful when processing the data.
						</p>
						<p>
							<u>Your task is simple</u>: Determine what city Agent Web was located in at the time of his last ping to our headquarters.
						</p>
						<p class="mb-1">
							Here is some information that may be helpful in your endeavors:
						</p>
						<ul class="list-disc">
							<li class="ml-4"><b>Agent Web's Social Security Number</b>: <code class="code-inline">002-05-1849</code></li>
							<li class="ml-4"><b>Agent Web's Last Ping Time</b>: <code class="code-inline">2025-10-08T20:37:00Z</code></li>
						</ul>
						<p>
							Good luck!
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
								Great work, Agent!
							</p>
							<p>
								Now that you have determined the city that Agent Web was last seen in, it’s time to construct a list of suspects.
								Each of our agents has an entry in the <b>Worldwide Human Operatives database</b>, or W.H.O. for short, that contains information
								like name, social security number, height, eye color, and weight.
							</p>
							<p>
								Combining the information about the city and last ping time and still using F.L.Y.,
								generate a list of the agents who were in the same city as Agent Web when he went dark.
								To check your work, when sorting by name in ascending order, what does the first letter of each suspect’s last name spell out?
							</p>
							<p class="text-gray-400 italic">
								Note down the names of the suspects to use for later!
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
							<p class="text-gray-400 italic">
								Your findings have been transmitted to headquarters.
							</p>
							<p>
								Amazing job, Agent! You've successfully narrowed in on the general whereabouts of Agent Web
								and a list of suspects that were in the same area at the time of his demise.
							</p>
							<p class="text-green-400">
								Continue on to the next pieces of the puzzle, or combine your puzzle solutions
								to solve the mystery!
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

