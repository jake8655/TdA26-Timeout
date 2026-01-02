package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
    private UUID uuid;

    @Column(nullable = false)
    private String username;

    @JsonIgnore
    @Column(name = "hashed_pass", nullable = false)
    private String hashedPass;

    @OneToMany(mappedBy = "lecturer", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Course> courses;

    @WhenCreated
    private Instant createdAt;

    @WhenModified
    private Instant updatedAt;

    public Lecturer() {}

    public Lecturer(String username, String hashedPass) {
        this.username = username;
        this.hashedPass = hashedPass;
    }
}
