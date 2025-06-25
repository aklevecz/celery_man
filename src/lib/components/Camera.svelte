<script>
	import { onMount, onDestroy } from 'svelte';
	
	let videoElement;
	let stream = null;
	let isActive = $state(false);
	let error = $state('');
	let isLoading = $state(false);
	
	async function startCamera() {
		try {
			isLoading = true;
			error = '';
			
			stream = await navigator.mediaDevices.getUserMedia({ 
				video: { 
					width: { ideal: 640 },
					height: { ideal: 480 }
				}, 
				audio: false 
			});
			console.log(stream)
			console.log(videoElement)
			if (videoElement) {
				videoElement.srcObject = stream;
				isActive = true;
			}
		} catch (err) {
			console.error('Error accessing camera:', err);
			if (err.name === 'NotAllowedError') {
				error = 'Camera access denied. Please allow camera permissions.';
			} else if (err.name === 'NotFoundError') {
				error = 'No camera found on this device.';
			} else {
				error = 'Failed to access camera: ' + err.message;
			}
		} finally {
			isLoading = false;
		}
	}
	
	function stopCamera() {
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
			stream = null;
		}
		if (videoElement) {
			videoElement.srcObject = null;
		}
		isActive = false;
	}
	
	onMount(() => {
		startCamera();
	});
	
	onDestroy(() => {
		stopCamera();
	});
</script>

<div class="camera-container">
	<div class="camera-header">
		<span class="title">📹 Camera Feed</span>
		<div class="controls">
			{#if isActive}
				<button class="btn" onclick={stopCamera}>Stop</button>
			{:else}
				<button class="btn" onclick={startCamera} disabled={isLoading}>
					{isLoading ? 'Starting...' : 'Start'}
				</button>
			{/if}
		</div>
	</div>
	
	<div class="video-area">
		{#if error}
			<div class="error">
				<div class="error-icon">⚠️</div>
				<div class="error-text">{error}</div>
				<button class="btn retry-btn" onclick={startCamera}>Retry</button>
			</div>
		{:else if isLoading}
			<div class="loading">
				<div class="loading-text">Starting camera...</div>
			</div>
		{:else}

		{/if}

					<video 
				bind:this={videoElement}
				autoplay 
				playsinline 
				muted
				class="video-feed"
				class:active={isActive}
			></video>
	</div>
	
	<div class="status-bar">
		<span class="status" class:active={isActive}>
			{isActive ? '🟢 LIVE' : '🔴 OFFLINE'}
		</span>
		<span class="info">
			{isActive ? 'Camera active' : 'Camera stopped'}
		</span>
	</div>
</div>

<style>
	.camera-container {
		background: #c0c0c0;
		height: 100%;
		display: flex;
		flex-direction: column;
	}
	
	.camera-header {
		background: #c0c0c0;
		padding: 8px;
		border-bottom: 1px inset #c0c0c0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	
	.title {
		font-weight: bold;
		font-size: 11px;
	}
	
	.controls {
		display: flex;
		gap: 4px;
	}
	
	.btn {
		padding: 4px 8px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 10px;
		cursor: pointer;
		color: black;
	}
	
	.btn:hover:not(:disabled) {
		background: #d4d0c8;
	}
	
	.btn:active:not(:disabled) {
		border: 1px inset #c0c0c0;
	}
	
	.btn:disabled {
		color: #808080;
		cursor: not-allowed;
	}
	
	.video-area {
		flex: 1;
		background: black;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		border: 1px inset #c0c0c0;
		margin: 4px;
	}
	
	.video-feed {
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 0.3s ease;
	}
	
	.video-feed.active {
		opacity: 1;
	}
	
	.error, .loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		color: white;
		text-align: center;
		padding: 20px;
	}
	
	.error-icon {
		font-size: 32px;
		margin-bottom: 8px;
	}
	
	.error-text {
		font-size: 11px;
		margin-bottom: 12px;
		max-width: 200px;
		line-height: 1.4;
	}
	
	.retry-btn {
		margin-top: 8px;
	}
	
	.loading-text {
		font-size: 11px;
		color: #ccc;
	}
	
	.status-bar {
		background: #c0c0c0;
		padding: 4px 8px;
		border-top: 1px inset #c0c0c0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 10px;
	}
	
	.status {
		font-weight: bold;
	}
	
	.status.active {
		color: #008000;
	}
	
	.info {
		color: #666;
	}
</style>