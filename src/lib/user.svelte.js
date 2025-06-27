function createUser() {
    const user = $state({
        name: 'John Doe'
    })

    const faceData = $state({
        dataUrl: '',
        blob: null,
        timestamp: '',
        coordinates: null
    })

    const dancerFrameData = $state({
        dataUrl: '',
        blob: null,
        timestamp: '',
        gifUrl: ''
    })

    const LOCAL_STORAGE_FACE_KEY = 'user_face_data'
    const LOCAL_STORAGE_NAME_KEY = 'user_name'
    const LOCAL_STORAGE_DANCER_FRAME_KEY = 'user_dancer_frame_data'

    // Load from localStorage on initialization
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
        }
    }

    // Save to localStorage
    function saveToStorage() {
        if (typeof window !== 'undefined') {
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
        }
    }

    // Convert dataUrl back to blob if needed
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

        clearDancerFrame() {
            dancerFrameData.dataUrl = '';
            dancerFrameData.blob = null;
            dancerFrameData.timestamp = '';
            dancerFrameData.gifUrl = '';
            saveToStorage();
        },

        // Export user data for other components
        getUserData() {
            return {
                name: user.name,
                hasFace: this.hasFace,
                faceTimestamp: faceData.timestamp,
                faceCoordinates: faceData.coordinates,
                hasDancerFrame: this.hasDancerFrame,
                dancerFrameTimestamp: dancerFrameData.timestamp,
                dancerFrameGifUrl: dancerFrameData.gifUrl
            };
        }
    }
}

export const userStore = createUser();