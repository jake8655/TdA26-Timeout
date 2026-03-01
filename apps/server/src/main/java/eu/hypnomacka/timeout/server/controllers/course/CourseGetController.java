package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseJoin;
import eu.hypnomacka.timeout.server.core.Event;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QCourseJoin;
import eu.hypnomacka.timeout.server.core.query.QEvent;
import eu.hypnomacka.timeout.server.core.query.QQuizResult;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses")
public class CourseGetController extends Controller {

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public List<Map<String, Object>> root(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @CookieValue(value = "STUDENT_SESSION_ID", required = false) String studentSessionId) {
    boolean isLecturer = isLecturerSession(sessionId);

    List<Course> courses;
    if (isLecturer) {
      courses = new QCourse().orderBy().updatedAt.desc().findList();
    } else {
      courses =
          new QCourse()
              .status
              .in(
                  Course.Status.SCHEDULED,
                  Course.Status.LIVE,
                  Course.Status.PAUSED,
                  Course.Status.ARCHIVED)
              .orderBy()
              .updatedAt
              .desc()
              .findList();
    }

    List<Map<String, Object>> result = new ArrayList<>();
    for (Course course : courses) {
      if (!isLecturer
          && course.getStatus() == Course.Status.ARCHIVED
          && !hasSubmittedQuiz(course, studentSessionId)) {
        continue;
      }
      result.add(buildCourseSummaryResponse(course, studentSessionId));
    }
    return result;
  }

