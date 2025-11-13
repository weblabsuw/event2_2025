<script lang="ts">
	import Header from '$lib/components/Header.svelte';

	// Form state
	let murdererName = $state('');
	let murderWeapon = $state('');
	let murderLocation = $state('');
	let isSubmitting = $state(false);
	let resultMessage = $state('');
	let resultSuccess = $state(false);

	// TODO: Replace this with your encoded success message
	// To encode your message:
	// 1. Determine the correct answer key: murdererName + murderWeapon + murderLocation
	//    Example: "John SmithKnifeGrand Hotel, Paris"
	// 2. Run this encoding function in Node.js or browser console:
	//
	//    function encodeMessage(message, key) {
	//      const msgBytes = new TextEncoder().encode(message);
	//      const keyBytes = new TextEncoder().encode(key);
	//      const encoded = new Uint8Array(msgBytes.length);
	//      for (let i = 0; i < msgBytes.length; i++) {
	//        encoded[i] = msgBytes[i] ^ keyBytes[i % keyBytes.length];
	//      }
	//      return Array.from(encoded).map(b => b.toString(16).padStart(2, '0')).join('');
	//    }
	//
	//    const correctKey = "John SmithKnifeGrand Hotel, Paris";
	//    const successMsg = "🎉 CASE SOLVED! Agent Web's murderer has been identified. Excellent detective work!";
	//    console.log(encodeMessage(successMsg, correctKey));
	//
	// 3. Copy the hex output and paste it below
	const ENCODED_SUCCESS_MESSAGE = "baf0e6e700102c3a314818212530200353412f0345261b5432094e0723411f1c012e0a1a0b527305080748290b0c08452e16040010492e061101420c65280217051f2f011c4e4436190c171c22180c461228000a4f";
	const SUCCESS_MESSAGE_HASH = "ebb5bfcb22eee677b43be085ad46f88111b56684204e93ab6e125f3a8594a439"

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

	/**
	 * Handle form submission
	 */
	async function handleSubmit(event: Event) {
		event.preventDefault();

		isSubmitting = true;
		resultMessage = '';
		resultSuccess = false;

		// Simulate processing delay for effect
		await new Promise(resolve => setTimeout(resolve, 1500));

		try {
			// Concatenate answers to form the decryption key
			const answerKey = murdererName + murderWeapon + murderLocation;

			// Attempt to decode the success message
			const decoded = decodeMessage(ENCODED_SUCCESS_MESSAGE, answerKey);

			// Compute hash of decoded message
			const decodedHash = await computeHash(decoded);
			console.log(decodedHash);

			// Verify the hash matches the expected hash
			if (decodedHash === SUCCESS_MESSAGE_HASH) {
				// Hash matches - correct answer!
				resultSuccess = true;
				resultMessage = decoded;
			} else {
				// Hash doesn't match - wrong answer
				resultSuccess = false;
				resultMessage = '❌ ACCESS DENIED: Incorrect answer. Review your evidence and try again.';
			}
		} catch (e) {
			// Decoding or hashing failed
			resultSuccess = false;
			resultMessage = '❌ ACCESS DENIED: Incorrect answer. Review your evidence and try again.';
		}

		isSubmitting = false;
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
						<span class="font-pixel text-sm text-primary">CLASSIFIED</span>
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
						<p class="font-mono text-sm text-gray-400">
							Your mission: Investigate three intelligence systems to uncover the truth behind his disappearance.
						</p>
					</div>

					<div class="mt-8 rounded-lg border border-spy-red/30 bg-spy-red/5 p-4">
						<p class="font-pixel text-s text-spy-red">
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
					<p class="font-pixel text-s text-gray-400">
						💡 ANALYST TIP
					</p>
					<p class="mt-2 font-mono text-s text-gray-500">
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
								<label for="murderer" class="mb-2 block font-pixel text-sm text-gray-300">
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

							<!-- Murder Weapon -->
							<div class="text-left">
								<label for="weapon" class="mb-2 block font-pixel text-sm text-gray-300">
									MURDER WEAPON
								</label>
								<input
									id="weapon"
									type="text"
									bind:value={murderWeapon}
									placeholder="e.g., Knife"
									class="w-full rounded-lg border border-gray-600 bg-black/40 px-4 py-3 font-mono text-white placeholder-gray-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
									required
								/>
							</div>

							<!-- Murder Location -->
							<div class="text-left">
								<label for="location" class="mb-2 block font-pixel text-sm text-gray-300">
									MURDER LOCATION (Building, City)
								</label>
								<input
									id="location"
									type="text"
									bind:value={murderLocation}
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
						<div class="mt-6 rounded-lg border-2 p-6 {resultSuccess ? 'border-primary bg-primary/10' : 'border-spy-red bg-spy-red/10'}">
							<p class="font-pixel text-lg {resultSuccess ? 'text-primary' : 'text-spy-red'}">
								{resultMessage}
							</p>
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

