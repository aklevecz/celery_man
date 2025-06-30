<script>
	/**
	 * @typedef {Object} TypewriterProps
	 * @property {string[]} [messages] - Array of messages to type out
	 * @property {number} [delay] - Delay between characters in milliseconds
	 * @property {(() => void) | null} [onComplete] - Callback function when typing is complete
	 */

	/** @type {TypewriterProps} */
	let { messages = [], delay = 100, onComplete = null } = $props();

	/** @type {string} */
	let typewriterText = $state('');
	/** @type {number} */
	let currentMessageIndex = $state(0);
	/** @type {number} */
	let currentCharIndex = $state(0);
	/** @type {boolean} */
	let isTyping = $state(false);
	/** @type {number | null} */
	let typeInterval = null;

	/**
	 * Start typing animation with new messages
	 * @param {string | string[]} newMessages - Message(s) to type out
	 */
	function startTyping(newMessages) {
		if (typeInterval) {
			clearInterval(typeInterval);
		}

		// Reset state
		typewriterText = '';
		currentMessageIndex = 0;
		currentCharIndex = 0;
		isTyping = true;

		/** @type {string[]} */
		const messagesToType = Array.isArray(newMessages) ? newMessages : [newMessages];

		typeInterval = setInterval(() => {
			if (currentMessageIndex >= messagesToType.length) {
				clearInterval(typeInterval);
				isTyping = false;
				if (onComplete) onComplete();
				return;
			}

			/** @type {string} */
			const currentMessage = messagesToType[currentMessageIndex];

			if (currentCharIndex < currentMessage.length) {
				typewriterText += currentMessage[currentCharIndex];
				currentCharIndex++;
			} else {
				// Move to next message after a pause
				if (currentMessageIndex < messagesToType.length - 1) {
					setTimeout(() => {
						typewriterText += '\n';
						currentMessageIndex++;
						currentCharIndex = 0;
					}, delay * 5); // Pause between messages
				} else {
					currentMessageIndex++;
				}
			}
		}, delay);
	}

	// Auto-start if messages are provided as props
	$effect(() => {
		if (messages.length > 0) {
			startTyping(messages);
		}
	});

	// Expose the startTyping function for parent components
	export { startTyping };
</script>

<div class="typewriter-container">
	<div class="typewriter">
		{typewriterText}<span class="cursor" class:visible={isTyping}>|</span>
	</div>
</div>

<style>
	.typewriter-container {
		background: black;
		color: white;
		padding: 16px;
		font-family: 'Courier New', monospace;
		font-size: 14px;
		border: none;
		min-height: 60px;
		white-space: pre-wrap;
	}

	.typewriter {
		line-height: 1.4;
	}

	.cursor {
		opacity: 0;
		animation: blink 1s infinite;
	}

	.cursor.visible {
		opacity: 1;
	}

	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}
</style>
