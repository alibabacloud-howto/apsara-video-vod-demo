package com.alibaba.intl.voddemo.models;

/**
 * Information about where to upload an video.
 *
 * @author Alibaba Cloud
 */
public class VideoUploadDestination {

    private String videoId;
    private String uploadAddress;
    private String uploadAuth;

    public VideoUploadDestination() {
    }

    public VideoUploadDestination(String videoId, String uploadAddress, String uploadAuth) {
        this.videoId = videoId;
        this.uploadAddress = uploadAddress;
        this.uploadAuth = uploadAuth;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public String getUploadAddress() {
        return uploadAddress;
    }

    public void setUploadAddress(String uploadAddress) {
        this.uploadAddress = uploadAddress;
    }

    public String getUploadAuth() {
        return uploadAuth;
    }

    public void setUploadAuth(String uploadAuth) {
        this.uploadAuth = uploadAuth;
    }

    @Override
    public String toString() {
        return "VideoUploadDestination{" +
                "videoId='" + videoId + '\'' +
                ", uploadAddress='" + uploadAddress + '\'' +
                ", uploadAuth='" + uploadAuth + '\'' +
                '}';
    }
}
