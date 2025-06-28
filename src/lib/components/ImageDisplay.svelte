<script>
	let { imageUrl, alt = "Generated Image" } = $props();
</script>

<div class="image-display">
	<img src={imageUrl} {alt} />
</div>

<style>
	.image-display {
		padding: 8px;
		text-align: center;
		background: white;
		height: 100%;
	}

	img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}
</style>