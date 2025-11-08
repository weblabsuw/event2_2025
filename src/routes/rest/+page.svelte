<script lang="ts">
	import RestClient from '$lib/components/RestClient.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
</script>

<div class="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-hidden">
	<div class="layout-container flex h-full grow flex-col">
		<header
			class="flex items-center justify-between border-b border-solid border-b-[#23482f] px-10 py-3 whitespace-nowrap"
		>
			<div class="flex items-center gap-4 text-white">
				<div class="size-4 text-primary">
					<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z"
							fill="currentColor"
						></path>
					</svg>
				</div>
				<h2 class="font-display text-lg leading-tight font-bold tracking-[-0.015em] text-white">
					SPY_OPS_CONSOLE
				</h2>
			</div>
		</header>
		<main class="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-2 lg:p-10">
			<RestClient />
			<CodeEditor />
		</main>
	</div>
</div>
