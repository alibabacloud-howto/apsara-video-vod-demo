/**
 * Video file to upload.
 *
 * @author Alibaba Cloud
 */
class UploadableVideo {

    /**
     * @param {string} title
     * @param {string} fileName
     * @param {number} fileSize
     * @param {string} description
     */
    constructor(title, fileName, fileSize, description) {
        /** @type {string} */
        this.title = title;

        /** @type {string} */
        this.fileName = fileName;

        /** @type {number} */
        this.fileSize = fileSize;

        /** @type {string} */
        this.description = description;
    }

}