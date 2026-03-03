package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Event;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import java.util.Map;
import java.util.UUID;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}")
public class CourseDuplicateController extends Controller {

  @PostMapping(value = "/duplicate", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> duplicate(
      @PathVariable("courseId") String courseIdStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody DuplicateRequest request) {
    UUID courseId;
    try {
      courseId = UUID.fromString(courseIdStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = new QCourse().uuid.eq(courseId).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    String newName = request.getName();
    if (newName == null || newName.isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "name required"));
    }

    Course clone = new Course(course.getLecturer(), newName, course.getDescription());
    clone.setStatus(Course.Status.DRAFT);
    clone.save();

    for (Module module : course.getModules()) {
      Module moduleCopy = new Module(clone, module.getTitle(), module.getDescription());
      moduleCopy.setVisible(false);
      moduleCopy.setRevealedAt(null);
      moduleCopy.setOrderIndex(module.getOrderIndex());
      moduleCopy.save();

      for (FileAttachment attachment : module.getFileAttachments()) {
        FileAttachment copy =
            new FileAttachment(
                moduleCopy,
                attachment.getName(),
                attachment.getDescription(),
                attachment.getType(),
                attachment.getSizeBytes(),
                attachment.getMimeType(),
                attachment.getFileUrl());
        copy.save();
      }

      for (UrlAttachment attachment : module.getUrlAttachments()) {
        UrlAttachment copy =
            new UrlAttachment(
                moduleCopy,
                attachment.getName(),
                attachment.getUrl(),
                attachment.getDescription(),
                attachment.getType(),
                attachment.getFaviconUrl());
        copy.save();
      }

      for (Quiz quiz : module.getQuizzes()) {
        Quiz newQuiz = new Quiz(moduleCopy, quiz.getTitle());
        newQuiz.save();

        for (Question question : quiz.getQuestions()) {
          Question newQuestion = new Question();
          newQuestion.setQuiz(newQuiz);
          newQuestion.setType(question.getType());
          newQuestion.setQuestion(question.getQuestion());
          newQuestion.setOptions(question.getOptions());
          newQuestion.setCorrectIndex(question.getCorrectIndex());
          newQuestion.setCorrectIndices(question.getCorrectIndices());
          newQuestion.setPosition(question.getPosition());
          newQuestion.save();
        }
      }
    }

    for (Event event : course.getEvents()) {
      Event copy = new Event();
      copy.setUuid(UUID.randomUUID());
      copy.setCourse(clone);
      copy.setType(event.getType());
      copy.setMessage(event.getMessage());
      copy.setEdited(event.getEdited());
      copy.save();
    }

    return ResponseEntity.status(HttpStatus.CREATED).body(clone);
  }

  @Data
  public static class DuplicateRequest {
    private String name;
  }
}
