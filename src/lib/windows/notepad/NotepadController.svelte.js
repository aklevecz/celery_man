import { windowManager } from '$lib/window-manager.svelte';

function openNotepad() {
	windowManager.createWindow({
		id: 'notepad',
		title: 'Untitled - Notepad',
		width: 500,
		height: 400,
		x: 150,
		y: 100,
		content: `
				<div style="background: white; padding: 8px; height: 100%; border: 1px inset #c0c0c0;">
					<textarea 
						style="width: 100%; height: 100%; border: none; outline: none; font-family: 'Courier New', monospace; font-size: 12px; resize: none;"
						placeholder="Type your text here..."
					></textarea>
				</div>
			`
	});
}

function NotepadController() {
	windowManager.registerWindowCreator('notepad', openNotepad);
	return {
		openNotepad
	};
}

export default NotepadController();
