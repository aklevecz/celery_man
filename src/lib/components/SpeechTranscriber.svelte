<script>
	import agent from '$lib/agent.svelte';
	import { queuePrompt } from '$lib/comfy-api';
	import { celeryMan } from '$lib/prompts';
	import { onDestroy, onMount } from 'svelte';

	let recognition = null;
	let isListening = $state(false);
	let transcription = $state('');
	let finalTranscript = $state('');
	let interimTranscript = $state('');
	let error = $state('');
	let isSupported = $state(false);

	// Check if speech recognition is supported
	onMount(() => {
		if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
			isSupported = true;
			setupSpeechRecognition();
		} else {
			error = 'Speech recognition not supported in this browser. Try Chrome or Edge.';
		}
	});

	function setupSpeechRecognition() {
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
		};

		recognition.onerror = (event) => {
			console.error('Speech recognition error:', event.error);
			error = `Recognition error: ${event.error}`;
			isListening = false;
		};

		recognition.onend = () => {
			console.log('Speech recognition ended');
			isListening = false;
		};
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
			recognition.start();
		} catch (err) {
			console.error('Error starting recognition:', err);
			error = 'Failed to start listening: ' + err.message;
		}
	}

	async function stopListening() {
		if (recognition && isListening) {
			recognition.stop();
		}
		const audio = document.getElementById('yes-paul');
		audio.play();
		function callback(dancer) {
			console.log(`Dancer: ${dancer}`);
			queuePrompt({ workflow: celeryMan, dancer });
		}
		console.log(`Final transcript: ${finalTranscript}`);
		agent.sendChatMessage(finalTranscript, callback);
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
			{:else}
				<span class="idle">⚪ Ready</span>
			{/if}
		</div>
	</div>

	<div class="controls">
		<button
			class="btn listen-btn"
			onclick={startListening}
			disabled={isListening || !isSupported}
			class:listening={isListening}
		>
			🎤 Start Listening
		</button>

		<button class="btn stop-btn" onclick={stopListening} disabled={!isListening}>
			⏹️ Stop Listening
		</button>

		<button class="btn clear-btn" onclick={clearTranscription} disabled={isListening}>
			🗑️ Clear
		</button>
		<button
			class="btn clear-btn"
			onclick={() => {
				agent.sendChatMessage('can you show me celery man please?');
			}}
		>
			🗑️ celery man</button
		>
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

	.cursor.visible {
		opacity: 1;
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
