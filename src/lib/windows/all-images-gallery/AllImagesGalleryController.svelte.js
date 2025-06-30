import { windowManager } from '$lib/window-manager.svelte';
import AllImagesGallery from '$lib/components/AllImagesGallery.svelte';

function openAllImagesGallery() {
	windowManager.createWindow({
		id: 'all-images-gallery',
		title: 'All Saved Images',
		width: 800,
		height: 600,
		x: 200,
		y: 50,
		content: {
			component: AllImagesGallery,
			props: {}
		}
	});
}

function AllImagesGalleryController() {
	windowManager.registerWindowCreator('all-images-gallery', openAllImagesGallery);
	return {
		openAllImagesGallery
	};
}

export default AllImagesGalleryController();
