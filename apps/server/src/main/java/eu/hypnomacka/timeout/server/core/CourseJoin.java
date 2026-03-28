package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonBackReference;
import io.ebean.Model;
import io.ebean.annotation.WhenCreated;
import io.ebean.annotation.WhenModified;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "course_joins")
public class CourseJoin extends Model {

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "course_uuid", nullable = false)
  @JsonBackReference
  private Course course;

  @Column(nullable = false)
  private String sessionToken;

  @Column private String username;

  @WhenCreated private Instant joinedAt;

  @WhenModified private Instant lastSeenAt;

  @Column(nullable = false)
  private Boolean active = true;

  public CourseJoin() {}

  public CourseJoin(Course course, String sessionToken) {
    this.course = course;
    this.sessionToken = sessionToken;
    this.active = true;
  }
}
