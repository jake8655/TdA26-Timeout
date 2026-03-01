package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Quiz;
import io.ebean.DB;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/quizzes")
public class QuizDeleteController extends Controller {

  @DeleteMapping(value = "/{quizId}")
  public ResponseEntity<?> deleteQuiz(
      @PathVariable String courseId,
      @PathVariable String moduleId,
      @PathVariable String quizId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

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

    if (!isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "course not editable"));
    }

    int moduleItemCount =
        module.getFileAttachments().size()
            + module.getUrlAttachments().size()
            + module.getQuizzes().size();
    if (moduleItemCount <= 1) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "module must contain at least one material or quiz"));
    }

    Quiz quiz = findQuiz(quizId, module);
    if (quiz == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "quiz not found"));
    }

    quiz.delete();

    return ResponseEntity.noContent().build();
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
