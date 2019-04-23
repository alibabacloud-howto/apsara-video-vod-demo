/**
 * Metadata about an uploaded video file.
 *
 * @author Alibaba Cloud
 */
class VideoMetadata {

    /**
     * @param {string} videoId
     * @param {string} title
     * @param {string} description
     * @param {string} status
     * @param {number} duration
     * @param {string} creationTime
     * @param {string} coverUrl
     * @param {Array<string>} snapshots
     */
    constructor(videoId, title, description, status, duration, creationTime, coverUrl, snapshots) {
        /** @type {string} */
        this.videoId = videoId;

        /** @type {string} */
        this.title = title;

        /** @type {string} */
        this.description = description;

        /** @type {string} */
        this.status = status;

        /** @type {number} */
        this.duration = duration;

        /** @type {string} */
        this.creationTime = creationTime;

        /** @type {string} */
        this.coverUrl = coverUrl;

        /** @type {Array<string>} */
        this.snapshots = snapshots;
    }

}