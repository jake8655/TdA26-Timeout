package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import java.time.Instant;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitRequest {
  private List<QuizAnswer> answers;
  private Instant attemptStartedAt;
}
