<script>
	import { userStore } from '$lib/user.svelte.js';

	// Derived state for all images
	let allImages = $derived.by(() => {
		const images = [];

		console.log('Building all images array...');
		console.log('Has face:', userStore.hasFace);
		console.log('Has dancer frame:', userStore.hasDancerFrame);
		console.log('Edited images count:', userStore.editedImages.length);

		// Add face image if available
		if (userStore.hasFace) {
			images.push({
				id: 'face',
				type: 'face',
				dataUrl: userStore.faceDataUrl,
				timestamp: userStore.faceTimestamp,
				title: 'Saved Face',
				description: 'User face for generation',
				isSelected: userStore.selectedImageType === 'face' && userStore.selectedImageId === 'face'
			});
			console.log('Added face image');
		}

		// Add dancer frame if available
		if (userStore.hasDancerFrame) {
			images.push({
				id: 'dancer-frame',
				type: 'dancer-frame',
				dataUrl: userStore.dancerFrameDataUrl,
				timestamp: userStore.dancerFrameTimestamp,
				title: 'Dancer Frame',
				description: 'First frame from generated dance',
				isSelected: userStore.selectedImageType === 'dancer-frame' && userStore.selectedImageId === 'dancer-frame'
			});
			console.log('Added dancer frame');
		}

		// Add all edited images
		userStore.editedImages.forEach((editedImage, index) => {
			images.push({
				id: editedImage.id,
				type: 'edited',
				dataUrl: editedImage.dataUrl,
				timestamp: editedImage.timestamp,
				title: `Edited Image #${index + 1}`,
				description: editedImage.prompt || 'Generated image',
				isSelected: userStore.selectedImageType === 'edited' && userStore.selectedImageId === editedImage.id
			});
			console.log(`Added edited image ${index + 1}`);
		});

		console.log('Total images:', images.length);

		// Sort by timestamp (newest first)
		return images.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	});

	/** @param {string} imageId */
	function selectImage(imageId) {
		console.log(`Trying to select image ${imageId}`);
		// Find the image and handle selection based on type
		const image = allImages.find((img) => img.id === imageId);
		console.log(image);
		if (!image) return;

		// Use global selection system for all image types
		userStore.selectGlobalImage(image.type, imageId);
		console.log(`Selected ${image.type} image: ${imageId}`);
	}

	/** @param {string} imageId */
	function downloadImage(imageId) {
		const image = allImages.find((img) => img.id === imageId);
		if (!image) return;

		switch (image.type) {
			case 'face':
				userStore.downloadFace();
				break;
			case 'dancer-frame':
				userStore.downloadDancerFrame();
				break;
			case 'edited':
				const editedIndex = userStore.editedImages.findIndex((img) => img.id === imageId);
				if (editedIndex >= 0) {
					userStore.downloadEditedImage(editedIndex);
				}
				break;
		}
	}

	/** @param {string} imageId */
	async function deleteImage(imageId) {
		const image = allImages.find((img) => img.id === imageId);
		if (!image) return;

		const confirmMessage = `Are you sure you want to delete "${image.title}"?`;
		if (!confirm(confirmMessage)) return;

		switch (image.type) {
			case 'face':
				await userStore.clearFace();
				break;
			case 'dancer-frame':
				await userStore.clearDancerFrame();
				break;
			case 'edited':
				const editedIndex = userStore.editedImages.findIndex((img) => img.id === imageId);
				if (editedIndex >= 0) {
					await userStore.deleteEditedImage(editedIndex);
				}
				break;
		}
	}

	async function clearAllImages() {
		if (!confirm('Are you sure you want to delete ALL saved images? This cannot be undone.')) {
			return;
		}

		await userStore.clearFace();
		await userStore.clearDancerFrame();
		await userStore.clearAllEditedImages();
	}
</script>

