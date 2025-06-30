<script>
	// I dont understand how the setup is blocking if it has no promises
	import agent from '$lib/agent.svelte';
	import { queuePrompt, queueFluxPrompt } from '$lib/comfy-api';
	import { celeryMan } from '$lib/prompts';
	import { userStore } from '$lib/user.svelte.js';
	import { onDestroy, onMount } from 'svelte';

	/** @type {*} */
	let recognition = null;
	let isListening = $state(false);
	let transcription = $state('');
	let finalTranscript = $state('');
	let interimTranscript = $state('');
	let error = $state('');
	let isSupported = $state(false);
	let isProcessingStop = $state(false);
	let isSetupComplete = $state(false);

	// Check if speech recognition is supported
	onMount(async () => {
		if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
			isSupported = true;
			await setupSpeechRecognition();
			// Auto-start transcription once setup is complete
			if (isSetupComplete && !isListening) {
				startListening();
			}
		} else {
			error = 'Speech recognition not supported in this browser. Try Chrome or Edge.';
		}
	});

	async function setupSpeechRecognition() {
		try {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			recognition = new SpeechRecognition();

			// Configure recognition
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.lang = 'en-US';
			recognition.maxAlternatives = 1;

			recognition.onstart = () => {
				isListening = true;
				error = '';
				console.log('Speech recognition started');
			};

			/** @param {*} event */
			recognition.onresult = (event) => {
				let interim = '';
				let final = '';

				for (let i = event.resultIndex; i < event.results.length; i++) {
					const transcript = event.results[i][0].transcript;

					if (event.results[i].isFinal) {
						final += transcript;
					} else {
						interim += transcript;
					}
				}

				// Update the transcripts
				if (final) {
					finalTranscript += final;
					transcription = finalTranscript;
				}

				interimTranscript = interim;

				// Combine final and interim for display
				const displayText = finalTranscript + (interim ? ' ' + interim : '');
				transcription = displayText;

				// Check for "please" trigger only once
				if (!isProcessingStop && transcription.toLowerCase().includes('please')) {
					// isProcessingStop = true;
					recognition.stop();
					stopListening();
				}
			};

			/** @param {*} event */
			recognition.onerror = (event) => {
				console.error('Speech recognition error:', event.error);
				error = `Recognition error: ${event.error}`;
				isListening = false;
			};

			recognition.onend = () => {
				console.log('Speech recognition ended');
				isListening = false;
			};

			// Mark setup as complete
			isSetupComplete = true;
			console.log('Speech recognition setup complete');
		} catch (setupError) {
			console.error('Error setting up speech recognition:', setupError);
			const message = setupError instanceof Error ? setupError.message : 'Unknown error';
			error = 'Failed to setup speech recognition: ' + message;
		}
	}

	function startListening() {
		if (!recognition || !isSupported) {
			error = 'Speech recognition not available';
			return;
		}

		try {
			finalTranscript = '';
			interimTranscript = '';
			transcription = '';
			error = '';
			isProcessingStop = false; // Reset the flag
			recognition.start();
		} catch (err) {
			console.error('Error starting recognition:', err);
			const message = err instanceof Error ? err.message : 'Unknown error';
			error = 'Failed to start listening: ' + message;
		}
	}

	async function stopListening() {
		console.log('calling stop listening');

		// Prevent multiple calls
		if (isProcessingStop) {
			console.log('Already processing stop, ignoring duplicate call');
			return;
		}

		isProcessingStop = true;

		if (recognition && isListening) {
			recognition.stop();
		}

		const audio = document.getElementById('yes-paul');
		if (audio) {
			// audio.play();
		}
		// function callback(dancer) {
		// 	console.log(`Dancer: ${dancer}`);
		// 	queuePrompt({ workflow: celeryMan, dancer });
		// }
		console.log(`Final transcript: ${transcription}`);
		let { dancer, modelResponse, editPrompt, isEdit } =
			await agent.sendChatMessage(transcription);
		console.log(`Dancer: ${dancer}`);
		if (modelResponse) {
			// Use the browser Speech Synthesis API with Eddy en-US voice
			const speak = () => {
				const utterance = new SpeechSynthesisUtterance(modelResponse);

				// Get available voices and find Eddy en-US
				const voices = speechSynthesis.getVoices();
				const eddyVoice =
					voices.find(
						(voice) => voice.name.toLowerCase().includes('eddy') && voice.lang === 'en-US'
					) || voices.find((voice) => voice.lang === 'en-US'); // Fallback to any en-US voice

				if (eddyVoice) {
					utterance.voice = eddyVoice;
					console.log(`Using voice: ${eddyVoice.name}`);
				}

				utterance.rate = 1.0;
				utterance.pitch = 0.6;
				utterance.volume = 1.0;

				speechSynthesis.speak(utterance);
			};

			// Check if voices are loaded, if not wait for them
			if (speechSynthesis.getVoices().length === 0) {
				speechSynthesis.addEventListener('voiceschanged', speak, { once: true });
			} else {
				speak();
			}
		}

		if (!dancer) {
			dancer = 'celeryman';
		}
		if (dancer) {
			console.log(`Dancer: ${dancer}`);

			if (isEdit && editPrompt) {
				// Handle edit request - use Flux with globally selected image
				console.log(`Edit request: ${editPrompt}`);

				let imageBlob = null;

				// Try to use globally selected image first
				if (userStore.hasGlobalSelection) {
					try {
						imageBlob = await userStore.getGloballySelectedImageBlob();
						const selectedInfo = userStore.getGloballySelectedImageInfo();
						console.log(
							`Using globally selected ${selectedInfo?.type} image for editing:`,
							selectedInfo?.title
						);
					} catch (err) {
						console.error('Error getting globally selected image blob:', err);
					}
				}

				// // Fall back to dancer frame if no global selection
				// if (!imageBlob && userStore.hasDancerFrame) {
				// 	try {
				// 		imageBlob = await userStore.getDancerFrameBlob();
				// 		console.log('Using saved dancer frame for editing (fallback)');
				// 	} catch (error) {
				// 		console.error('Error getting dancer frame blob:', error);
				// 	}
				// }

				// // Last fallback to face if available
				// if (!imageBlob && userStore.hasFace) {
				// 	try {
				// 		imageBlob = await userStore.getFaceBlob();
				// 		console.log('Using saved face for editing (last fallback)');
				// 	} catch (error) {
				// 		console.error('Error getting face blob:', error);
				// 	}
				// }

				if (imageBlob) {
					await queueFluxPrompt({
						prompt: editPrompt,
						imageBlob: imageBlob
					});
				} else {
					console.log('No reference image available for editing');
				}
			} else {
				// Handle regular show request - use celery man workflow
				// Get saved face blob if it exists
				let faceBlob = null;
				if (userStore.hasFace) {
					try {
						faceBlob = await userStore.getFaceBlob();
						console.log('Using saved face blob for generation');
					} catch (err) {
						console.error('Error getting saved face blob:', err);
					}
				}

				queuePrompt({
					workflow: celeryMan,
					dancer,
					imageBlob: faceBlob // Will be null if no saved face
				});
			}
		}
	}

	function clearTranscription() {
		transcription = '';
		finalTranscript = '';
		interimTranscript = '';
		error = '';
	}

	function copyToClipboard() {
		if (transcription) {
			navigator.clipboard.writeText(transcription);
		}
	}

	onDestroy(() => {
		if (isListening) {
			stopListening();
		}
	});
