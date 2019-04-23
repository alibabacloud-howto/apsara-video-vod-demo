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

        $('#upload-video-form').on('submit', () => {
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
            }
        });
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
        const $file = $('#upload-video-file');
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
        $file.prop('disabled', true);
        $title.prop('disabled', true);
        $title.prop('disabled', true);
        $description.prop('disabled', true);
        const uploadableVideo = new UploadableVideo(title, this._selectedFile.name, this._selectedFile.size, description);
        const videoUploadDestination = await videosService.prepareVideoUpload(uploadableVideo);

        // Upload the video
        await videosService.uploadVideo(videoUploadDestination, this._selectedFile, progressPercentage => {
            $status.text(`Uploading (${Math.ceil(progressPercentage * 100)}%)...`);
        });
        $status.text('Video uploaded with success!');

        // Reset the form
        $title.val('');
        $description.val('');
        $file.val('');
        this._selectedFile = null;
        $file.prop('disabled', false);
        $title.prop('disabled', false);
        $title.prop('disabled', false);
        $description.prop('disabled', false);
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
    }
};

$(document).ready(() => indexController.onDocumentReady());