package eu.hypnomacka.timeout.server.controllers.course;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Question;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.services.CourseVersionService;
import io.ebean.DB;
import io.ebean.annotation.Transactional;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CoursePortabilityController extends Controller {

  private final CourseVersionService courseVersionService;
  private final ObjectMapper objectMapper = new ObjectMapper();

  @PostMapping("/courses/{courseId}/export")
  public ResponseEntity<?> exportCourse(
      @PathVariable String courseId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    var session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    Map<String, Object> payload = new LinkedHashMap<>();
    payload.put("formatVersion", 1);
    payload.put("exportedAt", java.time.Instant.now().toString());
    payload.put("course", Map.of("name", course.getName(), "description", course.getDescription()));

    List<Map<String, Object>> modules = new ArrayList<>();
    for (Module module : course.getModules()) {
      Map<String, Object> modulePayload = new LinkedHashMap<>();
      modulePayload.put("title", module.getTitle());
      modulePayload.put("description", module.getDescription());
      modulePayload.put("orderIndex", module.getOrderIndex());
      modulePayload.put("visible", module.getVisible());

      List<Map<String, Object>> materials = new ArrayList<>();
      for (FileAttachment fileAttachment : module.getFileAttachments()) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("type", "file");
        item.put("name", fileAttachment.getName());
        item.put("description", fileAttachment.getDescription());
        item.put("url", fileAttachment.getFileUrl());
        item.put("mimeType", fileAttachment.getMimeType());
        item.put("sizeBytes", fileAttachment.getSizeBytes());
        materials.add(item);
      }
      for (UrlAttachment urlAttachment : module.getUrlAttachments()) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("type", "url");
        item.put("name", urlAttachment.getName());
        item.put("description", urlAttachment.getDescription());
        item.put("url", urlAttachment.getUrl());
        item.put("faviconUrl", urlAttachment.getFaviconUrl());
        materials.add(item);
      }
      modulePayload.put("materials", materials);

      List<Map<String, Object>> quizzes = new ArrayList<>();
      for (Quiz quiz : module.getQuizzes()) {
        Map<String, Object> quizPayload = new LinkedHashMap<>();
        quizPayload.put("title", quiz.getTitle());

        List<Map<String, Object>> questions = new ArrayList<>();
        for (Question question : quiz.getQuestions()) {
          Map<String, Object> questionPayload = new LinkedHashMap<>();
          questionPayload.put("type", question.getType().name());
          questionPayload.put("question", question.getQuestion());
          questionPayload.put("options", question.getOptions());
          questionPayload.put("correctIndex", question.getCorrectIndex());
          questionPayload.put("correctIndices", question.getCorrectIndices());
          questionPayload.put("position", question.getPosition());
          questions.add(questionPayload);
        }
        quizPayload.put("questions", questions);
        quizzes.add(quizPayload);
      }
      modulePayload.put("quizzes", quizzes);

      modules.add(modulePayload);
    }

    payload.put("modules", modules);
    return ResponseEntity.ok(payload);
  }

  @PostMapping("/courses/import")
  @Transactional
  public ResponseEntity<?> importCourse(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody Map<String, Object> payload) {
    var session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    Account actor = resolveAccount(session);
    var lecturer = resolveLecturer(session);
    if (lecturer == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "lecturer not found"));
    }

    Map<String, Object> courseMap = castMap(payload.get("course"));
    if (courseMap == null || courseMap.get("name") == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid import payload"));
    }

    Course newCourse =
        new Course(
            lecturer,
            String.valueOf(courseMap.get("name")),
            String.valueOf(courseMap.getOrDefault("description", "")));
    newCourse.setStatus(Course.Status.DRAFT);
    newCourse.setCountry(session.getCountry());
    newCourse.setBranch(session.getBranch());
    newCourse.save();

    List<Map<String, Object>> modules = castListMap(payload.get("modules"));
    int fallbackOrder = 0;
    for (Map<String, Object> modulePayload : modules) {
      Module module =
          new Module(
              newCourse,
              String.valueOf(modulePayload.getOrDefault("title", "Untitled module")),
              String.valueOf(modulePayload.getOrDefault("description", "")));
      Object orderIndex = modulePayload.get("orderIndex");
      if (orderIndex instanceof Number number) {
        module.setOrderIndex(number.intValue());
      } else {
        module.setOrderIndex(fallbackOrder);
      }
      fallbackOrder++;
      module.setVisible(false);
      module.save();

      for (Map<String, Object> materialPayload : castListMap(modulePayload.get("materials"))) {
        String type = String.valueOf(materialPayload.getOrDefault("type", "url"));
        if ("file".equalsIgnoreCase(type)) {
          FileAttachment attachment =
              new FileAttachment(
                  module,
                  String.valueOf(materialPayload.getOrDefault("name", "Imported file")),
                  String.valueOf(materialPayload.getOrDefault("description", "")),
                  FileAttachment.Type.file,
                  toLong(materialPayload.get("sizeBytes")),
                  String.valueOf(materialPayload.getOrDefault("mimeType", "application/octet-stream")),
                  String.valueOf(materialPayload.getOrDefault("url", "")));
          attachment.save();
        } else {
          UrlAttachment attachment =
              new UrlAttachment(
                  module,
                  String.valueOf(materialPayload.getOrDefault("name", "Imported URL")),
                  String.valueOf(materialPayload.getOrDefault("url", "")),
                  String.valueOf(materialPayload.getOrDefault("description", "")),
                  UrlAttachment.Type.url,
                  String.valueOf(materialPayload.getOrDefault("faviconUrl", "")));
          attachment.save();
        }
      }

      for (Map<String, Object> quizPayload : castListMap(modulePayload.get("quizzes"))) {
        Quiz quiz = new Quiz(module, String.valueOf(quizPayload.getOrDefault("title", "Imported quiz")));
        quiz.save();

        for (Map<String, Object> questionPayload : castListMap(quizPayload.get("questions"))) {
          Question question = new Question();
          question.setQuiz(quiz);
          question.setQuestion(String.valueOf(questionPayload.getOrDefault("question", "")));

          String type = String.valueOf(questionPayload.getOrDefault("type", "singleChoice"));
          question.setType(
              "multipleChoice".equalsIgnoreCase(type)
                  ? Question.Type.multipleChoice
                  : Question.Type.singleChoice);

          question.setOptions(castListString(questionPayload.get("options")));
          question.setCorrectIndex(toInteger(questionPayload.get("correctIndex")));
          question.setCorrectIndices(castListInteger(questionPayload.get("correctIndices")));
          Integer position = toInteger(questionPayload.get("position"));
          question.setPosition(position == null ? 0 : position);
          question.save();
        }
      }
    }

    if (actor != null) {
      courseVersionService.createSnapshot(newCourse, actor, "Course imported");
    }

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(Map.of("status", "ok", "courseId", newCourse.getUuid().toString()));
  }

  private Course findCourse(String courseId) {
    try {
      UUID uuid = UUID.fromString(courseId);
      return new QCourse().uuid.eq(uuid).findOne();
    } catch (IllegalArgumentException e) {
      return null;
    }
  }

  private Map<String, Object> castMap(Object value) {
    if (value instanceof Map<?, ?> map) {
      return objectMapper.convertValue(map, new TypeReference<>() {});
    }
    return null;
  }

  private List<Map<String, Object>> castListMap(Object value) {
    if (value instanceof List<?> list) {
      return objectMapper.convertValue(list, new TypeReference<>() {});
    }
    return List.of();
  }

  private List<String> castListString(Object value) {
    if (value instanceof List<?> list) {
      return list.stream().map(String::valueOf).toList();
    }
    return List.of();
  }

  private List<Integer> castListInteger(Object value) {
    if (value instanceof List<?> list) {
      List<Integer> output = new ArrayList<>();
      for (Object item : list) {
        Integer parsed = toInteger(item);
        if (parsed != null) {
          output.add(parsed);
        }
      }
      return output;
    }
    return List.of();
  }

  private Integer toInteger(Object value) {
    if (value == null) {
      return null;
    }
    if (value instanceof Number number) {
      return number.intValue();
    }
    try {
      return Integer.parseInt(String.valueOf(value));
    } catch (NumberFormatException e) {
      return null;
    }
  }

  private Long toLong(Object value) {
    if (value == null) {
      return 0L;
    }
    if (value instanceof Number number) {
      return number.longValue();
    }
    try {
      return Long.parseLong(String.valueOf(value));
    } catch (NumberFormatException e) {
      return 0L;
    }
  }
}
