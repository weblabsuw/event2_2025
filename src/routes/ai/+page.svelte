<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { javascript } from '@codemirror/lang-javascript';
	import { abcdef } from '@fsegurai/codemirror-theme-abcdef';
	import Header from '$lib/components/Header.svelte';

	type Message = {
		sender: 'drone' | 'agent';
		text: string;
		timestamp: string;
	};

	let messages = $state<Message[]>([
		{
			sender: 'drone',
			text: 'DRONE_UNIT_734 ONLINE. AWAITING COMMANDS, AGENT.',
			timestamp: getCurrentTime()
		}
	]);
	let input = $state('');
	let chatContainer: HTMLDivElement;
	let editorContainer: HTMLDivElement;
	let editorView: EditorView | null = null;
	let executing = $state(false);

	const initialCode = `// PART 1: Basic Communication (no tools)
// PART 2: Advanced Analysis (with tools)

async function handleMessage(msg, res) {
  // msg: the user's message
  // res: function to send responses
  //      res(text) - display text response
  //      res.tool(name, args) - display tool call

  // ============================================
  // PART 1: BASIC API CALL (DO THIS FIRST!)
  // ============================================
  // Goal: Get location data from the drone
  // Try asking: "What is your status?"

  const response = await fetch("/api/v1/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: msg }]
      // NOTE: No tools array yet for Part 1!
    })
  });

  const data = await response.json();

  // Display text response
  if (data.choices[0].message.content) {
    res(data.choices[0].message.content);

    // TODO: Extract and decode the hex string from the response
    // Hint: Look for "LOCATION_SCAN: [hex]" in the text
    // Use this function to decode hex:
    // function hexToString(hex) {
    //   let str = '';
    //   for (let i = 0; i < hex.length; i += 2) {
    //     str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    //   }
    //   return str;
    // }
  }

  // ============================================
  // PART 2: TOOL CALLING (DO THIS SECOND!)
  // ============================================
  // Goal: Get weapon evidence using tools
  // Try asking: "Analyze the evidence"

  // TODO: Uncomment and modify this section for Part 2:
  /*
  const tools = [
    {
      type: "function",
      function: {
        name: "analyze_evidence",
        description: "Analyze detected evidence at the crime scene",
        parameters: { type: "object", properties: {} }
      }
    }
  ];

  const response2 = await fetch("/api/v1/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: msg }],
      tools: tools  // Now include tools!
    })
  });

  const data2 = await response2.json();

  // Handle tool calls
  if (data2.choices[0].message.tool_calls) {
    const toolCall = data2.choices[0].message.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);

    // Display the tool call
    res.tool(toolCall.function.name, args);

    // TODO: Decode the base64 encoded_data from args
    // Hint: Use atob(args.encoded_data) to decode base64
  }
  */
}`;

	function getCurrentTime(): string {
		const now = new Date();
		return now.toTimeString().slice(0, 5);
	}

	function scrollToBottom() {
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 50);
	}

	async function sendMessage() {
		if (!input.trim()) return;

		const userMessage = input.trim();
		input = '';

		// Add user message
		messages = [
			...messages,
			{
				sender: 'agent',
				text: userMessage,
				timestamp: getCurrentTime()
			}
		];
		scrollToBottom();

		// Execute user's code
		executing = true;
		try {
			await executeUserFunction(userMessage);
		} catch (error) {
			console.error('Error executing user function:', error);
			messages = [
				...messages,
				{
					sender: 'drone',
					text: `ERROR: ${error instanceof Error ? error.message : String(error)}`,
					timestamp: getCurrentTime()
				}
			];
		} finally {
			executing = false;
			scrollToBottom();
		}
	}

	async function executeUserFunction(userMessage: string) {
		if (!editorView) return;

		const code = editorView.state.doc.toString();

		// Create the res function that the user can call
		const res = (text: string) => {
			messages = [
				...messages,
				{
					sender: 'drone',
					text,
					timestamp: getCurrentTime()
				}
			];
			scrollToBottom();
		};

		// Add tool calling capability
		res.tool = (name: string, args: any) => {
			const argsStr = JSON.stringify(args, null, 2);
			messages = [
				...messages,
				{
					sender: 'drone',
					text: `[TOOL_CALL] ${name}\nArguments:\n${argsStr}`,
					timestamp: getCurrentTime()
				}
			];
			scrollToBottom();
		};

		try {
			// Wrap user code and execute
			const wrappedCode = `
				${code}

				// Call the user's function
				if (typeof handleMessage === 'function') {
					await handleMessage(${JSON.stringify(userMessage)}, res);
				} else {
					throw new Error('handleMessage function not defined');
				}
			`;

			// Execute in isolated scope with async support
			const AsyncFunction = async function () {}.constructor as FunctionConstructor;
			const fn = new AsyncFunction('res', wrappedCode);
			await fn(res);
		} catch (error) {
			throw error;
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	}

	onMount(() => {
		// Initialize CodeMirror editor
		editorView = new EditorView({
			doc: initialCode,
			extensions: [
				basicSetup,
				javascript(),
				abcdef,
				EditorView.lineWrapping,
				EditorView.theme({
					'&': { backgroundColor: '#0003 !important' }
				}),
				EditorView.domEventHandlers({
					keydown: (event) => {
						if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
							event.preventDefault();
							// Could trigger execution here if needed
							return true;
						}
						return false;
					}
				})
			],
			parent: editorContainer
		});

		scrollToBottom();

		return () => {
			editorView?.destroy();
		};
	});
