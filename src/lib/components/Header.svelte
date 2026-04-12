<script>
	import favicon from '$lib/assets/favicon.svg';
</script>

<header
	class="flex items-center justify-between border-b border-solid border-b-[#23482f] px-10 py-3 whitespace-nowrap"
>
	<div class="flex items-center text-white">
		<a class="contents" href="/">
			<div class="size-6 text-primary">
				<img src={favicon} alt="logo" height="24" width="24" />
			</div>
			<h2 class="font-display pl-2 text-lg leading-tight font-bold tracking-[-0.015em] text-white hover:text-primary transition-colors">
				OPERATION WEAVE
			</h2>
		</a>
	</div>
	<nav class="flex items-center gap-4 md:gap-6">
		<div class="flex items-center gap-1">
			<a
				href="/sql"
				class="font-pixel text-lg font-medium text-white hover:text-primary transition-colors"
			>
				SQL
			</a>
			<span class="text-gray-600">|</span>
			<a
				href="/sql/docs"
				class="text-xs text-gray-400 hover:text-primary transition-colors"
			>
				Guide
			</a>
		</div>
		<div class="flex items-center gap-1">
			<a
				href="/rest"
				class="font-pixel text-lg font-medium text-white hover:text-primary transition-colors"
			>
				REST
			</a>
			<span class="text-gray-600">|</span>
			<a
				href="/rest/docs"
				class="text-xs text-gray-400 hover:text-primary transition-colors"
			>
				Guide
			</a>
		</div>
		<div class="flex items-center gap-1">
			<a
				href="/ai"
				class="font-pixel text-lg font-medium text-white hover:text-primary transition-colors"
			>
				AI
			</a>
			<span class="text-gray-600">|</span>
			<a
				href="/ai/docs"
				class="text-xs text-gray-400 hover:text-primary transition-colors"
			>
				Guide
			</a>
		</div>
	</nav>
</header>
