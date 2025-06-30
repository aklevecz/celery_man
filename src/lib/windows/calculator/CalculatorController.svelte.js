import { windowManager } from '$lib/window-manager.svelte';
import Calculator from '$lib/components/Calculator.svelte';

function openCalculator() {
	windowManager.createWindow({
		id: 'calculator',
		title: 'Calculator',
		width: 200,
		height: 250,
		x: 200,
		y: 150,
		content: {
			component: Calculator,
			props: {}
		}
	});
}

function CalculatorController() {
	windowManager.registerWindowCreator('calculator', openCalculator);
	return {
		openCalculator
	};
}

export default CalculatorController();
