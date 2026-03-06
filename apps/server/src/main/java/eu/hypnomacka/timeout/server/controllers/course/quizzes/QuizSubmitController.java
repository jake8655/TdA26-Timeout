package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.QuizAnswerSubmission;
import eu.hypnomacka.timeout.server.core.QuizResult;
import eu.hypnomacka.timeout.server.services.CourseStatsService;
import io.ebean.DB;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/modules/{moduleId}/quizzes")
@RequiredArgsConstructor
public class QuizSubmitController extends Controller {

  private final CourseStatsService statsService;

  @PostMapping(
      value = "/{quizId}/submit",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> submitQuiz(
      @PathVariable String courseId,
      @PathVariable String moduleId,
      @PathVariable String quizId,
      @CookieValue(value = "STUDENT_SESSION_ID", required = false) String studentSessionId,
      @RequestBody QuizSubmitRequest request) {

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

    if (course.getStatus() != Course.Status.LIVE || !Boolean.TRUE.equals(module.getVisible())) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("message", "module not visible"));
    }

    Quiz quiz = findQuiz(quizId, module);
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
              .body(Map.of("message", "selectedIndices is required for multipleChoice question"));
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
    if (studentSessionId != null && !studentSessionId.isBlank()) {
      result.setSessionToken(studentSessionId);
    }
    result.save();

    if (studentSessionId != null && !studentSessionId.isBlank()) {
      eu.hypnomacka.timeout.server.core.CourseJoin join =
          new eu.hypnomacka.timeout.server.core.query.QCourseJoin()
              .course
              .eq(course)
              .sessionToken
              .eq(studentSessionId)
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

    statsService.recordQuizResult(course, score, maxScore);

    QuizSubmitResponse response =
        new QuizSubmitResponse(
            quiz.getUuid().toString(),
            score,
            maxScore,
            correctPerQuestion,
            result.getSubmittedAt());

    return ResponseEntity.ok(response);
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