  @GetMapping(value = "/lecturer", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> lecturerList(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    List<Course> courses = new QCourse().orderBy().updatedAt.desc().findList();
    List<Map<String, Object>> result = new ArrayList<>();
    for (Course course : courses) {
      result.add(buildCourseSummaryResponse(course, null));
    }
    return ResponseEntity.ok(result);
  }

  @GetMapping(value = "/{UUID}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> byUUID(
      @PathVariable("UUID") String uuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @CookieValue(value = "STUDENT_SESSION_ID", required = false) String studentSessionId) {
    UUID uuid;
    try {
      uuid = UUID.fromString(uuidStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = new QCourse().uuid.eq(uuid).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    boolean isLecturer = isLecturerSession(sessionId);

    if (!isLecturer
        && (course.getStatus() == Course.Status.DRAFT
            || (course.getStatus() == Course.Status.ARCHIVED
                && !hasSubmittedQuiz(course, studentSessionId)))) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (!isLecturer && course.getStatus() == Course.Status.ARCHIVED) {
      return ResponseEntity.status(HttpStatus.OK)
          .body(buildArchivedCourseResponse(course, studentSessionId));
    }

    if (!isLecturer
        && (course.getStatus() == Course.Status.SCHEDULED
            || course.getStatus() == Course.Status.PAUSED)) {
      return ResponseEntity.status(HttpStatus.OK)
          .body(buildLimitedCourseResponse(course, studentSessionId));
    }

    return ResponseEntity.status(HttpStatus.OK)
        .body(buildCourseDetailResponse(course, isLecturer, studentSessionId));
  }

  @GetMapping(value = "/lecturer/{UUID}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> lecturerByUUID(
      @PathVariable("UUID") String uuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    UUID uuid;
    try {
      uuid = UUID.fromString(uuidStr);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid UUID format"));
    }

    Course course = new QCourse().uuid.eq(uuid).findOne();
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    return ResponseEntity.ok(buildCourseDetailResponse(course, true, null));
  }

  private Map<String, Object> buildCourseSummaryResponse(Course course, String studentSessionId) {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("uuid", course.getUuid());
    response.put("name", course.getName());
    response.put("description", course.getDescription());
    response.put("createdAt", course.getCreatedAt());
    response.put("updatedAt", course.getUpdatedAt());
    response.put("status", course.getStatus().name().toLowerCase());
    response.put("scheduledStartAt", course.getScheduledStartAt());
    response.put("scheduledEndAt", course.getScheduledEndAt());
    response.put("pausedAt", course.getPausedAt());
    response.put("archivedAt", course.getArchivedAt());
    if (studentSessionId != null) {
      response.put("joined", isJoined(course, studentSessionId));
    }

    return response;
  }

  private Map<String, Object> buildCourseDetailResponse(
      Course course, boolean isLecturer, String studentSessionId) {
    List<Module> modules = new ArrayList<>(course.getModules());
    modules.sort(Comparator.comparing(Module::getCreatedAt));

    List<Map<String, Object>> moduleResponses = new ArrayList<>();
    for (Module module : modules) {
      if (!isLecturer && !Boolean.TRUE.equals(module.getVisible())) {
        continue;
      }
      moduleResponses.add(buildModuleResponse(module, true));
    }

    List<Event> events = new QEvent().course.eq(course).orderBy().createdAt.desc().findList();
    List<Map<String, Object>> feed = new ArrayList<>();
    for (Event event : events) {
      Map<String, Object> eventMap = new LinkedHashMap<>();
      eventMap.put("uuid", event.getUuid());
      eventMap.put("type", event.getType().name().toLowerCase());
      eventMap.put("message", event.getMessage());
      eventMap.put("edited", event.getEdited());
      eventMap.put("createdAt", event.getCreatedAt());
      eventMap.put("updatedAt", event.getUpdatedAt());
      feed.add(eventMap);
    }

    Map<String, Object> response = new LinkedHashMap<>();
    response.put("uuid", course.getUuid());
    response.put("name", course.getName());
    response.put("description", course.getDescription());
    response.put("createdAt", course.getCreatedAt());
    response.put("updatedAt", course.getUpdatedAt());
    response.put("modules", moduleResponses);
    response.put("feed", feed);
    response.put("status", course.getStatus().name().toLowerCase());
    response.put("scheduledStartAt", course.getScheduledStartAt());
    response.put("scheduledEndAt", course.getScheduledEndAt());
    response.put("pausedAt", course.getPausedAt());
    response.put("archivedAt", course.getArchivedAt());
    response.put("joined", isJoined(course, studentSessionId));
    return response;
  }

  private Map<String, Object> buildLimitedCourseResponse(Course course, String studentSessionId) {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("uuid", course.getUuid());
    response.put("name", course.getName());
    response.put("description", course.getDescription());
    response.put("createdAt", course.getCreatedAt());
    response.put("updatedAt", course.getUpdatedAt());
    response.put("status", course.getStatus().name().toLowerCase());
    response.put("scheduledStartAt", course.getScheduledStartAt());
    response.put("scheduledEndAt", course.getScheduledEndAt());
    response.put("pausedAt", course.getPausedAt());
    response.put("archivedAt", course.getArchivedAt());
    response.put("joined", isJoined(course, studentSessionId));
    response.put("modules", List.of());
    return response;
  }

  private boolean isJoined(Course course, String sessionId) {
    if (sessionId == null || sessionId.isBlank()) {
      return false;
    }
    CourseJoin join = new QCourseJoin().course.eq(course).sessionToken.eq(sessionId).findOne();
    return join != null && Boolean.TRUE.equals(join.getActive());
  }

  private boolean hasSubmittedQuiz(Course course, String sessionId) {
    if (sessionId == null || sessionId.isBlank()) {
      return false;
    }
    CourseJoin join = new QCourseJoin().course.eq(course).sessionToken.eq(sessionId).findOne();
    if (join != null && Boolean.TRUE.equals(join.getHasSubmittedQuiz())) {
      return true;
    }
    return new QQuizResult().quiz.module.course.eq(course).sessionToken.eq(sessionId).findCount()
        > 0;
  }

  private Map<String, Object> buildArchivedCourseResponse(Course course, String studentSessionId) {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("uuid", course.getUuid());
    response.put("name", course.getName());
    response.put("description", course.getDescription());
    response.put("createdAt", course.getCreatedAt());
    response.put("updatedAt", course.getUpdatedAt());
    response.put("feed", List.of());
    response.put("status", course.getStatus().name().toLowerCase());
    response.put("scheduledStartAt", course.getScheduledStartAt());
    response.put("scheduledEndAt", course.getScheduledEndAt());
    response.put("pausedAt", course.getPausedAt());
    response.put("archivedAt", course.getArchivedAt());
    response.put("joined", isJoined(course, studentSessionId));
    response.put("modules", filterArchivedModules(course, studentSessionId));
    return response;
  }

  private List<Map<String, Object>> filterArchivedModules(Course course, String studentSessionId) {
    if (studentSessionId == null || studentSessionId.isBlank()) {
      return List.of();
    }

    List<Module> modules = new ArrayList<>(course.getModules());
    modules.sort(Comparator.comparing(Module::getCreatedAt));

    List<Map<String, Object>> response = new ArrayList<>();
    for (Module module : modules) {
      List<Quiz> quizzes = new ArrayList<>(module.getQuizzes());
      quizzes.sort(Comparator.comparing(Quiz::getUpdatedAt).reversed());
      List<Quiz> submittedQuizzes =
          quizzes.stream()
              .filter(
                  quiz ->
                      new QQuizResult().quiz.eq(quiz).sessionToken.eq(studentSessionId).findCount()
                          > 0)
              .toList();

      if (submittedQuizzes.isEmpty()) {
        continue;
      }

      Map<String, Object> moduleMap = new LinkedHashMap<>();
      moduleMap.put("uuid", module.getUuid());
      moduleMap.put("title", module.getTitle());
      moduleMap.put("quizzes", submittedQuizzes);
      response.add(moduleMap);
    }

    return response;
  }

  private Map<String, Object> buildModuleResponse(Module module, boolean includeDescription) {
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
    if (includeDescription) {
      response.put("description", module.getDescription());
    }
    response.put("visible", module.getVisible());
    response.put("revealedAt", module.getRevealedAt());
    response.put("materials", materials);
    response.put("quizzes", quizzes);
    response.put("createdAt", module.getCreatedAt());
    response.put("updatedAt", module.getUpdatedAt());
    return response;
  }
}
