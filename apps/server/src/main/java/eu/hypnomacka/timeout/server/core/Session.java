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
@Table(name = "sessions")
public class Session extends Model {

    @Id
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "lecturer_id", nullable = false)
    private Lecturer lecturer;

    @WhenCreated
    private Instant createdAt;

    @WhenModified
    private Instant updatedAt;

    @Column(nullable = false)
    private Instant expiresAt;

    public Session() {
    }

    public Session(Lecturer lecturer, Instant expiresAt) {
        this.lecturer = lecturer;
        this.expiresAt = expiresAt;
    }
}
