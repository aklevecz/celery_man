<script>
	import { onMount, onDestroy } from 'svelte';
	import pkg from '@mediapipe/face_detection';
	const { FaceDetection } = pkg;
	import pkg2 from '@mediapipe/camera_utils';
	const { Camera } = pkg2;
	import { queuePrompt } from '$lib/comfy-api';
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
	let lastCapturedBlob = $state(null);
	let lastCapturedType = $state(''); // 'face' or 'screenshot'
	let lastCapturedTimestamp = $state('');

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

	async function sendFaceToPrompt() {
		if (detectedFaces.length === 0 || !videoElement) {
			alert('No face detected. Please enable face detection first.');
			return;
		}

		try {
			const face = detectedFaces[0]; // Use first detected face
			console.log('Face coordinates:', face);

			// Add some padding around the face (10% on each side)
			const padding = 0.1;
			const paddedX = Math.max(0, face.x - face.width * padding);
			const paddedY = Math.max(0, face.y - face.height * padding);
			const paddedWidth = Math.min(videoElement.videoWidth - paddedX, face.width * (1 + 2 * padding));
			const paddedHeight = Math.min(videoElement.videoHeight - paddedY, face.height * (1 + 2 * padding));

			console.log('Padded face area:', { 
				x: paddedX, 
				y: paddedY, 
				width: paddedWidth, 
				height: paddedHeight 
			});

			// Create a canvas for the cropped face (ONLY the face area)
			const croppedCanvas = document.createElement('canvas');
			const croppedCtx = croppedCanvas.getContext('2d');

			// Set cropped canvas size to ONLY the face area
			croppedCanvas.width = paddedWidth;
			croppedCanvas.height = paddedHeight;

			console.log('Cropped canvas size:', croppedCanvas.width, 'x', croppedCanvas.height);

			// Draw ONLY the face area directly from the video element
			croppedCtx.drawImage(
				videoElement,
				paddedX, paddedY, paddedWidth, paddedHeight,  // Source area (face region)
				0, 0, paddedWidth, paddedHeight               // Destination (full cropped canvas)
			);

			// Convert canvas to blob
			const blob = await new Promise(resolve => {
				croppedCanvas.toBlob(resolve, 'image/png');
			});

			console.log('Blob size:', blob.size, 'bytes');

			// Cache the captured face
			lastCapturedBlob = blob;
			lastCapturedType = 'face';
			lastCapturedTimestamp = new Date().toLocaleTimeString();

			// Send to prompt system
			await queuePrompt({ 
				imageBlob: blob,
				prompt: 'Cropped face from camera'
			});

			console.log('Cropped face sent to prompt successfully');

		} catch (error) {
			console.error('Error sending face to prompt:', error);
			alert('Failed to send face to prompt: ' + error.message);
		}
	}

	async function takeScreenshot() {
		if (!videoElement) {
			alert('No video feed available');
			return;
		}

		try {
			// Create a canvas to capture the current video frame
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			canvas.width = videoElement.videoWidth;
			canvas.height = videoElement.videoHeight;

			// Draw current video frame
			ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

			// Convert canvas to blob
			const blob = await new Promise(resolve => {
				canvas.toBlob(resolve, 'image/png');
			});

			// Cache the captured screenshot
			lastCapturedBlob = blob;
			lastCapturedType = 'screenshot';
			lastCapturedTimestamp = new Date().toLocaleTimeString();

			// Send to prompt system
			await queuePrompt({ 
				imageBlob: blob,
				prompt: 'Screenshot from camera'
			});

			console.log('Screenshot sent to prompt successfully');

		} catch (error) {
			console.error('Error sending screenshot to prompt:', error);
			alert('Failed to send image to prompt: ' + error.message);
		}
	}

	async function resendLastImage() {
		if (!lastCapturedBlob) {
			alert('No cached image available. Take a photo or capture a face first.');
			return;
		}

		try {
			const promptText = lastCapturedType === 'face' ? 'Resending cached face' : 'Resending cached screenshot';
			
			await queuePrompt({ 
				imageBlob: lastCapturedBlob,
				prompt: promptText
			});

			console.log(`Resent cached ${lastCapturedType} successfully`);

		} catch (error) {
			console.error('Error resending cached image:', error);
			alert('Failed to resend cached image: ' + error.message);
		}
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
				<button class="btn" onclick={takeScreenshot}>📸 Send Image</button>
				<button class="btn" onclick={toggleFaceDetection} disabled={!modelsLoaded}>
					{faceDetectionEnabled ? 'Hide Faces' : 'Detect Faces'}
				</button>
				{#if detectedFaces.length > 0}
					<button class="btn send-face-btn" onclick={sendFaceToPrompt}>🎯 Send Face</button>
					<button class="btn" onclick={cropFace}>💾 Download Face</button>
				{/if}
				{#if lastCapturedBlob}
					<button class="btn resend-btn" onclick={resendLastImage}>🔄 Resend Last</button>
				{/if}
				<button class="btn" onclick={stopCamera}>Stop</button>
			{:else}
				<button class="btn" onclick={startCamera} disabled={isLoading}>
					{isLoading ? 'Starting...' : 'Start'}
				</button>
			{/if}
		</div>
	</div>

	{#if lastCapturedBlob}
		<div class="cache-info">
			<span class="cache-label">📦 Cached:</span>
			<span class="cache-details">
				{lastCapturedType} at {lastCapturedTimestamp}
			</span>
		</div>
	{/if}

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
	
	.send-face-btn {
		background: #ffeeaa !important;
		border-color: #ddcc88 !important;
	}
	
	.send-face-btn:hover:not(:disabled) {
		background: #ffdd88 !important;
	}
	
	.resend-btn {
		background: #eeffaa !important;
		border-color: #ccdd88 !important;
	}
	
	.resend-btn:hover:not(:disabled) {
		background: #ddff88 !important;
	}
	
	.cache-info {
		background: #f0f0f0;
		padding: 4px 8px;
		border-bottom: 1px inset #c0c0c0;
		font-size: 10px;
		display: flex;
		align-items: center;
		gap: 8px;
	}
	
	.cache-label {
		font-weight: bold;
		color: #666;
	}
	
	.cache-details {
		color: #888;
		font-style: italic;
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
