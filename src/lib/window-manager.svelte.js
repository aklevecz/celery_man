function createWindowManager() {
	let windows = $state([]);
	let activeWindowId = $state(null);
	let zIndexCounter = 1000;

	const visibleWindows = $derived(windows.filter(w => !w.isMinimized));

	function createWindow({ id, title, content, width = 400, height = 300, x = 100, y = 100 }) {
		const windowId = id || `window-${Date.now()}`;
		
		const existingWindow = windows.find(w => w.id === windowId);
		if (existingWindow) {
			focusWindow(windowId);
			return windowId;
		}

		const newWindow = {
			id: windowId,
			title,
			content,
			width,
			height,
			x,
			y,
			zIndex: ++zIndexCounter,
			isMinimized: false,
			isMaximized: false,
			originalBounds: null
		};

		windows.push(newWindow);
		activeWindowId = windowId;
		
		return windowId;
	}

	function closeWindow(windowId) {
		const windowIndex = windows.findIndex(w => w.id === windowId);
		if (windowIndex === -1) return;

		windows.splice(windowIndex, 1);
		
		if (activeWindowId === windowId) {
			activeWindowId = windows.length > 0 ? windows[windows.length - 1].id : null;
		}
	}

	function focusWindow(windowId) {
		const window = windows.find(w => w.id === windowId);
		if (!window) return;

		if (window.isMinimized) {
			window.isMinimized = false;
		}
		window.zIndex = ++zIndexCounter;
		activeWindowId = windowId;
	}

	function minimizeWindow(windowId) {
		const window = windows.find(w => w.id === windowId);
		if (!window) return;

		window.isMinimized = true;

		if (activeWindowId === windowId) {
			const visibleWindowsList = windows.filter(w => !w.isMinimized);
			activeWindowId = visibleWindowsList.length > 0 
				? visibleWindowsList[visibleWindowsList.length - 1].id 
				: null;
		}
	}

	function maximizeWindow(windowId) {
		const window = windows.find(w => w.id === windowId);
		if (!window) return;

		if (window.isMaximized) {
			// Restore window
			if (window.originalBounds) {
				window.x = window.originalBounds.x;
				window.y = window.originalBounds.y;
				window.width = window.originalBounds.width;
				window.height = window.originalBounds.height;
			}
			window.isMaximized = false;
			window.originalBounds = null;
		} else {
			// Maximize window
			window.originalBounds = {
				x: window.x,
				y: window.y,
				width: window.width,
				height: window.height
			};
			window.x = 0;
			window.y = 0;
			window.width = (typeof globalThis !== 'undefined' && globalThis.innerWidth) || 800;
			window.height = (typeof globalThis !== 'undefined' && globalThis.innerHeight) || 600;
			window.isMaximized = true;
		}
		focusWindow(windowId);
	}

	function moveWindow(windowId, x, y) {
		const window = windows.find(w => w.id === windowId);
		if (!window || window.isMaximized) return;

		window.x = x;
		window.y = y;
	}

	function resizeWindow(windowId, width, height) {
		const window = windows.find(w => w.id === windowId);
		if (!window || window.isMaximized) return;

		window.width = Math.max(200, width);
		window.height = Math.max(100, height);
	}

	return {
		get windows() { return windows; },
		get activeWindowId() { return activeWindowId; },
		get visibleWindows() { return visibleWindows; },
		createWindow,
		closeWindow,
		focusWindow,
		minimizeWindow,
		maximizeWindow,
		moveWindow,
		resizeWindow
	};
}

export const windowManager = createWindowManager();