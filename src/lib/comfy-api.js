// import { PUBLIC_COMFYUI_API_KEY } from '$env/static/public';
// import { fetchUrl } from '$lib';
// import { flow } from './prompts';

import { fetchUrl } from '$lib';
import { celeryMan, flux_kontext } from './prompts';

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
 * @param {Blob | null} [params.imageBlob] - An optional image blob to be uploaded.
 * @param {string} [params.prompt] - The prompt to be included in the workflow.
 * @param {string} [params.dancer] - The dancer to be included in the workflow.
 *
 * @returns {Promise<Response>} - The response from the server after queuing the prompt.
 *
 * @throws {Error} - Throws an error if the image upload or fetch request fails.
 */

async function queuePrompt({
	workflow = celeryMan,
	imageBlob = null,
	prompt = '',
	dancer = 'celeryman'
} = {}) {
	console.log('running queue');
	// If we have an image, upload it first and get the filename
	if (imageBlob) {
		try {
			console.log('Uploading image...');
			const uploadedFilename = await uploadImage(imageBlob);
			// workflow['2']['inputs']['image'] = `/workspace/ComfyUI/input/${uploadedFilename}`;
			workflow['2']['inputs']['image'] = `${uploadedFilename}`;
		} catch (error) {
			console.error('Error uploading image:', error);
			throw error;
		}
	}

	// workflow['5']['inputs'].prompt = prompt;
	// workflow['5']['inputs'].seed = Math.floor(Math.random() * 1000000);

	let parsedDancer = dancer.toLowerCase();

	if (dancer === 'tame') {
		parsedDancer = 'tayne';
	}

	if (dancer === '10') {
		parsedDancer = 'tayne';
	}

	const allVideos = {
		celeryman: [
			'celeryman_dance_1.mp4',
			'celeryman_dance_2.mp4',
			'celeryman_dance_3.mp4',
			'celeryman_dance_4.mp4'
		],
		tayne: [
			'tayne_flarg.mp4',
			'tayne_hatwobble.mp4',
			'tayne_intro.mp4',
			'tayne_kick.mp4',
			'tayne_nsfw.mp4',
			'tayne_punch.mp4',
			'tayne_squat.mp4'
		],
		oyster: ['oyster_1.mp4', 'oyster_2.mp4']
	};
	// @ts-ignore
	const dancersOptions = allVideos[parsedDancer];
	console.log(dancersOptions);
	const dancerVideo = dancersOptions[Math.floor(Math.random() * dancersOptions.length)];
	// workflow['5'].inputs.video = `/workspace/ComfyUI/input/${dancerVideo}`;
	workflow['5'].inputs.video = `dancing_videos/${dancerVideo}`;

	const p = {
		prompt: workflow,
		client_id: window.comfyClientId
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
		console.log(data);
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

/**
 * Queues a Flux prompt for processing by uploading an image if provided and sending a Flux workflow to the server.
 *
 * @param {Object} params - The parameters for the queue prompt.
 * @param {*} [params.workflow=flux_kontext] - The workflow configuration to be sent.
 * @param {Blob | null} [params.imageBlob] - An optional image blob to be uploaded for reference.
 * @param {string} [params.prompt=''] - The text prompt to be included in the workflow.
 * @param {number} [params.width=1024] - The width of the generated image.
 * @param {number} [params.height=1024] - The height of the generated image.
 * @param {number} [params.steps=20] - The number of generation steps.
 * @param {number} [params.guidance=2.5] - The guidance scale for generation.
 * @param {number} [params.seed] - Optional seed for reproducible generation.
 *
 * @returns {Promise<Response>} - The response from the server after queuing the prompt.
 *
 * @throws {Error} - Throws an error if the image upload or fetch request fails.
 */
async function queueFluxPrompt({ workflow = flux_kontext, imageBlob = null, prompt = '' } = {}) {
	console.log('Running Flux queue');

	// Create a deep copy of the workflow to avoid modifying the original
	const workflowCopy = JSON.parse(JSON.stringify(workflow));

	// If we have an image, upload it first and update the reference image
	if (imageBlob) {
		try {
			console.log('Uploading reference image...');
			const uploadedFilename = await uploadImage(imageBlob, 'flux_reference.png');
			// workflowCopy['59']['inputs']['image'] = `/workspace/ComfyUI/input/${uploadedFilename}`;
			workflowCopy['59']['inputs']['image'] = `ComfyUI/input/${uploadedFilename}`;
		} catch (error) {
			console.error('Error uploading reference image:', error);
			throw error;
		}
	}

	// Update the text prompt
	if (prompt) {
		workflowCopy['6']['inputs']['text'] = prompt;
	}

	// Update image dimensions
	// workflowCopy['27']['inputs']['width'] = width;
	// workflowCopy['27']['inputs']['height'] = height;
	// workflowCopy['30']['inputs']['width'] = width;
	// workflowCopy['30']['inputs']['height'] = height;

	// // Update generation parameters
	// workflowCopy['17']['inputs']['steps'] = steps;
	// workflowCopy['26']['inputs']['guidance'] = guidance;

	// Update seed if provided, otherwise use random
	const finalSeed = Math.floor(Math.random() * 1000000000000000);
	workflowCopy['25']['inputs']['noise_seed'] = finalSeed;

	const payload = {
		prompt: workflowCopy,
		client_id: window.comfyClientId
	};

	console.log(`Sending Flux prompt: ${JSON.stringify(payload)}`);

	const response = await fetch(`${fetchUrl}/prompt`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(payload)
	});

	if (!response.ok) {
		const data = await response.json();
		console.log(data);
		throw new Error('Failed to queue Flux prompt');
	}
	return response;
}

export { queuePrompt, queueFluxPrompt, getHistory, getImgUrl };
