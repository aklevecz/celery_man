const testSD15 = {
	3: {
		inputs: {
			seed: 171636503449870,
			steps: 20,
			cfg: 8,
			sampler_name: 'euler',
			scheduler: 'normal',
			denoise: 1,
			model: ['4', 0],
			positive: ['6', 0],
			negative: ['7', 0],
			latent_image: ['5', 0]
		},
		class_type: 'KSampler',
		_meta: {
			title: 'KSampler'
		}
	},
	4: {
		inputs: {
			ckpt_name: 'v1-5-pruned-emaonly-fp16.safetensors'
		},
		class_type: 'CheckpointLoaderSimple',
		_meta: {
			title: 'Load Checkpoint'
		}
	},
	5: {
		inputs: {
			width: 512,
			height: 512,
			batch_size: 1
		},
		class_type: 'EmptyLatentImage',
		_meta: {
			title: 'Empty Latent Image'
		}
	},
	6: {
		inputs: {
			text: 'beautiful scenery nature glass bottle landscape, , purple galaxy bottle,',
			clip: ['4', 1]
		},
		class_type: 'CLIPTextEncode',
		_meta: {
			title: 'CLIP Text Encode (Prompt)'
		}
	},
	7: {
		inputs: {
			text: 'text, watermark',
			clip: ['4', 1]
		},
		class_type: 'CLIPTextEncode',
		_meta: {
			title: 'CLIP Text Encode (Prompt)'
		}
	},
	8: {
		inputs: {
			samples: ['3', 0],
			vae: ['4', 2]
		},
		class_type: 'VAEDecode',
		_meta: {
			title: 'VAE Decode'
		}
	},
	9: {
		inputs: {
			filename_prefix: 'ComfyUI',
			images: ['8', 0]
		},
		class_type: 'SaveImage',
		_meta: {
			title: 'Save Image'
		}
	}
};

const testText = {
	1: {
		inputs: {
			preview: 'Woof!\n',
			source: ['3', 0]
		},
		class_type: 'PreviewAny',
		_meta: {
			title: 'Preview Any'
		}
	},
	3: {
		inputs: {
			prompt: 'bark like a dog',
			api_key: '',
			model: 'gemini-2.0-flash-lite-001',
			temperature: 0.7,
			max_tokens: 4096,
			seed: 1874599436
		},
		class_type: 'GeminiTextNode',
		_meta: {
			title: 'Gemini Text Generator'
		}
	}
};

const celeryManoriginal = {
	1: {
		inputs: {
			enabled: true,
			swap_model: 'inswapper_128.onnx',
			facedetection: 'retinaface_resnet50',
			face_restore_model: 'none',
			face_restore_visibility: 1,
			codeformer_weight: 0.5,
			detect_gender_input: 'no',
			detect_gender_source: 'no',
			input_faces_index: '0',
			source_faces_index: '0',
			console_log_level: 1,
			input_image: ['5', 0],
			source_image: ['2', 0]
		},
		class_type: 'ReActorFaceSwap',
		_meta: {
			title: 'ReActor 🌌 Fast Face Swap'
		}
	},
	2: {
		inputs: {
			image: 'face.png'
		},
		class_type: 'LoadImage',
		_meta: {
			title: 'Load Image'
		}
	},
	5: {
		inputs: {
			video: 'celeryman_dance_4.mp4',
			force_rate: 0,
			custom_width: 0,
			custom_height: 0,
			frame_load_cap: 0,
			skip_first_frames: 0,
			select_every_nth: 1,
			format: 'AnimateDiff'
		},
		class_type: 'VHS_LoadVideo',
		_meta: {
			title: 'Load Video (Upload) 🎥🅥🅗🅢'
		}
	},
	6: {
		inputs: {
			frame_rate: 24,
			loop_count: 0,
			filename_prefix: 'AnimateDiff',
			format: 'image/gif',
			pingpong: false,
			save_output: false,
			images: ['1', 0]
		},
		class_type: 'VHS_VideoCombine',
		_meta: {
			title: 'Video Combine 🎥🅥🅗🅢'
		}
	}
};

