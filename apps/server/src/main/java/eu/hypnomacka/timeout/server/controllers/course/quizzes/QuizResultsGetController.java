package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseJoin;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.QuizResult;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QCourseJoin;
import eu.hypnomacka.timeout.server.core.query.QQuiz;
import eu.hypnomacka.timeout.server.core.query.QQuizResult;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/quizzes")
public class QuizResultsGetController extends Controller {

  @GetMapping(value = "/{quizId}/results", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getQuizResults(
      @PathVariable String courseId,
      @PathVariable String quizId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

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

    if (course.getStatus() == Course.Status.ARCHIVED) {
      if (!isParticipant(course, sessionId)) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("message", "course not found"));
      }
    }

    Quiz quiz = new QQuiz().uuid.eq(quizUuid).course.eq(course).findOne();

    if (quiz == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "quiz not found"));
    }

    List<QuizResult> results =
        new QQuizResult().quiz.eq(quiz).orderBy().submittedAt.desc().findList();

    List<QuizSubmitResponse> responses = new ArrayList<>();
    for (QuizResult result : results) {
      responses.add(
          new QuizSubmitResponse(
              result.getQuiz().getUuid().toString(),
              result.getScore(),
              result.getMaxScore(),
              result.getCorrectPerQuestion(),
              result.getSubmittedAt()));
    }

    return ResponseEntity.ok(responses);
  }

  private boolean isParticipant(Course course, String sessionId) {
    if (sessionId == null || sessionId.isBlank()) {
      return false;
    }
    CourseJoin join = new QCourseJoin().course.eq(course).sessionToken.eq(sessionId).findOne();
    return join != null && Boolean.TRUE.equals(join.getActive());
  }
}
