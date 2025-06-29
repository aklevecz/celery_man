/**
 * @typedef {Object} FaceCoordinates
 * @property {number} x - X coordinate of face detection
 * @property {number} y - Y coordinate of face detection
 * @property {number} width - Width of face detection box
 * @property {number} height - Height of face detection box
 */

/**
 * @typedef {Object} EditedImage
 * @property {string} id - Unique identifier for the edited image
 * @property {string | null} cacheKey - Cache key for retrieving the image
 * @property {string} dataUrl - Base64 data URL of the image (for display)
 * @property {string} originalUrl - Original URL of the image
 * @property {string} prompt - Prompt used to generate the image
 * @property {string} timestamp - Timestamp when the image was created
 */

/**
 * @typedef {Object} GeneratedGif
 * @property {string} id - Unique identifier for the GIF
 * @property {string} url - URL of the generated GIF
 * @property {string} title - Display title for the GIF
 * @property {string} timestamp - Timestamp when the GIF was created
 * @property {string} [prompt] - Prompt used to generate the GIF
 * @property {string} [dancer] - Dancer type used in generation
 */

/**
 * @typedef {'face' | 'dancer-frame' | 'edited'} ImageType
 */

/**
 * @typedef {Object} GlobalImageSelection
 * @property {ImageType | null} selectedImageType - Type of currently selected image
 * @property {string | null} selectedImageId - ID of currently selected image
 */

/**
 * @typedef {Object} ImageInfo
 * @property {ImageType} type - Type of the image
 * @property {string} id - ID of the image
 * @property {string} title - Display title of the image
 * @property {string} dataUrl - Base64 data URL of the image
 * @property {string} timestamp - Timestamp when the image was created
 * @property {string} [prompt] - Prompt used for edited images
 */

/**
 * Creates and manages user data including face detection, dancer frames, and edited images
 * @returns {Object} User store with methods and getters for managing user data
 */
