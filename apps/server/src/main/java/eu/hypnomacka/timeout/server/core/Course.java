package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonBackReference;
import io.ebean.Model;
import io.ebean.annotation.WhenCreated;
import io.ebean.annotation.WhenModified;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter @Setter
@Entity
@Table(name = "courses")
public class Course extends Model {

    @Id
    private UUID uuid;

    @ManyToOne(optional = false)
    @JoinColumn(name = "lecturer_uuid", nullable = false)
    @JsonBackReference
    private Lecturer lecturer;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<FileAttachment> fileAttachments = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<UrlAttachment> urlAttachments = new ArrayList<>();

    @WhenCreated
    private Instant createdAt;

    @WhenModified
    private Instant updatedAt;

    public Course() {}

    public Course(Lecturer lecturer, String name, String description) {
        this.lecturer = lecturer;
        this.name = name;
        this.description = description;
    }

}
