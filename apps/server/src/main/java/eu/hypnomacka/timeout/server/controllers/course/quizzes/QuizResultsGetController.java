package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseJoin;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.QuizResult;
import eu.hypnomacka.timeout.server.core.query.QCourseJoin;
import eu.hypnomacka.timeout.server.core.query.QQuizResult;
import io.ebean.DB;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/quizzes")
public class QuizResultsGetController extends Controller {

  @GetMapping(value = "/{quizId}/results", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getQuizResults(
      @PathVariable String courseId,
      @PathVariable String moduleId,
      @PathVariable String quizId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @CookieValue(value = "STUDENT_SESSION_ID", required = false) String studentSessionId) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("message", "course not found"));
    }

    Module module = findModule(moduleId, course);
    if (module == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("message", "module not found"));
    }

    Quiz quiz = findQuiz(quizId, module);
    if (quiz == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "quiz not found"));
    }

    boolean isLecturer = isLecturerSession(sessionId);

    if (!isLecturer) {
      if (course.getStatus() == Course.Status.ARCHIVED) {
        if (!isParticipant(course, studentSessionId)) {
          return ResponseEntity.status(HttpStatus.NOT_FOUND)
              .body(Map.of("message", "course not found"));
        }
      } else if (course.getStatus() != Course.Status.LIVE
          || !Boolean.TRUE.equals(module.getVisible())) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("message", "module not visible"));
      }
    }

    List<QuizResult> results = new ArrayList<>();
    if (isLecturer) {
      results = new QQuizResult().quiz.eq(quiz).orderBy().submittedAt.desc().findList();
    } else if (studentSessionId != null && !studentSessionId.isBlank()) {
      results =
          new QQuizResult()
              .quiz
              .eq(quiz)
              .sessionToken
              .eq(studentSessionId)
              .orderBy()
              .submittedAt
              .desc()
              .findList();
    }

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

  private boolean isParticipant(Course course, String studentSessionId) {
    if (studentSessionId == null || studentSessionId.isBlank()) {
      return false;
    }
    CourseJoin join =
        new QCourseJoin().course.eq(course).sessionToken.eq(studentSessionId).findOne();
    return join != null && Boolean.TRUE.equals(join.getHasSubmittedQuiz());
  }

  private Course findCourse(String courseId) {
    try {
      return DB.find(Course.class, UUID.fromString(courseId));
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  private Module findModule(String moduleId, Course course) {
    try {
      Module module = DB.find(Module.class, UUID.fromString(moduleId));
      if (module == null || !module.getCourse().getUuid().equals(course.getUuid())) {
        return null;
      }
      return module;
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  private Quiz findQuiz(String quizId, Module module) {
    try {
      Quiz quiz = DB.find(Quiz.class, UUID.fromString(quizId));
      if (quiz == null || !quiz.getModule().getUuid().equals(module.getUuid())) {
        return null;
      }
      return quiz;
    } catch (IllegalArgumentException e) {
      return null;
    }
  }
}
