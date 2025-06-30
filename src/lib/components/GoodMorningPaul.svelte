<script>
	import Typewriter from './Typewriter.svelte';

	/** @type {any} */
	let typewriter;

	/** @type {HTMLAudioElement | null} */
	let audio = null;

	function triggerMessage1() {
		typewriter.startTyping(['Good morning Paul.']);

		audio = document.getElementById('good-morning-paul');
		if (audio && audio instanceof HTMLAudioElement) {
			audio.play();
		}
	}

	function triggerMessage2() {
		typewriter.startTyping(['What will your first sequence of the day be']);

		const audioElement = document.getElementById('first-sequence-of-the-day');
		if (audioElement && audioElement instanceof HTMLAudioElement) {
			audioElement.play();
		}
	}

	function triggerMessage3() {
		typewriter.startTyping(['Yes Paul.']);

		const audioElement = document.getElementById('yes-paul');
		if (audioElement && audioElement instanceof HTMLAudioElement) {
			audioElement.play();
		}
	}
</script>

<div class="container">
	<div class="controls">
		<button onclick={triggerMessage1} class="btn">Good Morning</button>
		<button onclick={triggerMessage2} class="btn">First sequence of the day</button>
		<button onclick={triggerMessage3} class="btn">Yes</button>
	</div>

	<Typewriter bind:this={typewriter} delay={120} />
</div>

<style>
	.container {
		padding: 16px;
		background: white;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.controls {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}

	.btn {
		padding: 6px 12px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 11px;
		font-weight: bold;
		cursor: pointer;
		color: black;
	}

	.btn:hover {
		background: #d4d0c8;
	}

	.btn:active {
		border: 1px inset #c0c0c0;
	}

</style>
