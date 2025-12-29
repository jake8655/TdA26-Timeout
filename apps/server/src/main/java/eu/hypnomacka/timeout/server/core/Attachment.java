package eu.hypnomacka.timeout.server.core;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

public class Attachment {

    @Getter @Setter
    int id;
    @Getter
    String name, fileType, url;
    @Getter @Setter
    LocalDateTime createdAt, updatedAt;
    @Getter
    int courseId;

    public Attachment(int courseId, int id, String name, String fileType, String url, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.courseId = courseId;
        this.id = id;
        this.name = name;
        this.fileType = fileType;
        this.url = url;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Attachment(int courseId, String name, String fileType, String url) {
        this.courseId = courseId;
        this.name = name;
        this.fileType = fileType;
        this.url = url;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

}
