/**
 * Additional information to play a video.
 *
 * @author Alibaba Cloud
 */
class VideoPlayUrl {

    /**
     * @param {string} definition
     * @param {string} playUrl
     */
    constructor(definition, playUrl) {
        /** @type {string} */
        this.definition = definition;

        /** @type {string} */
        this.playUrl = playUrl;
    }

}