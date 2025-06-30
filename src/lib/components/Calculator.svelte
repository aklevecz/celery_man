<script>
	let display = $state('0');
	/** @type {string | null} */
	let operation = $state(null);
	/** @type {number | null} */
	let previousValue = $state(null);
	let waitingForOperand = $state(false);

	/** @param {string | number} num */
	function inputNumber(num) {
		console.log(num);
		if (waitingForOperand) {
			display = String(num);
			waitingForOperand = false;
		} else {
			display = display === '0' ? String(num) : display + num;
		}
	}

	/** @param {string} nextOperation */
	function inputOperation(nextOperation) {
		const inputValue = parseFloat(display);

		if (previousValue === null) {
			previousValue = inputValue;
		} else if (operation) {
			const currentValue = previousValue || 0;
			const newValue = calculate(currentValue, inputValue, operation);

			display = String(newValue);
			previousValue = newValue;
		}

		waitingForOperand = true;
		operation = nextOperation;
	}

	/**
	 * @param {number} firstValue
	 * @param {number} secondValue
	 * @param {string} operation
	 */
	function calculate(firstValue, secondValue, operation) {
		switch (operation) {
			case '+':
				return firstValue + secondValue;
			case '-':
				return firstValue - secondValue;
			case '×':
				return firstValue * secondValue;
			case '÷':
				return firstValue / secondValue;
			case '=':
				return secondValue;
			default:
				return secondValue;
		}
	}

	function performCalculation() {
		const inputValue = parseFloat(display);

		if (previousValue !== null && operation) {
			const newValue = calculate(previousValue, inputValue, operation);
			display = String(newValue);
			previousValue = null;
			operation = null;
			waitingForOperand = true;
		}
	}

	function clear() {
		display = '0';
		previousValue = null;
		operation = null;
		waitingForOperand = false;
	}

	function toggleSign() {
		display = String(parseFloat(display) * -1);
	}

	function inputPercent() {
		display = String(parseFloat(display) / 100);
	}
</script>

<div class="calculator">
	<div class="display text-black">{display}</div>
	<div class="buttons">
		<button class="btn" onclick={clear}>C</button>
		<button class="btn" onclick={toggleSign}>±</button>
		<button class="btn" onclick={inputPercent}>%</button>
		<button class="btn operator" onclick={() => inputOperation('÷')}>÷</button>

		<button class="btn" onclick={() => inputNumber(7)}>7</button>
		<button class="btn" onclick={() => inputNumber(8)}>8</button>
		<button class="btn" onclick={() => inputNumber(9)}>9</button>
		<button class="btn operator" onclick={() => inputOperation('×')}>×</button>

		<button class="btn" onclick={() => inputNumber(4)}>4</button>
		<button class="btn" onclick={() => inputNumber(5)}>5</button>
		<button class="btn" onclick={() => inputNumber(6)}>6</button>
		<button class="btn operator" onclick={() => inputOperation('-')}>-</button>

		<button class="btn" onclick={() => inputNumber(1)}>1</button>
		<button class="btn" onclick={() => inputNumber(2)}>2</button>
		<button class="btn" onclick={() => inputNumber(3)}>3</button>
		<button class="btn operator" onclick={() => inputOperation('+')}>+</button>

		<button class="btn zero" onclick={() => inputNumber(0)}>0</button>
		<button class="btn" onclick={() => inputNumber('.')}>.</button>
		<button class="btn operator" onclick={performCalculation}>=</button>
	</div>
</div>

<style>
	.calculator {
		background: #c0c0c0;
		padding: 4px;
		width: 100%;
		height: 100%;
	}

	.display {
		background: white;
		border: 1px inset #c0c0c0;
		padding: 8px;
		margin-bottom: 4px;
		text-align: right;
		font-family: 'Courier New', monospace;
		font-size: 14px;
		min-height: 20px;
		overflow: hidden;
	}

	.buttons {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 2px;
		height: calc(100% - 40px);
	}

	.btn {
		padding: 8px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 12px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.btn:hover {
		background: #d4d0c8;
	}

	.btn:active {
		border: 1px inset #c0c0c0;
	}

	.btn.operator {
		background: #dfdfdf;
	}

	.btn.zero {
		grid-column: span 2;
	}
</style>