const celeryMan2 = {
	1: {
		inputs: {
			enabled: true,
			swap_model: 'inswapper_128.onnx',
			facedetection: 'retinaface_resnet50',
			face_restore_model: 'none',
			face_restore_visibility: 1,
			codeformer_weight: 0.5500000000000002,
			detect_gender_input: 'no',
			detect_gender_source: 'no',
			input_faces_index: '0',
			source_faces_index: '0',
			console_log_level: 1,
			input_image: ['5', 0],
			source_image: ['2', 0]
		},
		class_type: 'ReActorFaceSwap',
		_meta: {
			title: 'ReActor 🌌 Fast Face Swap'
		}
	},
	6: {
		inputs: {
			frame_rate: 24,
			loop_count: 0,
			filename_prefix: 'AnimateDiff',
			format: 'image/gif',
			pingpong: false,
			save_output: false,
			images: ['1', 0]
		},
		class_type: 'VHS_VideoCombine',
		_meta: {
			title: 'Video Combine 🎥🅥🅗🅢'
		}
	},
	5: {
		inputs: {
			video: '/workspace/ComfyUI/input/tayne_intro.mp4',
			force_rate: 0,
			custom_width: 0,
			custom_height: 0,
			frame_load_cap: 0,
			skip_first_frames: 0,
			select_every_nth: 1,
			format: 'AnimateDiff'
		},
		class_type: 'VHS_LoadVideoPath',
		_meta: {
			title: 'Load Video (Path) 🎥🅥🅗🅢'
		}
	},
	2: {
		inputs: {
			image: '/workspace/ComfyUI/input/canvas_image.png',
			custom_width: 0,
			custom_height: 0
		},
		class_type: 'VHS_LoadImagePath',
		_meta: {
			title: 'Load Image (Path) 🎥🅥🅗🅢'
		}
	}
};

const celeryMan = {
	1: {
		inputs: {
			enabled: true,
			swap_model: 'inswapper_128.onnx',
			facedetection: 'retinaface_resnet50',
			face_restore_model: 'none',
			face_restore_visibility: 1,
			codeformer_weight: 0.5500000000000002,
			detect_gender_input: 'no',
			detect_gender_source: 'no',
			input_faces_index: '0',
			source_faces_index: '0',
			console_log_level: 1,
			input_image: ['8', 0],
			source_image: ['9', 0]
		},
		class_type: 'ReActorFaceSwap',
		_meta: {
			title: 'ReActor 🌌 Fast Face Swap'
		}
	},
	6: {
		inputs: {
			frame_rate: 24,
			loop_count: 0,
			filename_prefix: 'AnimateDiff',
			format: 'image/gif',
			pingpong: false,
			save_output: false,
			images: ['1', 0]
		},
		class_type: 'VHS_VideoCombine',
		_meta: {
			title: 'Video Combine 🎥🅥🅗🅢'
		}
	},
	8: {
		inputs: {
			video: '/workspace/ComfyUI/input/tayne_intro.mp4',
			force_rate: 0,
			custom_width: 0,
			custom_height: 0,
			frame_load_cap: 0,
			skip_first_frames: 0,
			select_every_nth: 1,
			format: 'AnimateDiff'
		},
		class_type: 'VHS_LoadVideoPath',
		_meta: {
			title: 'Load Video (Path) 🎥🅥🅗🅢'
		}
	},
	9: {
		inputs: {
			image: '/workspace/ComfyUI/input/canvas_image.png',
			custom_width: 0,
			custom_height: 0
		},
		class_type: 'VHS_LoadImagePath',
		_meta: {
			title: 'Load Image (Path) 🎥🅥🅗🅢'
		}
	}
};
export { testSD15, testText, celeryMan };
