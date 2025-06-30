<script>
	import { fetchUrl } from '$lib';
	import GifDisplay from '$lib/components/GifDisplay.svelte';
	import ImageDisplay from '$lib/components/ImageDisplay.svelte';
	import WindowManager from '$lib/components/WindowManager.svelte';
	import { userStore } from '$lib/user.svelte.js';
	import { websocketClient } from '$lib/websocket-client';
	import { windowManager } from '$lib/window-manager.svelte.js';
	import NotepadController from '$lib/windows/notepad/NotepadController.svelte';
	import CalculatorController from '$lib/windows/calculator/CalculatorController.svelte';
	import CameraController from '$lib/windows/camera/CameraController.svelte';
	import SpeechTranscriberController from '$lib/windows/speech-transcriber/SpeechTranscriberController.svelte';
	import CincoIdentityGeneratorController from '$lib/windows/cinco-identity-generator/CincoIdentityGeneratorController.svelte';
	import DancerFrameViewerController from '$lib/windows/dancer-frame-viewer/DancerFrameViewerController.svelte';
	import FluxImageGeneratorController from '$lib/windows/flux-image-generator/FluxImageGeneratorController.svelte';
	import EditedImagesViewerController from '$lib/windows/edited-images-viewer/EditedImagesViewerController.svelte';
	import AllImagesGalleryController from '$lib/windows/all-images-gallery/AllImagesGalleryController.svelte';
	import GeneratedGifsViewerController from '$lib/windows/generated-gifs-viewer/GeneratedGifsViewerController.svelte';
	import AboutController from '$lib/windows/about/AboutController.svelte';
	import TaskManagerController from '$lib/windows/task-manager/TaskManagerController.svelte';
	import GoodMorningPaulController from '$lib/windows/good-morning-paul/GoodMorningPaulController.svelte';
	import { onMount } from 'svelte';

	let isLoading = $state(false);
	let loadingStage = $state('');
	let progress = $state(0);

	let textFeedback = $state('');

	let websocketStatus = $state('disconnected');
	let websocketClientId = $state('');
	let currentGenerationWindowId = $state(null);
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

				// Create loading window
				currentGenerationWindowId = `generation-${Date.now()}`;
				windowManager.createWindow({
					id: currentGenerationWindowId,
					title: 'Generating...',
					width: 400,
					height: 300,
					x: 200 + Math.random() * 100,
					y: 150 + Math.random() * 100,
					content: `
						<div style="padding: 20px; text-align: center; background: white; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
							<div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
							<div style="font-size: 14px; font-weight: bold; margin-bottom: 10px;">Finding your dancer...</div>
							<div id="loading-stage" style="font-size: 12px; color: #666; margin-bottom: 20px;">Starting generation...</div>
							<div style="width: 200px; height: 10px; background: #e0e0e0; border: 1px inset #c0c0c0;">
								<div id="progress-bar" style="width: 0%; height: 100%; background: #0080ff; transition: width 0.3s;"></div>
							</div>
						</div>
					`
				});
				break;
			case 'executing':
				console.log('Currently executing node:', message.data);
				loadingStage = 'Rubbing dancer...';
				progress = 25;

				// Update loading window
				if (currentGenerationWindowId) {
					const loadingStageEl = document.getElementById('loading-stage');
					const progressBarEl = document.getElementById('progress-bar');
					if (loadingStageEl) loadingStageEl.textContent = 'Processing image...';
					if (progressBarEl) progressBarEl.style.width = '25%';
				}
				break;
			case 'progress':
				console.log('Progress:', message.data);
				if (message.data.value && message.data.max) {
					progress = Math.round((message.data.value / message.data.max) * 100);
					loadingStage = `Generating... ${progress}%`;

					// Update loading window
					if (currentGenerationWindowId) {
						const loadingStageEl = document.getElementById('loading-stage');
						const progressBarEl = document.getElementById('progress-bar');
						if (loadingStageEl) loadingStageEl.textContent = `Generating... ${progress}%`;
						if (progressBarEl) progressBarEl.style.width = `${progress}%`;
					}
				}
				break;
			case 'executed':
				console.log('Node executed:', message.data);
				loadingStage = 'Finalizing...';
				progress = 90;

				// Update loading window
				if (currentGenerationWindowId) {
					const loadingStageEl = document.getElementById('loading-stage');
					const progressBarEl = document.getElementById('progress-bar');
					if (loadingStageEl) loadingStageEl.textContent = 'Finalizing...';
					if (progressBarEl) progressBarEl.style.width = '90%';
				}

				const output = message.data.output;
				if (output.gifs) {
					const gifs = output.gifs;
					const filename = gifs[0].filename;
					const subfolder = gifs[0].subfolder;
					const type = gifs[0].type;
					const url = `${fetchUrl}/api/view?filename=${filename}&type=${type}&subfolder=${subfolder}`;

					// Replace loading window content with the GIF FIRST
					if (currentGenerationWindowId) {
						windowManager.updateWindowContent(currentGenerationWindowId, {
							height: 400,
							title: `Here you go paul`,
							content: {
								component: GifDisplay,
								props: {
									gifUrl: url,
									alt: 'Generated GIF'
								}
							}
						});
					}

					// Save the generated GIF to the user store
					const gifTitle = `Generated GIF - ${filename}`;
					const gifId = userStore.addGeneratedGif(url, gifTitle, '', 'generated');
					console.log('Generated GIF saved to user store:', gifId);

					// Extract and save first frame in the background (non-blocking)
					extractFirstFrame(url)
						.then(async (firstFrameBlob) => {
							await userStore.setDancerFrame(firstFrameBlob, url);
							console.log('First frame saved to user store');
						})
						.catch((error) => {
							console.error('Failed to extract and save first frame:', error);
						});

					// Still set testImg for any other usage
					if (testImg) {
						testImg.src = url;
					}
				} else if (output.images) {
					const images = output.images;
					const filename = images[0].filename;
					const subfolder = images[0].subfolder;
					const type = images[0].type;
					const url = `${fetchUrl}/api/view?filename=${filename}&type=${type}&subfolder=${subfolder}`;

					// Replace loading window content with the generated image
					if (currentGenerationWindowId) {
						windowManager.updateWindowContent(currentGenerationWindowId, {
							height: 600,
							title: `Generated Image - ${filename}`,
							content: {
								component: ImageDisplay,
								props: {
									imageUrl: url,
									alt: 'Generated Image'
								}
							}
						});
					}

					// Save the edited image to the user store (for Flux-generated images)
					userStore
						.addEditedImage(url, `Generated image: ${filename}`)
						.then((imageId) => {
							console.log('Edited image saved to user store:', imageId);
						})
						.catch((error) => {
							console.error('Failed to save edited image:', error);
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
				currentGenerationWindowId = null; // Reset for next generation
				// Refresh gallery after successful generation
				// galleryStore.loadHistory();
				break;
			case 'execution_error':
				console.error('Execution failed:', message.data);
				alert(message.data.message || message.data.exception_message);
				isLoading = false;
				loadingStage = 'Generation failed';
				progress = 0;

				// Close loading window on error
				if (currentGenerationWindowId) {
					windowManager.closeWindow(currentGenerationWindowId);
					currentGenerationWindowId = null;
				}
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

	async function extractFirstFrame(gifUrl) {
		try {
			// Create a canvas to draw the first frame
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');

			// Create an image element to load the GIF
			const img = new Image();
			img.crossOrigin = 'anonymous';

			return new Promise((resolve, reject) => {
				img.onload = () => {
					try {
						// Set canvas size to match the image
						canvas.width = img.naturalWidth;
						canvas.height = img.naturalHeight;

						// Draw the first frame (this will be the first frame of the GIF)
						ctx.drawImage(img, 0, 0);

						// Convert to blob
						canvas.toBlob((blob) => {
							if (blob) {
								console.log('First frame extracted successfully');
								resolve(blob);
							} else {
								reject(new Error('Failed to create blob from first frame'));
							}
						}, 'image/png');
					} catch (error) {
						reject(error);
					}
				};

				img.onerror = () => {
					reject(new Error('Failed to load GIF image'));
				};

				img.src = gifUrl;
			});
		} catch (error) {
			console.error('Error extracting first frame:', error);
			throw error;
		}
	}

	onMount(() => {
		// Register all window creators for persistence
		// All window creators are now registered in their respective controllers

		// Load saved window state
		windowManager.loadWindowState();

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
	// function openNotepad() {
	// 	windowManager.createWindow({
	// 		id: 'notepad',
	// 		title: 'Untitled - Notepad',
	// 		width: 500,
	// 		height: 400,
	// 		x: 150,
	// 		y: 100,
	// 		content: `
	// 			<div style="background: white; padding: 8px; height: 100%; border: 1px inset #c0c0c0;">
	// 				<textarea
	// 					style="width: 100%; height: 100%; border: none; outline: none; font-family: 'Courier New', monospace; font-size: 12px; resize: none;"
	// 					placeholder="Type your text here..."
	// 				></textarea>
	// 			</div>
	// 		`
	// 	});
	// }






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








	function clearWindowState() {
		if (confirm('Clear all saved window positions and close all windows?')) {
			// Close all windows first
			const windowsToClose = [...windowManager.windows];
			windowsToClose.forEach((window) => {
				windowManager.closeWindow(window.id);
			});
			// Clear the saved state
			windowManager.clearWindowState();
		}
	}
	let testImg = $state();
</script>

<div class="desktop">
	<div class="desktop-icons">
		{#snippet desktopIcon(/** @type {{onClick:() => void, icon:string, label:string }} */ p)}
			<div class="icon" onclick={p.onClick}>
				<div class="icon-image">{p.icon}</div>
				<div class="icon-label">{p.label}</div>
			</div>
		{/snippet}

		{@render desktopIcon({
			onClick: NotepadController.openNotepad,
			icon: '📝',
			label: 'Notepad'
		})}

		{@render desktopIcon({
			onClick: SpeechTranscriberController.openSpeechTranscriber,
			icon: '🎤',
			label: 'Speech Transcriber'
		})}

		{@render desktopIcon({
			onClick: CameraController.openCamera,
			icon: '📹',
			label: 'Camera'
		})}

		{@render desktopIcon({
			onClick: () => danceWindow(1),
			icon: '🕺',
			label: 'Dance'
		})}

		{@render desktopIcon({
			onClick: CincoIdentityGeneratorController.openCincoIdentityGenerator,
			icon: '👤',
			label: 'Cinco Identity Generator'
		})}

		{@render desktopIcon({
			onClick: DancerFrameViewerController.openDancerFrameViewer,
			icon: '🖼️',
			label: 'Dancer Frame'
		})}

		{@render desktopIcon({
			onClick: FluxImageGeneratorController.openFluxImageGenerator,
			icon: '🎨',
			label: 'Flux Generator'
		})}

		{@render desktopIcon({
			onClick: EditedImagesViewerController.openEditedImagesViewer,
			icon: '🖼️',
			label: 'Edited Images'
		})}

		{@render desktopIcon({
			onClick: AllImagesGalleryController.openAllImagesGallery,
			icon: '📁',
			label: 'All Images'
		})}

		{@render desktopIcon({
			onClick: GeneratedGifsViewerController.openGeneratedGifsViewer,
			icon: '🎬',
			label: 'Generated GIFs'
		})}

		{@render desktopIcon({
			onClick: CalculatorController.openCalculator,
			icon: '🧮',
			label: 'Calculator'
		})}

		{@render desktopIcon({
			onClick: AboutController.openAbout,
			icon: 'ℹ️',
			label: 'About'
		})}

		{@render desktopIcon({
			onClick: TaskManagerController.openTaskbar,
			icon: '📋',
			label: 'Task Manager'
		})}

		{@render desktopIcon({
			onClick: clearWindowState,
			icon: '🔄',
			label: 'Reset Windows'
		})}
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
			<span
				class="status-icon"
				class:connected={websocketStatus === 'connected'}
				class:connecting={websocketStatus === 'connecting'}
				class:disconnected={websocketStatus === 'disconnected'}
				class:error={websocketStatus === 'error'}
			>
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
				<button class="reconnect-btn" onclick={retryConnection}> 🔄 Retry </button>
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
		height: 90%;
		flex-wrap: wrap;
	}

	.icon {
		width: 72px;
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
		/* word-wrap: ; */
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
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0.3;
		}
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
