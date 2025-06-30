import { windowManager } from '$lib/window-manager.svelte';
import SpeechTranscriber from '$lib/components/SpeechTranscriber.svelte';

function openSpeechTranscriber() {
	windowManager.createWindow({
		id: 'speech-transcriber',
		title: 'Speech Transcriber',
		width: 450,
		height: 500,
		x: 250,
		y: 50,
		content: {
			component: SpeechTranscriber,
			props: {}
		}
	});
}

function SpeechTranscriberController() {
	windowManager.registerWindowCreator('speech-transcriber', openSpeechTranscriber);
	return {
		openSpeechTranscriber
	};
}

export default SpeechTranscriberController();
