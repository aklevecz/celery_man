import { windowManager } from '$lib/window-manager.svelte';
import GeneratedGifsViewer from '$lib/components/GeneratedGifsViewer.svelte';

function openGeneratedGifsViewer() {
	windowManager.createWindow({
		id: 'generated-gifs-viewer',
		title: 'Generated GIFs Gallery',
		width: 800,
		height: 600,
		x: 250,
		y: 100,
		content: {
			component: GeneratedGifsViewer,
			props: {}
		}
	});
}

function GeneratedGifsViewerController() {
	windowManager.registerWindowCreator('generated-gifs-viewer', openGeneratedGifsViewer);
	return {
		openGeneratedGifsViewer
	};
}

export default GeneratedGifsViewerController();
