// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare global {
	interface Window {
		comfyClientId: string;
		SpeechRecognition: any;
		webkitSpeechRecognition: any;
	}
}
export {};
