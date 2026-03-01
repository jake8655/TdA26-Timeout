package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import io.ebean.DB;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/quizzes")
public class QuizGetController extends Controller {

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> listQuizzes(
      @PathVariable String courseId,
      @PathVariable String moduleId,
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

    boolean isLecturer = isLecturerSession(sessionId);
    if (!isLecturer
        && (course.getStatus() != Course.Status.LIVE
            || !Boolean.TRUE.equals(module.getVisible()))) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("message", "module not visible"));
    }

    List<Quiz> quizzes = new ArrayList<>(module.getQuizzes());
    quizzes.sort(Comparator.comparing(Quiz::getCreatedAt).reversed());

    List<QuizResponse> responses = new ArrayList<>();
    for (Quiz quiz : quizzes) {
      responses.add(buildQuizResponse(quiz));
    }

    return ResponseEntity.ok(responses);
  }

  @GetMapping(value = "/{quizId}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getQuiz(
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

    boolean isLecturer = isLecturerSession(sessionId);
    if (!isLecturer
        && (course.getStatus() != Course.Status.LIVE
            || !Boolean.TRUE.equals(module.getVisible()))) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("message", "module not visible"));
    }

    Quiz quiz = findQuiz(quizId, module);
    if (quiz == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "quiz not found"));
    }

    return ResponseEntity.ok(buildQuizResponse(quiz));
  }

  private QuizResponse buildQuizResponse(Quiz quiz) {
    List<Object> questionResponses = new ArrayList<>();
    for (Question question : quiz.getQuestions()) {
      QuestionResponse qResponse = new QuestionResponse();
      qResponse.setUuid(question.getUuid().toString());
      qResponse.setType(
          question.getType() == Question.Type.singleChoice
              ? QuestionResponse.types.singleChoice
              : QuestionResponse.types.multipleChoice);
      qResponse.setQuestion(question.getQuestion());
      qResponse.setOptions(question.getOptions());
      if (question.getType() == Question.Type.singleChoice) {
        qResponse.setCorrectIndex(question.getCorrectIndex());
      } else {
        qResponse.setCorrectIndices(question.getCorrectIndices());
      }
      questionResponses.add(qResponse);
    }

    return new QuizResponse(
        quiz.getUuid().toString(), quiz.getTitle(), quiz.getAttemptsCount(), questionResponses);
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
