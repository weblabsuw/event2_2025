<script lang="ts">
	import RestClient from '$lib/components/RestClient.svelte';
	import CodeEditor from '$lib/components/CodeEditor.svelte';
	import Header from '$lib/components/Header.svelte';
</script>

<div class="group/design-root relative flex h-auto min-h-screen w-full flex-col overflow-hidden">
	<div class="layout-container flex h-full grow flex-col">
		<Header />
		<main class="flex flex-1 flex-col items-center gap-8 p-4 lg:p-10">
			<!-- Guide Link -->
			<div class="w-full max-w-7xl">
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

			<!-- Mission Briefing -->
			<section class="w-full max-w-7xl space-y-6">
				<!-- Part 1 -->
				<div class="rounded-lg border border-[#23482f] bg-[#0c1a10]/50 p-6">
					<h2 class="mb-4 font-pixel text-xl text-primary">MISSION BRIEFING // PART 1: S.P.I.D.E.R. PROTOCOL</h2>
					<div class="space-y-3 font-mono text-sm text-gray-300">
						<p>
							The suspect seems to be good at covering their tracks — some of our systems have missing periods in their logs. However, the culprit seems to have forgotten about our <b>S.P.I.D.E.R. protocol</b> (Super Private IDentity Emergency Recall), which triggered when they tried to access confidential data about Agent Web.
						</p>
						<p>
							<u>Your task</u>: Check the S.P.I.D.E.R. logs through its API to verify what agents have recently triggered the protocol.
						</p>
						<p class="mb-1 mt-4 font-bold text-primary">S.P.I.D.E.R. API Endpoints:</p>
						<ul class="list-disc space-y-1">
							<li class="ml-4"><code class="code-inline">GET /api/v1/spider/info</code> - System information</li>
							<li class="ml-4">
								<code class="code-inline">POST /api/v1/spider/key</code> - Obtain API key<br/>
								<span class="ml-6 text-xs text-gray-400">Body: <code class="code-inline">&#123;"agent_id":"investigation_team","clearance":"omega"&#125;</code></span>
							</li>
							<li class="ml-4"><code class="code-inline">GET /api/v1/spider/agents?query="&lt;name&gt;"</code> - Search agents by name</li>
							<li class="ml-4"><code class="code-inline">GET /api/v1/spider/logs/&lt;UUID&gt;</code> - View agent access logs</li>
						</ul>
					</div>
				</div>

				<!-- Part 2 -->
				<div class="rounded-lg border border-[#23482f] bg-[#0c1a10]/50 p-6">
					<h2 class="mb-4 font-pixel text-xl text-primary">MISSION BRIEFING // PART 2: W.E.B. SURVEILLANCE</h2>
					<div class="space-y-3 font-mono text-sm text-gray-300">
						<p>
							Unfortunately, the culprit was successfully able to corrupt our suspect tracking system. Luckily we have partners with the <b>W.E.B.</b> (Worldwide Evidence Bureau) that can monitor our suspects by UUID.
						</p>
						<p>
							The data has been stored in the <b>Base64 format</b>, likely to save space. It's up to you to connect to the W.E.B.'s API, retrieve the data for each suspect, and decode it to determine suspicious transactions (denoted with <code class="code-inline">"suspicious": true</code>) involved in the crime.
						</p>
						<p class="mb-1 mt-4 font-bold text-primary">W.E.B. API Endpoints:</p>
						<ul class="list-disc space-y-1">
							<li class="ml-4"><code class="code-inline">GET /api/v1/web/info</code> - System information</li>
							<li class="ml-4"><code class="code-inline">GET /api/v1/web/suspects</code> - List all suspects under surveillance</li>
							<li class="ml-4"><code class="code-inline">GET /api/v1/web/surveillance/&lt;uuid&gt;?page=&lt;N&gt;</code> - Paginated surveillance logs (Base64 encoded)</li>
						</ul>
					</div>
				</div>
			</section>

			<!-- API Testing Tools -->
			<div class="grid w-full max-w-7xl grid-cols-1 gap-4 lg:grid-cols-2">
				<RestClient />
				<CodeEditor />
			</div>
		</main>
	</div>
</div>
