import { windowManager } from '$lib/window-manager.svelte';
import FluxImageGenerator from '$lib/components/FluxImageGenerator.svelte';

function openFluxImageGenerator() {
	windowManager.createWindow({
		id: 'flux-image-generator',
		title: 'Flux Image Generator',
		width: 500,
		height: 600,
		x: 350,
		y: 50,
		content: {
			component: FluxImageGenerator,
			props: {}
		}
	});
}

function FluxImageGeneratorController() {
	windowManager.registerWindowCreator('flux-image-generator', openFluxImageGenerator);
	return {
		openFluxImageGenerator
	};
}

export default FluxImageGeneratorController();
