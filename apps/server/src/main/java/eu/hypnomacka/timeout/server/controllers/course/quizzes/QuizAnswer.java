package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuizAnswer {
    private String uuid;
    private Integer selectedIndex;
    private List<Integer> selectedIndices;
    private String comment;
}
