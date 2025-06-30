import { windowManager } from '$lib/window-manager.svelte';
import CincoIdentityGenerator from '$lib/components/CincoIdentityGenerator.svelte';

function openCincoIdentityGenerator() {
	windowManager.createWindow({
		id: 'cinco-identity-generator',
		title: 'Cinco Identity Generator',
		width: 500,
		height: 360,
		x: 300,
		y: 250,
		content: {
			component: CincoIdentityGenerator,
			props: {}
		}
	});
}

function CincoIdentityGeneratorController() {
	windowManager.registerWindowCreator('cinco-identity-generator', openCincoIdentityGenerator);
	return {
		openCincoIdentityGenerator
	};
}

export default CincoIdentityGeneratorController();
