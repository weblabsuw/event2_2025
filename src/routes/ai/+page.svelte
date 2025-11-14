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

	const initialCode = `// Issue commands to Drone Unit 734
async function handleMessage(msg, res) {
  // msg: the user's message
  // res: function to call with your response
  //      res(text) - send a text response
  //      res.tool(name, args) - display a tool call

  // TODO: Define your tools
  const tools = [
    {
      type: "function",
      function: {
        name: "scan_environment",
        description: "Scan the drone's surroundings",
        parameters: { type: "object", properties: {} }
      }
    }
  ];

  // TODO: Make API call to /api/v1/ai/chat
  const response = await fetch("/api/v1/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "user", content: msg }],
      tools: tools
    })
  });

  const data = await response.json();

  // TODO: Handle the response
  // Check if there are tool calls: data.choices[0].message.tool_calls
  // Or just text: data.choices[0].message.content

  if (data.choices[0].message.content) {
    res(data.choices[0].message.content);
  }

  // Handle tool calls if present
  if (data.choices[0].message.tool_calls) {
    const toolCall = data.choices[0].message.tool_calls[0];
    res.tool(toolCall.function.name, JSON.parse(toolCall.function.arguments));
  }
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
			<div class="rounded-lg border border-[#23482f] bg-[#0c1a10]/50 p-6">
				<h2 class="mb-4 font-pixel text-xl text-primary">MISSION BRIEFING // AUTONOMOUS WITNESS</h2>
				<div class="space-y-3 font-mono text-sm text-gray-300">
					<p>
						Agent Web was traveling with an autonomous reconnaissance drone (<b>DRONE_UNIT_734</b>) that remained intact at the crime scene. The drone's onboard AI system has advanced environmental sensors and a CSI analysis kit that detected critical evidence.
					</p>
					<p>
						Due to <b>bandwidth encryption protocols</b>, all sensor data is stored in encoded formats. The drone will not reveal information directly — you must communicate through its <b>AI interface</b> and use its built-in tools to extract the encoded data.
					</p>
					<p>
						<u>Your task</u>: Establish a connection with DRONE_UNIT_734's AI system and extract information about the crime scene location and evidence detected.
					</p>

					<div class="mt-4 rounded border border-[#23482f] bg-[#0c1a10] p-4">
						<p class="mb-2 font-bold text-primary">Required Tools (you must define):</p>
						<ul class="list-disc space-y-1 text-xs">
							<li class="ml-4">
								<code class="code-inline">scan_environment</code> - Triggers drone's environmental scan (returns location data)
							</li>
							<li class="ml-4">
								<code class="code-inline">analyze_evidence</code> - Analyzes detected evidence samples (may require parameters)
							</li>
							<li class="ml-4">
								<code class="code-inline">decode_sensor_data</code> - Decodes encrypted sensor readings (optional but helpful)
							</li>
						</ul>
					</div>

					<div class="mt-4 rounded border border-[#23482f] bg-[#0c1a10] p-4">
						<p class="mb-2 font-bold text-primary">Technical Details:</p>
						<ul class="list-disc space-y-1 text-xs">
							<li class="ml-4">
								<b>API Endpoint:</b> <code class="code-inline">POST /api/v1/ai/chat</code>
							</li>
							<li class="ml-4">
								<b>Request Format:</b> OpenAI-compatible (messages array + tools array)
							</li>
							<li class="ml-4">
								<b>Encoding Schemes:</b>
								<ul class="ml-6 mt-1 list-disc space-y-0.5">
									<li>Location data: Hexadecimal encoding</li>
									<li>Sensor data: Base64 encoding</li>
								</ul>
							</li>
							<li class="ml-4">
								<b>Response Type:</b> AI will return <code class="code-inline">tool_calls</code> - you must execute these functions client-side and decode the results
							</li>
						</ul>
					</div>

					<p class="mt-4 rounded border-l-4 border-primary bg-[#0c1a10] p-3 text-xs italic">
						💡 <b>Tip:</b> The drone AI will not give you answers directly. Ask it questions like "What do you see?" or "Scan your surroundings" to trigger tool usage. Define the tools it needs, then decode the hex/base64 data it returns.
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
