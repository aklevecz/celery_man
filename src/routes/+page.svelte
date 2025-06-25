<script>
	import { fetchUrl } from '$lib';
	import { websocketClient } from '$lib/websocket-client';
	import { queuePrompt } from '$lib/comfy-api';
	import Calculator from '$lib/components/Calculator.svelte';
	import Camera from '$lib/components/Camera.svelte';
	import CincoIdentityGenerator from '$lib/components/CincoIdentityGenerator.svelte';
	import GoodMorningPaul from '$lib/components/GoodMorningPaul.svelte';
	import SpeechTranscriber from '$lib/components/SpeechTranscriber.svelte';
	import WindowManager from '$lib/components/WindowManager.svelte';
	import { celeryMan } from '$lib/prompts';
	import { windowManager } from '$lib/window-manager.svelte.js';
	import { onMount } from 'svelte';

	let backgroundImage = $state(null);
	let backgroundPreview = $state('');
	let isLoading = $state(false);
	let loadingStage = $state('');
	let progress = $state(0);

	let imagePreviews = $state([]);

	let textFeedback = $state('');

	let promptType = $state('background');
	let websocketStatus = $state('disconnected');
	let websocketClientId = $state('');
	/** @param {*} message */
	function handleWebSocketMessage(message) {
		switch (message.type) {
			case 'status':
				console.log('Status event:', message.data);
				break;
			case 'execution_start':
				console.log('Execution started:', message.data);
				isLoading = true;
				loadingStage = 'Starting generation...';
				progress = 0;
				break;
			case 'executing':
				console.log('Currently executing node:', message.data);
				loadingStage = 'Processing image...';
				progress = 25;
				break;
			case 'progress':
				console.log('Progress:', message.data);
				if (message.data.value && message.data.max) {
					progress = Math.round((message.data.value / message.data.max) * 100);
					loadingStage = `Generating... ${progress}%`;
				}
				break;
			case 'executed':
				console.log('Node executed:', message.data);
				loadingStage = 'Finalizing...';
				progress = 90;
				const output = message.data.output;
				if (output.gifs) {
					const gifs = output.gifs;
					const filename = gifs[0].filename;
					const subfolder = gifs[0].subfolder;
					const type = gifs[0].type;
					const url = `${fetchUrl}/api/view?filename=${filename}&type=${type}&subfolder=${subfolder}`;
					
					// Open a window to display the GIF
					windowManager.createWindow({
						id: `gif-${Date.now()}`, // Unique ID for each GIF
						title: `Generated GIF - ${filename}`,
						width: 400,
						height: 400,
						x: 100 + Math.random() * 200, // Random position
						y: 100 + Math.random() * 200,
						content: `
							<div style="padding: 8px; text-align: center; background: white; height: 100%;">
								<img src="${url}" alt="Generated GIF" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
							</div>
						`
					});
					
					// Still set testImg for any other usage
					if (testImg) {
						testImg.src = url;
					}
				}
				break;
			case 'execution_success':
				console.log('Execution completed successfully');
				isLoading = false;
				loadingStage = '';
				progress = 100;
				// Refresh gallery after successful generation
				// galleryStore.loadHistory();
				break;
			case 'execution_error':
				console.error('Execution failed:', message.data);
				alert(message.data.message || message.data.exception_message);
				isLoading = false;
				loadingStage = 'Generation failed';
				progress = 0;
				break;
			case 'text':
				textFeedback = message.data;
				break;
		}
	}

	function updateWebSocketStatus() {
		websocketStatus = websocketClient.getConnectionStatus();
		websocketClientId = websocketClient.getClientId() || '';
	}

	function retryConnection() {
		websocketClient.disconnect();
		setTimeout(() => {
			websocketClient.connect();
		}, 100);
	}

	onMount(() => {
		websocketClient.connect();
		websocketClient.setMessageHandler(handleWebSocketMessage);
		
		// Update status initially
		updateWebSocketStatus();
		
		// Poll status every 500ms for reactive updates
		const statusInterval = setInterval(updateWebSocketStatus, 500);
		
		return () => {
			clearInterval(statusInterval);
		};
	});
	function openNotepad() {
		windowManager.createWindow({
			id: 'notepad',
			title: 'Untitled - Notepad',
			width: 500,
			height: 400,
			x: 150,
			y: 100,
			content: `
				<div style="background: white; padding: 8px; height: 100%; border: 1px inset #c0c0c0;">
					<textarea 
						style="width: 100%; height: 100%; border: none; outline: none; font-family: 'Courier New', monospace; font-size: 12px; resize: none;"
						placeholder="Type your text here..."
					></textarea>
				</div>
			`
		});
	}

	function openCalculator() {
		windowManager.createWindow({
			id: 'calculator',
			title: 'Calculator',
			width: 200,
			height: 250,
			x: 200,
			y: 150,
			content: {
				component: Calculator,
				props: {}
			}
		});
	}

	function openAbout() {
		windowManager.createWindow({
			id: 'about',
			title: 'About Windows 95',
			width: 350,
			height: 200,
			x: 250,
			y: 200,
			content: `
				<div style="background: white; padding: 12px; display: flex; align-items: center; gap: 12px;">
					<div style="font-size: 48px;">🖥️</div>
					<div>
						<h3 style="margin: 0 0 8px 0; font-size: 14px;">Windows 95 Experience</h3>
						<p style="margin: 0; font-size: 11px; color: #666;">A nostalgic recreation of the classic Windows 95 interface.</p>
						<p style="margin: 8px 0 0 0; font-size: 11px; color: #666;">Built with Svelte and love for retro computing.</p>
					</div>
				</div>
			`
		});
	}

	function openTaskbar() {
		windowManager.createWindow({
			id: 'taskbar-window',
			title: 'Window Manager',
			width: 300,
			height: 200,
			x: 300,
			y: 250,
			content: `
				<div style="background: white; padding: 8px;">
					<h4 style="margin: 0 0 8px 0;">Open Windows:</h4>
					<div id="window-list" style="font-size: 11px;"></div>
				</div>
			`
		});
	}

	function openCincoIdentityGenerator() {
		windowManager.createWindow({
			id: 'cinco-identity-generator',
			title: 'Cinco Identity Generator',
			width: 500,
			height: 360,
			x: 300,
			y: 250,
			content: {
				component: CincoIdentityGenerator,
				props: {}
			}
		});
	}

	function goodMorningPaul() {
		windowManager.createWindow({
			id: 'good-morning-paul',
			title: `Paul's computer`,
			width: 400,
			height: 300,
			x: 100,
			y: 550,
			content: {
				component: GoodMorningPaul,
				props: {}
			}
		});
	}

	/** @param {number} n */
	function danceWindow(n) {
		windowManager.createWindow({
			id: 'dance-window-' + n,
			title: `Paul's computer`,
			width: 400,
			height: 300,
			x: 100,
			y: 550,
			content: `
            <video src="/celeryman_dance_1.mp4" autoplay loop></video>`
		});
	}

	function openCamera() {
		windowManager.createWindow({
			id: 'camera',
			title: 'Camera',
			width: 500,
			height: 400,
			x: 200,
			y: 100,
			content: {
				component: Camera,
				props: {}
			}
		});
	}

	function openSpeechTranscriber() {
		windowManager.createWindow({
			id: 'speech-transcriber',
			title: 'Speech Transcriber',
			width: 450,
			height: 500,
			x: 250,
			y: 50,
			content: {
				component: SpeechTranscriber,
				props: {}
			}
		});
	}
	let testImg = $state();
