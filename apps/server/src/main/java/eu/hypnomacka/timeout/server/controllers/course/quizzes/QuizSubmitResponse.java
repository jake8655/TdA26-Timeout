package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import java.time.Instant;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class QuizSubmitResponse {
  private String quizUuid;
  private String resultUuid;
  private Double score;
  private Double maxScore;
  private List<Boolean> correctPerQuestion;
  private Instant submittedAt;
  private Instant attemptStartedAt;
  private Integer durationSeconds;
  private String participantUsername;
  private String participantSessionToken;
  private List<QuizAnswerSelectionResponse> answers;

  public QuizSubmitResponse(
      String quizUuid,
      String resultUuid,
      Double score,
      Double maxScore,
      List<Boolean> correctPerQuestion,
      Instant submittedAt,
      Instant attemptStartedAt,
      Integer durationSeconds) {
    this.quizUuid = quizUuid;
    this.resultUuid = resultUuid;
    this.score = score;
    this.maxScore = maxScore;
    this.correctPerQuestion = correctPerQuestion;
    this.submittedAt = submittedAt;
    this.attemptStartedAt = attemptStartedAt;
    this.durationSeconds = durationSeconds;
  }
}
