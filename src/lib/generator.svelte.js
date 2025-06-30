function createGeneratorState() {
	/** @type {{status: 'identity' | 'loading-celery-man'}} */
	let generator = $state({
		status: 'identity'
		// status: 'loading-celery-man'
	});

	return {
		get state() {
			return generator;
		}
	};
}

const generatorState = createGeneratorState();
export default generatorState;
