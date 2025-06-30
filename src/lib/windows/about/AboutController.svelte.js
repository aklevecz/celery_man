import { windowManager } from '$lib/window-manager.svelte';

function openAbout() {
	windowManager.createWindow({
		id: 'about',
		title: 'About Windows 95',
		width: 350,
		height: 200,
		x: 250,
		y: 200,
		content: `
			<div style="background: white; padding: 12px; display: flex; align-items: center; gap: 12px;">
				<div style="font-size: 48px;">🖥️</div>
				<div>
					<h3 style="margin: 0 0 8px 0; font-size: 14px;">Windows 95 Experience</h3>
					<p style="margin: 0; font-size: 11px; color: #666;">A nostalgic recreation of the classic Windows 95 interface.</p>
					<p style="margin: 8px 0 0 0; font-size: 11px; color: #666;">Built with Svelte and love for retro computing.</p>
				</div>
			</div>
		`
	});
}

function AboutController() {
	windowManager.registerWindowCreator('about', openAbout);
	return {
		openAbout
	};
}

export default AboutController();
