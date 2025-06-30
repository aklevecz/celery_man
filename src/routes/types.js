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
