<script>
	import { queueFluxPrompt } from '$lib/comfy-api';
	import { userStore } from '$lib/user.svelte.js';
	import { onMount } from 'svelte';

	let prompt = $state('');
	let isGenerating = $state(false);
	let error = $state('');
	let success = $state('');
	let previewDancerFrame = $state(false);

	// Check if dancer frame is available
	let hasDancerFrame = $state(userStore.hasDancerFrame);
	let dancerFrameUrl = $state(userStore.dancerFrameDataUrl);
	let dancerFrameTimestamp = $state(userStore.dancerFrameTimestamp);

	// Update reactive state when user store changes
	$effect(() => {
		hasDancerFrame = userStore.hasDancerFrame;
		dancerFrameUrl = userStore.dancerFrameDataUrl;
		dancerFrameTimestamp = userStore.dancerFrameTimestamp;
	});

	async function generateImage() {
		if (!prompt.trim()) {
			error = 'Please enter a prompt';
			return;
		}

		if (!hasDancerFrame) {
			error = 'No dancer frame available. Generate a dancer first to use as reference.';
			return;
		}

		try {
			isGenerating = true;
			error = '';
			success = '';

			// Get the dancer frame blob
			const dancerFrameBlob = await userStore.getDancerFrameBlob();
			if (!dancerFrameBlob) {
				throw new Error('Failed to load dancer frame data');
			}

			console.log('Generating Flux image with prompt:', prompt);
			console.log('Using dancer frame as reference');

			await queueFluxPrompt({
				prompt: prompt.trim(),
				imageBlob: dancerFrameBlob
			});

			success = 'Flux image generation started! Check the loading window for progress.';
			console.log('Flux generation queued successfully');

		} catch (err) {
			console.error('Error generating Flux image:', err);
			error = 'Failed to generate image: ' + err.message;
		} finally {
			isGenerating = false;
		}
	}

	function clearMessages() {
		error = '';
		success = '';
	}

	onMount(() => {
		// Clear messages when component mounts
		clearMessages();
	});
</script>

<div class="flux-generator-container">
	<div class="flux-header">
		<span class="title">🎨 Flux Image Generator</span>
		<div class="status">
			{#if hasDancerFrame}
				<span class="has-frame">✅ Dancer Frame Ready</span>
			{:else}
				<span class="no-frame">❌ No Dancer Frame</span>
			{/if}
		</div>
	</div>

	{#if hasDancerFrame}
		<div class="reference-section">
			<div class="reference-header">
				<span class="reference-label">📸 Reference Image:</span>
				<span class="reference-timestamp">{dancerFrameTimestamp}</span>
				<button 
					class="btn preview-btn" 
					onclick={() => previewDancerFrame = !previewDancerFrame}
				>
					{previewDancerFrame ? '🙈 Hide' : '👁️ Show'}
				</button>
			</div>
			{#if previewDancerFrame}
				<div class="reference-preview">
					<img src={dancerFrameUrl} alt="Dancer Frame Reference" />
				</div>
			{/if}
		</div>
	{/if}

	<div class="prompt-section">
		<label for="flux-prompt" class="prompt-label">
			✨ Image Prompt:
		</label>
		<textarea
			id="flux-prompt"
			bind:value={prompt}
			placeholder="Describe how you want to transform the dancer frame... (e.g., 'put the man in a dress', 'make them a superhero', 'in the style of anime')"
			disabled={isGenerating || !hasDancerFrame}
			class="prompt-input"
		></textarea>
	</div>

	<div class="controls">
		<button 
			class="btn generate-btn" 
			onclick={generateImage}
			disabled={isGenerating || !hasDancerFrame || !prompt.trim()}
		>
			{#if isGenerating}
				⏳ Generating...
			{:else}
				🚀 Generate Image
			{/if}
		</button>
		
		{#if error || success}
			<button class="btn clear-btn" onclick={clearMessages}>
				🗑️ Clear
			</button>
		{/if}
	</div>

	{#if error}
		<div class="message error-message">
			⚠️ {error}
		</div>
	{/if}

	{#if success}
		<div class="message success-message">
			✅ {success}
		</div>
	{/if}

	{#if !hasDancerFrame}
		<div class="no-frame-info">
			<div class="info-icon">📝</div>
			<div class="info-text">
				<strong>No dancer frame available</strong><br>
				Generate a dancer GIF first to save a reference frame that can be used with Flux.
			</div>
		</div>
	{/if}
</div>

<style>
	.flux-generator-container {
		background: #c0c0c0;
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 8px;
		gap: 8px;
	}

	.flux-header {
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
		font-size: 10px;
		font-weight: bold;
	}

	.has-frame {
		color: #008000;
	}

	.no-frame {
		color: #cc0000;
	}

	.reference-section {
		border: 1px inset #c0c0c0;
		background: #f0f0f0;
		padding: 8px;
	}

	.reference-header {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 8px;
	}

	.reference-label {
		font-weight: bold;
		font-size: 11px;
		color: #333;
	}

	.reference-timestamp {
		font-size: 10px;
		color: #666;
		font-style: italic;
		flex: 1;
	}

	.preview-btn {
		padding: 2px 6px;
		font-size: 9px;
	}

	.reference-preview {
		display: flex;
		justify-content: center;
		padding: 8px;
		border: 1px inset #c0c0c0;
		background: white;
	}

	.reference-preview img {
		max-width: 200px;
		max-height: 200px;
		object-fit: contain;
		border: 1px solid #ccc;
	}

	.prompt-section {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.prompt-label {
		font-weight: bold;
		font-size: 11px;
		color: #333;
	}

	.prompt-input {
		flex: 1;
		min-height: 80px;
		padding: 8px;
		border: 1px inset #c0c0c0;
		background: white;
		font-family: 'Courier New', monospace;
		font-size: 11px;
		resize: vertical;
	}

	.prompt-input:disabled {
		background: #f0f0f0;
		color: #999;
	}

	.controls {
		display: flex;
		gap: 8px;
		align-items: center;
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

	.generate-btn {
		background: #aaffaa !important;
		border-color: #88dd88 !important;
		font-weight: bold;
	}

	.generate-btn:hover:not(:disabled) {
		background: #88ff88 !important;
	}

	.generate-btn:disabled {
		background: #cccccc !important;
		border-color: #aaaaaa !important;
	}

	.clear-btn {
		background: #ffcccc !important;
		border-color: #ddaaaa !important;
	}

	.clear-btn:hover:not(:disabled) {
		background: #ffaaaa !important;
	}

	.message {
		padding: 8px;
		border: 1px solid;
		font-size: 11px;
		border-radius: 2px;
	}

	.error-message {
		background: #ffeeee;
		border-color: #ffcccc;
		color: #cc0000;
	}

	.success-message {
		background: #eeffee;
		border-color: #ccffcc;
		color: #008000;
	}

	.no-frame-info {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px;
		border: 1px inset #c0c0c0;
		background: #f8f8f8;
		color: #666;
	}

	.info-icon {
		font-size: 24px;
	}

	.info-text {
		font-size: 11px;
		line-height: 1.4;
	}
</style>