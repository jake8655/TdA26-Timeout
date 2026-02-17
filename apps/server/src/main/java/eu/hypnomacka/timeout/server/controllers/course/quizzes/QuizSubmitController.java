package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.QuizAnswerSubmission;
import eu.hypnomacka.timeout.server.core.QuizResult;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QQuiz;
import java.time.Instant;
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
public class QuizSubmitController extends Controller {

  @PostMapping(
      value = "/{quizId}/submit",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> submitQuiz(
      @PathVariable String courseId,
      @PathVariable String quizId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody QuizSubmitRequest request) {

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
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("message", "course not live"));
    }

    Quiz quiz = new QQuiz().uuid.eq(quizUuid).course.eq(course).findOne();

    if (quiz == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "quiz not found"));
    }

    if (request.getAnswers() == null || request.getAnswers().isEmpty()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "answers are required"));
    }

    List<Question> questions = quiz.getQuestions();
    List<QuizAnswer> answers = request.getAnswers();

    if (questions.size() != answers.size()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "number of answers must match number of questions"));
    }

    List<Boolean> correctPerQuestion = new ArrayList<>();
    int correctCount = 0;

    for (QuizAnswer answer : answers) {
      Question question =
          questions.stream()
              .filter(q -> q.getUuid().toString().equals(answer.getUuid()))
              .findFirst()
              .orElse(null);
      if (question == null) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("message", "invalid question UUID in answers"));
      }

      boolean isCorrect = false;

      if (question.getType() == Question.Type.singleChoice) {
        if (answer.getSelectedIndex() == null) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
              .body(Map.of("message", "selectedIndex is required for singleChoice question"));
        }
        isCorrect = answer.getSelectedIndex().equals(question.getCorrectIndex());
      } else if (question.getType() == Question.Type.multipleChoice) {
        if (answer.getSelectedIndices() == null) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
              .body(
                  Map.of(
                      "message", "selectedIndices is required for multipleChoice" + " question"));
        }
        List<Integer> selected = answer.getSelectedIndices();
        List<Integer> correct = question.getCorrectIndices();
        if (selected.size() == correct.size()) {
          selected.sort(Integer::compareTo);
          correct.sort(Integer::compareTo);
          isCorrect = selected.equals(correct);
        }
      }

      correctPerQuestion.add(isCorrect);
      if (isCorrect) {
        correctCount++;
      }
    }

    double maxScore = (double) questions.size();
    double score = correctCount;

    QuizResult result = new QuizResult(quiz, score, maxScore, correctPerQuestion, Instant.now());
    result.save();

    if (sessionId != null && !sessionId.isBlank()) {
      eu.hypnomacka.timeout.server.core.CourseJoin join =
          new eu.hypnomacka.timeout.server.core.query.QCourseJoin()
              .course.eq(course)
              .sessionToken.eq(sessionId)
              .findOne();
      if (join != null) {
        join.setActive(true);
        join.setLastSeenAt(Instant.now());
        join.save();
      }
    }

    for (QuizAnswer answer : answers) {
      List<Integer> selectedIndices = new ArrayList<>();
      if (answer.getSelectedIndex() != null) {
        selectedIndices.add(answer.getSelectedIndex());
      } else if (answer.getSelectedIndices() != null) {
        selectedIndices = new ArrayList<>(answer.getSelectedIndices());
      }

      QuizAnswerSubmission submission =
          new QuizAnswerSubmission(result, answer.getUuid(), selectedIndices, Instant.now());
      submission.save();
    }

    quiz.setAttemptsCount(quiz.getAttemptsCount() + 1);
    quiz.save();

    QuizSubmitResponse response =
        new QuizSubmitResponse(
            quiz.getUuid().toString(),
            score,
            maxScore,
            correctPerQuestion,
            result.getSubmittedAt());

    return ResponseEntity.ok(response);
  }
}
