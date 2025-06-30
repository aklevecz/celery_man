<script>
	import { websocketClient } from '$lib/websocket-client';
	import { onMount } from 'svelte';

	let websocketStatus = $state('disconnected');
	let websocketClientId = $state('');

	function updateWebSocketStatus() {
		websocketStatus = websocketClient.getConnectionStatus();
		websocketClientId = websocketClient.getClientId() || '';
	}

	function retryConnection() {
		websocketClient.disconnect();
		setTimeout(() => {
			websocketClient.connect();
		}, 100);
	}

	onMount(() => {
		// Update status initially
		updateWebSocketStatus();

		// Poll status every 500ms for reactive updates
		const statusInterval = setInterval(updateWebSocketStatus, 500);

		return () => {
			clearInterval(statusInterval);
		};
	});
</script>

<div class="websocket-status-bar">
	<div class="status-indicator">
		<span
			class="status-icon"
			class:connected={websocketStatus === 'connected'}
			class:connecting={websocketStatus === 'connecting'}
			class:disconnected={websocketStatus === 'disconnected'}
			class:error={websocketStatus === 'error'}
		>
			{#if websocketStatus === 'connected'}
				🟢
			{:else if websocketStatus === 'connecting'}
				🟡
			{:else if websocketStatus === 'reconnecting'}
				🟠
			{:else if websocketStatus === 'error'}
				🔴
			{:else}
				⚫
			{/if}
		</span>
		<span class="status-text">
			WebSocket: {websocketStatus.toUpperCase()}
		</span>
	</div>
	<div class="status-controls">
		{#if websocketStatus === 'failed' || websocketStatus === 'error' || websocketStatus === 'disconnected'}
			<button class="reconnect-btn" onclick={retryConnection}> 🔄 Retry </button>
		{/if}
		{#if websocketClientId}
			<div class="client-id">
				ID: {websocketClientId.slice(-8)}
			</div>
		{/if}
	</div>
</div>

<style>
	.websocket-status-bar {
		/* position: fixed; */
		bottom: 30px; /* Above the taskbar */
		left: 0;
		right: 0;
		height: 20px;
		background: #d4d0c8;
		border-top: 1px solid #ffffff;
		border-bottom: 1px solid #808080;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 8px;
		font-size: 10px;
		z-index: 999; /* Below windows but above desktop */
	}

	.status-indicator {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.status-icon {
		font-size: 8px;
		animation: none;
	}

	.status-icon.connecting {
		animation: pulse 1.5s infinite;
	}

	.status-icon.error {
		animation: blink 1s infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
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

	.status-text {
		font-weight: bold;
		color: #333;
		text-transform: uppercase;
		font-size: 9px;
	}

	.status-controls {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.reconnect-btn {
		padding: 2px 6px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 8px;
		cursor: pointer;
		color: black;
		white-space: nowrap;
	}

	.reconnect-btn:hover {
		background: #d4d0c8;
	}

	.reconnect-btn:active {
		border: 1px inset #c0c0c0;
	}

	.client-id {
		color: #666;
		font-family: 'Courier New', monospace;
		font-size: 8px;
	}
</style>
