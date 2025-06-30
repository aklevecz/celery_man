import { websocketUrl } from '$lib';

class WebSocketClient {
	constructor() {
		this.ws = null;
		this.clientId = 'cid_' + Math.floor(Math.random() * 1000)
		this.connectionStatus = 'disconnected';
		this.isConnecting = false;
		this.onMessage = null;
		this.reconnectAttempts = 0;
		this.maxReconnectAttempts = 5;
		this.reconnectDelay = 1000;
	}

	connect() {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			return;
		}
		this.isConnecting = true;
		this.ws = new WebSocket(`${websocketUrl}/ws?clientId=${this.clientId}`);

		this.ws.addEventListener('open', () => {
			console.log('WebSocket connection opened');
			this.connectionStatus = 'connected';
			this.isConnecting = false;
			this.reconnectAttempts = 0;
			// Store clientId globally for other parts of the app
			if (typeof window !== 'undefined' && this.clientId) {
				window.comfyClientId = this.clientId;
			}
		});

		this.ws.addEventListener('close', () => {
			console.log('WebSocket connection closed');
			this.connectionStatus = 'disconnected';
			this.isConnecting = false;
			this.attemptReconnect();
		});

		this.ws.addEventListener('error', (error) => {
			console.error('WebSocket error:', error);
			this.connectionStatus = 'error';
			this.isConnecting = false;
		});

		this.ws.addEventListener('message', (event) => {
			// Handle string messages (JSON)
			if (typeof event.data === 'string') {
				try {
					const message = JSON.parse(event.data);
					if (message.type === 'crystools.monitor') {
						return;
					}
					console.log('JSON message:', message);
					if (this.onMessage) {
						this.onMessage(message);
					}
				} catch (error) {
					console.error('Error parsing JSON message:', error);
				}
			}
			// Handle binary messages (Blobs - usually images)
			else if (event.data instanceof Blob) {
				console.log('Blob size:', event.data.size, 'bytes');
				console.log('Blob type:', event.data.type);

				// Option 1: Parse as text (for JSON, CSV, XML, plain text, etc.)
				event.data
					.text()
					.then((textData) => {
						console.log('Blob as text:', textData);

						// Try parsing as JSON
						try {
							const jsonData = JSON.parse(textData);
							console.log('Blob contained JSON:', jsonData);
							if (this.onMessage) {
								this.onMessage(jsonData);
							}
						} catch (error) {
							// Not JSON, handle as plain text or other format
							console.log('Blob is plain text or other format:', textData);
							if (this.onMessage) {
								this.onMessage({ type: 'text', data: textData });
							}
						}
					})
					.catch((error) => {
						console.error('Error reading blob as text:', error);
					});
			} else {
				console.log('Unknown message type:', typeof event.data, event.data);
			}
		});
	}

	attemptReconnect() {
		if (this.reconnectAttempts < this.maxReconnectAttempts) {
			this.reconnectAttempts++;
			this.connectionStatus = 'reconnecting';
			setTimeout(() => {
				console.log(`Reconnection attempt ${this.reconnectAttempts}`);
				this.connect();
			}, this.reconnectDelay * this.reconnectAttempts);
		} else {
			console.log('Max reconnection attempts reached');
			this.connectionStatus = 'failed';
		}
	}

	disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
		this.connectionStatus = 'disconnected';
	}

	/**
	 * Sets the handler for WebSocket messages
	 * @param {Function} handler - Message handler function, called with the message object as argument
	 */
	setMessageHandler(handler) {
		this.onMessage = handler;
	}

	getConnectionStatus() {
		return this.connectionStatus;
	}

	getClientId() {
		return this.clientId;
	}

	isConnected() {
		return this.connectionStatus === 'connected';
	}
}

export const websocketClient = new WebSocketClient();
