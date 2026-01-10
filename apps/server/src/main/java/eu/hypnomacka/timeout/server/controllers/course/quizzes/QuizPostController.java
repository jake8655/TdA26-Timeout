package eu.hypnomacka.timeout.server.controllers.course.quizzes;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QQuiz;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/courses/{courseId}/quizzes")
public class QuizPostController extends Controller {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping(
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createQuiz(
            @PathVariable String courseId, @RequestBody QuizCreateRequest request) {

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

        if (request.getTitle() == null || request.getTitle().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "title is required"));
        }

        Quiz quiz = new Quiz(course, request.getTitle());
        quiz.save();

        if (request.getQuestions() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "questions are required"));
        }

        for (Object questionObj : request.getQuestions()) {
            JsonNode questionNode = objectMapper.valueToTree(questionObj);
            String type = questionNode.has("type") ? questionNode.get("type").asText() : null;
            String questionText =
                    questionNode.has("question") ? questionNode.get("question").asText() : null;
            JsonNode optionsNode = questionNode.get("options");

            if (type == null
                    || questionText == null
                    || optionsNode == null
                    || !optionsNode.isArray()) {
                continue;
            }

            Question question = new Question();
            question.setQuiz(quiz);
            question.setQuestion(questionText);
            question.setType(
                    type.equals("singleChoice")
                            ? Question.Type.singleChoice
                            : Question.Type.multipleChoice);

            List<String> options = new ArrayList<>();
            optionsNode.forEach(node -> options.add(node.asText()));
            question.setOptions(options);

            if (type.equals("singleChoice")) {
                if (questionNode.has("correctIndex")) {
                    question.setCorrectIndex(questionNode.get("correctIndex").asInt());
                }
            } else if ("multipleChoice".equals(type)) {
                if (questionNode.has("correctIndices")) {
                    List<Integer> correctIndices = new ArrayList<>();
                    questionNode
                            .get("correctIndices")
                            .forEach(node -> correctIndices.add(node.asInt()));
                    question.setCorrectIndices(correctIndices);
                }
            }

            question.save();
        }

        Quiz updatedQuiz = new QQuiz().uuid.eq(quiz.getUuid()).findOne();
        if (updatedQuiz == null) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "newly created quiz not found in database"));
        }
        QuizResponse response = buildQuizResponse(updatedQuiz);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
                quiz.getUuid().toString(),
                quiz.getTitle(),
                quiz.getAttemptsCount(),
                questionResponses);
    }
}
