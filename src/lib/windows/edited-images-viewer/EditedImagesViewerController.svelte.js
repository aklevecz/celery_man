import { windowManager } from '$lib/window-manager.svelte';
import EditedImagesViewer from '$lib/components/EditedImagesViewer.svelte';

function openEditedImagesViewer() {
	windowManager.createWindow({
		id: 'edited-images-viewer',
		title: 'Edited Images Gallery',
		width: 600,
		height: 500,
		x: 250,
		y: 100,
		content: {
			component: EditedImagesViewer,
			props: {}
		}
	});
}

function EditedImagesViewerController() {
	windowManager.registerWindowCreator('edited-images-viewer', openEditedImagesViewer);
	return {
		openEditedImagesViewer
	};
}

export default EditedImagesViewerController();
