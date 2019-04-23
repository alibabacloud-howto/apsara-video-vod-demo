/**
 * Client-side counterpart of the VideosController.
 *
 * @author Alibaba Cloud
 */
const videosService = {

    /**
     * Request an upload address for the given video.
     *
     * @param {VideoMetadata} videoMetadata
     * @returns {Promise<VideoUploadDestination>}
     */
    async prepareVideoUpload(videoMetadata) {
        console.log(`Prepare upload for the video: ${videoMetadata.title} (file name ${videoMetadata.fileName})...`);

        const response = await fetch('/videos/prepare-upload', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(videoMetadata)
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
    }

};