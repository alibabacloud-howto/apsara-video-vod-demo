/**
 * Information about where to upload an video.
 *
 * @author Alibaba Cloud
 */
class VideoUploadDestination {

    /**
     * @param {string} videoId
     * @param {string} uploadAddress
     * @param {string} uploadAuth
     */
    constructor(videoId, uploadAddress, uploadAuth) {
        /** @type {string} */
        this.videoId = videoId;

        /** @type {string} */
        this.uploadAddress = uploadAddress;

        /** @type {string} */
        this.uploadAuth = uploadAuth;
    }

}