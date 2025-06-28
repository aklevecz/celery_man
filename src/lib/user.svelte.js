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
 * @property {string} dataUrl - Base64 data URL of the image
 * @property {Blob | null} blob - Blob object of the image
 * @property {string} originalUrl - Original URL of the image
 * @property {string} prompt - Prompt used to generate the image
 * @property {string} timestamp - Timestamp when the image was created
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

    /** @type {{dataUrl: string, blob: Blob | null, timestamp: string, coordinates: FaceCoordinates | null}} */
    const faceData = $state({
        dataUrl: '',
        blob: null,
        timestamp: '',
        coordinates: null
    })

    /** @type {{dataUrl: string, blob: Blob | null, timestamp: string, gifUrl: string}} */
    const dancerFrameData = $state({
        dataUrl: '',
        blob: null,
        timestamp: '',
        gifUrl: ''
    })

    /** @type {{images: EditedImage[], selectedIndex: number}} */
    const editedImages = $state({
        images: [],
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
    const LOCAL_STORAGE_GLOBAL_SELECTION_KEY = 'user_global_selection'
    
    // Storage limits
    const MAX_EDITED_IMAGES = 10; // Maximum number of edited images to store
    const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB limit (localStorage is usually 5-10MB)

    /**
     * Load user data from localStorage on initialization
     */
    function loadFromStorage() {
        if (typeof window !== 'undefined') {
            const savedName = localStorage.getItem(LOCAL_STORAGE_NAME_KEY);
            if (savedName) {
                user.name = savedName;
            }

            const savedFaceData = localStorage.getItem(LOCAL_STORAGE_FACE_KEY);
            if (savedFaceData) {
                try {
                    const parsed = JSON.parse(savedFaceData);
                    faceData.dataUrl = parsed.dataUrl || '';
                    faceData.timestamp = parsed.timestamp || '';
                    faceData.coordinates = parsed.coordinates || null;
                    // Note: blob cannot be serialized, will need to be recreated from dataUrl if needed
                } catch (error) {
                    console.error('Error loading face data from localStorage:', error);
                }
            }

            const savedDancerFrameData = localStorage.getItem(LOCAL_STORAGE_DANCER_FRAME_KEY);
            if (savedDancerFrameData) {
                try {
                    const parsed = JSON.parse(savedDancerFrameData);
                    dancerFrameData.dataUrl = parsed.dataUrl || '';
                    dancerFrameData.timestamp = parsed.timestamp || '';
                    dancerFrameData.gifUrl = parsed.gifUrl || '';
                } catch (error) {
                    console.error('Error loading dancer frame data from localStorage:', error);
                }
            }

            const savedEditedImages = localStorage.getItem(LOCAL_STORAGE_EDITED_IMAGES_KEY);
            if (savedEditedImages) {
                try {
                    const parsed = JSON.parse(savedEditedImages);
                    editedImages.images = parsed.images || [];
                    editedImages.selectedIndex = parsed.selectedIndex || -1;
                } catch (error) {
                    console.error('Error loading edited images from localStorage:', error);
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
     * Get estimated storage size for a value
     * @param {any} value - Value to estimate size for
     * @returns {number} - Estimated size in bytes
     */
    function getStorageSize(value) {
        return new Blob([JSON.stringify(value)]).size;
    }

    /**
     * Clean up old edited images to stay within limits
     */
    function cleanupEditedImages() {
        // Remove oldest images if we exceed the limit
        while (editedImages.images.length > MAX_EDITED_IMAGES) {
            const removedImage = editedImages.images.shift();
            console.log(`Removed old edited image: ${removedImage?.id}`);
            
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
            editedImages.images = editedImages.images.slice(0, MAX_EDITED_IMAGES);
            // Reset selection if it's out of bounds
            if (editedImages.selectedIndex >= editedImages.images.length) {
                editedImages.selectedIndex = editedImages.images.length > 0 ? 0 : -1;
            }
        }
    }

    /**
     * Save current user data to localStorage with error handling and cleanup
     */
    function saveToStorage() {
        if (typeof window !== 'undefined') {
            try {
                // Clean up edited images before saving
                cleanupEditedImages();

                localStorage.setItem(LOCAL_STORAGE_NAME_KEY, user.name);
                
                const faceDataToSave = {
                    dataUrl: faceData.dataUrl,
                    timestamp: faceData.timestamp,
                    coordinates: faceData.coordinates
                };
                localStorage.setItem(LOCAL_STORAGE_FACE_KEY, JSON.stringify(faceDataToSave));

                const dancerFrameDataToSave = {
                    dataUrl: dancerFrameData.dataUrl,
                    timestamp: dancerFrameData.timestamp,
                    gifUrl: dancerFrameData.gifUrl
                };
                localStorage.setItem(LOCAL_STORAGE_DANCER_FRAME_KEY, JSON.stringify(dancerFrameDataToSave));

                const editedImagesToSave = {
                    images: editedImages.images,
                    selectedIndex: editedImages.selectedIndex
                };
                
                // Check size before saving edited images
                const editedImagesSize = getStorageSize(editedImagesToSave);
                console.log(`Saving edited images: ${editedImages.images.length} images, ~${Math.round(editedImagesSize / 1024)}KB`);
                
                if (editedImagesSize > MAX_STORAGE_SIZE) {
                    console.warn('Edited images exceed storage limit, performing aggressive cleanup');
                    // More aggressive cleanup - keep only half the images
                    editedImages.images = editedImages.images.slice(0, Math.floor(MAX_EDITED_IMAGES / 2));
                    if (editedImages.selectedIndex >= editedImages.images.length) {
                        editedImages.selectedIndex = editedImages.images.length > 0 ? 0 : -1;
                    }
                    editedImagesToSave.images = editedImages.images;
                    editedImagesToSave.selectedIndex = editedImages.selectedIndex;
                }

                localStorage.setItem(LOCAL_STORAGE_EDITED_IMAGES_KEY, JSON.stringify(editedImagesToSave));

                const globalSelectionToSave = {
                    selectedImageType: globalSelection.selectedImageType,
                    selectedImageId: globalSelection.selectedImageId
                };
                localStorage.setItem(LOCAL_STORAGE_GLOBAL_SELECTION_KEY, JSON.stringify(globalSelectionToSave));

            } catch (error) {
                console.error('Error saving to localStorage:', error);
                
                if (error.name === 'QuotaExceededError') {
                    console.warn('Storage quota exceeded, performing emergency cleanup');
                    // Emergency cleanup - remove half of the edited images
                    const originalLength = editedImages.images.length;
                    editedImages.images = editedImages.images.slice(0, Math.max(1, Math.floor(originalLength / 2)));
                    
                    // Reset selection if out of bounds
                    if (editedImages.selectedIndex >= editedImages.images.length) {
                        editedImages.selectedIndex = editedImages.images.length > 0 ? 0 : -1;
                    }
                    
                    console.log(`Emergency cleanup: reduced from ${originalLength} to ${editedImages.images.length} images`);
                    
                    // Try saving again with reduced data
                    try {
                        const editedImagesToSave = {
                            images: editedImages.images,
                            selectedIndex: editedImages.selectedIndex
                        };
                        localStorage.setItem(LOCAL_STORAGE_EDITED_IMAGES_KEY, JSON.stringify(editedImagesToSave));
                        console.log('Successfully saved after emergency cleanup');
                    } catch (retryError) {
                        console.error('Failed to save even after cleanup:', retryError);
                        // Last resort - clear edited images
                        editedImages.images = [];
                        editedImages.selectedIndex = -1;
                        localStorage.setItem(LOCAL_STORAGE_EDITED_IMAGES_KEY, JSON.stringify({images: [], selectedIndex: -1}));
                        console.warn('Cleared all edited images to resolve storage issue');
                    }
                }
            }
        }
    }

    /**
     * Convert dataUrl back to blob if needed
     * @param {string} dataUrl - Base64 data URL to convert
     * @returns {Promise<Blob>} - Promise that resolves to a Blob object
     */
    async function dataUrlToBlob(dataUrl) {
        return new Promise(resolve => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(resolve, 'image/png');
            };
            
            img.src = dataUrl;
        });
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
            // Convert blob to data URL for storage
            const dataUrl = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });

            faceData.dataUrl = dataUrl;
            faceData.blob = blob;
            faceData.timestamp = new Date().toLocaleString();
            faceData.coordinates = coordinates;
            
            saveToStorage();
        },

        /**
         * Get the face image as a Blob
         * @returns {Promise<Blob | null>} - Promise that resolves to face blob or null
         */
        async getFaceBlob() {
            if (faceData.blob) {
                return faceData.blob;
            } else if (faceData.dataUrl) {
                // Recreate blob from dataUrl
                faceData.blob = await dataUrlToBlob(faceData.dataUrl);
                return faceData.blob;
            }
            return null;
        },

        /**
         * Clear the saved face data
         */
        clearFace() {
            faceData.dataUrl = '';
            faceData.blob = null;
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
            // Convert blob to data URL for storage
            const dataUrl = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });

            dancerFrameData.dataUrl = dataUrl;
            dancerFrameData.blob = blob;
            dancerFrameData.timestamp = new Date().toLocaleString();
            dancerFrameData.gifUrl = gifUrl;
            
            saveToStorage();
        },

        /**
         * Get the dancer frame image as a Blob
         * @returns {Promise<Blob | null>} - Promise that resolves to dancer frame blob or null
         */
        async getDancerFrameBlob() {
            if (dancerFrameData.blob) {
                return dancerFrameData.blob;
            } else if (dancerFrameData.dataUrl) {
                // Recreate blob from dataUrl
                dancerFrameData.blob = await dataUrlToBlob(dancerFrameData.dataUrl);
                return dancerFrameData.blob;
            }
            return null;
        },

        /**
         * Clear the saved dancer frame data
         */
        clearDancerFrame() {
            dancerFrameData.dataUrl = '';
            dancerFrameData.blob = null;
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
            // Convert image URL to blob and data URL for storage
            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                
                const dataUrl = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });

                const newImage = {
                    id: `edited-${Date.now()}`,
                    dataUrl: dataUrl,
                    blob: blob,
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
            if (!selected) return null;
            
            if (selected.blob) {
                return selected.blob;
            } else if (selected.dataUrl) {
                // Recreate blob from dataUrl
                selected.blob = await dataUrlToBlob(selected.dataUrl);
                return selected.blob;
            }
            return null;
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
        deleteEditedImage(index) {
            if (index >= 0 && index < editedImages.images.length) {
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
        clearAllEditedImages() {
            editedImages.images = [];
            editedImages.selectedIndex = -1;
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
                    if (editedImage) {
                        if (editedImage.blob) {
                            return editedImage.blob;
                        } else if (editedImage.dataUrl) {
                            editedImage.blob = await dataUrlToBlob(editedImage.dataUrl);
                            return editedImage.blob;
                        }
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
        getStorageInfo() {
            const faceSize = getStorageSize(faceData);
            const dancerFrameSize = getStorageSize(dancerFrameData);
            const editedImagesSize = getStorageSize(editedImages);
            const totalSize = faceSize + dancerFrameSize + editedImagesSize;
            
            return {
                totalSize,
                faceSize,
                dancerFrameSize,
                editedImagesSize,
                editedImagesCount: editedImages.images.length,
                maxEditedImages: MAX_EDITED_IMAGES,
                maxStorageSize: MAX_STORAGE_SIZE,
                usagePercentage: Math.round((totalSize / MAX_STORAGE_SIZE) * 100)
            };
        },

        /**
         * Manually clean up storage by removing old edited images
         * @param {number} [keepCount] - Number of images to keep (default: half of current)
         */
        cleanupStorage(keepCount) {
            const targetCount = keepCount || Math.floor(editedImages.images.length / 2);
            const originalCount = editedImages.images.length;
            
            if (originalCount <= targetCount) {
                console.log('No cleanup needed');
                return;
            }
            
            // Sort by timestamp and keep newest
            editedImages.images.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            editedImages.images = editedImages.images.slice(0, targetCount);
            
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
        }
    }
}

export const userStore = createUser();