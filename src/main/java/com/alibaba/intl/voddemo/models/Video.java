package com.alibaba.intl.voddemo.models;

import java.util.List;

/**
 * Uploaded video file.
 *
 * @author Alibaba Cloud
 */
public class Video {

    private String videoId;
    private String title;
    private String description;
    private String status;
    private Float duration;
    private String creationTime;
    private String coverUrl;
    private List<String> snapshots;

    public Video() {
    }

    public Video(String videoId, String title, String description, String status, Float duration,
                 String creationTime, String coverUrl, List<String> snapshots) {
        this.videoId = videoId;
        this.title = title;
        this.description = description;
        this.status = status;
        this.duration = duration;
        this.creationTime = creationTime;
        this.coverUrl = coverUrl;
        this.snapshots = snapshots;
    }

    public String getVideoId() {
        return videoId;
    }

    public void setVideoId(String videoId) {
        this.videoId = videoId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Float getDuration() {
        return duration;
    }

    public void setDuration(Float duration) {
        this.duration = duration;
    }

    public String getCreationTime() {
        return creationTime;
    }

    public void setCreationTime(String creationTime) {
        this.creationTime = creationTime;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public List<String> getSnapshots() {
        return snapshots;
    }

    public void setSnapshots(List<String> snapshots) {
        this.snapshots = snapshots;
    }

    @Override
    public String toString() {
        return "Video{" +
                "videoId='" + videoId + '\'' +
                ", title='" + title + '\'' +
                '}';
    }
}
