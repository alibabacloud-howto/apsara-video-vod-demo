package com.alibaba.intl.voddemo.controllers;

import com.alibaba.intl.voddemo.models.UploadableVideoMetadata;
import com.alibaba.intl.voddemo.models.VideoMetadata;
import com.alibaba.intl.voddemo.models.VideoUploadDestination;
import com.aliyuncs.DefaultAcsClient;
import com.aliyuncs.exceptions.ClientException;
import com.aliyuncs.profile.DefaultProfile;
import com.aliyuncs.profile.IClientProfile;
import com.aliyuncs.vod.model.v20170321.CreateUploadVideoRequest;
import com.aliyuncs.vod.model.v20170321.GetVideoListRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Allow users to upload and play videos.
 *
 * @author Alibaba Cloud
 */
@RestController
public class VideosController {

    private static final Logger LOGGER = LoggerFactory.getLogger(VideosController.class);

    private final String templateGroupId;
    private final IClientProfile clientProfile;

    public VideosController(@Value("${apsaraVideoVod.accessKeyId}") String accessKeyId,
                            @Value("${apsaraVideoVod.accessKeySecret}") String accessKeySecret,
                            @Value("${apsaraVideoVod.regionId}") String regionId,
                            @Value("${apsaraVideoVod.templateGroupId}") String templateGroupId) {
        this.clientProfile = DefaultProfile.getProfile(regionId, accessKeyId, accessKeySecret);
        this.templateGroupId = templateGroupId;
    }

    /**
     * Request an upload address for the given video.
     *
     * @param uploadableVideoMetadata Information about the video to upload.
     * @return Information about where to upload the video.
     */
    @RequestMapping(value = "/videos/prepare-upload", method = RequestMethod.POST)
    public ResponseEntity<VideoUploadDestination> prepareVideoUpload(@RequestBody UploadableVideoMetadata uploadableVideoMetadata) {
        LOGGER.info("Prepare upload for the video: " + uploadableVideoMetadata.getTitle() +
                " (file name = " + uploadableVideoMetadata.getFileName() + ")...");

        var client = new DefaultAcsClient(clientProfile);
        var request = new CreateUploadVideoRequest();
        request.setTitle(uploadableVideoMetadata.getTitle());
        request.setFileName(uploadableVideoMetadata.getFileName());
        request.setFileSize(uploadableVideoMetadata.getFileSize());
        request.setDescription(uploadableVideoMetadata.getDescription());
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

    /**
     * @return 100 last uploaded videos.
     */
    @RequestMapping("/videos")
    public ResponseEntity<List<VideoMetadata>> findAllVideos() {
        LOGGER.info("Finding the last 100 videos...");

        var client = new DefaultAcsClient(clientProfile);
        var request = new GetVideoListRequest();
        request.setPageSize(100);

        try {
            var response = client.getAcsResponse(request);
            if (response.getVideoList() == null || response.getVideoList().isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            var videoMetadatas = response.getVideoList().stream()
                    .map(video -> new VideoMetadata(
                            video.getVideoId(),
                            video.getTitle(),
                            video.getDescription(),
                            video.getStatus(),
                            video.getDuration(),
                            video.getCreationTime(),
                            video.getCoverURL(),
                            video.getSnapshots()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(videoMetadatas);
        } catch (ClientException e) {
            LOGGER.warn("Unable to find the 100 last videos: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        }
    }
}
