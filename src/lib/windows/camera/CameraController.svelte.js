import { windowManager } from '$lib/window-manager.svelte';
import Camera from '$lib/components/Camera.svelte';

function openCamera() {
	windowManager.createWindow({
		id: 'camera',
		title: 'Camera',
		width: 500,
		height: 400,
		x: 200,
		y: 100,
		content: {
			component: Camera,
			props: {}
		}
	});
}

function CameraController() {
	windowManager.registerWindowCreator('camera', openCamera);
	return {
		openCamera
	};
}

export default CameraController();
