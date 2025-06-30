import { windowManager } from '$lib/window-manager.svelte';
import GoodMorningPaul from '$lib/components/GoodMorningPaul.svelte';

function goodMorningPaul() {
	windowManager.createWindow({
		id: 'good-morning-paul',
		title: `Paul's computer`,
		width: 400,
		height: 300,
		x: 100,
		y: 550,
		content: {
			component: GoodMorningPaul,
			props: {}
		}
	});
}

function GoodMorningPaulController() {
	windowManager.registerWindowCreator('good-morning-paul', goodMorningPaul);
	return {
		goodMorningPaul
	};
}

export default GoodMorningPaulController();