</script>

<div class="transcriber-container">
	<div class="transcriber-header">
		<span class="title">🎤 Live Speech Transcriber</span>
		<div class="status">
			{#if isListening}
				<span class="listening">🎤 LISTENING</span>
			{:else if !isSupported}
				<span class="error">❌ NOT SUPPORTED</span>
			{:else if !isSetupComplete}
				<span class="setting-up">🔄 Setting up...</span>
			{:else}
				<span class="idle">⚪ Ready</span>
			{/if}
		</div>
	</div>

	<div class="controls">
		<button
			class="btn listen-btn"
			onclick={startListening}
			disabled={isListening || !isSupported || !isSetupComplete}
			class:listening={isListening}
		>
			{#if !isSetupComplete}
				🔄 Setting up...
			{:else if isListening}
				🎤 Listening...
			{:else}
				🎤 Start Listening
			{/if}
		</button>

		<button
			class="btn stop-btn"
			onclick={() => {
				isProcessingStop = false; // Allow manual stop
				stopListening();
			}}
			disabled={!isListening}
		>
			⏹️ Stop Listening
		</button>

		<button class="btn clear-btn" onclick={clearTranscription} disabled={isListening}>
			🗑️ Clear
		</button>
		<!-- <button
			class="btn clear-btn"
			onclick={async () => {
				// agent.sendChatMessage('can you show me celery man please?');
				// stopListening()
				// Get saved face blob if it exists
				let faceBlob = null;
				if (userStore.hasFace) {
					try {
						faceBlob = await userStore.getFaceBlob();
						console.log('Using saved face blob for generation');
					} catch (err) {
						console.error('Error getting saved face blob:', err);
					}
				}

				queuePrompt({
					workflow: celeryMan,
					dancer: 'celery_man',
					imageBlob: faceBlob // Will be null if no saved face
				});
			}}
		>
			🗑️ celery man</button
		> -->
	</div>

	{#if error}
		<div class="error-message">
			⚠️ {error}
		</div>
	{/if}

	<div class="transcription-area">
		<div class="transcription-header">
			<span>Live Transcription:</span>
			{#if transcription}
				<button class="btn copy-btn" onclick={copyToClipboard}> 📋 Copy </button>
			{/if}
		</div>
		<div class="transcription-display">
			{#if transcription}
				<span class="transcription-text-display">
					<span class="final-text">{finalTranscript}</span>
					{#if interimTranscript}
						<span class="interim-text">{interimTranscript}</span>
					{/if}
					{#if isListening}
						<span class="cursor">|</span>
					{/if}
				</span>
			{:else}
				<span class="placeholder">
					{isListening
						? 'Start speaking...'
						: 'Click "Start Listening" and speak to see live transcription'}
				</span>
			{/if}
		</div>
	</div>

	<div class="info">
		<small>
			💡 This uses your browser's built-in speech recognition for real-time transcription. Works
			best in Chrome and Edge browsers.
		</small>
	</div>
</div>

<style>
	.transcriber-container {
		background: #c0c0c0;
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 8px;
		gap: 8px;
	}

	.transcriber-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px;
		border: 1px inset #c0c0c0;
		background: #e0e0e0;
	}

	.title {
		font-weight: bold;
		font-size: 12px;
	}

	.status {
		font-size: 11px;
		font-weight: bold;
	}

	.listening {
		color: #ff0000;
		animation: blink 1s infinite;
	}

	.error {
		color: #cc0000;
	}

	.idle {
		color: #666;
	}

	.setting-up {
		color: #0066cc;
		animation: pulse 1.5s infinite;
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

	.controls {
		display: flex;
		gap: 4px;
		flex-wrap: wrap;
	}

	.btn {
		padding: 6px 8px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 10px;
		cursor: pointer;
		color: black;
		white-space: nowrap;
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
		background: #a0a0a0;
	}

	.listen-btn.listening {
		background: #ffcccc;
		animation: pulse 1s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			background: #ffcccc;
		}
		50% {
			background: #ff9999;
		}
	}

	.error-message {
		padding: 8px;
		background: #ffeeee;
		border: 1px solid #ffcccc;
		color: #cc0000;
		font-size: 11px;
		border-radius: 2px;
	}

	.transcription-area {
		flex: 1;
		display: flex;
		flex-direction: column;
		border: 1px inset #c0c0c0;
		background: white;
	}

	.transcription-header {
		padding: 4px 8px;
		background: #e0e0e0;
		border-bottom: 1px solid #ccc;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		font-weight: bold;
	}

	.copy-btn {
		padding: 2px 6px;
		font-size: 9px;
	}

	.transcription-display {
		flex: 1;
		padding: 8px;
		font-size: 12px;
		font-family: 'Courier New', monospace;
		line-height: 1.4;
		background: white;
		overflow-y: auto;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.transcription-text-display {
		color: #000;
	}

	.final-text {
		color: #000;
		font-weight: normal;
	}

	.interim-text {
		color: #666;
		font-style: italic;
		opacity: 0.8;
	}

	.placeholder {
		color: #999;
		font-style: italic;
	}

	.cursor {
		opacity: 0;
		animation: cursor-blink 1s infinite;
		color: #000;
		font-weight: bold;
	}


	@keyframes cursor-blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}

	.info {
		padding: 4px;
		background: #f0f0f0;
		border: 1px inset #c0c0c0;
		font-size: 10px;
		color: #666;
		text-align: center;
	}
</style>
