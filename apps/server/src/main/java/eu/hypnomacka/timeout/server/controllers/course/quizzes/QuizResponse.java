package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizResponse {
  private String uuid;
  private String title;
  private Integer attemptsCount;
  private List<Object> questions;
}
