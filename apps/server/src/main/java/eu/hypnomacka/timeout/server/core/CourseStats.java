package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonBackReference;
import io.ebean.Model;
import io.ebean.annotation.DbDefault;
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
@Table(name = "course_stats")
public class CourseStats extends Model {

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "course_uuid", nullable = false, unique = true)
  @JsonBackReference
  private Course course;

  @Column(nullable = false)
  @DbDefault("0")
  private Integer totalSubmissions = 0;

  @Column(nullable = false)
  @DbDefault("0")
  private Double totalScoreSum = 0.0;

  @Column(nullable = false)
  @DbDefault("0")
  private Double totalMaxScoreSum = 0.0;

  @Column(nullable = false)
  @DbDefault("0")
  private Double totalPercentageSum = 0.0;

  @Column(nullable = false)
  @DbDefault("0")
  private Integer downloads = 0;

  @Column(nullable = false)
  @DbDefault("0")
  private Integer siteVisits = 0;

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public CourseStats() {}

  public CourseStats(Course course) {
    this.uuid = UUID.randomUUID();
    this.course = course;
  }
}
