package eu.hypnomacka.timeout.server.services;

import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.QuizResult;
import eu.hypnomacka.timeout.server.core.query.QQuizResult;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;

@Service
public class CourseProgressService {

  @Data
  @AllArgsConstructor
  public static class Progress {
    private double points;
    private int bestAttemptsCount;
    private int threshold;

    public boolean isEligible() {
      return points >= threshold;
    }
  }

  public Progress calculate(String sessionToken, Course course) {
    if (sessionToken == null || sessionToken.isBlank() || course == null) {
      return new Progress(0.0, 0, 10);
    }

    List<QuizResult> results =
        new QQuizResult()
            .sessionToken
            .eq(sessionToken)
            .quiz
            .module
            .course
            .eq(course)
            .findList();

    Map<String, Double> bestByQuiz = new HashMap<>();
    for (QuizResult result : results) {
      String quizKey = result.getQuiz().getUuid().toString();
      Double currentBest = bestByQuiz.get(quizKey);
      if (currentBest == null || result.getScore() > currentBest) {
        bestByQuiz.put(quizKey, result.getScore());
      }
    }

    double points = 0.0;
    for (Double score : bestByQuiz.values()) {
      points += score;
    }

    return new Progress(points, bestByQuiz.size(), 10);
  }
}
