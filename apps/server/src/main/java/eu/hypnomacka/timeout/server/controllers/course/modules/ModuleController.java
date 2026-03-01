package eu.hypnomacka.timeout.server.controllers.course.modules;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.controllers.feed.CourseFeedService;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import io.ebean.DB;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}/modules")
@RequiredArgsConstructor
public class ModuleController extends Controller {

  private final CourseFeedService feedService;

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> listModules(
      @PathVariable String courseId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    boolean isLecturer = isLecturerSession(sessionId);
    if (!isLecturer && course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "course not live"));
    }

    List<Module> modules = new ArrayList<>(course.getModules());
    modules.sort(Comparator.comparing(Module::getCreatedAt));

    List<Map<String, Object>> response = new ArrayList<>();
    for (Module module : modules) {
      if (!isLecturer && !Boolean.TRUE.equals(module.getVisible())) {
        continue;
      }
      response.add(buildModuleResponse(module));
    }

    return ResponseEntity.ok(response);
  }

  @PostMapping(
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> createModule(
      @PathVariable String courseId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody CreateModuleRequest request) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (!isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    if (request.getTitle() == null || request.getTitle().isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "title is required"));
    }
    boolean hasInitialMaterial =
        request.getInitialMaterialName() != null
            && !request.getInitialMaterialName().isBlank()
            && request.getInitialMaterialUrl() != null
            && !request.getInitialMaterialUrl().isBlank();
    boolean hasInitialQuizTitle =
        request.getInitialQuizTitle() != null && !request.getInitialQuizTitle().isBlank();
    if (!hasInitialMaterial && !hasInitialQuizTitle) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              Map.of(
                  "status",
                  "bad",
                  "message",
                  "module requires at least one initial material or quiz"));
    }

    Module module = new Module(course, request.getTitle(), request.getDescription());
    module.setUuid(UUID.randomUUID());
    module.setVisible(false);
    module.save();

    if (hasInitialMaterial) {
      String materialDescription = request.getInitialMaterialDescription();
      if (materialDescription == null) {
        materialDescription = "";
      }
      String materialUrl = request.getInitialMaterialUrl();
      UrlAttachment attachment =
          new UrlAttachment(
              module,
              request.getInitialMaterialName(),
              materialUrl,
              materialDescription,
              UrlAttachment.Type.url,
              "https://icons.duckduckgo.com/ip2/"
                  + materialUrl.replace("https://", "").replace("http://", "").split("/")[0]
                  + ".ico");
      attachment.save();
    }

    if (hasInitialQuizTitle) {
      Quiz quiz = new Quiz(module, request.getInitialQuizTitle());
      quiz.save();
    }

    return ResponseEntity.status(HttpStatus.CREATED).body(buildModuleResponse(module));
  }

  @PutMapping(value = "/{moduleId}", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> updateModule(
      @PathVariable String courseId,
      @PathVariable String moduleId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody UpdateModuleRequest request) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    Module module = findModule(moduleId, course);
    if (module == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "module not found"));
    }

    if (!isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    if (request.getTitle() != null) {
      if (request.getTitle().isBlank()) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("status", "bad", "message", "title cannot be blank"));
      }
      module.setTitle(request.getTitle());
    }

    if (request.getDescription() != null) {
      module.setDescription(request.getDescription());
    }

    module.save();
    return ResponseEntity.ok(buildModuleResponse(module));
  }

  @DeleteMapping(value = "/{moduleId}")
  public ResponseEntity<?> deleteModule(
      @PathVariable String courseId,
      @PathVariable String moduleId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    Module module = findModule(moduleId, course);
    if (module == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "module not found"));
    }

    if (!isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    module.delete();
    return ResponseEntity.noContent().build();
  }

  @PutMapping(value = "/{moduleId}/reveal", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> revealModule(
      @PathVariable String courseId,
      @PathVariable String moduleId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    Module module = findModule(moduleId, course);
    if (module == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "module not found"));
    }

    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    if (course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "module can only be revealed in live"));
    }

    if (Boolean.TRUE.equals(module.getVisible())) {
      return ResponseEntity.ok(buildModuleResponse(module));
    }

    module.setVisible(true);
    module.setRevealedAt(Instant.now());
    module.save();

    feedService.broadcastMessage(
        course.getUuid(),
        "module_revealed",
        String.format(
            "{\"moduleId\":\"%s\",\"title\":\"%s\",\"revealedAt\":\"%s\"}",
            module.getUuid(), module.getTitle().replace("\"", "\\\""), module.getRevealedAt()));

    return ResponseEntity.ok(buildModuleResponse(module));
  }

  private Map<String, Object> buildModuleResponse(Module module) {
    List<Object> materials = new ArrayList<>();
    materials.addAll(module.getFileAttachments());
    materials.addAll(module.getUrlAttachments());
    materials.sort(
        (a, b) -> {
          Instant dateA =
              a instanceof FileAttachment
                  ? ((FileAttachment) a).getUpdatedAt()
                  : ((UrlAttachment) a).getUpdatedAt();
          Instant dateB =
              b instanceof FileAttachment
                  ? ((FileAttachment) b).getUpdatedAt()
                  : ((UrlAttachment) b).getUpdatedAt();
          return dateB.compareTo(dateA);
        });

    List<Quiz> quizzes = new ArrayList<>(module.getQuizzes());
    quizzes.sort(Comparator.comparing(Quiz::getUpdatedAt).reversed());

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("uuid", module.getUuid());
    response.put("title", module.getTitle());
    response.put("description", module.getDescription());
    response.put("visible", module.getVisible());
    response.put("revealedAt", module.getRevealedAt());
    response.put("materials", materials);
    response.put("quizzes", quizzes);
    response.put("createdAt", module.getCreatedAt());
    response.put("updatedAt", module.getUpdatedAt());
    return response;
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

  @Data
  public static class CreateModuleRequest {
    private String title;
    private String description;
    private String initialMaterialName;
    private String initialMaterialUrl;
    private String initialMaterialDescription;
    private String initialQuizTitle;
  }

  @Data
  public static class UpdateModuleRequest {
    private String title;
    private String description;
  }
}
