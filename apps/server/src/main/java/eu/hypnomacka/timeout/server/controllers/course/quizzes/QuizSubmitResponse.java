package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizSubmitResponse {
    private String quizUuid;
    private Double score;
    private Double maxScore;
    private List<Boolean> correctPerQuestion;
    private Instant submittedAt;
}