<div class="gallery-container">
	<div class="header">
		<span class="title">🖼️ All Saved Images ({allImages.length})</span>
		{#if allImages.length > 0}
			<button class="btn clear-all-btn" onclick={clearAllImages}> 🗑️ Clear All </button>
		{/if}
	</div>

	{#if allImages.length === 0}
		<div class="empty-state">
			<div class="empty-icon">📷</div>
			<p><strong>No images saved yet</strong></p>
			<p>Save images by:</p>
			<ul>
				<li>Taking a photo with the Camera</li>
				<li>Generating a dancer (saves first frame)</li>
				<li>Creating edited images with speech commands</li>
			</ul>
			<div class="debug-info">
				<strong>Debug Info:</strong><br />
				Has Face: {userStore.hasFace}<br />
				Has Dancer Frame: {userStore.hasDancerFrame}<br />
				Edited Images Count: {userStore.editedImages.length}<br />
				All Images Length: {allImages.length}
			</div>
		</div>
	{:else}
		<div class="images-grid">
			{#each allImages as image (image.id)}
				<div
					class="image-card"
					class:selected={image.isSelected}
					class:face={image.type === 'face'}
					class:dancer-frame={image.type === 'dancer-frame'}
					class:edited={image.type === 'edited'}
				>
					<div class="image-header">
						<div
							class="image-type-badge"
							class:face={image.type === 'face'}
							class:dancer-frame={image.type === 'dancer-frame'}
							class:edited={image.type === 'edited'}
						>
							{#if image.type === 'face'}
								👤 Face
							{:else if image.type === 'dancer-frame'}
								🕺 Dancer
							{:else}
								🎨 Edited
							{/if}
						</div>
						{#if image.isSelected}
							<div class="selected-badge">✓ Selected</div>
						{/if}
					</div>

					<div class="image-preview" onclick={() => selectImage(image.id)}>
						<img src={image.dataUrl} alt={image.title} />
					</div>

					<div class="image-info">
						<div class="image-title">{image.title}</div>
						<div class="image-description">{image.description}</div>
						<div class="image-timestamp">{image.timestamp}</div>
					</div>

					<div class="image-controls">
						<button
							class="btn-small select-btn"
							onclick={() => selectImage(image.id)}
							disabled={image.isSelected}
						>
							{image.isSelected ? '✓ Selected' : 'Select'}
						</button>
						<button
							class="btn-small download-btn"
							onclick={() => downloadImage(image.id)}
							title="Download"
						>
							💾 Download
						</button>
						<button
							class="btn-small delete-btn"
							onclick={() => deleteImage(image.id)}
							title="Delete"
						>
							🗑️ Delete
						</button>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.gallery-container {
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

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
		opacity: 0.5;
	}

	.empty-state ul {
		text-align: left;
		margin-top: 8px;
	}

	.debug-info {
		margin-top: 16px;
		padding: 8px;
		background: #ffe;
		border: 1px solid #cc0;
		font-size: 10px;
		text-align: left;
	}

	.images-grid {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 12px;
		overflow-y: auto;
		padding: 8px;
		border: 1px inset #c0c0c0;
		background: #f0f0f0;
	}

	.image-card {
		background: white;
		border: 2px outset #c0c0c0;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		transition: all 0.2s;
	}

	.image-card:hover {
		background: #f8f8f8;
	}

	.image-card.selected {
		border: 2px solid #0080ff;
		box-shadow: 0 0 8px rgba(0, 128, 255, 0.3);
	}

	.image-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 4px 8px;
		background: #e8e8e8;
		border-bottom: 1px solid #ccc;
		min-height: 24px;
	}

	.image-type-badge {
		font-size: 9px;
		font-weight: bold;
		padding: 2px 6px;
		border-radius: 3px;
		color: white;
	}

	.image-type-badge.face {
		background: #4caf50;
	}

	.image-type-badge.dancer-frame {
		background: #ff9800;
	}

	.image-type-badge.edited {
		background: #9c27b0;
	}

	.selected-badge {
		font-size: 9px;
		font-weight: bold;
		color: #0080ff;
		background: #e8f4ff;
		padding: 2px 6px;
		border-radius: 3px;
		border: 1px solid #0080ff;
	}

	.image-preview {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8px;
		cursor: pointer;
		min-height: 120px;
		max-height: 150px;
		overflow: hidden;
	}

	.image-preview img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
		border: 1px solid #ddd;
	}

	.image-info {
		padding: 8px;
		border-top: 1px solid #eee;
		background: #fafafa;
	}

	.image-title {
		font-size: 11px;
		font-weight: bold;
		margin-bottom: 2px;
		color: #333;
	}

	.image-description {
		font-size: 10px;
		color: #666;
		margin-bottom: 4px;
		line-height: 1.3;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.image-timestamp {
		font-size: 9px;
		color: #999;
	}

	.image-controls {
		display: flex;
		gap: 4px;
		padding: 6px 8px;
		background: #f0f0f0;
		border-top: 1px solid #ddd;
		flex-wrap: wrap;
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
		flex: 1;
		min-width: 0;
	}

	.btn-small {
		font-size: 8px;
		padding: 3px 5px;
	}

	.btn:hover:not(:disabled),
	.btn-small:hover:not(:disabled) {
		background: #d4d0c8;
	}

	.btn:active:not(:disabled),
	.btn-small:active:not(:disabled) {
		border: 1px inset #c0c0c0;
	}

	.btn:disabled,
	.btn-small:disabled {
		background: #a0a0a0;
		color: #666;
		cursor: not-allowed;
	}

	.clear-all-btn {
		color: #cc0000;
		font-weight: bold;
	}

	.delete-btn {
		color: #cc0000;
	}

	.download-btn {
		color: #006600;
	}

	.select-btn {
		color: #0066cc;
	}

	.select-btn:disabled {
		color: #999;
		background: #e0e0e0;
	}
</style>
