<script>
	import { userStore } from '$lib/user.svelte.js';

	let images = $derived(userStore.editedImages);
	let selectedIndex = $derived(userStore.selectedEditedImageIndex);
	let selectedImage = $derived(userStore.selectedEditedImage);

	function selectImage(index) {
		userStore.selectEditedImage(index);
	}

	function downloadImage(index) {
		userStore.downloadEditedImage(index);
	}

	async function deleteImage(index) {
		if (confirm('Are you sure you want to delete this edited image?')) {
			await userStore.deleteEditedImage(index);
		}
	}

	async function clearAll() {
		if (confirm('Are you sure you want to delete all edited images?')) {
			await userStore.clearAllEditedImages();
		}
	}
</script>

<div class="edited-images-container">
	<div class="header">
		<span class="title">🎨 Edited Images ({images.length})</span>
		{#if images.length > 0}
			<button class="btn clear-all-btn" onclick={clearAll}> 🗑️ Clear All </button>
		{/if}
	</div>

	{#if images.length === 0}
		<div class="empty-state">
			<p>No edited images yet.</p>
			<p>
				Use the speech transcriber to say "I want [character] to be wearing [something]" to create
				edited images.
			</p>
		</div>
	{:else}
		<div class="content">
			<!-- Selected image preview -->
			{#if selectedImage}
				<div class="selected-preview">
					<div class="preview-header">
						<span class="preview-title">Selected Image</span>
						<div class="preview-controls">
							<button class="btn download-btn" onclick={() => downloadImage(selectedIndex)}>
								💾 Download
							</button>
							<button class="btn delete-btn" onclick={() => deleteImage(selectedIndex)}>
								🗑️ Delete
							</button>
						</div>
					</div>
					<div class="preview-image">
						<img src={selectedImage.dataUrl} alt="Selected edited image" />
					</div>
					<div class="preview-info">
						<p><strong>Prompt:</strong> {selectedImage.prompt || 'No prompt'}</p>
						<p><strong>Created:</strong> {selectedImage.timestamp}</p>
					</div>
				</div>
			{/if}

			<!-- Images grid -->
			<div class="images-grid">
				{#each images as image, index}
					<div
						class="image-item"
						class:selected={index === selectedIndex}
						onclick={() => selectImage(index)}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectImage(index)}
						role="button"
						tabindex="0"
						aria-label="Select edited image {index + 1}"
					>
						<div class="image-preview">
							<img src={image.dataUrl} alt="Edited image {index + 1}" />
						</div>
						<div class="image-info">
							<div class="image-number">#{index + 1}</div>
							<div class="image-timestamp">{image.timestamp}</div>
						</div>
						<div class="image-controls">
							<button
								class="btn-small download-btn-small"
								onclick={(e) => {
									e.stopPropagation();
									downloadImage(index);
								}}
								title="Download"
							>
								💾
							</button>
							<button
								class="btn-small delete-btn-small"
								onclick={(e) => {
									e.stopPropagation();
									deleteImage(index);
								}}
								title="Delete"
							>
								🗑️
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.edited-images-container {
		background: #c0c0c0;
		height: 100%;
		display: flex;
		flex-direction: column;
		padding: 8px;
		gap: 8px;
	}

	.header {
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

	.empty-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		text-align: center;
		color: #666;
		font-size: 11px;
		padding: 20px;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8px;
		overflow: hidden;
	}

	.selected-preview {
		border: 1px inset #c0c0c0;
		background: white;
		padding: 8px;
		min-height: 200px;
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
		padding-bottom: 4px;
		border-bottom: 1px solid #ccc;
	}

	.preview-title {
		font-weight: bold;
		font-size: 11px;
	}

	.preview-controls {
		display: flex;
		gap: 4px;
	}

	.preview-image {
		text-align: center;
		margin-bottom: 8px;
	}

	.preview-image img {
		max-width: 100%;
		max-height: 150px;
		border: 1px solid #ccc;
	}

	.preview-info {
		font-size: 10px;
		color: #666;
	}

	.preview-info p {
		margin: 2px 0;
	}

	.images-grid {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 8px;
		overflow-y: auto;
		padding: 4px;
		border: 1px inset #c0c0c0;
		background: #f0f0f0;
	}

	.image-item {
		background: white;
		border: 2px outset #c0c0c0;
		padding: 4px;
		cursor: pointer;
		position: relative;
		display: flex;
		flex-direction: column;
		height: 140px;
	}

	.image-item:hover {
		background: #f8f8f8;
	}

	.image-item.selected {
		border: 2px inset #c0c0c0;
		background: #e8e8ff;
	}

	.image-preview {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.image-preview img {
		max-width: 100%;
		max-height: 80px;
		object-fit: contain;
	}

	.image-info {
		text-align: center;
		font-size: 9px;
		color: #666;
		margin: 2px 0;
	}

	.image-number {
		font-weight: bold;
	}

	.image-controls {
		display: flex;
		justify-content: center;
		gap: 2px;
		margin-top: 2px;
	}

	.btn,
	.btn-small {
		padding: 4px 6px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 9px;
		cursor: pointer;
		color: black;
		white-space: nowrap;
	}

	.btn-small {
		padding: 2px 4px;
		font-size: 8px;
	}

	.btn:hover:not(:disabled),
	.btn-small:hover:not(:disabled) {
		background: #d4d0c8;
	}

	.btn:active:not(:disabled),
	.btn-small:active:not(:disabled) {
		border: 1px inset #c0c0c0;
	}

	.clear-all-btn {
		color: #cc0000;
		font-weight: bold;
	}

	.delete-btn,
	.delete-btn-small {
		color: #cc0000;
	}

	.download-btn,
	.download-btn-small {
		color: #006600;
	}
</style>
