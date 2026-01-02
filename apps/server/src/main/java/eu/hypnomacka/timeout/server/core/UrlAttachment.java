package eu.hypnomacka.timeout.server.core;

import io.ebean.Model;
import io.ebean.annotation.WhenCreated;
import io.ebean.annotation.WhenModified;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter @Setter
@Entity
@Table(name = "url_attachments")
public class UrlAttachment extends Model {

    @Id
    private UUID uuid;

    @ManyToOne(optional = false)
    @JoinColumn(name = "course_uuid", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String url;

    @Column
    private String description;

    @Column(nullable = false)
    private String faviconUrl;

    @WhenCreated
    private Instant createdAt;

    @WhenModified
    private Instant updatedAt;

    public UrlAttachment() {
    }

    public UrlAttachment(Course course, String name, String url, String description, String faviconUrl) {
        this.course = course;
        this.name = name;
        this.url = url;
        this.description = description;
        this.faviconUrl = faviconUrl;
    }

    @Override
    public void save() {
        super.save();
        setCreatedAt(Instant.now());
    }

}