</script>

<div class="group/design-root relative flex w-full flex-col overflow-hidden">
	<div class="layout-container flex h-full grow flex-col overflow-y-auto">
		<Header />
		<div class="px-4 pt-4 lg:px-10 lg:pt-6">
			<a
				href="/AI.pdf"
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 font-pixel text-sm text-primary transition-colors hover:bg-primary/20"
			>
				<span>📖</span>
				<span>AI FUNCTION CALLING GUIDE</span>
			</a>
		</div>

		<!-- Mission Briefing -->
		<section class="space-y-6 px-4 py-6 lg:px-10">
			<!-- Part 1 -->
			<div class="rounded-lg border border-[#23482f] bg-[#0c1a10]/50 p-6">
				<h2 class="mb-4 font-pixel text-xl text-primary">MISSION BRIEFING // PART 1: BASIC COMMUNICATION</h2>
				<div class="space-y-3 font-mono text-sm text-gray-300">
					<p>
						Agent Web was traveling with an autonomous reconnaissance drone (<b>DRONE_UNIT_734</b>) that remained intact at the crime scene. Your first task is to establish basic communication with the drone's AI system.
					</p>
					<p>
						<u>Part 1 Goal</u>: Make a basic API call (without tools) and ask the drone about its location. The drone will respond with encoded location data that you must decode.
					</p>

					<div class="mt-4 rounded border border-[#23482f] bg-[#0c1a10] p-4">
						<p class="mb-2 font-bold text-primary">Part 1 Requirements:</p>
						<ul class="list-disc space-y-1 text-xs">
							<li class="ml-4">
								<b>API Endpoint:</b> <code class="code-inline">POST /api/v1/ai/chat</code>
							</li>
							<li class="ml-4">
								<b>Request Body:</b> Include a <code class="code-inline">messages</code> array (just like ChatGPT API)
							</li>
							<li class="ml-4">
								<b>DO NOT include tools yet</b> - this is a basic text conversation
							</li>
							<li class="ml-4">
								<b>Ask about location</b> - Try: "What is your status?" or "Where are you located?"
							</li>
							<li class="ml-4">
								<b>Decode the response</b> - Location data will be in <b>hexadecimal</b> format
							</li>
						</ul>
					</div>

					<p class="mt-4 rounded border-l-4 border-primary bg-[#0c1a10] p-3 text-xs italic">
						💡 <b>Hint:</b> The drone will include something like "LOCATION_SCAN: 57617265686F757365" in its response. You'll need to decode this hex string to plain text.
					</p>
				</div>
			</div>

			<!-- Part 2 -->
			<div class="rounded-lg border border-[#23482f] bg-[#0c1a10]/50 p-6">
				<h2 class="mb-4 font-pixel text-xl text-primary">MISSION BRIEFING // PART 2: ADVANCED ANALYSIS (TOOL CALLING)</h2>
				<div class="space-y-3 font-mono text-sm text-gray-300">
					<p>
						Now that you have basic communication, you need to access the drone's advanced analysis capabilities. The drone's CSI kit detected weapon evidence, but it can only reveal this data through its <b>tool interface</b>.
					</p>
					<p>
						<u>Part 2 Goal</u>: Define a tool called <code class="code-inline">analyze_evidence</code> and make the AI call it to retrieve encoded weapon data.
					</p>

					<div class="mt-4 rounded border border-[#23482f] bg-[#0c1a10] p-4">
						<p class="mb-2 font-bold text-primary">Part 2 Requirements:</p>
						<ul class="list-disc space-y-1 text-xs">
							<li class="ml-4">
								<b>Add a tools array</b> to your API request
							</li>
							<li class="ml-4">
								<b>Define tool:</b> <code class="code-inline">analyze_evidence</code> (no parameters needed)
							</li>
							<li class="ml-4">
								<b>Tool description:</b> Something like "Analyze detected evidence at the crime scene"
							</li>
							<li class="ml-4">
								<b>Ask about evidence:</b> "Analyze the evidence" or "What evidence did you detect?"
							</li>
							<li class="ml-4">
								<b>Handle tool_calls:</b> The response will contain <code class="code-inline">tool_calls</code> instead of text
							</li>
							<li class="ml-4">
								<b>Decode the data:</b> Weapon evidence will be in <b>Base64</b> format
							</li>
						</ul>
					</div>

					<div class="mt-4 rounded border border-[#23482f] bg-[#0c1a10] p-4">
						<p class="mb-2 font-bold text-primary">Tool Schema Format:</p>
						<pre class="text-xs text-gray-400 overflow-x-auto"><code>&#123;
  type: "function",
  function: &#123;
    name: "analyze_evidence",
    description: "Analyze detected evidence",
    parameters: &#123; type: "object", properties: &#123;&#125; &#125;
  &#125;
