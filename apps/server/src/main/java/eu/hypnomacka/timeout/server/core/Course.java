package eu.hypnomacka.timeout.server.core;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;

public class Course {

    @Getter @Setter
    int id;
    @Getter
    String name, description;
    @Getter @Setter
    LocalDateTime createdAt, updatedAt;
    @Getter @Setter
    ArrayList<Attachment> attachments = new ArrayList<>();
    @Getter
    int lecturerId;

    public Course(int id, int lecturerId, String name, String description, LocalDateTime createdAt, LocalDateTime updatedAt, ArrayList<Attachment> attachments) {
        this.id = id;
        this.lecturerId = lecturerId;
        this.name = name;
        this.description = description;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.attachments = attachments;
    }

    public Course(int lecturerId, String name, String description) {
        this.lecturerId = lecturerId;
        this.name = name;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    public void addAttachment(Attachment attachment) {
        this.attachments.add(attachment);
        this.updatedAt = LocalDateTime.now();
    }

}
