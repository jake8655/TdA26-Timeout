package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonBackReference;

import io.ebean.Model;
import io.ebean.annotation.DbEnumValue;
import io.ebean.annotation.WhenCreated;
import io.ebean.annotation.WhenModified;

import jakarta.persistence.*;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "file_attachments")
public class FileAttachment extends Model {

    public enum Type {
        file("file");

        private final String dbValue;

        Type(String dbValue) {
            this.dbValue = dbValue;
        }

        @DbEnumValue
        public String getDbValue() {
            return dbValue;
        }
    }

    @Id private UUID uuid;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_uuid", nullable = false)
    @JsonBackReference
    private Course course;

    @Column(nullable = false)
    private String name;

    @Column private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    private Long sizeBytes;

    private String mimeType;

    @Column(nullable = false)
    private String fileUrl;

    @WhenCreated private Instant createdAt;

    @WhenModified private Instant updatedAt;

    public FileAttachment() {}

    public FileAttachment(
            Course course,
            String name,
            String description,
            Type type,
            Long sizeBytes,
            String mimeType,
            String fileUrl) {
        this.course = course;
        this.name = name;
        this.description = description;
        this.type = type;
        this.sizeBytes = sizeBytes;
        this.mimeType = mimeType;
        this.fileUrl = fileUrl;
    }
}