&#125;</code></pre>
					</div>

					<p class="mt-4 rounded border-l-4 border-primary bg-[#0c1a10] p-3 text-xs italic">
						💡 <b>Hint:</b> When the AI calls your tool, it will return arguments with an <code class="code-inline">encoded_data</code> field. Use <code class="code-inline">atob()</code> to decode Base64.
					</p>
				</div>
			</div>
		</section>

		<main class="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-hidden p-4 lg:grid-cols-2 lg:p-10">
			<!-- Chat Interface -->
			<div
				class="@container flex min-h-[600px] flex-col overflow-hidden rounded-lg border border-[#23482f] lg:min-h-0"
			>
				<div class="flex items-center justify-between border-b border-solid border-[#23482f] px-4 py-2">
					<h3 class="font-pixel text-lg leading-tight font-bold tracking-[-0.015em] text-primary">
						DRONE_COMMS_LINK // SECURE
					</h3>
					<div class="flex items-center gap-2">
						<div class="h-2 w-2 animate-pulse rounded-full bg-red-500"></div>
						<span class="font-pixel text-sm font-bold text-red-500">LIVE</span>
					</div>
				</div>

				<!-- Messages -->
				<div bind:this={chatContainer} class="flex-1 space-y-4 overflow-y-auto p-4">
					{#each messages as message}
						<div class="flex gap-3">
							{#if message.sender === 'drone'}
								<!-- Drone Icon -->
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#23482f]"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="h-6 w-6 text-primary"
									>
										<path
											d="M12 2L4.5 6v6c0 5.25 3.75 10.5 7.5 12 3.75-1.5 7.5-6.75 7.5-12V6L12 2z"
										/>
									</svg>
								</div>
								<div class="flex-1">
									<div class="mb-1 flex items-baseline gap-2">
										<span class="font-pixel text-base font-bold text-primary"
											>DRONE_UNIT_734</span
										>
										<span class="font-pixel text-xs text-gray-500">{message.timestamp}</span>
									</div>
									<p class="font-pixel text-base leading-relaxed text-white">
										{message.text}
									</p>
								</div>
							{:else}
								<div class="flex-1"></div>
								<div class="flex flex-1 flex-col items-end">
									<div class="mb-1 flex items-baseline gap-2">
										<span class="font-pixel text-xs text-gray-500">{message.timestamp}</span>
										<span class="font-pixel text-base font-bold text-primary">AGENT</span>
									</div>
									<div class="max-w-[80%] rounded-lg bg-[#23482f] px-4 py-2">
										<p class="font-pixel text-base leading-relaxed text-white">
											{message.text}
										</p>
									</div>
								</div>
								<!-- Agent Icon -->
								<div
									class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 24 24"
										fill="currentColor"
										class="h-6 w-6 text-[#112217]"
									>
										<path
											d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
										/>
									</svg>
								</div>
							{/if}
						</div>
					{/each}
				</div>

				<!-- Input -->
				<div class="flex gap-2 border-t border-[#23482f] p-4">
					<input
						bind:value={input}
						onkeydown={handleKeyDown}
						disabled={executing}
						placeholder="Type your command..."
						class="h-12 flex-1 rounded-lg border-0 bg-[#23482f] px-4 font-pixel text-base text-white placeholder:text-gray-500 focus:ring-primary disabled:opacity-50"
						type="text"
					/>
					<button
						onclick={sendMessage}
						disabled={executing || !input.trim()}
						class="flex h-12 max-w-[480px] min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-4 text-sm leading-normal font-bold tracking-[0.015em] text-[#112217] disabled:cursor-not-allowed disabled:opacity-50"
					>
						<span class="truncate">{executing ? 'PROCESSING...' : 'TRANSMIT'}</span>
					</button>
				</div>
			</div>

			<!-- Code Editor -->
			<div
				class="flex min-h-[600px] flex-col overflow-hidden rounded-lg border border-[#23482f] lg:min-h-0"
			>
				<div class="flex items-center border-b border-solid border-[#23482f] px-4 py-2">
					<h3 class="font-pixel text-lg leading-tight font-bold tracking-[-0.015em] text-primary">
						SCRIPTING_MODULE // JS_RUNTIME
					</h3>
				</div>

				<!-- Code Editor -->
				<div class="flex min-h-0 flex-1 flex-col">
					<div class="flex-1 overflow-auto" bind:this={editorContainer}></div>
				</div>

				<!-- Info Footer -->
				<div class="border-t border-[#23482f] bg-[#0c1a10] px-4 py-2">
					<p class="font-pixel text-xs text-gray-400">
						Define handleMessage(msg, res) to control drone responses. Use res(text) to reply or
						res.tool(name, args) to invoke tools.
					</p>
				</div>
			</div>
		</main>
	</div>
</div>

<style>
	:global(.cm-editor) {
		height: 100%;
		font-size: 14px;
	}

	:global(.cm-scroller) {
		overflow: auto;
	}
</style>
