<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		function handleTripleMouseDown(e: MouseEvent) {
			// Intercept before browser creates the larger selection (mousedown fires earlier than click)
			if (e.detail !== 3) return;
			const target = e.target as HTMLElement | null;
			if (!target) return;
			const codeEl = target.closest('code.code-inline');
			if (!codeEl) return;

			// Prevent default triple-click expansion to parent block
			e.preventDefault();
			e.stopPropagation();

			// Create our custom selection immediately
			const sel = window.getSelection();
			if (!sel) return;
			sel.removeAllRanges();
			const range = document.createRange();
			range.selectNodeContents(codeEl);
			sel.addRange(range);
		}

		// Use capture to beat native logic
		document.addEventListener('mousedown', handleTripleMouseDown, true);
		return () => {
			document.removeEventListener('mousedown', handleTripleMouseDown, true);
		};
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children?.()}
