package com.alibaba.intl.voddemo.models;

/**
 * Additional information to play a video.
 *
 * @author Alibaba Cloud
 */
public class VideoPlayUrl {
    private String definition;
    private String playUrl;

    public VideoPlayUrl() {
    }

    public VideoPlayUrl(String definition, String playUrl) {
        this.definition = definition;
        this.playUrl = playUrl;
    }

    public String getDefinition() {
        return definition;
    }

    public void setDefinition(String definition) {
        this.definition = definition;
    }

    public String getPlayUrl() {
        return playUrl;
    }

    public void setPlayUrl(String playUrl) {
        this.playUrl = playUrl;
    }

    @Override
    public String toString() {
        return "VideoPlayUrl{" +
                "definition='" + definition + '\'' +
                ", playUrl='" + playUrl + '\'' +
                '}';
    }
}
