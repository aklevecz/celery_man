<script>
	let { gifUrl, alt = "Generated GIF" } = $props();
</script>

<div class="gif-display">
	<img src={gifUrl} {alt} />
</div>

<style>
	.gif-display {
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