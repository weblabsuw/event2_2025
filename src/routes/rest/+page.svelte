<script lang="ts">
	import RestClient from '$lib/components/RestClient.svelte';
</script>

<div class="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-hidden">
<div class="layout-container flex h-full grow flex-col">
<header class="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#23482f] px-10 py-3">
<div class="flex items-center gap-4 text-white">
<div class="size-4 text-primary">
<svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
<path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
</svg>
</div>
<h2 class="text-white text-lg font-bold leading-tight tracking-[-0.015em] font-display">SPY_OPS_CONSOLE</h2>
</div>
</header>
<main class="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 lg:p-10">
<RestClient />
<div class="flex flex-col border border-[#23482f] rounded-lg overflow-hidden min-h-[600px] lg:min-h-0">
<div class="flex items-center border-b border-solid border-[#23482f] px-4 py-2">
<h3 class="text-primary text-lg font-bold leading-tight tracking-[-0.015em] font-pixel">SCRIPTING_MODULE // JS_RUNTIME</h3>
</div>
<div class="flex-1 bg-[#0c1a10] p-4 font-mono text-sm">
<pre class="text-white whitespace-pre-wrap"><code>code goes here
</code></pre>
</div>
<div class="flex items-center justify-end gap-4 p-4 border-t border-[#23482f]">
<button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent border border-primary/50 text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/10">
<span class="truncate">CLEAR</span>
</button>
<button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent border border-primary/50 text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/10">
<span class="truncate">LOAD PRESET</span>
</button>
<button class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-[#112217] text-sm font-bold leading-normal tracking-[0.015em]">
<span class="truncate">EXECUTE SCRIPT</span>
</button>
</div>
</div>
</main>
</div>
</div>
