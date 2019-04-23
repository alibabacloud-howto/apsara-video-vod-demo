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
        const videoMetadata = new UploadableVideoMetadata(title, this._selectedFile.name, this._selectedFile.size, description);
        const videoUploadDestination = await videosService.prepareVideoUpload(videoMetadata);

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
        const videoMetadatas = await videosService.findAllVideos();

        // Display the videos
        if (videoMetadatas.length === 0) {
            $videos.html('<li>No video.</li>');
            return;
        }

        const videoElements = videoMetadatas.map(video => {
            return `
               <li data-attr-video-id="${video.videoId}">
                   <h3>${video.title}</h3>
                   <img class="video-cover" src="${video.coverUrl}" alt="${video.title}" />
                   <ul>
                       <li>Description: ${video.description}</li>
                       <li>Duration: ${video.duration} sec</li>
                       <li>Status: ${video.status}</li>
                       <li>Creation time: ${video.creationTime}</li>
                   </ul>
               </li>`;
        });
        $videos.html(videoElements.join(''));
    }
};

$(document).ready(() => indexController.onDocumentReady());