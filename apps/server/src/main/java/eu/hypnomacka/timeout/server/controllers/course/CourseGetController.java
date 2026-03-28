package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Branch;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Event;
import eu.hypnomacka.timeout.server.core.FileAttachment;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.core.Quiz;
import eu.hypnomacka.timeout.server.core.UrlAttachment;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QEvent;
import io.ebean.DB;
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
  public List<Map<String, Object>> root() {
    List<Course> courses =
        new QCourse()
            .status
            .in(Course.Status.SCHEDULED, Course.Status.LIVE, Course.Status.PAUSED)
            .orderBy()
            .updatedAt
            .desc()
            .findList();

    List<Map<String, Object>> result = new ArrayList<>();
    for (Course course : courses) {
      result.add(buildCourseSummaryResponse(course));
    }
    return result;
  }

  @GetMapping(value = "/lecturer", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> lecturerList(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    List<Course> courses;
    Account account = resolveAccount(session);
    Branch branch = session.getBranch();
    if (branch != null) {
      courses = new QCourse().branch.eq(branch).orderBy().updatedAt.desc().findList();
    } else if (account != null && account.getRole() == Account.Role.ADMIN) {
      courses = new QCourse().orderBy().updatedAt.desc().findList();
    } else {
      var lecturer = resolveLecturer(session);
      if (lecturer == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(Map.of("status", "bad", "message", "unauthorized"));
      }
      courses =
          new QCourse()
              .lecturer
              .uuid
              .eq(lecturer.getUuid())
              .orderBy()
              .updatedAt
              .desc()
              .findList();
    }

    List<Map<String, Object>> result = new ArrayList<>();
    for (Course course : courses) {
      result.add(buildCourseSummaryResponse(course));
    }
    return ResponseEntity.ok(result);
  }

  @GetMapping(value = "/{UUID}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> byUUID(@PathVariable("UUID") String uuidStr) {
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

    if (course.getStatus() == Course.Status.DRAFT || course.getStatus() == Course.Status.ARCHIVED) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (course.getStatus() == Course.Status.SCHEDULED
        || course.getStatus() == Course.Status.PAUSED) {
      return ResponseEntity.status(HttpStatus.OK).body(buildLimitedCourseResponse(course));
    }

    return ResponseEntity.status(HttpStatus.OK).body(buildCourseDetailResponse(course, false));
  }

  @GetMapping(value = "/lecturer/{UUID}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> lecturerByUUID(
      @PathVariable("UUID") String uuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    Session session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId)) {
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

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    return ResponseEntity.ok(buildCourseDetailResponse(course, true));
  }

  @GetMapping(value = "/tenants/{countryKey}/branches/{branchKey}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> listByTenant(
      @PathVariable String countryKey,
      @PathVariable String branchKey,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    Session session = getValidSession(sessionId);
    if (session == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    var country = resolveCountryFromKey(countryKey);
    if (country == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "country not found"));
    }

    var branch = resolveBranchFromKey(branchKey, country);
    if (branch == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "branch not found"));
    }

    if (!canAccessBranch(session, branch)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    List<Course> courses = new QCourse().branch.eq(branch).orderBy().updatedAt.desc().findList();
    List<Map<String, Object>> result = new ArrayList<>();
    for (Course course : courses) {
      result.add(buildCourseSummaryResponse(course));
    }
    return ResponseEntity.ok(result);
  }

  @GetMapping(
      value = "/tenants/{countryKey}/branches/{branchKey}/{UUID}",
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> byTenantCourse(
      @PathVariable String countryKey,
      @PathVariable String branchKey,
      @PathVariable("UUID") String uuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
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

    var country = resolveCountryFromKey(countryKey);
    if (country == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "country not found"));
    }

    var branch = resolveBranchFromKey(branchKey, country);
    if (branch == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "branch not found"));
    }

    if (course.getBranch() == null || !course.getBranch().getId().equals(branch.getId())) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    Session session = getValidSession(sessionId);
    boolean isLecturer = session != null && isLecturerSession(sessionId) && canAccessCourse(session, course);

    if (!isLecturer && (course.getStatus() == Course.Status.DRAFT || course.getStatus() == Course.Status.ARCHIVED)) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (!isLecturer && (course.getStatus() == Course.Status.SCHEDULED || course.getStatus() == Course.Status.PAUSED)) {
      return ResponseEntity.status(HttpStatus.OK).body(buildLimitedCourseResponse(course));
    }

    return ResponseEntity.ok(buildCourseDetailResponse(course, isLecturer));
  }

  private Map<String, Object> buildCourseSummaryResponse(Course course) {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("uuid", course.getUuid());
    response.put("name", course.getName());
    response.put("description", course.getDescription());
    response.put("createdAt", course.getCreatedAt());
    response.put("updatedAt", course.getUpdatedAt());
    response.put("status", course.getStatus().name().toLowerCase());
    response.put("scheduledStartAt", course.getScheduledStartAt());
    response.put("pausedAt", course.getPausedAt());
    response.put("archivedAt", course.getArchivedAt());
    return response;
  }

  private Map<String, Object> buildCourseDetailResponse(Course course, boolean isLecturer) {
    List<Module> modules = new ArrayList<>(course.getModules());
    modules.sort(Comparator.comparing(Module::getOrderIndex).thenComparing(Module::getCreatedAt));

    List<Map<String, Object>> moduleResponses = new ArrayList<>();
    for (Module module : modules) {
      if (!isLecturer && !Boolean.TRUE.equals(module.getVisible())) {
        continue;
      }
      moduleResponses.add(buildModuleResponse(module, true));
    }

    List<Event> events =
        new QEvent()
            .course.eq(course).orderBy().createdAt.desc().findList().stream()
                .filter(this::isVisibleFeedEvent)
                .toList();
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
    response.put("pausedAt", course.getPausedAt());
    response.put("archivedAt", course.getArchivedAt());
    return response;
  }

  private Map<String, Object> buildLimitedCourseResponse(Course course) {
    Map<String, Object> response = new LinkedHashMap<>();
    response.put("uuid", course.getUuid());
    response.put("name", course.getName());
    response.put("description", course.getDescription());
    response.put("createdAt", course.getCreatedAt());
    response.put("updatedAt", course.getUpdatedAt());
    response.put("status", course.getStatus().name().toLowerCase());
    response.put("scheduledStartAt", course.getScheduledStartAt());
    response.put("pausedAt", course.getPausedAt());
    response.put("archivedAt", course.getArchivedAt());
    response.put("modules", List.of());
    return response;
  }

  private boolean isVisibleFeedEvent(Event event) {
    if (event.getType() == Event.Type.MANUAL) {
      return true;
    }

    String message = event.getMessage();
    if (message == null) {
      return false;
    }

    return message.startsWith("Module revealed:") || message.startsWith("Module hidden:");
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
    response.put("orderIndex", module.getOrderIndex());
    response.put("materials", materials);
    response.put("quizzes", quizzes);
    response.put("createdAt", module.getCreatedAt());
    response.put("updatedAt", module.getUpdatedAt());
    return response;
  }
}
