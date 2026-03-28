package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import io.ebean.Model;
import io.ebean.annotation.DbDefault;
import io.ebean.annotation.WhenCreated;
import io.ebean.annotation.WhenModified;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "courses")
public class Course extends Model {

  public enum Status {
    DRAFT,
    SCHEDULED,
    LIVE,
    PAUSED,
    ARCHIVED
  }

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "lecturer_uuid", nullable = false)
  @JsonBackReference
  private Lecturer lecturer;

  @ManyToOne(optional = true)
  @JoinColumn(name = "country_id")
  private Country country;

  @ManyToOne(optional = true)
  @JoinColumn(name = "branch_id")
  private Branch branch;

  @Column(nullable = false)
  private String name;

  @Column private String description;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @DbDefault("DRAFT")
  private Status status = Status.DRAFT;

  @Column private Instant scheduledStartAt;

  @Column private Instant pausedAt;

  @Column private Instant archivedAt;

  @Column private Instant lastWentLiveAt;

  @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
  @JsonManagedReference
  private List<Module> modules = new ArrayList<>();

  @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
  @JsonManagedReference
  private List<Event> events = new ArrayList<>();

  @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
  @JsonManagedReference
  private List<CourseJoin> joins = new ArrayList<>();

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public Course() {}

  public Course(Lecturer lecturer, String name, String description) {
    this.lecturer = lecturer;
    this.name = name;
    this.description = description;
    this.status = Status.DRAFT;
  }
}