function createUser() {
    /** @type {{name: string}} */
    const user = $state({
        name: 'John Doe'
    })

    /** @type {{cacheKey: string | null, dataUrl: string, timestamp: string, coordinates: FaceCoordinates | null}} */
    const faceData = $state({
        cacheKey: null,
        dataUrl: '',
        timestamp: '',
        coordinates: null
    })

    /** @type {{cacheKey: string | null, dataUrl: string, timestamp: string, gifUrl: string}} */
    const dancerFrameData = $state({
        cacheKey: null,
        dataUrl: '',
        timestamp: '',
        gifUrl: ''
    })

    /** @type {{images: EditedImage[], selectedIndex: number}} */
    const editedImages = $state({
        images: [],
        selectedIndex: -1
    })

    /** @type {{gifs: GeneratedGif[], selectedIndex: number}} */
    const generatedGifs = $state({
        gifs: [],
        selectedIndex: -1
    })

    /** @type {GlobalImageSelection} */
    const globalSelection = $state({
        selectedImageType: null, // 'face', 'dancer-frame', 'edited'
        selectedImageId: null
    })

    const LOCAL_STORAGE_FACE_KEY = 'user_face_data'
    const LOCAL_STORAGE_NAME_KEY = 'user_name'
    const LOCAL_STORAGE_DANCER_FRAME_KEY = 'user_dancer_frame_data'
    const LOCAL_STORAGE_EDITED_IMAGES_KEY = 'user_edited_images'
    const LOCAL_STORAGE_GENERATED_GIFS_KEY = 'user_generated_gifs'
    const LOCAL_STORAGE_GLOBAL_SELECTION_KEY = 'user_global_selection'
    
    // Cache API constants
    const CACHE_NAME = 'celery-man-images'
    const MAX_EDITED_IMAGES = 20; // Increased since we're using Cache API now
    const MAX_GENERATED_GIFS = 50; // Maximum number of GIF URLs to store
    
    /**
     * Get or create the cache for storing images
     * @returns {Promise<Cache>}
     */
    async function getImageCache() {
        return await caches.open(CACHE_NAME);
    }
    
    /**
     * Generate a cache key for an image
     * @param {string} type - Image type (face, dancer-frame, edited)
     * @param {string} [id] - Optional ID for edited images
     * @returns {string}
     */
    function generateCacheKey(type, id = null) {
        const baseUrl = 'https://celery-man.local/images/';
        return id ? `${baseUrl}${type}/${id}` : `${baseUrl}${type}`;
    }
    
    /**
     * Store an image blob in cache and return the cache key
     * @param {string} type - Image type
     * @param {Blob} blob - Image blob to store
     * @param {string} [id] - Optional ID for edited images
     * @returns {Promise<string>} Cache key
     */
    async function storeImageInCache(type, blob, id = null) {
        const cache = await getImageCache();
        const cacheKey = generateCacheKey(type, id);
        const response = new Response(blob, {
            headers: {
                'Content-Type': blob.type || 'image/png'
            }
        });
        await cache.put(cacheKey, response);
        return cacheKey;
    }
    
    /**
     * Retrieve an image blob from cache
     * @param {string} cacheKey - Cache key to retrieve
     * @returns {Promise<Blob | null>}
     */
    async function getImageFromCache(cacheKey) {
        try {
            const cache = await getImageCache();
            const response = await cache.match(cacheKey);
            return response ? await response.blob() : null;
        } catch (error) {
            console.error('Error retrieving from cache:', error);
            return null;
        }
    }
    
    /**
     * Delete an image from cache
     * @param {string} cacheKey - Cache key to delete
     * @returns {Promise<boolean>}
     */
    async function deleteImageFromCache(cacheKey) {
        try {
            const cache = await getImageCache();
            return await cache.delete(cacheKey);
        } catch (error) {
            console.error('Error deleting from cache:', error);
            return false;
        }
    }
    
    /**
     * Convert blob to data URL for display
     * @param {Blob} blob - Blob to convert
     * @returns {Promise<string>}
     */
    async function blobToDataUrl(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Get all cache keys for this application
     * @returns {Promise<Request[]>}
     */
    async function getAllCacheKeys() {
        try {
            const cache = await getImageCache();
            return await cache.keys();
        } catch (error) {
            console.error('Error getting cache keys:', error);
            return [];
        }
    }

    /**
     * Clear entire image cache
     * @returns {Promise<boolean>}
     */
    async function clearImageCache() {
        try {
            return await caches.delete(CACHE_NAME);
        } catch (error) {
            console.error('Error clearing cache:', error);
            return false;
        }
    }

    /**
     * Load user data from localStorage on initialization
     */
    async function loadFromStorage() {
        if (typeof window !== 'undefined') {
            const savedName = localStorage.getItem(LOCAL_STORAGE_NAME_KEY);
            if (savedName) {
                user.name = savedName;
            }

            const savedFaceData = localStorage.getItem(LOCAL_STORAGE_FACE_KEY);
            if (savedFaceData) {
                try {
                    const parsed = JSON.parse(savedFaceData);
                    faceData.cacheKey = parsed.cacheKey || null;
                    faceData.timestamp = parsed.timestamp || '';
                    faceData.coordinates = parsed.coordinates || null;
                    
                    // Load data URL from cache if we have a cache key
                    if (faceData.cacheKey) {
                        const blob = await getImageFromCache(faceData.cacheKey);
                        if (blob) {
                            faceData.dataUrl = await blobToDataUrl(blob);
                        }
                    } else if (parsed.dataUrl) {
                        // Migration: if we have old dataUrl, keep it for now
                        faceData.dataUrl = parsed.dataUrl;
                    }
                } catch (error) {
                    console.error('Error loading face data from localStorage:', error);
                }
            }

            const savedDancerFrameData = localStorage.getItem(LOCAL_STORAGE_DANCER_FRAME_KEY);
            if (savedDancerFrameData) {
                try {
                    const parsed = JSON.parse(savedDancerFrameData);
                    dancerFrameData.cacheKey = parsed.cacheKey || null;
                    dancerFrameData.timestamp = parsed.timestamp || '';
                    dancerFrameData.gifUrl = parsed.gifUrl || '';
                    
                    // Load data URL from cache if we have a cache key
                    if (dancerFrameData.cacheKey) {
                        const blob = await getImageFromCache(dancerFrameData.cacheKey);
                        if (blob) {
                            dancerFrameData.dataUrl = await blobToDataUrl(blob);
                        }
                    } else if (parsed.dataUrl) {
                        // Migration: if we have old dataUrl, keep it for now
                        dancerFrameData.dataUrl = parsed.dataUrl;
                    }
                } catch (error) {
                    console.error('Error loading dancer frame data from localStorage:', error);
                }
            }

            const savedEditedImages = localStorage.getItem(LOCAL_STORAGE_EDITED_IMAGES_KEY);
            if (savedEditedImages) {
                try {
                    const parsed = JSON.parse(savedEditedImages);
                    const loadedImages = parsed.images || [];
                    
                    // Load data URLs from cache for each edited image
                    for (const image of loadedImages) {
                        if (image.cacheKey) {
                            const blob = await getImageFromCache(image.cacheKey);
                            if (blob) {
                                image.dataUrl = await blobToDataUrl(blob);
                            }
                        }
                        // If no cacheKey but has dataUrl, keep for migration
                    }
                    
                    editedImages.images = loadedImages;
                    editedImages.selectedIndex = parsed.selectedIndex || -1;
                } catch (error) {
                    console.error('Error loading edited images from localStorage:', error);
                }
            }

            const savedGeneratedGifs = localStorage.getItem(LOCAL_STORAGE_GENERATED_GIFS_KEY);
            if (savedGeneratedGifs) {
                try {
                    const parsed = JSON.parse(savedGeneratedGifs);
                    generatedGifs.gifs = parsed.gifs || [];
                    generatedGifs.selectedIndex = parsed.selectedIndex || -1;
                } catch (error) {
                    console.error('Error loading generated GIFs from localStorage:', error);
                }
            }

            const savedGlobalSelection = localStorage.getItem(LOCAL_STORAGE_GLOBAL_SELECTION_KEY);
            if (savedGlobalSelection) {
                try {
                    const parsed = JSON.parse(savedGlobalSelection);
                    globalSelection.selectedImageType = parsed.selectedImageType || null;
                    globalSelection.selectedImageId = parsed.selectedImageId || null;
                } catch (error) {
                    console.error('Error loading global selection from localStorage:', error);
                }
            }
        }
    }

    /**
     * Clean up old edited images to stay within limits
     */
    async function cleanupEditedImages() {
        // Remove oldest images if we exceed the limit
        while (editedImages.images.length > MAX_EDITED_IMAGES) {
            const removedImage = editedImages.images.shift();
            console.log(`Removed old edited image: ${removedImage?.id}`);
            
            // Delete from cache if we have a cache key
            if (removedImage?.cacheKey) {
                await deleteImageFromCache(removedImage.cacheKey);
            }
            
            // Adjust selected index if necessary
            if (editedImages.selectedIndex > 0) {
                editedImages.selectedIndex--;
            } else if (editedImages.selectedIndex === 0 && editedImages.images.length === 0) {
                editedImages.selectedIndex = -1;
            }
        }

        // Sort by timestamp and keep only the newest ones
        editedImages.images.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (editedImages.images.length > MAX_EDITED_IMAGES) {
            const imagesToRemove = editedImages.images.slice(MAX_EDITED_IMAGES);
            editedImages.images = editedImages.images.slice(0, MAX_EDITED_IMAGES);
            
            // Delete removed images from cache
            for (const image of imagesToRemove) {
                if (image.cacheKey) {
                    await deleteImageFromCache(image.cacheKey);
                }
            }
            
            // Reset selection if it's out of bounds
            if (editedImages.selectedIndex >= editedImages.images.length) {
                editedImages.selectedIndex = editedImages.images.length > 0 ? 0 : -1;
            }
        }
    }

    /**
     * Save current user data to localStorage (metadata only, images are in cache)
     */
    function saveToStorage() {
        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(LOCAL_STORAGE_NAME_KEY, user.name);
                
                const faceDataToSave = {
                    cacheKey: faceData.cacheKey,
                    timestamp: faceData.timestamp,
                    coordinates: faceData.coordinates
                };
                localStorage.setItem(LOCAL_STORAGE_FACE_KEY, JSON.stringify(faceDataToSave));

                const dancerFrameDataToSave = {
                    cacheKey: dancerFrameData.cacheKey,
                    timestamp: dancerFrameData.timestamp,
                    gifUrl: dancerFrameData.gifUrl
                };
                localStorage.setItem(LOCAL_STORAGE_DANCER_FRAME_KEY, JSON.stringify(dancerFrameDataToSave));

                // Only store metadata for edited images (no dataUrl)
                const editedImagesToSave = {
                    images: editedImages.images.map(img => ({
                        id: img.id,
                        cacheKey: img.cacheKey,
                        originalUrl: img.originalUrl,
                        prompt: img.prompt,
                        timestamp: img.timestamp
                    })),
                    selectedIndex: editedImages.selectedIndex
                };
                localStorage.setItem(LOCAL_STORAGE_EDITED_IMAGES_KEY, JSON.stringify(editedImagesToSave));

                const generatedGifsToSave = {
                    gifs: generatedGifs.gifs,
                    selectedIndex: generatedGifs.selectedIndex
                };
                localStorage.setItem(LOCAL_STORAGE_GENERATED_GIFS_KEY, JSON.stringify(generatedGifsToSave));

                const globalSelectionToSave = {
                    selectedImageType: globalSelection.selectedImageType,
                    selectedImageId: globalSelection.selectedImageId
                };
                localStorage.setItem(LOCAL_STORAGE_GLOBAL_SELECTION_KEY, JSON.stringify(globalSelectionToSave));

            } catch (error) {
                console.error('Error saving to localStorage:', error);
            }
        }
    }

    // Initialize from storage
    loadFromStorage();

    return {
        get name() {
            return user.name;
        },
        set name(value) {
            user.name = value;
            saveToStorage();
        },
        
        get faceDataUrl() {
            return faceData.dataUrl;
        },
        
        get faceTimestamp() {
            return faceData.timestamp;
        },
        
        get faceCoordinates() {
            return faceData.coordinates;
        },
        
        get hasFace() {
            return !!faceData.dataUrl;
        },

        /**
         * Set the user's face image and coordinates
         * @param {Blob} blob - Image blob of the face
         * @param {FaceCoordinates | null} [coordinates=null] - Face detection coordinates
         * @returns {Promise<void>}
         */
        async setFace(blob, coordinates = null) {
            try {
                // Delete old cache entry if it exists
                if (faceData.cacheKey) {
                    await deleteImageFromCache(faceData.cacheKey);
                }
                
                // Store in cache and get cache key
                const cacheKey = await storeImageInCache('face', blob);
                const dataUrl = await blobToDataUrl(blob);

                faceData.cacheKey = cacheKey;
                faceData.dataUrl = dataUrl;
                faceData.timestamp = new Date().toLocaleString();
                faceData.coordinates = coordinates;
                
                saveToStorage();
            } catch (error) {
                console.error('Error saving face to cache:', error);
                throw error;
            }
        },

        /**
         * Get the face image as a Blob
         * @returns {Promise<Blob | null>} - Promise that resolves to face blob or null
         */
        async getFaceBlob() {
            if (faceData.cacheKey) {
                return await getImageFromCache(faceData.cacheKey);
            }
            return null;
        },

        /**
         * Clear the saved face data
         */
        async clearFace() {
            if (faceData.cacheKey) {
                await deleteImageFromCache(faceData.cacheKey);
            }
            faceData.cacheKey = null;
            faceData.dataUrl = '';
            faceData.timestamp = '';
            faceData.coordinates = null;
            saveToStorage();
        },

        get dancerFrameDataUrl() {
            return dancerFrameData.dataUrl;
        },
        
        get dancerFrameTimestamp() {
            return dancerFrameData.timestamp;
        },
        
        get dancerFrameGifUrl() {
            return dancerFrameData.gifUrl;
        },
        
        get hasDancerFrame() {
            return !!dancerFrameData.dataUrl;
        },

        /**
         * Set the dancer frame image
         * @param {Blob} blob - Image blob of the dancer frame
         * @param {string} gifUrl - URL of the original GIF
         * @returns {Promise<void>}
         */
        async setDancerFrame(blob, gifUrl) {
            try {
                // Delete old cache entry if it exists
                if (dancerFrameData.cacheKey) {
                    await deleteImageFromCache(dancerFrameData.cacheKey);
                }
                
                // Store in cache and get cache key
                const cacheKey = await storeImageInCache('dancer-frame', blob);
                const dataUrl = await blobToDataUrl(blob);

                dancerFrameData.cacheKey = cacheKey;
                dancerFrameData.dataUrl = dataUrl;
                dancerFrameData.timestamp = new Date().toLocaleString();
                dancerFrameData.gifUrl = gifUrl;
                
                saveToStorage();
            } catch (error) {
                console.error('Error saving dancer frame to cache:', error);
                throw error;
            }
        },

        /**
         * Get the dancer frame image as a Blob
         * @returns {Promise<Blob | null>} - Promise that resolves to dancer frame blob or null
         */
        async getDancerFrameBlob() {
            if (dancerFrameData.cacheKey) {
                return await getImageFromCache(dancerFrameData.cacheKey);
            }
            return null;
        },

        /**
         * Clear the saved dancer frame data
         */
        async clearDancerFrame() {
            if (dancerFrameData.cacheKey) {
                await deleteImageFromCache(dancerFrameData.cacheKey);
            }
            dancerFrameData.cacheKey = null;
            dancerFrameData.dataUrl = '';
            dancerFrameData.timestamp = '';
            dancerFrameData.gifUrl = '';
            saveToStorage();
        },

        /**
         * Download the saved dancer frame image
         */
        downloadDancerFrame() {
            if (!this.hasDancerFrame) return;
            const link = document.createElement('a');
            link.download = `dancer-frame-${Date.now()}.png`;
            link.href = dancerFrameData.dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        /**
         * Download the saved face image
         */
        downloadFace() {
            if (!this.hasFace) return;
            const link = document.createElement('a');
            link.download = `face-${Date.now()}.png`;
            link.href = faceData.dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        // Edited images management
        get editedImages() {
            return editedImages.images;
        },

        get selectedEditedImage() {
            if (editedImages.selectedIndex >= 0 && editedImages.selectedIndex < editedImages.images.length) {
                return editedImages.images[editedImages.selectedIndex];
            }
            return null;
        },

        get selectedEditedImageIndex() {
            return editedImages.selectedIndex;
        },

        get hasEditedImages() {
            return editedImages.images.length > 0;
        },

        /**
         * Add a new edited image to the collection
         * @param {string} imageUrl - URL of the edited image
         * @param {string} [prompt=''] - Prompt used to generate the image
         * @returns {Promise<string | null>} - Promise that resolves to the image ID or null on error
         */
        async addEditedImage(imageUrl, prompt = '') {
            try {
                // Clean up old images before adding new one
                await cleanupEditedImages();
                
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                
                const imageId = `edited-${Date.now()}`;
                const cacheKey = await storeImageInCache('edited', blob, imageId);
                const dataUrl = await blobToDataUrl(blob);

                const newImage = {
                    id: imageId,
                    cacheKey: cacheKey,
                    dataUrl: dataUrl,
                    originalUrl: imageUrl,
                    prompt: prompt,
                    timestamp: new Date().toLocaleString()
                };

                editedImages.images.push(newImage);
                editedImages.selectedIndex = editedImages.images.length - 1; // Select the new image
                
                saveToStorage();
                return newImage.id;
            } catch (error) {
                console.error('Error adding edited image:', error);
                return null;
            }
        },

        /**
         * Select an edited image by index
         * @param {number} index - Index of the edited image to select
         */
        selectEditedImage(index) {
            if (index >= 0 && index < editedImages.images.length) {
                editedImages.selectedIndex = index;
                saveToStorage();
            }
        },

        /**
         * Get the currently selected edited image as a Blob
         * @returns {Promise<Blob | null>} - Promise that resolves to selected image blob or null
         */
        async getSelectedEditedImageBlob() {
            const selected = this.selectedEditedImage;
            if (!selected || !selected.cacheKey) return null;
            
            return await getImageFromCache(selected.cacheKey);
        },

        /**
         * Download an edited image by index
         * @param {number} index - Index of the edited image to download
         */
        downloadEditedImage(index) {
            if (index >= 0 && index < editedImages.images.length) {
                const image = editedImages.images[index];
                const link = document.createElement('a');
                link.download = `edited-image-${image.timestamp.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
                link.href = image.dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        },

        /**
         * Delete an edited image by index
         * @param {number} index - Index of the edited image to delete
         */
        async deleteEditedImage(index) {
            if (index >= 0 && index < editedImages.images.length) {
                const imageToDelete = editedImages.images[index];
                
                // Delete from cache if we have a cache key
                if (imageToDelete.cacheKey) {
                    await deleteImageFromCache(imageToDelete.cacheKey);
                }
                
                editedImages.images.splice(index, 1);
                
                // Adjust selected index
                if (editedImages.selectedIndex === index) {
                    editedImages.selectedIndex = editedImages.images.length > 0 ? Math.max(0, index - 1) : -1;
                } else if (editedImages.selectedIndex > index) {
                    editedImages.selectedIndex--;
                }
                
                saveToStorage();
            }
        },

        /**
         * Clear all edited images from the collection
         */
        async clearAllEditedImages() {
            // Delete all cached images
            for (const image of editedImages.images) {
                if (image.cacheKey) {
                    await deleteImageFromCache(image.cacheKey);
                }
            }
            
            editedImages.images = [];
            editedImages.selectedIndex = -1;
            saveToStorage();
        },

        // Generated GIFs management
        get generatedGifs() {
            return generatedGifs.gifs;
        },

        get selectedGeneratedGif() {
            if (generatedGifs.selectedIndex >= 0 && generatedGifs.selectedIndex < generatedGifs.gifs.length) {
                return generatedGifs.gifs[generatedGifs.selectedIndex];
            }
            return null;
        },

        get selectedGeneratedGifIndex() {
            return generatedGifs.selectedIndex;
        },

        get hasGeneratedGifs() {
            return generatedGifs.gifs.length > 0;
        },

        /**
         * Add a new generated GIF to the collection
         * @param {string} gifUrl - URL of the generated GIF
         * @param {string} [title=''] - Title for the GIF
         * @param {string} [prompt=''] - Prompt used to generate the GIF
         * @param {string} [dancer=''] - Dancer type used in generation
         * @returns {string} - The GIF ID
         */
        addGeneratedGif(gifUrl, title = '', prompt = '', dancer = '') {
            // Clean up old GIFs if we exceed the limit
            while (generatedGifs.gifs.length >= MAX_GENERATED_GIFS) {
                const removedGif = generatedGifs.gifs.shift();
                console.log(`Removed old generated GIF: ${removedGif?.id}`);
                
                // Adjust selected index if necessary
                if (generatedGifs.selectedIndex > 0) {
                    generatedGifs.selectedIndex--;
                } else if (generatedGifs.selectedIndex === 0 && generatedGifs.gifs.length === 0) {
                    generatedGifs.selectedIndex = -1;
                }
            }

            const newGif = {
                id: `gif-${Date.now()}`,
                url: gifUrl,
                title: title || `Generated GIF`,
                timestamp: new Date().toLocaleString(),
                prompt: prompt,
                dancer: dancer
            };

            generatedGifs.gifs.push(newGif);
            generatedGifs.selectedIndex = generatedGifs.gifs.length - 1; // Select the new GIF
            
            saveToStorage();
            return newGif.id;
        },

        /**
         * Select a generated GIF by index
         * @param {number} index - Index of the GIF to select
         */
        selectGeneratedGif(index) {
            if (index >= 0 && index < generatedGifs.gifs.length) {
                generatedGifs.selectedIndex = index;
                saveToStorage();
            }
        },

        /**
         * Delete a generated GIF by index
         * @param {number} index - Index of the GIF to delete
         */
        deleteGeneratedGif(index) {
            if (index >= 0 && index < generatedGifs.gifs.length) {
                generatedGifs.gifs.splice(index, 1);
                
                // Adjust selected index
                if (generatedGifs.selectedIndex === index) {
                    generatedGifs.selectedIndex = generatedGifs.gifs.length > 0 ? Math.max(0, index - 1) : -1;
                } else if (generatedGifs.selectedIndex > index) {
                    generatedGifs.selectedIndex--;
                }
                
                saveToStorage();
            }
        },

        /**
         * Clear all generated GIFs from the collection
         */
        clearAllGeneratedGifs() {
            generatedGifs.gifs = [];
            generatedGifs.selectedIndex = -1;
            saveToStorage();
        },

        // Global image selection management
        get selectedImageType() {
            return globalSelection.selectedImageType;
        },

        get selectedImageId() {
            return globalSelection.selectedImageId;
        },

        get hasGlobalSelection() {
            return !!globalSelection.selectedImageType && !!globalSelection.selectedImageId;
        },

        /**
         * Select an image globally (any type)
         * @param {ImageType} imageType - Type of image to select
         * @param {string} imageId - ID of the image to select
         */
        selectGlobalImage(imageType, imageId) {
            globalSelection.selectedImageType = imageType;
            globalSelection.selectedImageId = imageId;
            saveToStorage();
        },

        /**
         * Clear the global image selection
         */
        clearGlobalSelection() {
            globalSelection.selectedImageType = null;
            globalSelection.selectedImageId = null;
            saveToStorage();
        },

        /**
         * Get the globally selected image as a Blob
         * @returns {Promise<Blob | null>} - Promise that resolves to globally selected image blob or null
         */
        async getGloballySelectedImageBlob() {
            if (!this.hasGlobalSelection) return null;

            switch (globalSelection.selectedImageType) {
                case 'face':
                    return await this.getFaceBlob();
                case 'dancer-frame':
                    return await this.getDancerFrameBlob();
                case 'edited':
                    const editedImage = editedImages.images.find(img => img.id === globalSelection.selectedImageId);
                    if (editedImage && editedImage.cacheKey) {
                        return await getImageFromCache(editedImage.cacheKey);
                    }
                    return null;
                default:
                    return null;
            }
        },

        /**
         * Get information about the globally selected image
         * @returns {ImageInfo | null} - Information about the selected image or null
         */
        getGloballySelectedImageInfo() {
            if (!this.hasGlobalSelection) return null;

            switch (globalSelection.selectedImageType) {
                case 'face':
                    return {
                        type: 'face',
                        id: 'face',
                        title: 'Saved Face',
                        dataUrl: faceData.dataUrl,
                        timestamp: faceData.timestamp
                    };
                case 'dancer-frame':
                    return {
                        type: 'dancer-frame',
                        id: 'dancer-frame',
                        title: 'Dancer Frame',
                        dataUrl: dancerFrameData.dataUrl,
                        timestamp: dancerFrameData.timestamp
                    };
                case 'edited':
                    const editedImage = editedImages.images.find(img => img.id === globalSelection.selectedImageId);
                    if (editedImage) {
                        return {
                            type: 'edited',
                            id: editedImage.id,
                            title: `Edited Image`,
                            dataUrl: editedImage.dataUrl,
                            timestamp: editedImage.timestamp,
                            prompt: editedImage.prompt
                        };
                    }
                    return null;
                default:
                    return null;
            }
        },

        /**
         * Get storage usage information
         * @returns {Object} Storage usage details
         */
        async getStorageInfo() {
            let cacheSize = 0;
            try {
                const cache = await getImageCache();
                const keys = await cache.keys();
                cacheSize = keys.length; // Approximate count
            } catch (error) {
                console.error('Error getting cache info:', error);
            }
            
            return {
                editedImagesCount: editedImages.images.length,
                maxEditedImages: MAX_EDITED_IMAGES,
                cacheEntriesCount: cacheSize,
                hasFace: !!faceData.cacheKey,
                hasDancerFrame: !!dancerFrameData.cacheKey,
                storageType: 'Cache API'
            };
        },

        /**
         * Manually clean up storage by removing old edited images
         * @param {number} [keepCount] - Number of images to keep (default: half of current)
         */
        async cleanupStorage(keepCount) {
            const targetCount = keepCount || Math.floor(editedImages.images.length / 2);
            const originalCount = editedImages.images.length;
            
            if (originalCount <= targetCount) {
                console.log('No cleanup needed');
                return;
            }
            
            // Sort by timestamp and keep newest
            editedImages.images.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const imagesToRemove = editedImages.images.slice(targetCount);
            editedImages.images = editedImages.images.slice(0, targetCount);
            
            // Delete removed images from cache
            for (const image of imagesToRemove) {
                if (image.cacheKey) {
                    await deleteImageFromCache(image.cacheKey);
                }
            }
            
            // Reset selection if out of bounds
            if (editedImages.selectedIndex >= editedImages.images.length) {
                editedImages.selectedIndex = editedImages.images.length > 0 ? 0 : -1;
            }
            
            saveToStorage();
            console.log(`Cleaned up storage: ${originalCount} → ${targetCount} images`);
        },

        /**
         * Export user data for other components
         * @returns {Object} Summary of all user data and state
         */
        getUserData() {
            return {
                name: user.name,
                hasFace: this.hasFace,
                faceTimestamp: faceData.timestamp,
                faceCoordinates: faceData.coordinates,
                hasDancerFrame: this.hasDancerFrame,
                dancerFrameTimestamp: dancerFrameData.timestamp,
                dancerFrameGifUrl: dancerFrameData.gifUrl,
                hasEditedImages: this.hasEditedImages,
                editedImagesCount: editedImages.images.length,
                selectedEditedImageIndex: editedImages.selectedIndex
            };
        },

        /**
         * Get all cache keys for debugging/management
         * @returns {Promise<Request[]>}
         */
        getAllCacheKeys,

        /**
         * Clear the entire image cache
         * @returns {Promise<boolean>}
         */
        clearImageCache
    }
}

export const userStore = createUser();