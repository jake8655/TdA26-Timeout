package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitRequest {
    private List<QuizAnswer> answers;
}
