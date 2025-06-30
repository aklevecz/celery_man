import { FunctionCallingConfigMode, GoogleGenAI, Type } from '@google/genai';
import { PUBLIC_GEMINI_API_KEY } from '$env/static/public';

const geminiModels = {
	exp25: 'gemini-2.5-pro-exp-03-25',
	flash25: 'gemini-2.5-flash-preview-05-20',
	flash20: 'gemini-2.0-flash-001'
};

/**
 * @typedef {Record<string, string>} Message
 * @property {string} role
 * @property {string} content
 *
 */

const generateDancerFunction = {
	name: 'show_entity',
	description:
		'Call this function when the user asks to see, show, or display a specific entity/character. Triggered by phrases like "show me [name]", "display [name]", "I want to see [name]", etc.',
	parameters: {
		type: Type.OBJECT,
		properties: {
			user_message: {
				type: Type.STRING,
				description: 'The complete original message from the user'
			},
			dancer_name: {
				type: Type.STRING,
				description:
					'The exact name of the entity/character the user wants to see (e.g., "Celery Man", "Paul Rudd", "Tayne", "Tame").'
			},
			type_of_dance: {
				type: Type.STRING,
				description:
					'The specific type of dance requested, if mentioned (e.g., "flarhgunnstow", "sequence", "hat wobble")'
			},
			model_response: {
				type: Type.STRING,
				description:
					'A direct response from the model acknowledging the request (e.g. "Ok Paul", "Here is celery man Paul.", "Here you go Paul")'
			}
		},
		required: ['user_message', 'dancer_name', 'model_response']
	}
};

const editDancerFunction = {
	name: 'edit_entity',
	description:
		'Call this function when the user asks to edit, modify, change, or alter an entity/character appearance or attributes.',
	parameters: {
		type: Type.OBJECT,
		properties: {
			user_message: {
				type: Type.STRING,
				description: 'The complete original message from the user'
			},
			edit_prompt: {
				type: Type.STRING,
				description:
					'A prompt to be used in an image generation inference to edit the entity/character.'
			},
			dancer_name: {
				type: Type.STRING,
				description:
					'The exact name of the entity/character the user wants to edit (e.g., "Celery Man", "Paul Rudd", "Tayne", "Tame").'
			},
			model_response: {
				type: Type.STRING,
				description:
					'A direct response from the model acknowledging the request (e.g. "Ok Paul", "Here is celery man Paul.", "Here you go Paul")'
			}
		},
		required: ['user_message', 'edit_prompt', 'dancer_name', 'model_response']
	}
};

