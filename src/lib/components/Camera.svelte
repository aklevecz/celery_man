<script>
	import { onMount, onDestroy } from 'svelte';
	import pkg from '@mediapipe/face_detection';
	const { FaceDetection } = pkg;
	import pkg2 from '@mediapipe/camera_utils';
	const { Camera } = pkg2;
	let videoElement;
	let canvasElement;
	let stream = null;
	let isActive = $state(false);
	let error = $state('');
	let isLoading = $state(false);
	let faceDetectionEnabled = $state(false);
	let detectedFaces = $state([]);
	let faceDetection = null;
	let camera = null;
	let modelsLoaded = $state(false);

	async function initFaceDetection() {
		try {
			faceDetection = new FaceDetection({
				locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
			});

			faceDetection.setOptions({
				model: 'short', // 'short' for close faces, 'full' for longer range
				minDetectionConfidence: 0.5
			});

			faceDetection.onResults(onResults);
			modelsLoaded = true;
			console.log('MediaPipe face detection initialized');
		} catch (err) {
			console.error('Failed to initialize MediaPipe:', err);
			error = 'Failed to load face detection models';
		}
	}

	function onResults(results) {
		if (!canvasElement || !videoElement) return;

		const canvas = canvasElement;
		const ctx = canvas.getContext('2d');

		canvas.width = videoElement.videoWidth;
		canvas.height = videoElement.videoHeight;

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// Update detected faces
		detectedFaces = [];

		if (results.detections && results.detections.length > 0) {
			for (const detection of results.detections) {
				const bbox = detection.boundingBox;
				const rect = {
					x: bbox.xCenter * canvas.width - (bbox.width * canvas.width) / 2,
					y: bbox.yCenter * canvas.height - (bbox.height * canvas.height) / 2,
					width: bbox.width * canvas.width,
					height: bbox.height * canvas.height
				};
				detectedFaces.push(rect);
				// Draw rectangle
				ctx.strokeStyle = '#00ff00';
				ctx.lineWidth = 2;
				ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);

				// Add confidence score
				ctx.fillStyle = '#00ff00';
				ctx.font = '16px Arial';
				const confidence = detection.V && detection.V[0] ? detection.V[0].ga : 1;
				ctx.fillText(`${Math.round(confidence * 100)}%`, rect.x, rect.y - 5);
			}
		}
	}

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

			if (videoElement) {
				videoElement.srcObject = stream;
				await new Promise((resolve) => {
					videoElement.onloadedmetadata = resolve;
				});
				isActive = true;

				// Initialize MediaPipe camera
				if (modelsLoaded && faceDetection) {
					camera = new Camera(videoElement, {
						onFrame: async () => {
							if (faceDetectionEnabled && faceDetection) {
								await faceDetection.send({ image: videoElement });
							}
						},
						width: 640,
						height: 480
					});
				}
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
		if (camera) {
			camera.stop();
			camera = null;
		}
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
		if (videoElement) {
			videoElement.srcObject = null;
		}
		isActive = false;
		faceDetectionEnabled = false;
		detectedFaces = [];

		// Clear canvas
		if (canvasElement) {
			const ctx = canvasElement.getContext('2d');
			ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
		}
	}

	function toggleFaceDetection() {
		faceDetectionEnabled = !faceDetectionEnabled;

		if (faceDetectionEnabled && isActive && camera && modelsLoaded) {
			camera.start();
		} else {
			if (camera) {
				camera.stop();
			}
			detectedFaces = [];
			// Clear canvas
			if (canvasElement) {
				const ctx = canvasElement.getContext('2d');
				ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
			}
		}
	}

	function cropFace() {
		if (detectedFaces.length === 0 || !videoElement) return;

		// Create a temporary canvas to capture the current video frame
		const tempCanvas = document.createElement('canvas');
		const tempCtx = tempCanvas.getContext('2d');
		tempCanvas.width = videoElement.videoWidth;
		tempCanvas.height = videoElement.videoHeight;

		// Draw current video frame
		tempCtx.drawImage(videoElement, 0, 0, tempCanvas.width, tempCanvas.height);

		const face = detectedFaces[0]; // Use first detected face

		// Create a new canvas for the cropped face
		const croppedCanvas = document.createElement('canvas');
		const croppedCtx = croppedCanvas.getContext('2d');

		// Set cropped canvas size
		croppedCanvas.width = face.width;
		croppedCanvas.height = face.height;

		// Draw the cropped face
		croppedCtx.drawImage(
			tempCanvas,
			face.x,
			face.y,
			face.width,
			face.height,
			0,
			0,
			face.width,
			face.height
		);

		// Convert to data URL and download
		const dataURL = croppedCanvas.toDataURL('image/png');
		const link = document.createElement('a');
		link.download = `face-crop-${Date.now()}.png`;
		link.href = dataURL;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	onMount(async () => {
		await initFaceDetection();
		await startCamera();
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
				<button class="btn" onclick={takeScreenshot}>Send Image</button>
				<button class="btn" onclick={toggleFaceDetection} disabled={!modelsLoaded}>
					{faceDetectionEnabled ? 'Hide Faces' : 'Detect Faces'}
				</button>
				{#if detectedFaces.length > 0}
					<button class="btn" onclick={cropFace}>Crop Face</button>
				{/if}
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
		{:else if isLoading || !modelsLoaded}
			<div class="loading">
				<div class="loading-text">
					{isLoading ? 'Starting camera...' : 'Loading face detection models...'}
				</div>
			</div>
		{/if}

		<div class="video-container">
			<video
				bind:this={videoElement}
				autoplay
				playsinline
				muted
				class="video-feed"
				class:active={isActive}
			></video>

			{#if faceDetectionEnabled}
				<canvas bind:this={canvasElement} class="detection-overlay"></canvas>
			{/if}
		</div>
	</div>

	<div class="status-bar">
		<span class="status" class:active={isActive}>
			{isActive ? '🟢 LIVE' : '🔴 OFFLINE'}
		</span>
		<span class="info">
			{#if faceDetectionEnabled}
				👤 {detectedFaces.length} face(s) detected
			{:else if isActive}
				Camera active {modelsLoaded ? '(Face detection ready)' : '(Loading models...)'}
			{:else}
				Camera stopped
			{/if}
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

	.video-container {
		position: relative;
		width: 100%;
		height: 100%;
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

	.detection-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 10;
	}

	.error,
	.loading {
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
