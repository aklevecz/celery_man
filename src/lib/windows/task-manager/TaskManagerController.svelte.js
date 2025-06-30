import { windowManager } from '$lib/window-manager.svelte';

function openTaskbar() {
	windowManager.createWindow({
		id: 'taskbar-window',
		title: 'Window Manager',
		width: 300,
		height: 200,
		x: 300,
		y: 250,
		content: `
			<div style="background: white; padding: 8px;">
				<h4 style="margin: 0 0 8px 0;">Open Windows:</h4>
				<div id="window-list" style="font-size: 11px;"></div>
			</div>
		`
	});
}

function TaskManagerController() {
	windowManager.registerWindowCreator('taskbar-window', openTaskbar);
	return {
		openTaskbar
	};
}

export default TaskManagerController();
