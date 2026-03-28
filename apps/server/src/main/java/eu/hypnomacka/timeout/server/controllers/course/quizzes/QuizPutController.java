package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.services.CourseVersionService;
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
public class QuizPutController extends Controller {

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final CourseVersionService courseVersionService;

  public QuizPutController(CourseVersionService courseVersionService) {
    this.courseVersionService = courseVersionService;
  }

  @PutMapping(
      value = "/{quizId}",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> updateQuiz(
      @PathVariable String courseId,
      @PathVariable String moduleId,
      @PathVariable String quizId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody QuizCreateRequest request) {

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

    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("message", "course not editable"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "forbidden"));
    }

    Quiz quiz = findQuiz(quizId, module);
    if (quiz == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "quiz not found"));
    }

    if (request.getTitle() != null && !request.getTitle().isBlank()) {
      quiz.setTitle(request.getTitle());
    }
    quiz.save();

    if (request.getQuestions() != null) {
      for (Question existingQuestion : quiz.getQuestions()) {
        existingQuestion.delete();
      }

      int position = 0;
      for (Object questionObj : request.getQuestions()) {
        JsonNode questionNode = objectMapper.valueToTree(questionObj);
        String type = questionNode.has("type") ? questionNode.get("type").asText() : null;
        String questionText =
            questionNode.has("question") ? questionNode.get("question").asText() : null;
        JsonNode optionsNode = questionNode.get("options");

        if (type == null || questionText == null || optionsNode == null || !optionsNode.isArray()) {
          continue;
        }

        Question question = new Question();
        question.setQuiz(quiz);
        question.setQuestion(questionText);
        question.setType(
            "singleChoice".equals(type)
                ? Question.Type.singleChoice
                : Question.Type.multipleChoice);
        question.setPosition(position++);

        List<String> options = new ArrayList<>();
        optionsNode.forEach(node -> options.add(node.asText()));
        question.setOptions(options);

        if ("singleChoice".equals(type)) {
          if (questionNode.has("correctIndex")) {
            question.setCorrectIndex(questionNode.get("correctIndex").asInt());
          }
        } else if ("multipleChoice".equals(type)) {
          if (questionNode.has("correctIndices")) {
            List<Integer> correctIndices = new ArrayList<>();
            questionNode.get("correctIndices").forEach(node -> correctIndices.add(node.asInt()));
            question.setCorrectIndices(correctIndices);
          }
        }

        question.save();
      }
    }

    QuizResponse response = buildQuizResponse(quiz);

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Quiz updated");
    }

    return ResponseEntity.ok(response);
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
