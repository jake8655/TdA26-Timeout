package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.QuizAnswerSubmission;
import eu.hypnomacka.timeout.server.core.QuizResult;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QQuiz;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/quizzes")
public class QuizStatsGetController extends Controller {

  @GetMapping(value = "/{quizId}/stats", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getQuizStats(
      @PathVariable String courseId, @PathVariable String quizId) {

    UUID courseUuid;
    try {
      courseUuid = UUID.fromString(courseId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "invalid UUID format"));
    }

    UUID quizUuid;
    try {
      quizUuid = UUID.fromString(quizId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "invalid UUID format"));
    }

    Course course = new QCourse().uuid.eq(courseUuid).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("message", "course not found"));
    }

    if (course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "course not live"));
    }

    Quiz quiz = new QQuiz().uuid.eq(quizUuid).course.eq(course).findOne();

    if (quiz == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "quiz not found"));
    }

    List<QuizResult> results = quiz.getQuizResults();
    int totalSubmissions = results.size();

    List<Map<String, Object>> questionStats = new ArrayList<>();

    for (Question question : quiz.getQuestions()) {
      Map<String, Object> questionStat = new HashMap<>();
      questionStat.put("questionUuid", question.getUuid().toString());
      questionStat.put("type", question.getType().toString());
      questionStat.put("question", question.getQuestion());
      questionStat.put("options", question.getOptions());

      if (question.getType() == Question.Type.singleChoice) {
        questionStat.put("correctIndex", question.getCorrectIndex());
      } else {
        questionStat.put("correctIndices", question.getCorrectIndices());
      }

      Map<Integer, Integer> optionCounts = new HashMap<>();
      for (QuizResult result : results) {
        for (QuizAnswerSubmission submission : result.getAnswerSubmissions()) {
          if (submission.getQuestionUuid().equals(question.getUuid().toString())) {
            for (Integer index : submission.getSelectedIndices()) {
              optionCounts.put(index, optionCounts.getOrDefault(index, 0) + 1);
            }
          }
        }
      }

      questionStat.put("optionCounts", optionCounts);
      questionStats.add(questionStat);
    }

    Map<String, Object> response = new HashMap<>();
    response.put("quizUuid", quiz.getUuid().toString());
    response.put("quizTitle", quiz.getTitle());
    response.put("totalSubmissions", totalSubmissions);
    response.put("questions", questionStats);

    return ResponseEntity.ok(response);
  }
}
