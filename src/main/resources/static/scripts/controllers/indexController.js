/**
 * Controller for the index page.
 *
 * @author Alibaba Cloud
 */
const indexController = {

    /**
     * @type {?File}
     */
    _selectedFile: null,

    /**
     * @type {Video[]}
     */
    _videos: [],

    /**
     * Method called when the index page is completely loaded.
     */
    onDocumentReady() {
        $('#upload-video-file').on('change', (event) => {
            const files = $.map(event.originalEvent.target.files, file => file);
            this.onFileSelected(files[0]);
            return false;
        });

        $('#upload-modal').on('show.bs.modal', () => {
            this.resetUploadForm();
        });

        $('#upload-video-form').on('submit', () => {
            return false;
        });

        $('#upload-video').on('click', () => {
            this.onVideoUpload();
            return false;
        });

        $('#refresh-videos').on('click', () => {
            this.refreshUploadedVideos();
            return false;
        });

        $('#videos').on('click', event => {
            const $target = $(event.target);

            if ($target.hasClass('play-video')) {
                this.playVideo($target.attr('data-attr-video-id'));
            } else if ($target.hasClass('delete-video')) {
                this.deleteVideo($target.attr('data-attr-video-id'));
            }
        });
    },

    resetUploadForm() {
        const $status = $('#upload-video-status');
        const $file = $('#upload-video-file');
        const $title = $('#upload-video-title');
        const $description = $('#upload-video-description');
        const $uploadVideo = $('#upload-video');
        const $closeUploadModel = $('#close-upload-modal');

        $status.text('');
        $file.val('');
        $title.val('');
        $description.val('');
        this._selectedFile = null;

        $file.prop('disabled', false);
        $title.prop('disabled', false);
        $description.prop('disabled', false);
        $uploadVideo.prop('disabled', false);
        $closeUploadModel.prop('disabled', false);
    },

    disableUploadForm() {
        const $file = $('#upload-video-file');
        const $title = $('#upload-video-title');
        const $description = $('#upload-video-description');
        const $uploadVideo = $('#upload-video');
        const $closeUploadModel = $('#close-upload-modal');

        $file.prop('disabled', true);
        $title.prop('disabled', true);
        $description.prop('disabled', true);
        $uploadVideo.prop('disabled', true);
        $closeUploadModel.prop('disabled', true);
    },

    /**
     * Method called when a file is selected for upload.
     *
     * @param {File} file
     */
    onFileSelected(file) {
        this._selectedFile = null;

        if (file.size > 5000000000) {
            return alert('The file is too big (5GB max).');
        }

        // Generate a title based on the file name
        let title = file.name;
        const extensionIndex = title.lastIndexOf('.');
        if (extensionIndex > 0) {
            title = title.substr(0, extensionIndex);
        }

        $('#upload-video-title').val(title);
        $('#upload-video-description').val('');

        this._selectedFile = file;
    },

    /**
     * Method called when a video is ready to be uploaded.
     */
    async onVideoUpload() {
        const $status = $('#upload-video-status');
        const $title = $('#upload-video-title');
        const $description = $('#upload-video-description');

        // Check the upload form has been filled correctly
        if (!this._selectedFile) {
            return alert('Please select a video file.');
        }
        const title = $title.val();
        const description = $description.val();
        if (!title) {
            return alert('Please enter a title.');
        }

        // Prepare the video upload in order to obtain the destination URL
        $status.text('Uploading...');
        this.disableUploadForm();
        const uploadableVideo = new UploadableVideo(title, this._selectedFile.name, this._selectedFile.size, description);
        const videoUploadDestination = await videosService.prepareVideoUpload(uploadableVideo);

        // Upload the video
        await videosService.uploadVideo(videoUploadDestination, this._selectedFile, progressPercentage => {
            $status.text(`Uploading (${Math.ceil(progressPercentage * 100)}%)...`);
        });
        this.resetUploadForm();
        $status.text('Video uploaded with success!');
    },

    /**
     * Load and display the uploaded videos.
     */
    async refreshUploadedVideos() {
        const $videos = $('#videos');

        // Load the videos
        $videos.html('<li>Loading...</li>');
        const videos = await videosService.findAllVideos();
        this._videos = videos;

        // Display the videos
        if (videos.length === 0) {
            $videos.html('<li>No video.</li>');
            return;
        }

        const videoElements = videos.map(video => {
            return `
               <li data-attr-video-id="${video.videoId}">
                   <h3>
                       ${video.title}
                       <button class="play-video" type="button" data-attr-video-id="${video.videoId}">Play</button>
                       <button class="delete-video" type="button" data-attr-video-id="${video.videoId}">Delete</button>
                   </h3>
                   <img class="video-cover" id="video-cover-${video.videoId}" src="${video.coverUrl}" alt="${video.title}" />
                   <div class="prism-player" id="video-player-${video.videoId}" style="display: none;"></div>
                   <ul>
                       <li>Description: ${video.description}</li>
                       <li>Duration: ${video.duration} sec</li>
                       <li>Status: ${video.status}</li>
                       <li>Creation time: ${video.creationTime}</li>
                   </ul>
               </li>`;
        });
        $videos.html(videoElements.join(''));
    },

    /**
     * Play the video with the given ID.
     *
     * @param {string} videoId
     */
    async playVideo(videoId) {
        const index = this._videos.findIndex(video => video.videoId === videoId);
        const video = this._videos[index];

        const playUrls = await videosService.getVideoPlayUrls(video.videoId);
        const source = playUrls.reduce((map, obj) => {
            map[obj.definition] = obj.playUrl;
            return map;
        }, {});

        $(`#video-cover-${video.videoId}`).hide();
        $(`#video-player-${video.videoId}`).show();
        new Aliplayer({
            id: `video-player-${video.videoId}`,
            width: '100%',
            autoplay: true,
            source: JSON.stringify(source),
            cover: video.coverUrl
        });
    },

    /**
     * Ask confirmation and delete the given video.
     *
     * @param {string} videoId
     */
    async deleteVideo(videoId) {
        const response = confirm("Are you sure you want to delete this video?");
        if (response) {
            try {
                await videosService.deleteVideoById(videoId);
            } catch (error) {
                return alert(`Unable to delete this video! (error = ${JSON.stringify(error)})`);
            }

            await this.refreshUploadedVideos();
        }
    }
};

$(document).ready(() => indexController.onDocumentReady());