package com.alibaba.intl.voddemo.controllers;

import com.alibaba.intl.voddemo.models.UploadableVideo;
import com.alibaba.intl.voddemo.models.Video;
import com.alibaba.intl.voddemo.models.VideoPlayUrl;
import com.alibaba.intl.voddemo.models.VideoUploadDestination;
import com.aliyuncs.DefaultAcsClient;
import com.aliyuncs.exceptions.ClientException;
import com.aliyuncs.profile.DefaultProfile;
import com.aliyuncs.profile.IClientProfile;
import com.aliyuncs.vod.model.v20170321.CreateUploadVideoRequest;
import com.aliyuncs.vod.model.v20170321.DeleteVideoRequest;
import com.aliyuncs.vod.model.v20170321.GetPlayInfoRequest;
import com.aliyuncs.vod.model.v20170321.GetVideoListRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
     * @param uploadableVideo Information about the video to upload.
     * @return Information about where to upload the video.
     */
    @RequestMapping(value = "/videos/prepare-upload", method = RequestMethod.POST)
    public ResponseEntity<VideoUploadDestination> prepareVideoUpload(@RequestBody UploadableVideo uploadableVideo) {
        LOGGER.info("Prepare upload for the video: " + uploadableVideo.getTitle() +
                " (file name = " + uploadableVideo.getFileName() + ")...");

        var client = new DefaultAcsClient(clientProfile);
        var request = new CreateUploadVideoRequest();
        request.setTitle(uploadableVideo.getTitle());
        request.setFileName(uploadableVideo.getFileName());
        request.setFileSize(uploadableVideo.getFileSize());
        request.setDescription(uploadableVideo.getDescription());
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
    public ResponseEntity<List<Video>> findAllVideos() {
        LOGGER.info("Finding the last 100 videos...");

        var client = new DefaultAcsClient(clientProfile);
        var request = new GetVideoListRequest();
        request.setPageSize(100);

        try {
            var response = client.getAcsResponse(request);
            if (response.getVideoList() == null || response.getVideoList().isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            var videos = response.getVideoList().stream()
                    .map(video -> new Video(
                            video.getVideoId(),
                            video.getTitle(),
                            video.getDescription() == null ? "" : video.getDescription(),
                            video.getStatus(),
                            video.getDuration(),
                            video.getCreationTime(),
                            video.getCoverURL(),
                            video.getSnapshots()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(videos);
        } catch (ClientException e) {
            LOGGER.warn("Unable to find the 100 last videos: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * @param videoId ID of the video to play.
     * @return URLs to play the video.
     */
    @RequestMapping("/videos/{videoId}/play-urls")
    public ResponseEntity<List<VideoPlayUrl>> getVideoPlayUrls(@PathVariable("videoId") String videoId) {
        LOGGER.info("Get play URLs for the video " + videoId + "...");

        var client = new DefaultAcsClient(clientProfile);
        var request = new GetPlayInfoRequest();
        request.setVideoId(videoId);

        try {
            var response = client.getAcsResponse(request);

            if (response.getPlayInfoList() == null || response.getPlayInfoList().isEmpty()) {
                return ResponseEntity.ok(Collections.emptyList());
            }

            var videoPlayUrls = response.getPlayInfoList().stream()
                    .map(info -> new VideoPlayUrl(info.getDefinition(), info.getPlayURL()))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(videoPlayUrls);
        } catch (ClientException e) {
            LOGGER.warn("Unable to get play URLs for the video " + videoId + ": " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(null);
        }
    }

    /**
     * Delete the video with the given ID.
     *
     * @param videoId ID of the video to delete.
     * @return {@link HttpStatus#OK} if the video is deleted, {@link HttpStatus#BAD_REQUEST} if the video cannot be deleted.
     */
    @RequestMapping(value = "/videos/{videoId}", method = RequestMethod.DELETE)
    public HttpStatus deleteVideoById(@PathVariable("videoId") String videoId) {
        LOGGER.info("Delete the video " + videoId + "...");

        var client = new DefaultAcsClient(clientProfile);
        var request = new DeleteVideoRequest();
        request.setVideoIds(videoId);

        try {
            client.getAcsResponse(request);
            return HttpStatus.OK;

        } catch (ClientException e) {
            LOGGER.warn("Unable to delete the video " + videoId + ": " + e.getMessage(), e);
            return HttpStatus.BAD_REQUEST;
        }
    }
}
