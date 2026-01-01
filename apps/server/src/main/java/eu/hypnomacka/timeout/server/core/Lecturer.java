package eu.hypnomacka.timeout.server.core;

import io.ebean.Model;
import io.ebean.annotation.WhenCreated;
import io.ebean.annotation.WhenModified;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter @Setter
@Entity
@Table(name = "lecturers")
public class Lecturer extends Model {

    @Id
    private UUID id;

    @Column(nullable = false)
    private String username;

    @Column(name = "hashed_pass", nullable = false)
    private String hashedPass;

    @OneToMany(mappedBy = "lecturer", cascade = CascadeType.ALL)
    private List<Course> courses;

    @WhenCreated
    private Instant createdAt;

    @WhenModified
    private Instant updatedAt;

    public Lecturer() {
    }

    public Lecturer(String username, String hashedPass) {
        this.username = username;
        this.hashedPass = hashedPass;
    }
}
