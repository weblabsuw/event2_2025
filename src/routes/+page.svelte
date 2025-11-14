<script lang="ts">
	import Header from '$lib/components/Header.svelte';
	import { tick } from 'svelte';

	// Form state
	let murdererName = $state('');
	let murderWeaponType = $state('');
	let murderWeaponManufacturer = $state('');
	let murderLocationCity = $state('');
	let murderLocationBuilding = $state('');
	let isSubmitting = $state(false);
	let resultMessage = $state('');
	let resultSuccess = $state(false);
	let resultDiv: HTMLElement;

	const ENCODED_SUCCESS_MESSAGE = "27080e00551a0b471d074818021b1755160a000a1b1d07180c471f1b140a404c4f14004d000a00000000571500040b04101745070e1e1c4f6d4700090d503d0b0a1f0048080347130f0c41090716161d19" +
		"111d1d0d4e0707041a1d0b08020d54081c0a410813071016190217451c071407450f0807190a48000d020b50000a4d2c0645071a4725040a461e4e0110131b1c4172633b1e0609481213131804451352040f19001c061c1000060c0701595324" +
		"040407064f654e0215181815084d1f04560c0f0b17054815050b4507170e07001600000949050d1c0f0f084c4804004d021f0c03115f5712131c01011253472a4103071c580006080c1c100b4a1941531d0f0916412a140e050c1b1507150258" +
		"3e0b0c4906060d460d03024704004341390d0f005404411c0a1c4f1005000d41011b1c0c52000615501a0400084d00100112520a060e1a4f453d1b1c541d1d08024e0706051146081f4c6214110608030206151e57345c452a0e111400114d49" +
		"130148000d025e0354031f020c001a010a17411a00030a0a18521f180e1b0c4e0707473f1d1502030253081c43412c031a110157161a041c4f1d164507080d521b4300081e591615110508130c492306000a4828030917141a0e194358204e06" +
		"080348000941010d4b0452050800453e352a5943786f3f06011b4517090c520243540c111c501709080c1300080003521500044d050b1a0503110b1f0c4e1a01061c542706090254413b03061f0406151e570011110d0b5512090c0f0c5e4f6e" +
		"410131101211164d0211451b0f131b170d124d1e10015207111d5808190f10470e1b14410b034f055c4d261f000f0053000e000e444f3414000d1547";
	const SUCCESS_MESSAGE_HASH = "856e7887b01a3d27b2acf0ecbe1b0e2f3079ba926fddcd14af9c1dd59ab511ce";

	/**
	 * XOR decode using the answer key
	 * Returns the decoded message if key is correct, otherwise returns garbage
	 */
	function decodeMessage(encodedHex: string, key: string): string {
		try {
			// Convert hex string to bytes
			const encodedBytes = new Uint8Array(
				encodedHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
			);

			// Convert key to bytes
			const keyBytes = new TextEncoder().encode(key);

			// XOR decode
			const decoded = new Uint8Array(encodedBytes.length);
			for (let i = 0; i < encodedBytes.length; i++) {
				decoded[i] = encodedBytes[i] ^ keyBytes[i % keyBytes.length];
			}

			// Convert back to string
			return new TextDecoder().decode(decoded);
		} catch (e) {
			return '';
		}
	}

	async function hashAnswer(text: string): Promise<string> {
		const encoder = new TextEncoder();
		const data = encoder.encode(text);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

		return hashHex;
	}

	/**
	 * Handle form submission
	 */
	async function handleSubmit(event: Event) {
		event.preventDefault();

		isSubmitting = true;
		resultMessage = '';
		resultSuccess = false;

		// Simulate processing delay for effect
		await new Promise(resolve => setTimeout(resolve, 700));

		resultMessage = 'Incorrect answer. Review your evidence and try again.';

		try {
			// Concatenate answers to form the decryption key
			const answerKey = (murdererName + murderWeaponType + murderWeaponManufacturer + murderLocationBuilding + murderLocationCity).trim().toLowerCase();

			// Attempt to decode the success message
			const decoded = decodeMessage(ENCODED_SUCCESS_MESSAGE, answerKey);

			// Compute hash of decoded message
			const decodedHash = await hashAnswer(decoded);

			// Verify the hash matches the expected hash
			if (decodedHash === SUCCESS_MESSAGE_HASH) {
				// Hash matches - correct answer!
				resultSuccess = true;
				resultMessage = decoded;
			} else {
				// Hash doesn't match - wrong answer
			}
		} catch (e) {
			// Decoding or hashing failed
		}

		isSubmitting = false;

		// Wait for DOM to update before scrolling
		await tick();
		resultDiv?.scrollIntoView({ behavior: 'smooth', block: 'end' });
	}

	const missions = [
		{
			id: 'sql',
			title: 'SQL INVESTIGATION',
			code: 'F.L.Y. & W.H.O.',
			description: 'Analyze flight logs and agent records to identify suspects in the area at the time of the murder.',
			icon: '🗂️',
			status: 'ACTIVE',
			href: '/sql',
			color: 'border-primary bg-primary/5'
		},
		{
			id: 'rest',
			title: 'REST INFILTRATION',
			code: 'S.P.I.D.E.R. API',
			description: 'Interact with S.P.I.D.E.R. to extract classified intelligence on operatives.',
			icon: '🕸️',
			status: 'ACTIVE',
			href: '/rest',
			color: 'border-spy-amber bg-spy-amber/5'
		},
		{
			id: 'ai',
			title: 'AI DRONE CONTROL',
			code: 'DRONE_UNIT_734',
			description: 'Program and command an autonomous reconnaissance drone to gather field intelligence.',
			icon: '🤖',
			status: 'ACTIVE',
			href: '/ai',
			color: 'border-blue-500 bg-blue-500/5'
		}
	];

	let hoveredMission = $state<string | null>(null);
	let resultParagraphs = $derived(resultMessage ? resultMessage.split(/\r?\n\r?\n+/) : []);
