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
@Table(name = "quizzes")
public class Quiz extends Model {

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "course_uuid", nullable = false)
  @JsonBackReference
  private Course course;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  @DbDefault("0")
  private Integer attemptsCount = 0;

  @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL)
  @JsonManagedReference
  @OrderBy("position")
  private List<Question> questions = new ArrayList<>();

  @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL)
  @JsonManagedReference
  private List<QuizResult> quizResults = new ArrayList<>();

  @WhenCreated private Instant createdAt;

  @WhenModified private Instant updatedAt;

  public Quiz() {}

  public Quiz(Course course, String title) {
    this.course = course;
    this.title = title;
  }
}
