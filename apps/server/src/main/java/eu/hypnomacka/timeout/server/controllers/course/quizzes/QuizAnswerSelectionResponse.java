package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnswerSelectionResponse {
  private String questionUuid;
  private List<Integer> selectedIndices;
}
