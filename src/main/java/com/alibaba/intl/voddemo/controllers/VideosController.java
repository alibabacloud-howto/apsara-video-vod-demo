package com.alibaba.intl.voddemo.controllers;

import com.alibaba.intl.voddemo.models.VideoMetadata;
import com.alibaba.intl.voddemo.models.VideoUploadDestination;
import com.aliyuncs.DefaultAcsClient;
import com.aliyuncs.exceptions.ClientException;
import com.aliyuncs.profile.DefaultProfile;
import com.aliyuncs.vod.model.v20170321.CreateUploadVideoRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

/**
 * Allow users to upload and play videos.
 *
 * @author Alibaba Cloud
 */
@RestController
public class VideosController {

    private static final Logger LOGGER = LoggerFactory.getLogger(VideosController.class);

    @Value("${apsaraVideoVod.accessKeyId}")
    private String accessKeyId;

    @Value("${apsaraVideoVod.accessKeySecret}")
    private String accessKeySecret;

    @Value("${apsaraVideoVod.regionId}")
    private String regionId;

    @Value("${apsaraVideoVod.templateGroupId}")
    private String templateGroupId;

    /**
     * Request an upload address for the given video.
     *
     * @param videoMetadata Information about the video to upload.
     * @return Information about where to upload the video.
     */
    @RequestMapping(value = "/videos/prepare-upload", method = RequestMethod.POST)
    public ResponseEntity<VideoUploadDestination> prepareVideoUpload(@RequestBody VideoMetadata videoMetadata) {
        LOGGER.info("Prepare upload for the video: " + videoMetadata.getTitle() +
                " (file name = " + videoMetadata.getFileName() + ")...");

        DefaultProfile profile = DefaultProfile.getProfile(regionId, accessKeyId, accessKeySecret);
        var client = new DefaultAcsClient(profile);

        var request = new CreateUploadVideoRequest();
        request.setTitle(videoMetadata.getTitle());
        request.setFileName(videoMetadata.getFileName());
        request.setFileSize(videoMetadata.getFileSize());
        request.setDescription(videoMetadata.getDescription());
        request.setTemplateGroupId(templateGroupId);

        try {
            var response = client.getAcsResponse(request);
            var destination = new VideoUploadDestination(
                    response.getVideoId(), response.getUploadAddress(), response.getUploadAuth());
            return ResponseEntity.ok(destination);
        } catch (ClientException e) {
            LOGGER.warn("Unable to prepare the video upload: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        }
    }
}
