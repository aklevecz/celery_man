<script>
	import { windowManager } from '$lib/window-manager.svelte.js';
	import WindowManager from '$lib/components/WindowManager.svelte';
	import Calculator from '$lib/components/Calculator.svelte';
	import CincoIdentityGenerator from '$lib/components/cinco-identity-generator.svelte';
	import GoodMorningPaul from '$lib/components/good-morning-paul.svelte';
	import Camera from '$lib/components/Camera.svelte';

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

	function openCincoIdentityGenerator() {
		windowManager.createWindow({
			id: 'cinco-identity-generator',
			title: 'Cinco Identity Generator',
			width: 500,
			height: 360,
			x: 300,
			y: 250,
			content: {
				component: CincoIdentityGenerator,
				props: {}
			}
		});
	}

	function goodMorningPaul() {
		windowManager.createWindow({
			id: 'good-morning-paul',
			title: `Paul's computer`,
			width: 400,
			height: 300,
			x: 100,
			y: 550,
			content: {
				component: GoodMorningPaul,
				props: {}
			}
		});
	}

	/** @param {number} n */
	function danceWindow(n) {
		windowManager.createWindow({
			id: 'dance-window-' + n,
			title: `Paul's computer`,
			width: 400,
			height: 300,
			x: 100,
			y: 550,
			content: `
            <video src="/celeryman_dance_1.mp4" autoplay loop></video>`
		});
	}

	function openCamera() {
		windowManager.createWindow({
			id: 'camera',
			title: 'Camera',
			width: 500,
			height: 400,
			x: 200,
			y: 100,
			content: {
				component: Camera,
				props: {}
			}
		});
	}
</script>

<div class="desktop">
	<div class="desktop-icons">
		<div class="icon" onclick={openCamera}>
			<div class="icon-image">📹</div>
			<div class="icon-label">Camera</div>
		</div>
		<div class="icon" onclick={() => danceWindow(1)}>
			<div class="icon-image">🕺</div>
			<div class="icon-label">Dance</div>
		</div>
		<div class="icon" onclick={goodMorningPaul}>
			<div class="icon-image">👋</div>
			<div class="icon-label">Good Morning Paul</div>
		</div>

		<div class="icon" onclick={openCincoIdentityGenerator}>
			<div class="icon-image">👤</div>
			<div class="icon-label">Cinco Identity Generator</div>
		</div>

		<div class="icon" onclick={openNotepad}>
			<div class="icon-image">📝</div>
			<div class="icon-label">Notepad</div>
		</div>

		<div class="icon" onclick={openCalculator}>
			<div class="icon-image">🧮</div>
			<div class="icon-label">Calculator</div>
		</div>

		<div class="icon" onclick={openAbout}>
			<div class="icon-image">ℹ️</div>
			<div class="icon-label">About</div>
		</div>

		<div class="icon" onclick={openTaskbar}>
			<div class="icon-image">📋</div>
			<div class="icon-label">Task Manager</div>
		</div>
	</div>

	<div class="taskbar">
		<button class="start-button">
			<span class="start-logo">🪟</span>
			Start
		</button>

		<div class="taskbar-buttons">
			{#each windowManager.windows as window (window.id)}
				<button
					class="taskbar-button"
					class:active={windowManager.activeWindowId === window.id}
					onclick={() => windowManager.focusWindow(window.id)}
				>
					{window.title}
				</button>
			{/each}
		</div>

		<div class="system-tray">
			<span class="time"
				>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span
			>
		</div>
	</div>
</div>

<WindowManager />

<style>
	.desktop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-image:
			radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
			radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
		font-family: 'MS Sans Serif', sans-serif;
		overflow: hidden;
	}

	.desktop-icons {
		position: absolute;
		top: 20px;
		left: 20px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.icon {
		width: 64px;
		text-align: center;
		cursor: pointer;
		padding: 4px;
		border: 1px solid transparent;
		color: white;
		text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8);
	}

	.icon:hover {
		background: rgba(255, 255, 255, 0.1);
		border: 1px dotted white;
	}

	.icon-image {
		font-size: 32px;
		margin-bottom: 4px;
	}

	.icon-label {
		font-size: 11px;
		word-wrap: break-word;
		line-height: 1.2;
	}

	.taskbar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 28px;
		background: #c0c0c0;
		border-top: 1px solid #dfdfdf;
		display: flex;
		align-items: center;
		padding: 2px;
		box-shadow: 0 -1px 3px rgba(0, 0, 0, 0.2);
	}

	.start-button {
		height: 24px;
		padding: 0 8px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 11px;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.start-button:active {
		border: 1px inset #c0c0c0;
	}

	.start-logo {
		font-size: 14px;
	}

	.taskbar-buttons {
		flex: 1;
		display: flex;
		gap: 2px;
		margin-left: 4px;
	}

	.taskbar-button {
		height: 22px;
		padding: 0 8px;
		border: 1px outset #c0c0c0;
		background: #c0c0c0;
		font-size: 11px;
		cursor: pointer;
		max-width: 150px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.taskbar-button.active {
		border: 1px inset #c0c0c0;
		background: #a0a0a0;
	}

	.taskbar-button:hover:not(.active) {
		background: #d4d0c8;
	}

	.system-tray {
		height: 24px;
		padding: 0 8px;
		border: 1px inset #c0c0c0;
		background: #c0c0c0;
		display: flex;
		align-items: center;
		font-size: 11px;
		min-width: 60px;
	}

	.time {
		font-family: 'Courier New', monospace;
	}
</style>
