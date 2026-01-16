package eu.hypnomacka.timeout.server.core;

import com.fasterxml.jackson.annotation.JsonBackReference;
import io.ebean.Model;
import io.ebean.annotation.DbJson;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "quiz_answer_submissions")
public class QuizAnswerSubmission extends Model {

  @Id private UUID uuid;

  @ManyToOne(optional = false)
  @JoinColumn(name = "quiz_result_uuid", nullable = false)
  @JsonBackReference
  private QuizResult quizResult;

  @Column(nullable = false, columnDefinition = "text")
  private String questionUuid;

  @DbJson
  @Column(nullable = false, columnDefinition = "json")
  private List<Integer> selectedIndices;

  @Column(nullable = false)
  private Instant submittedAt;

  public QuizAnswerSubmission() {}

  public QuizAnswerSubmission(
      QuizResult quizResult,
      String questionUuid,
      List<Integer> selectedIndices,
      Instant submittedAt) {
    this.quizResult = quizResult;
    this.questionUuid = questionUuid;
    this.selectedIndices = selectedIndices;
    this.submittedAt = submittedAt;
  }
}
