/**
 * Client-side counterpart of the VideosController.
 *
 * @author Alibaba Cloud
 */
const videosService = {

    /**
     * Request an upload address for the given video.
     *
     * @param {UploadableVideo} uploadableVideo
     * @returns {Promise<VideoUploadDestination>}
     */
    async prepareVideoUpload(uploadableVideo) {
        console.log(`Prepare upload for the video: ${uploadableVideo.title} (file name ${uploadableVideo.fileName})...`);

        const response = await fetch('/videos/prepare-upload', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadableVideo)
        });

        if (response.status !== 200) {
            throw new Error('Unable to prepare the video upload.');
        }
        const responseBody = await response.json();
        return new VideoUploadDestination(responseBody.videoId, responseBody.uploadAddress, responseBody.uploadAuth);
    },

    /**
     * Upload the video.
     *
     * @param {VideoUploadDestination} videoUploadDestination
     *     Value obtained by calling {@link #prepareVideoUpload()}.
     * @param {File} file
     *     File to upload.
     * @param {function(progressPercentage: number)} onProgressUpdateCallback
     *     Function called to indicate the upload progress.
     * @returns {Promise<void>}
     */
    async uploadVideo(videoUploadDestination, file, onProgressUpdateCallback) {
        return new Promise((resolve, reject) => {
            const uploader = new AliyunUpload.Vod({
                partSize: 1048576,
                parallel: 5,
                retryCount: 3,
                retryDuration: 2,

                onUploadstarted(uploadInfo) {
                    console.log('Video upload started: ', uploadInfo);
                    uploader.setUploadAuthAndAddress(uploadInfo,
                        videoUploadDestination.uploadAuth,
                        videoUploadDestination.uploadAddress,
                        videoUploadDestination.videoId);
                },

                onUploadProgress(uploadInfo, totalSize, loadedPercent) {
                    console.log(`Video upload progress: file = ${uploadInfo.file.name}, ` +
                        `size = ${totalSize}, progress = ${Math.ceil(loadedPercent * 100)}%`);
                    onProgressUpdateCallback(loadedPercent);
                },

                onUploadSucceed(uploadInfo) {
                    console.log('Video upload succeeded: ', uploadInfo);
                },

                onUploadEnd() {
                    console.log('Video upload ended.');
                    resolve();
                },

                onUploadFailed(uploadInfo, code, message) {
                    console.error('Unable to upload the video.', uploadInfo, code, message);
                    reject(`Unable to upload the video: file = ${uploadInfo.file.name}. code = ${code}, message = ${message}.`);
                },

                onUploadTokenExpired(uploadInfo) {
                    console.error('Upload token expired.', uploadInfo);
                    reject('Upload token expired.');
                }
            });

            uploader.addFile(file, null, null, null, '{}');
            uploader.startUpload();
        });
    },

    /**
     * Find the 100 last uploaded videos.
     *
     * @returns {Promise<Video[]>}
     */
    async findAllVideos() {
        const response = await fetch('/videos', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        /** @type {Array} */ const responseBody = await response.json();
        return responseBody.map(item => new Video(
            item.videoId,
            item.title,
            item.description,
            item.status,
            item.duration,
            item.creationTime,
            item.coverUrl,
            item.snapshots));
    },

    /**
     * Get URLs to play the video.
     *
     * @param {string} videoId ID of the video to play.
     * @returns {Promise<VideoPlayUrl[]>}
     */
    async getVideoPlayUrls(videoId) {
        const response = await fetch(`/videos/${videoId}/play-urls`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        /** @type {Array} */ const responseBody = await response.json();
        return responseBody.map(item => new VideoPlayUrl(item.definition, item.playUrl));
    }
};