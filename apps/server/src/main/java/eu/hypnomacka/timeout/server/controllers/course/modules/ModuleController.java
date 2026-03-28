package eu.hypnomacka.timeout.server.controllers.course.modules;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.controllers.feed.CourseFeedService;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Event;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.services.CourseVersionService;
import io.ebean.DB;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
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
  private final CourseVersionService courseVersionService;

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
    Session session = getValidSession(sessionId);
    if (isLecturer && (session == null || !canAccessCourse(session, course))) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    if (!isLecturer && course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "course not live"));
    }

    List<Module> modules = new ArrayList<>(course.getModules());
    modules.sort(Comparator.comparing(Module::getOrderIndex).thenComparing(Module::getCreatedAt));

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

    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    if (request.getTitle() == null || request.getTitle().isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "title is required"));
    }

    Module module = new Module(course, request.getTitle(), request.getDescription());
    module.setUuid(UUID.randomUUID());
    module.setVisible(false);

    int maxOrder = course.getModules().stream().mapToInt(Module::getOrderIndex).max().orElse(-1);
    module.setOrderIndex(maxOrder + 1);

    module.save();

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Module created");
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

    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
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

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Module updated");
    }

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

    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    module.delete();

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Module deleted");
    }

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

    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    if (course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "module can only be revealed in live"));
    }

    boolean hasContent =
        !module.getFileAttachments().isEmpty()
            || !module.getUrlAttachments().isEmpty()
            || !module.getQuizzes().isEmpty();
    if (!hasContent) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              Map.of(
                  "status",
                  "bad",
                  "message",
                  "cannot reveal an empty module — add at least one material or quiz first"));
    }

    if (Boolean.TRUE.equals(module.getVisible())) {
      return ResponseEntity.ok(buildModuleResponse(module));
    }

    List<Module> allModules = new ArrayList<>(course.getModules());
    allModules.sort(
        Comparator.comparing(Module::getOrderIndex).thenComparing(Module::getCreatedAt));
    Module nextUnrevealed =
        allModules.stream()
            .filter(m -> !Boolean.TRUE.equals(m.getVisible()))
            .findFirst()
            .orElse(null);
    if (nextUnrevealed == null || !nextUnrevealed.getUuid().equals(module.getUuid())) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              Map.of(
                  "status",
                  "bad",
                  "message",
                  "modules must be revealed in order — reveal the next module first"));
    }

    module.setVisible(true);
    module.setRevealedAt(Instant.now());
    module.save();

    createModuleFeedEvent(course, "Module revealed: %s", module.getTitle());

    feedService.broadcastMessage(
        course.getUuid(),
        "module_revealed",
        String.format(
            "{\"moduleId\":\"%s\",\"title\":\"%s\",\"revealedAt\":\"%s\"}",
            module.getUuid(), module.getTitle().replace("\"", "\\\""), module.getRevealedAt()));

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Module revealed");
    }

    return ResponseEntity.ok(buildModuleResponse(module));
  }

  @PutMapping(value = "/order", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> reorderModules(
      @PathVariable String courseId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody ReorderModulesRequest request) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId) || course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "can only reorder in draft"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    List<String> moduleIds = request.getModuleIds();
    if (moduleIds == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "moduleIds required"));
    }

    List<Module> courseModules = course.getModules();
    if (moduleIds.size() != courseModules.size()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "moduleIds count mismatch"));
    }

    Map<String, Module> moduleMap =
        courseModules.stream().collect(Collectors.toMap(m -> m.getUuid().toString(), m -> m));

    for (String id : moduleIds) {
      if (!moduleMap.containsKey(id)) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("status", "bad", "message", "module " + id + " not in course"));
      }
    }

    for (int i = 0; i < moduleIds.size(); i++) {
      Module m = moduleMap.get(moduleIds.get(i));
      m.setOrderIndex(i);
      m.save();
    }

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Modules reordered");
    }

    return ResponseEntity.ok(Map.of("status", "ok"));
  }

  @PutMapping(value = "/reveal-next", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> revealNextModule(
      @PathVariable String courseId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    if (course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course must be live"));
    }

    List<Module> allModules = new ArrayList<>(course.getModules());
    allModules.sort(
        Comparator.comparing(Module::getOrderIndex).thenComparing(Module::getCreatedAt));

    Module next =
        allModules.stream()
            .filter(m -> !Boolean.TRUE.equals(m.getVisible()))
            .findFirst()
            .orElse(null);

    if (next == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "no more modules to reveal"));
    }

    boolean hasContent =
        !next.getFileAttachments().isEmpty()
            || !next.getUrlAttachments().isEmpty()
            || !next.getQuizzes().isEmpty();
    if (!hasContent) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              Map.of(
                  "status",
                  "bad",
                  "message",
                  "cannot reveal an empty module — add at least one material or quiz first"));
    }

    next.setVisible(true);
    next.setRevealedAt(Instant.now());
    next.save();

    createModuleFeedEvent(course, "Module revealed: %s", next.getTitle());

    feedService.broadcastMessage(
        course.getUuid(),
        "module_revealed",
        String.format(
            "{\"moduleId\":\"%s\",\"title\":\"%s\",\"revealedAt\":\"%s\"}",
            next.getUuid(), next.getTitle().replace("\"", "\\\""), next.getRevealedAt()));

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Next module revealed");
    }

    return ResponseEntity.ok(buildModuleResponse(next));
  }

  @PutMapping(value = "/hide-last", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> hideLastModule(
      @PathVariable String courseId,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {

    Course course = findCourse(courseId);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    if (course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course must be live"));
    }

    List<Module> allModules = new ArrayList<>(course.getModules());
    allModules.sort(
        Comparator.comparing(Module::getOrderIndex).thenComparing(Module::getCreatedAt));

    Module last = null;
    for (int i = allModules.size() - 1; i >= 0; i--) {
      if (Boolean.TRUE.equals(allModules.get(i).getVisible())) {
        last = allModules.get(i);
        break;
      }
    }

    if (last == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "no revealed modules to hide"));
    }

    Instant hiddenAt = Instant.now();
    last.setVisible(false);
    last.setRevealedAt(null);
    last.save();

    createModuleFeedEvent(course, "Module hidden: %s", last.getTitle());

    feedService.broadcastMessage(
        course.getUuid(),
        "module_hidden",
        String.format(
            "{\"moduleId\":\"%s\",\"title\":\"%s\",\"hiddenAt\":\"%s\"}",
            last.getUuid(), last.getTitle().replace("\"", "\\\""), hiddenAt));

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Last module hidden");
    }

    return ResponseEntity.ok(buildModuleResponse(last));
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
    response.put("orderIndex", module.getOrderIndex());
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

  private void createModuleFeedEvent(Course course, String messageTemplate, String moduleTitle) {
    Event event = new Event();
    event.setUuid(UUID.randomUUID());
    event.setCourse(course);
    event.setType(Event.Type.SYSTEM);
    event.setMessage(String.format(messageTemplate, moduleTitle));
    event.setEdited(false);
    event.save();
  }

  @Data
  public static class CreateModuleRequest {
    private String title;
    private String description;
  }

  @Data
  public static class UpdateModuleRequest {
    private String title;
    private String description;
  }

  @Data
  public static class ReorderModulesRequest {
    private List<String> moduleIds;
  }
}
