import { windowManager } from '$lib/window-manager.svelte';
import DancerFrameViewer from '$lib/components/DancerFrameViewer.svelte';
import { userStore } from '$lib/user.svelte.js';

function openDancerFrameViewer(force = false) {
	if (!force && !userStore.hasDancerFrame) {
		alert('No dancer frame saved. Generate a dancer first to save a frame.');
		return;
	}

	windowManager.createWindow({
		id: 'dancer-frame-viewer',
		title: 'Saved Dancer Frame',
		width: 450,
		height: 500,
		x: 300,
		y: 100,
		content: {
			component: DancerFrameViewer,
			props: {
				frameDataUrl: userStore.dancerFrameDataUrl,
				timestamp: userStore.dancerFrameTimestamp,
				originalGifUrl: userStore.dancerFrameGifUrl
			}
		}
	});
}

function DancerFrameViewerController() {
	windowManager.registerWindowCreator('dancer-frame-viewer', () => openDancerFrameViewer(true));
	return {
		openDancerFrameViewer
	};
}

export default DancerFrameViewerController();
