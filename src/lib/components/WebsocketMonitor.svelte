<script>
	import { fetchUrl } from '$lib';
	import { queuePrompt } from '$lib/comfy-api';
	import { websocketClient } from '$lib/websocket-client';
	import { onMount, onDestroy } from 'svelte';

	/** @type {string[]} imagePreviews*/
	let imagePreviews = $state([]);
	let textPreview = $state('');

    /** @param {*} message */
	function handleWebSocketMessage(message) {
		switch (message.type) {
			case 'status':
				console.log('Status event:', message.data);
				break;
			case 'execution_start':
				console.log('Execution started:', message.data);
				break;
			case 'executing':
				console.log('Currently executing node:', message.data);
				break;
			case 'progress':
				console.log('Progress:', message.data);
				break;
			case 'executed':
				console.log('Node executed:', message.data);
				const output = message.data.output;
				if (output.images) {
					const images = message.data.output.images;
					const filename = images[0].filename;
					const subfolder = images[0].subfolder;
					const type = images[0].type;
					const url = `${fetchUrl}/api/view?filename=${filename}&type=${type}&subfolder=${subfolder}`;
					imagePreviews = [...imagePreviews, url];
				} else if (output.text) {
					console.log(output.text);
					const text = output.text;
					textPreview = text.join(' ');
				}
				break;
			case 'execution_success':
				console.log('Execution completed successfully');
				break;
		}
	}

	onMount(() => {
		websocketClient.setMessageHandler(handleWebSocketMessage);
		websocketClient.connect();
	});

	onDestroy(() => {
		websocketClient.disconnect();
	});
</script>

<div class="container">
	<div class="mb-4 p-2 rounded" class:bg-green-100={websocketClient.connectionStatus === 'connected'} class:bg-yellow-100={websocketClient.connectionStatus === 'connecting' || websocketClient.connectionStatus === 'reconnecting'} class:bg-red-100={websocketClient.connectionStatus === 'disconnected' || websocketClient.connectionStatus === 'error' || websocketClient.connectionStatus === 'failed'}>
		Status: {websocketClient.connectionStatus}
		{#if websocketClient.isConnecting}
			<span class="animate-pulse">...</span>
		{/if}
	</div>
	<button class="bg-white text-black py-2 px-4 rounded" onclick={() => queuePrompt()}>Test</button>
	<div>{textPreview}</div>
	<div>
		{#each imagePreviews as image, index}
			<img src={image} alt="Preview {index + 1}" class="w-full h-auto" />
		{/each}
	</div>
</div>
