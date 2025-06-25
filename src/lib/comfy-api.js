// import { PUBLIC_COMFYUI_API_KEY } from '$env/static/public';
// import { fetchUrl } from '$lib';
// import { flow } from './prompts';

import { fetchUrl } from "$lib";
import { celeryMan } from "./prompts";

// const host = '127.0.0.1:8000';

/**
 * Uploads an image to the server and returns the name of the uploaded image.
 * @param {Blob} imageBlob - The image blob to be uploaded.
 * @param {string} [filename='canvas_image.png'] - The filename to be used for the uploaded image.
 * @throws {Error} - If the image upload fails.
 * @returns {Promise<string>} - The name of the uploaded image.
 */
async function uploadImage(imageBlob, filename = 'canvas_image.png') {
	const formData = new FormData();
	formData.append('image', imageBlob, filename);
	formData.append('type', 'input');

	const response = await fetch(`${fetchUrl}/upload/image`, {
		method: 'POST',
		body: formData
	});

	if (!response.ok) {
		throw new Error('Failed to upload image');
	}

	const result = await response.json();
	return result.name; // This is the filename we need
}

/**
 * Queues a prompt for processing by uploading an image if provided and sending a workflow to the server.
 *
 * @param {Object} params - The parameters for the queue prompt.
 * @param {*} [params.workflow=flow] - The workflow configuration to be sent.
 * @param {Blob} [params.imageBlob] - An optional image blob to be uploaded.
 * @param {string} params.prompt - The prompt to be included in the workflow.
 *
 * @returns {Promise<Response>} - The response from the server after queuing the prompt.
 *
 * @throws {Error} - Throws an error if the image upload or fetch request fails.
 */

async function queuePrompt({ workflow = celeryMan, imageBlob = null, prompt  = '' }) {
	console.log("running queue")
	// If we have an image, upload it first and get the filename
	if (imageBlob) {
		try {
			console.log('Uploading image...');
			const uploadedFilename = await uploadImage(imageBlob);
			workflow['2']['inputs']['image'] = uploadedFilename;
		} catch (error) {
			console.error('Error uploading image:', error);
			throw error;
		}
	}

	// workflow['5']['inputs'].prompt = prompt;
	// workflow['5']['inputs'].seed = Math.floor(Math.random() * 1000000);
	const p = {
		prompt: workflow,
		client_id: window.comfyClientId,
		// extra_data: {
		// 	api_key_comfy_org: PUBLIC_COMFYUI_API_KEY
		// }
	};
	console.log(`Sending prompt: ${JSON.stringify(p)}`);

	const response = await fetch(`${fetchUrl}/prompt`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(p)
	});

	if (!response.ok) {
		const data = await response.json();
		console.log(data)
		throw new Error('Failed to queue prompt');
	}
	return response;
}

async function getHistory() {
	const response = await fetch(`${fetchUrl}/history`);
	return response.json();
}

/**
 * Constructs a URL to view an image on the server.
 * @param {Object} params - The parameters for the image URL.
 * @param {string} params.filename - The name of the image file.
 * @param {string} params.type - The type of the image.
 * @param {string} params.subfolder - The subfolder where the image is located.
 * @returns {string} - A URL string to access the image.
 */

function getImgUrl({ filename, type, subfolder }) {
	const url = `${fetchUrl}/api/view?filename=${filename}&type=${type}&subfolder=${subfolder}`;
	return url;
}

export { queuePrompt, getHistory, getImgUrl };
