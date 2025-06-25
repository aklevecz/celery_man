<script>
	import generatorState from '$lib/generator.svelte';
	import { windowManager } from '$lib/window-manager.svelte';

	let statusMessage = $derived(
		generatorState.state.status === 'loading-celery-man'
			? 'Loading CELERY MAN, please wait...'
			: 'please wait...'
	);

	$effect(() => {
		if (generatorState.state.status === 'identity') {
			windowManager.resizeWindow('cinco-identity-generator', 500, 360);
		} else {
			windowManager.resizeWindow('cinco-identity-generator', 500, 200);
		}
	});

	function updatePercentage() {
		// TODO: update percentage
        return '70%';
	}
</script>

<div class="flex flex-col justify-center items-center h-full">
	{#if generatorState.state.status === 'identity'}<img
			src="cinco-identity.png"
			alt="Cinco Identity Generator 2.5"
		/>
		<h1>Cinco Identity Generator 2.5</h1>
	{/if}
	<div class="loading-bar-container bg-white h-10 w-3/4 inner-shadow mb-4">
		<div class="colored-bar bg-blue-600 h-full" style="width: {updatePercentage()}"></div>
	</div>
	<div>{statusMessage}</div>
</div>
