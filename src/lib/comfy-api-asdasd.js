import { fetchUrl } from "$lib";
import { testText } from "./prompts";

async function queuePrompt(promptText = testText) {
	const prompt = { ...promptText };
	const p = {
		prompt: prompt,
		client_id: window.comfyClientId // Add this
	};
	// If the workflow contains API nodes, you can add a Comfy API key to the `extra_data` field of the payload.
	// p.extra_data = {
	//     api_key_comfy_org: "comfyui-87d01e28d*******************************************************"  // replace with real key
	// };
	// See: https://docs.comfy.org/tutorials/api-nodes/overview
	// Generate a key here: https://platform.comfy.org/login

	const response = await fetch(`${fetchUrl}/prompt`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(p)
	});

    return response
}

export { queuePrompt }