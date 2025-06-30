<script>
	import { queueFluxPrompt } from '$lib/comfy-api';
	import { userStore } from '$lib/user.svelte.js';
	import { onMount } from 'svelte';

	let prompt = $state('');
	let isGenerating = $state(false);
	let error = $state('');
	let success = $state('');
	let previewImage = $state(false);

	// Get globally selected image info
	let hasGlobalSelection = $derived(userStore.hasGlobalSelection);
	let selectedImageInfo = $derived(userStore.getGloballySelectedImageInfo());
	let selectedImageType = $derived(userStore.selectedImageType);

	async function generateImage() {
		if (!prompt.trim()) {
			error = 'Please enter a prompt';
			return;
		}

		if (!hasGlobalSelection) {
			error =
				'No image selected. Please select an image from the "All Images" gallery to use as reference.';
			return;
		}

		try {
			isGenerating = true;
			error = '';
			success = '';

			// Get the globally selected image blob
			const imageBlob = await userStore.getGloballySelectedImageBlob();
			if (!imageBlob) {
				throw new Error('Failed to load selected image data');
			}

			console.log('Generating Flux image with prompt:', prompt);
			console.log(
				`Using globally selected ${selectedImageType} image as reference:`,
				selectedImageInfo?.title
			);

			await queueFluxPrompt({
				prompt: prompt.trim(),
				imageBlob: imageBlob
			});

			success = 'Flux image generation started! Check the loading window for progress.';
			console.log('Flux generation queued successfully');
		} catch (err) {
			console.error('Error generating Flux image:', err);
			const message = err instanceof Error ? err.message : 'Unknown error';
			error = 'Failed to generate image: ' + message;
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
			{#if hasGlobalSelection}
				<span class="has-selection">✅ Image Selected</span>
			{:else}
				<span class="no-selection">❌ No Image Selected</span>
			{/if}
		</div>
	</div>

	{#if hasGlobalSelection && selectedImageInfo}
		<div class="reference-section">
			<div class="reference-header">
				<span class="reference-label">📸 Reference Image:</span>
				<div class="reference-info">
					<span class="reference-title">{selectedImageInfo.title}</span>
					<span class="reference-timestamp">{selectedImageInfo.timestamp}</span>
				</div>
				<button class="btn preview-btn" onclick={() => (previewImage = !previewImage)}>
					{previewImage ? '🙈 Hide' : '👁️ Show'}
				</button>
			</div>
			{#if previewImage}
				<div class="reference-preview">
					<img src={selectedImageInfo.dataUrl} alt={selectedImageInfo.title} />
				</div>
			{/if}
		</div>
	{/if}

	<div class="prompt-section">
		<label for="flux-prompt" class="prompt-label"> ✨ Image Prompt: </label>
		<textarea
			id="flux-prompt"
			bind:value={prompt}
			placeholder="Describe how you want to transform the selected image... (e.g., 'put the person in a dress', 'make them a superhero', 'in the style of anime')"
			disabled={isGenerating || !hasGlobalSelection}
			class="prompt-input"
		></textarea>
	</div>

	<div class="controls">
		<button
			class="btn generate-btn"
			onclick={generateImage}
			disabled={isGenerating || !hasGlobalSelection || !prompt.trim()}
		>
			{#if isGenerating}
				⏳ Generating...
			{:else}
				🚀 Generate Image
			{/if}
		</button>

		{#if error || success}
			<button class="btn clear-btn" onclick={clearMessages}> 🗑️ Clear </button>
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

	{#if !hasGlobalSelection}
		<div class="no-selection-info">
			<div class="info-icon">📝</div>
			<div class="info-text">
				<strong>No image selected</strong><br />
				Go to "All Images" gallery and select an image (face, dancer frame, or edited image) to use as
				reference for Flux generation.
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

	.has-selection {
		color: #008000;
	}

	.no-selection {
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

	.reference-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.reference-title {
		font-size: 10px;
		font-weight: bold;
		color: #333;
	}

	.reference-timestamp {
		font-size: 9px;
		color: #666;
		font-style: italic;
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

	.no-selection-info {
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
