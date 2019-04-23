package com.alibaba.intl.voddemo.models;

/**
 * Metadata about a video file.
 *
 * @author Alibaba Cloud
 */
public class VideoMetadata {

    private String title;
    private String fileName;
    private long fileSize; // In bytes
    private String description;

    public VideoMetadata() {
    }

    public VideoMetadata(String title, String fileName, long fileSize, String description) {
        this.title = title;
        this.fileName = fileName;
        this.fileSize = fileSize;
        this.description = description;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public long getFileSize() {
        return fileSize;
    }

    public void setFileSize(long fileSize) {
        this.fileSize = fileSize;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public String toString() {
        return "VideoMetadata{" +
                "title='" + title + '\'' +
                ", fileName='" + fileName + '\'' +
                ", fileSize=" + fileSize +
                ", description='" + description + '\'' +
                '}';
    }
}
