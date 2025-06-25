import { GoogleGenAI, Type } from '@google/genai';
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
					'The exact name of the entity/character the user wants to see (e.g., "Celery Man", "Paul Rudd", "Tayne")'
			},
			type_of_dance: {
				type: Type.STRING,
				description:
					'The specific type of dance requested, if mentioned (e.g., "flarhgunnstow", "sequence", "hat wobble")'
			}
		},
		required: ['user_message', 'dancer_name']
	}
};
function createAgent() {
	const genAI = new GoogleGenAI({ apiKey: PUBLIC_GEMINI_API_KEY });

	let state = $state('idle');
	/** @type {Message[]} */
	let messages = $state([]);
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
		 * @param {Function} [cb] - An optional callback function to be called when content generation is complete.
		 * @returns {Promise<void>} - A promise that resolves when content generation is complete.
		 */

		sendChatMessage: async (prompt, cb) => {
			const enhancedPrompt = `
You are a computer that responds to user commands. When the user says "computer" followed by a request to see/show/display an entity or character, you should call the show_entity function.

ALWAYS call the show_entity function when you detect:
- "show me [name]"
- "display [name]" 
- "I want to see [name]"
- "give me [name]"
- Any variation asking to see a specific entity

Examples that should trigger the function:
- "computer, show me Celery Man please" → call show_entity with dancer_name: "Celery Man"
- "computer, display Paul Rudd" → call show_entity with dancer_name: "Paul Rudd"
- "computer, I want to see Tayne doing flarhgunnstow" → call show_entity with dancer_name: "Tayne", type_of_dance: "flarhgunnstow"

User message: "${prompt}"

If this message contains a request to show/display an entity, call the show_entity function with the appropriate parameters.`;
			const result = await genAI.models.generateContent({
				model: geminiModels.flash25,
				contents: enhancedPrompt,
				config: {
					temperature: 0.1,
					maxOutputTokens: 200,
					tools: [
						{
							functionDeclarations: [generateDancerFunction]
						}
					]
				}
			});
			const functionCalls = result.functionCalls;
			console.log(functionCalls);
			if (functionCalls && functionCalls.length > 0) {
				const functionCall = functionCalls[0];
				if (functionCall.name === 'show_entity' && functionCall.args) {
					console.log(functionCall.args);
					const dancerNameRaw = functionCall.args.dancer_name;
					const dancerType = functionCall.args.type_of_dance;

					if (typeof dancerNameRaw === 'string') {
						/** @type {'celeryman' | 'oyster' | 'tayne' | null} */
						let dancer = null;
						if (dancerNameRaw.toLowerCase().includes('celery')) {
							dancer = 'celeryman';
						}
						if (dancerNameRaw.toLowerCase().includes('oyster')) {
							dancer = 'oyster';
						}
						if (dancerNameRaw.toLowerCase().includes('tayne')) {
							dancer = 'tayne';
						}
						const message = `I want to see a ${dancerType} dancer named ${dancer}.`;
						console.log(message);
						cb && cb(dancer);
					}
				}
			}
		}
	};
	return agent;
}

const agent = createAgent();

export default agent;