</script>

<div class="desktop">
	<div class="desktop-icons">
		<div class="icon" onclick={openSpeechTranscriber}>
			<div class="icon-image">🎤</div>
			<div class="icon-label">Speech Transcriber</div>
		</div>
		<div class="icon" onclick={openCamera}>
			<div class="icon-image">📹</div>
			<div class="icon-label">Camera</div>
		</div>
		<div class="icon" onclick={() => danceWindow(1)}>
			<div class="icon-image">🕺</div>
			<div class="icon-label">Dance</div>
		</div>
		<div class="icon" onclick={goodMorningPaul}>
			<div class="icon-image">👋</div>
			<div class="icon-label">Good Morning Paul</div>
		</div>

		<div class="icon" onclick={openCincoIdentityGenerator}>
			<div class="icon-image">👤</div>
			<div class="icon-label">Cinco Identity Generator</div>
		</div>

		<div class="icon" onclick={openNotepad}>
			<div class="icon-image">📝</div>
			<div class="icon-label">Notepad</div>
		</div>

		<div class="icon" onclick={openCalculator}>
			<div class="icon-image">🧮</div>
			<div class="icon-label">Calculator</div>
		</div>

		<div class="icon" onclick={openAbout}>
			<div class="icon-image">ℹ️</div>
			<div class="icon-label">About</div>
		</div>

		<div class="icon" onclick={openTaskbar}>
			<div class="icon-image">📋</div>
			<div class="icon-label">Task Manager</div>
		</div>
	</div>

	<div class="taskbar">
		<button class="start-button">
			<span class="start-logo">🪟</span>
			Start
		</button>

		<div class="taskbar-buttons">
			{#each windowManager.windows as window (window.id)}
				<button
					class="taskbar-button"
					class:active={windowManager.activeWindowId === window.id}
					onclick={() => windowManager.focusWindow(window.id)}
				>
					{window.title}
				</button>
			{/each}
		</div>

		<div class="system-tray">
			<span class="time"
				>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span
			>
		</div>
	</div>

	<!-- WebSocket Status Bar -->
	<div class="websocket-status-bar">
		<div class="status-indicator">
			<span class="status-icon" class:connected={websocketStatus === 'connected'} class:connecting={websocketStatus === 'connecting'} class:disconnected={websocketStatus === 'disconnected'} class:error={websocketStatus === 'error'}>
				{#if websocketStatus === 'connected'}
					🟢
				{:else if websocketStatus === 'connecting'}
					🟡
				{:else if websocketStatus === 'reconnecting'}
					🟠
				{:else if websocketStatus === 'error'}
					🔴
				{:else}
					⚫
				{/if}
			</span>
			<span class="status-text">
				WebSocket: {websocketStatus.toUpperCase()}
			</span>
		</div>
		<div class="status-controls">
			{#if websocketStatus === 'failed' || websocketStatus === 'error' || websocketStatus === 'disconnected'}
				<button class="reconnect-btn" onclick={retryConnection}>
					🔄 Retry
				</button>
			{/if}
			{#if websocketClientId}
				<div class="client-id">
					ID: {websocketClientId.slice(-8)}
				</div>
			{/if}
		</div>
	</div>
</div>

<WindowManager />

<style>
	.desktop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-image:
			radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
		font-family: 'MS Sans Serif', sans-serif;
		overflow: hidden;
	}

	.desktop-icons {
		position: absolute;
		top: 20px;
		left: 20px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.icon {
		width: 64px;
		text-align: center;
		cursor: pointer;
		padding: 4px;
		border: 1px solid transparent;
		color: white;
		text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
	}

	.icon:hover {
		background: rgba(255, 255, 255, 0.1);
		border: 1px dotted white;
	}

	.icon-image {
		font-size: 32px;
		margin-bottom: 4px;
	}

	.icon-label {
		font-size: 11px;
		word-wrap: break-word;
		line-height: 1.2;
	}

	.taskbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 28px;
		background: #c0c0c0;
		border-top: 1px solid #dfdfdf;
		display: flex;
		align-items: center;
		padding: 2px;
		box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.2);
	}

	.start-button {
		height: 24px;
		padding: 0 8px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 11px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.start-button:active {
		border: 1px inset #c0c0c0;
	}

	.start-logo {
		font-size: 14px;
	}

	.taskbar-buttons {
		flex: 1;
		display: flex;
		gap: 2px;
		margin-left: 4px;
	}

	.taskbar-button {
		height: 22px;
		padding: 0 8px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 11px;
		cursor: pointer;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.taskbar-button.active {
		border: 1px inset #c0c0c0;
		background: #a0a0a0;
	}

	.taskbar-button:hover:not(.active) {
		background: #d4d0c8;
	}

	.system-tray {
		height: 24px;
		padding: 0 8px;
		border: 1px inset #c0c0c0;
		background: #c0c0c0;
		display: flex;
		align-items: center;
		font-size: 11px;
		min-width: 60px;
	}

	.time {
		font-family: 'Courier New', monospace;
	}

	.websocket-status-bar {
		position: fixed;
		bottom: 30px; /* Above the taskbar */
		left: 0;
		right: 0;
		height: 20px;
		background: #d4d0c8;
		border-top: 1px solid #ffffff;
		border-bottom: 1px solid #808080;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8px;
		font-size: 10px;
		z-index: 999; /* Below windows but above desktop */
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.status-icon {
		font-size: 8px;
		animation: none;
	}

	.status-icon.connecting {
		animation: pulse 1.5s infinite;
	}

	.status-icon.error {
		animation: blink 1s infinite;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.5; }
	}

	@keyframes blink {
		0%, 50% { opacity: 1; }
		51%, 100% { opacity: 0.3; }
	}

	.status-text {
		font-weight: bold;
		color: #333;
		text-transform: uppercase;
		font-size: 9px;
	}

	.status-controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.reconnect-btn {
		padding: 2px 6px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 8px;
		cursor: pointer;
		color: black;
		white-space: nowrap;
	}

	.reconnect-btn:hover {
		background: #d4d0c8;
	}

	.reconnect-btn:active {
		border: 1px inset #c0c0c0;
	}

	.client-id {
		color: #666;
		font-family: 'Courier New', monospace;
		font-size: 8px;
	}
</style>
