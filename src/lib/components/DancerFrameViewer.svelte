<script>
	import { userStore } from '$lib/user.svelte.js';
	import { windowManager } from '$lib/window-manager.svelte.js';
	import GifDisplay from './GifDisplay.svelte';

	let { frameDataUrl, timestamp, originalGifUrl } = $props();

	function downloadDancerFrame() {
		const link = document.createElement('a');
		link.download = `dancer-frame-${Date.now()}.png`;
		link.href = frameDataUrl;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function viewOriginalGif() {
		if (originalGifUrl) {
			windowManager.createWindow({
				id: `original-gif-${Date.now()}`,
				title: 'Original GIF',
				width: 400,
				height: 400,
				x: 350 + Math.random() * 100,
				y: 150 + Math.random() * 100,
				content: {
					component: GifDisplay,
					props: {
						gifUrl: originalGifUrl,
						alt: "Original GIF"
					}
				}
			});
		}
	}

	function clearDancerFrame() {
		if (confirm('Are you sure you want to clear the saved dancer frame?')) {
			userStore.clearDancerFrame();
			windowManager.closeWindow('dancer-frame-viewer');
			alert('Dancer frame cleared successfully.');
		}
	}
</script>

<div class="dancer-frame-viewer">
	<div class="header">
		<div class="title">📸 Dancer Frame</div>
		<div class="timestamp">Saved: {timestamp}</div>
	</div>
	<div class="content">
		<img src={frameDataUrl} alt="Saved Dancer Frame" class="frame-image" />
		<div class="controls">
			<button class="btn download-btn" onclick={downloadDancerFrame}>
				💾 Download
			</button>
			<button class="btn view-btn" onclick={viewOriginalGif}>
				🎬 View Original GIF
			</button>
			<button class="btn clear-btn" onclick={clearDancerFrame}>
				🗑️ Clear
			</button>
		</div>
	</div>
</div>

<style>
	.dancer-frame-viewer {
		background: white;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.header {
		padding: 8px;
		border-bottom: 1px solid #ccc;
		background: #f0f0f0;
		font-size: 11px;
	}

	.title {
		font-weight: bold;
		margin-bottom: 4px;
	}

	.timestamp {
		color: #666;
	}

	.content {
		flex: 1;
		padding: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.frame-image {
		max-width: 100%;
		max-height: 70%;
		object-fit: contain;
		border: 1px solid #ccc;
		margin-bottom: 12px;
	}

	.controls {
		display: flex;
		gap: 8px;
	}

	.btn {
		padding: 6px 12px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 10px;
		cursor: pointer;
		color: black;
		white-space: nowrap;
	}

	.btn:hover {
		background: #d4d0c8;
	}

	.btn:active {
		border: 1px inset #c0c0c0;
	}

	.clear-btn {
		background: #ffcccc;
		border-color: #ddaaaa;
	}

	.clear-btn:hover {
		background: #ffaaaa;
	}
</style>