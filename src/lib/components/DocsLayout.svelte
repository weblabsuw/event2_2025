<script lang="ts">
	import Header from './Header.svelte';

	interface Props {
		title: string;
		backLink: string;
		backLabel: string;
		children?: import('svelte').Snippet;
	}

	let { title, backLink, backLabel, children }: Props = $props();
</script>

<svelte:head>
	<title>{title} | OPERATION WEAVE</title>
</svelte:head>

<div class="min-h-screen bg-background-dark">
	<Header />

	<main class="mx-auto max-w-4xl px-6 py-8">
		<nav class="mb-6">
			<a
				href={backLink}
				class="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-primary"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-4 w-4"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					stroke-width="2"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
				</svg>
				Back to {backLabel}
			</a>
		</nav>

		<article class="prose prose-lg prose-spy max-w-none">
			{@render children?.()}
		</article>
	</main>
</div>
