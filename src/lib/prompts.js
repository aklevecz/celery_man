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

// 6 is prompt
// 59 is image

const flux_kontext = {
	6: {
		inputs: {
			text: 'put the man in a dress',
			clip: ['11', 0]
		},
		class_type: 'CLIPTextEncode',
		_meta: {
			title: 'CLIP Text Encode (Positive Prompt)'
		}
	},
	8: {
		inputs: {
			samples: ['13', 0],
			vae: ['10', 0]
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
	},
	10: {
		inputs: {
			vae_name: 'ae.safetensors'
		},
		class_type: 'VAELoader',
		_meta: {
			title: 'Load VAE'
		}
	},
	11: {
		inputs: {
			clip_name1: 't5/t5xxl_fp16.safetensors',
			clip_name2: 'clip_l.safetensors',
			type: 'flux',
			device: 'default'
		},
		class_type: 'DualCLIPLoader',
		_meta: {
			title: 'DualCLIPLoader'
		}
	},
	12: {
		inputs: {
			unet_name: 'flux-kontext-devfp8.safetensors',
			weight_dtype: 'default'
		},
		class_type: 'UNETLoader',
		_meta: {
			title: 'Load Diffusion Model'
		}
	},
	13: {
		inputs: {
			noise: ['25', 0],
			guider: ['22', 0],
			sampler: ['16', 0],
			sigmas: ['17', 0],
			latent_image: ['27', 0]
		},
		class_type: 'SamplerCustomAdvanced',
		_meta: {
			title: 'SamplerCustomAdvanced'
		}
	},
	16: {
		inputs: {
			sampler_name: 'euler'
		},
		class_type: 'KSamplerSelect',
		_meta: {
			title: 'KSamplerSelect'
		}
	},
	17: {
		inputs: {
			scheduler: 'simple',
			steps: 20,
			denoise: 1,
			model: ['30', 0]
		},
		class_type: 'BasicScheduler',
		_meta: {
			title: 'BasicScheduler'
		}
	},
	22: {
		inputs: {
			model: ['30', 0],
			conditioning: ['42', 0]
		},
		class_type: 'BasicGuider',
		_meta: {
			title: 'BasicGuider'
		}
	},
	25: {
		inputs: {
			noise_seed: 389455300471460
		},
		class_type: 'RandomNoise',
		_meta: {
			title: 'RandomNoise'
		}
	},
	26: {
		inputs: {
			guidance: 2.5,
			conditioning: ['6', 0]
		},
		class_type: 'FluxGuidance',
		_meta: {
			title: 'FluxGuidance'
		}
	},
	27: {
		inputs: {
			width: 1024,
			height: 1024,
			batch_size: 1
		},
		class_type: 'EmptySD3LatentImage',
		_meta: {
			title: 'EmptySD3LatentImage'
		}
	},
	30: {
		inputs: {
			max_shift: 1.15,
			base_shift: 0.5,
			width: 1024,
			height: 1024,
			model: ['12', 0]
		},
		class_type: 'ModelSamplingFlux',
		_meta: {
			title: 'ModelSamplingFlux'
		}
	},
	39: {
		inputs: {
			pixels: ['40', 0],
			vae: ['10', 0]
		},
		class_type: 'VAEEncode',
		_meta: {
			title: 'VAE Encode'
		}
	},
	40: {
		inputs: {
			image: ['59', 0]
		},
		class_type: 'FluxKontextImageScale',
		_meta: {
			title: 'FluxKontextImageScale'
		}
	},
	42: {
		inputs: {
			conditioning: ['26', 0],
			latent: ['39', 0]
		},
		class_type: 'ReferenceLatent',
		_meta: {
			title: 'ReferenceLatent'
		}
	},
	59: {
		inputs: {
			image: '/workspace/ComfyUI/input/download (3).png',
			custom_width: 0,
			custom_height: 0
		},
		class_type: 'VHS_LoadImagePath',
		_meta: {
			title: 'Load Image (Path) 🎥🅥🅗🅢'
		}
	}
};
export { testSD15, testText, celeryMan, flux_kontext };