</script>

<div class="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-hidden">
	<!-- Animated background grid -->
	<div class="pointer-events-none absolute inset-0 opacity-20">
		<div class="grid-pattern h-full w-full"></div>
	</div>

	<div class="layout-container relative flex h-full grow flex-col">
		<Header />

		<main class="flex flex-1 flex-col items-center justify-center gap-12 p-4 lg:p-10">
			<!-- Hero Section -->
			<section class="w-full max-w-4xl space-y-6 text-center">
				<div class="animate-fadeIn">
					<div class="mb-4 flex items-center justify-center gap-3">
						<div class="h-px w-12 bg-primary"></div>
						<span class="font-pixel text-2xl text-primary">CLASSIFIED</span>
						<div class="h-px w-12 bg-primary"></div>
					</div>

					<h1 class="mb-4 font-pixel text-5xl leading-tight text-primary lg:text-7xl">
						OPERATION<br />WEAVE
					</h1>

					<div class="mx-auto max-w-2xl space-y-4">
						<p class="font-mono text-lg text-gray-300">
							<span class="text-spy-red">AGENT BUCKINGHAM WEB</span> has gone dark.
						</p>
						<p class="font-mono text-sm text-gray-400">
							Last ping timestamp: <code class="code-inline">2025-10-08T20:37:00Z</code>
						</p>
						<p class="text-base gray-300">
							You are a technical operative at <b>BadVibes</b>, a secretive international agency that tracks outbreaks of vibe coding
							and infiltrates suspected organizations to contain the spread. Our network of agents are dispersed throughout
							the world and operate completely undercover. Because of the nature of their work, our agents
							only ping headquarters at specific checkpoint intervals. Recently, the transponder of one of our agents,
							Buckingham Web, stopped sending signals. Our system logs lead us to believe there may have been foul play involved.
						</p>
						<p class="text-base gray-300">
							<u>Your task</u>: Investigate three intelligence systems to uncover the truth behind his disappearance.
						</p>
					</div>

					<div class="mt-8 rounded-lg border border-spy-red/30 bg-spy-red/5 p-4">
						<p class="font-pixel text-lg text-spy-red">
							⚠ SECURITY CLEARANCE REQUIRED ⚠
						</p>
						<p class="mt-2 font-mono text-s text-gray-400">
							All mission data is classified. Unauthorized access will be logged and reported.
						</p>
					</div>
				</div>
			</section>

			<!-- Mission Cards -->
			<section class="w-full max-w-6xl">
				<div class="mb-6 text-center">
					<h2 class="font-pixel text-2xl text-primary">SELECT YOUR MISSION</h2>
					<p class="mt-2 font-mono text-sm text-gray-400">
						Each investigation path reveals critical pieces of the puzzle
					</p>
				</div>

				<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
					{#each missions as mission}
						<a
							href={mission.href}
							class="mission-card group relative overflow-hidden rounded-lg border-2 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl {mission.color}"
							onmouseenter={() => hoveredMission = mission.id}
							onmouseleave={() => hoveredMission = null}
						>
							<!-- Status indicator -->
							<div class="mb-4 flex items-center justify-between">
								<span class="flex items-center gap-2 font-pixel text-xs text-primary">
									<span class="relative flex h-2 w-2">
										<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
										<span class="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
									</span>
									{mission.status}
								</span>
								<span class="text-4xl opacity-70 transition-transform group-hover:scale-110">
									{mission.icon}
								</span>
							</div>

							<!-- Mission title -->
							<h3 class="mb-2 font-pixel text-xl text-white">
								{mission.title}
							</h3>

							<!-- Mission code -->
							<div class="mb-3 font-mono text-xs text-gray-400">
								<span class="rounded bg-black/30 px-2 py-1">
									{mission.code}
								</span>
							</div>

							<!-- Description -->
							<p class="mb-4 font-mono text-sm leading-relaxed text-gray-300">
								{mission.description}
							</p>

							<!-- Action button -->
							<div class="flex items-center justify-between font-pixel text-sm">
								<span class="text-primary transition-all group-hover:translate-x-1">
									LAUNCH MISSION →
								</span>
								{#if hoveredMission === mission.id}
									<span class="animate-pulse text-primary">▸</span>
								{/if}
							</div>

							<!-- Animated border effect -->
							<div class="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
								<div class="scan-line absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"></div>
							</div>
						</a>
					{/each}
				</div>
			</section>

			<!-- Footer hint -->
			<section class="w-full max-w-4xl text-center">
				<div class="rounded-lg border border-gray-700 bg-black/20 p-6">
					<p class="font-pixel text-xl text-gray-400">
						💡 ANALYST TIP
					</p>
					<p class="mt-2 font-mono text-s text-gray-200">
						Complete all three missions to gather enough intelligence. Each mission provides crucial data that interconnects with the others. Cross-reference your findings to solve the mystery.
					</p>
				</div>
			</section>

			<!-- Answer Submission -->
			<section class="w-full max-w-4xl">
				<div class="rounded-lg border-2 border-spy-red bg-spy-red/5 p-8">
					<h2 class="mb-6 font-pixel text-3xl text-spy-red">SUBMIT FINAL REPORT</h2>

					<form onsubmit={handleSubmit} class="space-y-6">
						<div class="space-y-4">
							<!-- Murderer Name -->
							<div class="text-left">
								<label for="murderer" class="mb-2 block font-pixel text-lg text-gray-300">
									MURDERER'S NAME (First Last)
								</label>
								<input
									id="murderer"
									type="text"
									bind:value={murdererName}
									placeholder="e.g., John Smith"
									class="w-full rounded-lg border border-gray-600 bg-black/40 px-4 py-3 font-mono text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
									required
								/>
							</div>

							<!-- Murder Weapon Type -->
							<div class="text-left">
								<label for="weapon_type" class="mb-2 block font-pixel text-lg text-gray-300">
									MURDER WEAPON TYPE
								</label>
								<input
									id="weapon_type"
									type="text"
									bind:value={murderWeaponType}
									placeholder="e.g., Knife"
									class="w-full rounded-lg border border-gray-600 bg-black/40 px-4 py-3 font-mono text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
									required
								/>
							</div>

							<!-- Murder Weapon Manufacturer -->
							<div class="text-left">
								<label for="weapon_manufacturer" class="mb-2 block font-pixel text-lg text-gray-300">
									MURDER WEAPON MANUFACTURER
								</label>
								<input
									id="weapon_manufacturer"
									type="text"
									bind:value={murderWeaponManufacturer}
									placeholder="e.g., Moonshade Security Corp"
									class="w-full rounded-lg border border-gray-600 bg-black/40 px-4 py-3 font-mono text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
									required
								/>
							</div>

							<!-- Murder Location Building Type -->
							<div class="text-left">
								<label for="location_type" class="mb-2 block font-pixel text-lg text-gray-300">
									MURDER LOCATION BUILDING TYPE
								</label>
								<input
									id="location_type"
									type="text"
									bind:value={murderLocationBuilding}
									placeholder="e.g., Shed"
									class="w-full rounded-lg border border-gray-600 bg-black/40 px-4 py-3 font-mono text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
									required
								/>
							</div>

							<!-- Murder Location City -->
							<div class="text-left">
								<label for="location_city" class="mb-2 block font-pixel text-lg text-gray-300">
									MURDER LOCATION CITY (City, Country)
								</label>
								<input
									id="location_city"
									type="text"
									bind:value={murderLocationCity}
									placeholder="e.g., Grand Hotel, Paris"
									class="w-full rounded-lg border border-gray-600 bg-black/40 px-4 py-3 font-mono text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
									required
								/>
							</div>
						</div>

						<!-- Submit Button -->
						<button
							type="submit"
							disabled={isSubmitting}
							class="w-full rounded-lg border-2 border-primary bg-primary/10 px-6 py-4 font-pixel text-lg text-primary transition-all hover:bg-primary/20 hover:shadow-lg hover:shadow-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isSubmitting ? 'DECRYPTING...' : 'SUBMIT REPORT →'}
						</button>
					</form>

					<!-- Result Message -->
					{#if resultMessage}
						<div bind:this={resultDiv} class="mt-6 rounded-lg border-2 p-6 {resultSuccess ? 'border-primary bg-primary/10' : 'border-spy-red bg-spy-red/10'}">
							<div class="font-pixel text-3xl tracking-wide {resultSuccess ? 'text-primary' : 'text-spy-red'}">
								{resultSuccess ? '🎉 CASE SOLVED!' : '❌ ACCESS DENIED'}
							</div>
							<!-- Render paragraphs split by double newline; preserve single newlines -->
							<div class="mt-3 space-y-4">
								{#each resultParagraphs as para}
									<p class="text-base leading-relaxed text-gray-200 whitespace-pre-wrap">{para}</p>
								{/each}
							</div>
							{#if resultSuccess}
								<p class="mt-3 text-gray-400 italic">
									Thank you for playing our little game! We hope you learned something. :-)
								</p>
							{/if}
						</div>
					{/if}
				</div>
			</section>
		</main>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes scanLine {
		0% {
			transform: translateY(-100%);
		}
		100% {
			transform: translateY(2000%);
		}
	}

	@keyframes gridPulse {
		0%, 100% {
			opacity: 0.1;
		}
		50% {
			opacity: 0.2;
		}
	}

	.animate-fadeIn {
		animation: fadeIn 1s ease-out forwards;
	}

	.scan-line {
		animation: scanLine 2s ease-in-out infinite;
	}

	.grid-pattern {
		background-image:
			linear-gradient(rgba(19, 236, 91, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(19, 236, 91, 0.1) 1px, transparent 1px);
		background-size: 50px 50px;
		animation: gridPulse 4s ease-in-out infinite;
	}

	.mission-card {
		backdrop-filter: blur(8px);
		background-clip: padding-box;
	}

	.mission-card:hover {
		box-shadow: 0 0 30px rgba(19, 236, 91, 0.3);
	}

	@keyframes ping {
		75%, 100% {
			transform: scale(2);
			opacity: 0;
		}
	}

	.animate-ping {
		animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
	}
</style>
