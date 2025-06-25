import { websocketUrl } from '$lib';

class WebSocketClient {
	constructor() {
		this.ws = null;
		this.clientId = 'your-client-id-' + Math.random();;
		this.connectionStatus = 'disconnected'
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
			const message = JSON.parse(event.data);
			console.log('Full message:', message);
			
			if (this.onMessage) {
				this.onMessage(message);
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
		// this.clientId = null;
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