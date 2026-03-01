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
@Table(name = "modules")
public class Module extends Model {

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "course_uuid", nullable = false)
  @JsonBackReference
  private Course course;

  @Column(nullable = false)
  private String title;

  @Column private String description;

  @Column(nullable = false)
  @DbDefault("false")
  private Boolean visible = false;

  @Column private Instant revealedAt;

  @OneToMany(mappedBy = "module", cascade = CascadeType.ALL)
  @JsonManagedReference
  private List<FileAttachment> fileAttachments = new ArrayList<>();

  @OneToMany(mappedBy = "module", cascade = CascadeType.ALL)
  @JsonManagedReference
  private List<UrlAttachment> urlAttachments = new ArrayList<>();

  @OneToMany(mappedBy = "module", cascade = CascadeType.ALL)
  @JsonManagedReference
  private List<Quiz> quizzes = new ArrayList<>();

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public Module() {}

  public Module(Course course, String title, String description) {
    this.course = course;
    this.title = title;
    this.description = description;
    this.visible = false;
  }
}
