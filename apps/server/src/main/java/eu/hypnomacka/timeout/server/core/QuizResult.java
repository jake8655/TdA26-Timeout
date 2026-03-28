package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import io.ebean.Model;
import io.ebean.annotation.DbJson;
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
@Table(name = "quiz_results")
public class QuizResult extends Model {

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "quiz_uuid", nullable = false)
  @JsonBackReference
  private Quiz quiz;

  @Column(nullable = false)
  private Double score;

  @Column(nullable = false)
  private Double maxScore;

  @DbJson
  @Column(nullable = false, columnDefinition = "json")
  private List<Boolean> correctPerQuestion;

  @Column private String sessionToken;

  @Column private Instant attemptStartedAt;

  @Column private Integer durationSeconds;

  @Column(nullable = false)
  private Instant submittedAt;

  @OneToMany(mappedBy = "quizResult", cascade = CascadeType.ALL)
  @JsonManagedReference
  private List<QuizAnswerSubmission> answerSubmissions = new ArrayList<>();

  public QuizResult() {}

  public QuizResult(
      Quiz quiz,
      Double score,
      Double maxScore,
      List<Boolean> correctPerQuestion,
      Instant submittedAt) {
    this.quiz = quiz;
    this.score = score;
    this.maxScore = maxScore;
    this.correctPerQuestion = correctPerQuestion;
    this.submittedAt = submittedAt;
  }

  public QuizResult(
      Quiz quiz,
      Double score,
      Double maxScore,
      List<Boolean> correctPerQuestion,
      Instant submittedAt,
      Instant attemptStartedAt,
      Integer durationSeconds) {
    this.quiz = quiz;
    this.score = score;
    this.maxScore = maxScore;
    this.correctPerQuestion = correctPerQuestion;
    this.submittedAt = submittedAt;
    this.attemptStartedAt = attemptStartedAt;
    this.durationSeconds = durationSeconds;
  }
}
