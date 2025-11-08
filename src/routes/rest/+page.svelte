<script lang="ts">
	import RestClient from '$lib/components/RestClient.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import Header from '$lib/components/Header.svelte';
</script>

<div class="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-hidden">
	<div class="layout-container flex h-full grow flex-col">
		<Header />
		<main class="grid flex-1 grid-cols-1 gap-4 p-4 lg:grid-cols-2 lg:p-10">
			<RestClient />
			<CodeEditor />
		</main>
	</div>
</div>
