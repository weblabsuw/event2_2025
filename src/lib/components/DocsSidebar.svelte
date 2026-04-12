<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	interface Props {
		open: boolean;
		onclose: () => void;
		title: string;
		docsHref: string;
		children?: import('svelte').Snippet;
	}

	let { open, onclose, title, docsHref, children }: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') onclose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose();
	}
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
	<div
		class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
		role="presentation"
		transition:fade={{ duration: 200 }}
		onclick={handleBackdropClick}
	>
		<aside
			class="fixed top-0 right-0 z-50 flex h-full w-full flex-col border-l border-[#23482f] bg-[#0c1a10] shadow-2xl shadow-black/50 sm:w-[42rem]"
			role="dialog"
			aria-modal="true"
			aria-label={title}
			transition:fly={{ x: 672, duration: 350, easing: cubicOut }}
		>
			<div class="flex shrink-0 items-center justify-between border-b border-[#23482f] px-6 py-4">
				<h2 class="font-pixel text-xl text-primary">{title}</h2>
				<div class="flex items-center gap-3">
					<a
						href={docsHref}
						target="_blank"
						rel="noopener noreferrer"
						class="font-pixel text-xs text-gray-400 underline underline-offset-2 transition-colors hover:text-primary"
					>
						OPEN IN NEW TAB ↗
					</a>
					<button
						onclick={onclose}
						class="flex h-8 w-8 items-center justify-center rounded border border-[#23482f] text-gray-400 transition-colors hover:border-primary/50 hover:text-primary"
						aria-label="Close sidebar"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>

			<div class="min-h-0 flex-1 overflow-y-auto px-6 py-6">
				<article class="prose prose-lg prose-spy max-w-none">
					{@render children?.()}
				</article>
			</div>
		</aside>
	</div>
{/if}
