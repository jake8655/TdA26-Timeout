package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QQuiz;
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
public class QuizGetController extends Controller {

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> listQuizzes(
      @PathVariable String courseId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    UUID courseUuid;
    try {
      courseUuid = UUID.fromString(courseId);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "invalid UUID format"));
    }

    Course course = new QCourse().uuid.eq(courseUuid).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("message", "course not found"));
    }

    if (course.getStatus() != Course.Status.LIVE
        && course.getStatus() != Course.Status.ARCHIVED
        && !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "course not live"));
    }

    List<Quiz> quizzes = new QQuiz().course.eq(course).orderBy().createdAt.desc().findList();

    List<QuizResponse> responses = new ArrayList<>();
    for (Quiz quiz : quizzes) {
      responses.add(buildQuizResponse(quiz));
    }

    return ResponseEntity.ok(responses);
  }

  @GetMapping(value = "/{quizId}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> getQuiz(
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

    if (course.getStatus() != Course.Status.LIVE
        && course.getStatus() != Course.Status.ARCHIVED
        && !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "course not live"));
    }

    Quiz quiz = new QQuiz().uuid.eq(quizUuid).course.eq(course).findOne();

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
}
