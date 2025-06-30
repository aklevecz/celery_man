<script>
	import { userStore } from '$lib/user.svelte.js';

	let gifs = $derived(userStore.generatedGifs);
	let selectedIndex = $derived(userStore.selectedGeneratedGifIndex);
	let selectedGif = $derived(userStore.selectedGeneratedGif);

	function selectGif(index) {
		userStore.selectGeneratedGif(index);
	}

	function deleteGif(index) {
		if (confirm('Are you sure you want to delete this GIF?')) {
			userStore.deleteGeneratedGif(index);
		}
	}

	function clearAll() {
		if (confirm('Are you sure you want to delete all generated GIFs?')) {
			userStore.clearAllGeneratedGifs();
		}
	}

	function downloadGif(gif) {
		const link = document.createElement('a');
		link.download = `${gif.title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.gif`;
		link.href = gif.url;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	function openGifInNewWindow(gif) {
		const newWindow = window.open(gif.url, '_blank', 'width=600,height=600');
		if (newWindow) {
			newWindow.document.title = gif.title;
		}
	}
</script>

<div class="gifs-container">
	<div class="header">
		<span class="title">🎬 Generated GIFs ({gifs.length})</span>
		{#if gifs.length > 0}
			<button class="btn clear-all-btn" onclick={clearAll}> 🗑️ Clear All </button>
		{/if}
	</div>

	{#if gifs.length === 0}
		<div class="empty-state">
			<div class="empty-icon">🎭</div>
			<p><strong>No GIFs generated yet</strong></p>
			<p>Use the Speech Transcriber to say things like:</p>
			<ul>
				<li>"Show me celery man"</li>
				<li>"I want to see tayne"</li>
				<li>"Can I see a flarhgunnstow?"</li>
			</ul>
		</div>
	{:else}
		<div class="content">
			<!-- Selected GIF preview -->
			{#if selectedGif}
				<div class="selected-preview">
					<div class="preview-header">
						<span class="preview-title">Selected GIF</span>
						<div class="preview-controls">
							<button class="btn download-btn" onclick={() => downloadGif(selectedGif)}>
								💾 Download
							</button>
							<button class="btn open-btn" onclick={() => openGifInNewWindow(selectedGif)}>
								🪟 Open in Window
							</button>
							<button class="btn delete-btn" onclick={() => deleteGif(selectedIndex)}>
								🗑️ Delete
							</button>
						</div>
					</div>
					<div class="preview-gif">
						<img src={selectedGif.url} alt={selectedGif.title} />
					</div>
					<div class="preview-info">
						<p><strong>Title:</strong> {selectedGif.title}</p>
						{#if selectedGif.dancer}
							<p><strong>Dancer:</strong> {selectedGif.dancer}</p>
						{/if}
						{#if selectedGif.prompt}
							<p><strong>Prompt:</strong> {selectedGif.prompt}</p>
						{/if}
						<p><strong>Created:</strong> {selectedGif.timestamp}</p>
					</div>
				</div>
			{/if}

			<!-- GIFs grid -->
			<div class="gifs-grid">
				{#each gifs as gif, index}
					<div
						class="gif-item"
						class:selected={index === selectedIndex}
						onclick={() => selectGif(index)}
						onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectGif(index)}
						role="button"
						tabindex="0"
						aria-label="Select {gif.title || 'GIF ' + (index + 1)}"
					>
						<div class="gif-preview">
							<img src={gif.url} alt={gif.title} />
						</div>
						<div class="gif-info">
							<div class="gif-title">{gif.title}</div>
							<div class="gif-timestamp">{gif.timestamp}</div>
							{#if gif.dancer}
								<div class="gif-dancer">🕺 {gif.dancer}</div>
							{/if}
						</div>
						<div class="gif-controls">
							<button
								class="btn-small download-btn-small"
								onclick={(e) => {
									e.stopPropagation();
									downloadGif(gif);
								}}
								title="Download"
							>
								💾
							</button>
							<button
								class="btn-small open-btn-small"
								onclick={(e) => {
									e.stopPropagation();
									openGifInNewWindow(gif);
								}}
								title="Open in window"
							>
								🪟
							</button>
							<button
								class="btn-small delete-btn-small"
								onclick={(e) => {
									e.stopPropagation();
									deleteGif(index);
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
	.gifs-container {
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

	.preview-gif {
		text-align: center;
		margin-bottom: 8px;
	}

	.preview-gif img {
		max-width: 100%;
		max-height: 200px;
		border: 1px solid #ccc;
	}

	.preview-info {
		font-size: 10px;
		color: #666;
	}

	.preview-info p {
		margin: 2px 0;
	}

	.gifs-grid {
		flex: 1;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 8px;
		overflow-y: auto;
		padding: 4px;
		border: 1px inset #c0c0c0;
		background: #f0f0f0;
	}

	.gif-item {
		background: white;
		border: 2px outset #c0c0c0;
		padding: 4px;
		cursor: pointer;
		position: relative;
		display: flex;
		flex-direction: column;
		height: 180px;
	}

	.gif-item:hover {
		background: #f8f8f8;
	}

	.gif-item.selected {
		border: 2px inset #c0c0c0;
		background: #e8e8ff;
	}

	.gif-preview {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}

	.gif-preview img {
		max-width: 100%;
		max-height: 100px;
		object-fit: contain;
	}

	.gif-info {
		text-align: center;
		font-size: 9px;
		color: #666;
		margin: 2px 0;
	}

	.gif-title {
		font-weight: bold;
		margin-bottom: 2px;
	}

	.gif-dancer {
		font-size: 8px;
		color: #0066cc;
	}

	.gif-controls {
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

	.open-btn,
	.open-btn-small {
		color: #0066cc;
	}
</style>