function createAgent() {
	const genAI = new GoogleGenAI({ apiKey: PUBLIC_GEMINI_API_KEY });

	let state = $state('idle');
	/** @type {Message[]} */
	let messages = $state([]);

	// Improved dancer name mapping with more variations
	const dancerNameMapping = {
		celeryman: ['celery', 'celery man', 'celeryman'],
		tayne: ['tayne', 'tane', 'tain'],
		oyster: ['oyster', 'oysters'],
		paulrudd: ['paul', 'rudd', 'paul rudd']
	};

	/**
	 * Maps a raw dancer name to a normalized dancer key
	 * @param {string} rawName
	 * @returns {'celeryman' | 'oyster' | 'tayne' | 'paulrudd' | null}
	 */
	function normalizeDancerName(rawName) {
		const lowerName = rawName.toLowerCase();

		for (const [key, variations] of Object.entries(dancerNameMapping)) {
			for (const variation of variations) {
				if (lowerName.includes(variation)) {
					return /** @type {'celeryman' | 'oyster' | 'tayne' | 'paulrudd'} */ (key);
				}
			}
		}

		return null;
	}

	let agent = {
		get state() {
			return state;
		},
		set state(value) {
			state = value;
		},
		/**
		 * Sends a chat message to the GoogleGenAI model to generate content based on the provided prompt.
		 *
		 * @param {string} prompt - The prompt to be sent for content generation.
		 * @returns {Promise<{dancer: string | null, danceType: string | null, modelResponse: string | null, editPrompt: string | null, isEdit: boolean}>} - A promise that resolves when content generation is complete.
		 */

		sendChatMessage: async (prompt) => {
			// Improved system prompt with clearer instructions
			const systemPrompt = `You are a computer assistant that must ALWAYS call one of the available functions based on user commands.

IMPORTANT: You MUST call a function for EVERY user message. Never respond without calling a function.

Rules:
1. If the user wants to SEE, SHOW, DISPLAY, or VIEW an entity → call show_entity
2. If the user wants to EDIT, MODIFY, CHANGE, ALTER, or UPDATE an entity → call edit_entity
3. If unclear, default to show_entity

Key phrases for show_entity:
- "show me..."
- "display..."
- "I want to see..."
- "give me..."
- "can I see..."
- "let me see..."

Key phrases for edit_entity:
- "make [entity] [description]"
- "put [entity] in/wearing..."
- "change [entity] to..."
- "I want [entity] to be..."
- "add [something] to [entity]"
- "edit [entity]..."

Available entities: Celery Man, Paul Rudd, Tayne, Oyster

ALWAYS respond with a function call. Include a friendly acknowledgment in model_response.`;

			try {
				const result = await genAI.models.generateContent({
					model: geminiModels.flash20,
					contents: [
						{
							role: 'user',
							parts: [{ text: systemPrompt }]
						},
						{
							role: 'model',
							parts: [
								{ text: 'I understand. I will always call a function based on user commands.' }
							]
						},
						{
							role: 'user',
							parts: [{ text: prompt }]
						}
					],
					config: {
						temperature: 0.1, // Slightly increased for better function calling
						maxOutputTokens: 400,
						tools: [
							{
								functionDeclarations: [generateDancerFunction, editDancerFunction]
							}
						],
						toolConfig: {
							functionCallingConfig: {
								mode: FunctionCallingConfigMode.ANY, // Force function calling
								allowedFunctionNames: ['show_entity', 'edit_entity']
							}
						}
					}
				});

				// Log the full response for debugging
				console.log('Full Gemini response:', JSON.stringify(result, null, 2));

				const functionCalls = result.functionCalls;

				if (!functionCalls || functionCalls.length === 0) {
					console.error('No function calls returned by Gemini');
					// Fallback: try to parse the intent manually
					const lowerPrompt = prompt.toLowerCase();
					const isEdit =
						lowerPrompt.includes('edit') ||
						lowerPrompt.includes('wear') ||
						lowerPrompt.includes('put') ||
						lowerPrompt.includes('make') ||
						lowerPrompt.includes('change');

					return {
						dancer: null,
						danceType: null,
						modelResponse: "I couldn't process that command properly. Please try again.",
						editPrompt: null,
						isEdit: isEdit
					};
				}

				// Process all function calls (in case there are multiple)
				for (const functionCall of functionCalls) {
					console.log(`Processing function call: ${functionCall.name}`, functionCall.args);

					if (functionCall.name === 'show_entity' && functionCall.args) {
						const { dancer_name, type_of_dance, model_response } = functionCall.args;

						if (typeof dancer_name === 'string') {
							const dancer = normalizeDancerName(dancer_name);

							return {
								dancer,
								danceType: type_of_dance || null,
								modelResponse:
									(typeof model_response === 'string' ? model_response : null) ||
									`Showing ${dancer_name}`,
								editPrompt: null,
								isEdit: false
							};
						}
					}

					if (functionCall.name === 'edit_entity' && functionCall.args) {
						const { dancer_name, edit_prompt, model_response } = functionCall.args;

						if (typeof dancer_name === 'string' && typeof edit_prompt === 'string') {
							const dancer = normalizeDancerName(dancer_name);

							return {
								dancer,
								danceType: null,
								modelResponse:
									(typeof model_response === 'string' ? model_response : null) ||
									`Editing ${dancer_name}`,
								editPrompt: edit_prompt,
								isEdit: true
							};
						}
					}
				}

				// If we get here, function calls were malformed
				console.error('Function calls were malformed:', functionCalls);
				return {
					dancer: null,
					danceType: null,
					modelResponse: 'Function call was malformed. Please try again.',
					editPrompt: null,
					isEdit: false
				};
			} catch (error) {
				console.error('Error calling Gemini:', error);
				return {
					dancer: null,
					danceType: null,
					modelResponse: 'An error occurred. Please try again.',
					editPrompt: null,
					isEdit: false
				};
			}
		}
	};
	return agent;
}

const agent = createAgent();

export default agent;
