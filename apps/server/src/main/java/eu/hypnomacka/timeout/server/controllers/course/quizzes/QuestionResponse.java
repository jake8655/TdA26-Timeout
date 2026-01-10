package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {
    public enum types {
        singleChoice,
        multipleChoice
    }

    private String uuid;
    private types type;
    private String question;
    private List<String> options;
}
