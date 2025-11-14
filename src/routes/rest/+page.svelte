<script lang="ts">
	import RestClient from '$lib/components/RestClient.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import Header from '$lib/components/Header.svelte';
</script>

<div class="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-hidden">
	<div class="layout-container flex h-full grow flex-col">
		<Header />
		<div class="px-4 pt-4 lg:px-10 lg:pt-6">
			<a
				href="/REST.pdf"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 font-pixel text-sm text-primary transition-colors hover:bg-primary/20"
			>
				<span>📖</span>
				<span>REST API GUIDE</span>
			</a>
		</div>
		<main class="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-2 lg:p-10">
			<RestClient />
			<CodeEditor />
		</main>
	</div>
</div>
