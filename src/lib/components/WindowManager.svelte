<script>
	import { windowManager } from '$lib/window-manager.svelte.js';
	import Window from './Window.svelte';

	$effect(() => {
		function handleClickOutside(e) {
			const clickedWindow = e.target.closest('.window');
			if (!clickedWindow && windowManager.windows.length > 0) {
				return;
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	});
</script>

{#each windowManager.windows as window (window.id)}
	<Window
		windowId={window.id}
		title={window.title}
		width={window.width}
		height={window.height}
		x={window.x}
		y={window.y}
		zIndex={window.zIndex}
		isMinimized={window.isMinimized}
		isMaximized={window.isMaximized}
	>
		{#if typeof window.content === 'string'}
		<div>hello</div>
			<div>{@html window.content}</div>
		{:else if window.content && typeof window.content === 'object' && window.content.component}
			<svelte:component this={window.content.component} {...window.content.props || {}} />
		{:else}
			{@render window.content?.()}
		{/if}
	</Window>
{/each}

<style>
</style>