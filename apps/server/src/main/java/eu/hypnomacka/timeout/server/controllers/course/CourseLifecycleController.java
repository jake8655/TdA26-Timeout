package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Course.Status;
import eu.hypnomacka.timeout.server.core.Module;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.services.CourseLifecycleService;
import eu.hypnomacka.timeout.server.services.CourseVersionService;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}")
public class CourseLifecycleController extends Controller {

  private final CourseLifecycleService lifecycleService;
  private final CourseVersionService courseVersionService;

  public CourseLifecycleController(
      CourseLifecycleService lifecycleService, CourseVersionService courseVersionService) {
    this.lifecycleService = lifecycleService;
    this.courseVersionService = courseVersionService;
  }

  @PutMapping(value = "/status", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> updateStatus(
      @PathVariable("courseId") String courseIdStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody StatusRequest request) {
    Course course = findCourse(courseIdStr);
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

    Status status;
    try {
      status = Status.valueOf(request.getStatus().toUpperCase());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid status"));
    }

    switch (status) {
      case DRAFT -> lifecycleService.transitionToDraft(course, "Course moved to draft");
      case SCHEDULED -> {
        if (request.getScheduledStartAt() == null) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
              .body(Map.of("status", "bad", "message", "schedule requires start"));
        }
        lifecycleService.transitionToScheduled(
            course, Instant.parse(request.getScheduledStartAt()), "Course scheduled");
      }
      case LIVE -> {
        if (hasEmptyModules(course)) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
              .body(
                  Map.of(
                      "status",
                      "bad",
                      "message",
                      "all modules must have at least one material or one quiz"));
        }
        lifecycleService.transitionToLive(course, "Course started");
      }
      case PAUSED -> {
        lifecycleService.transitionToPaused(course, "Course paused by lecturer");
        lifecycleService.kickCourseParticipants(course, "Course paused by lecturer", Status.PAUSED);
      }
      case ARCHIVED -> {
        lifecycleService.transitionToArchived(course, "Course archived by lecturer");
        lifecycleService.deactivateJoinsAndKick(
            course, "Course archived by lecturer", Status.ARCHIVED);
      }
    }

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Course lifecycle status updated");
    }

    return ResponseEntity.ok(course);
  }

  @PostMapping(value = "/start", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> startNow(
      @PathVariable("courseId") String courseIdStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody StartRequest request) {
    Course course = findCourse(courseIdStr);
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

    if (hasEmptyModules(course)) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(
              Map.of(
                  "status",
                  "bad",
                  "message",
                  "all modules must have at least one material or one quiz"));
    }

    lifecycleService.transitionToLive(course, "Course started by lecturer");

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Course started");
    }

    return ResponseEntity.ok(course);
  }

  @PostMapping(value = "/pause", consumes = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> pauseCourse(
      @PathVariable("courseId") String courseIdStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody PauseRequest request) {
    Course course = findCourse(courseIdStr);
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

    lifecycleService.transitionToPaused(course, "Course paused by lecturer");
    lifecycleService.kickCourseParticipants(course, "Course paused by lecturer", Status.PAUSED);
    if (request.getScheduledStartAt() != null) {
      course.setScheduledStartAt(Instant.parse(request.getScheduledStartAt()));
      course.save();
    }

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Course paused");
    }

    return ResponseEntity.ok(course);
  }

  @PostMapping(value = "/archive")
  public ResponseEntity<?> archiveCourse(
      @PathVariable("courseId") String courseIdStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
    Course course = findCourse(courseIdStr);
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

    lifecycleService.transitionToArchived(course, "Course archived by lecturer");
    lifecycleService.deactivateJoinsAndKick(course, "Course archived by lecturer", Status.ARCHIVED);

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Course archived");
    }

    return ResponseEntity.ok(course);
  }

  private Course findCourse(String courseIdStr) {
    UUID courseId;
    try {
      courseId = UUID.fromString(courseIdStr);
    } catch (IllegalArgumentException e) {
      return null;
    }
    return new QCourse().uuid.eq(courseId).findOne();
  }

  private boolean hasEmptyModules(Course course) {
    for (Module module : course.getModules()) {
      int itemCount =
          module.getFileAttachments().size()
              + module.getUrlAttachments().size()
              + module.getQuizzes().size();
      if (itemCount == 0) {
        return true;
      }
    }
    return false;
  }

  @Data
  public static class StatusRequest {
    private String status;
    private String scheduledStartAt;
  }

  @Data
  public static class StartRequest {}

  @Data
  public static class PauseRequest {
    private String scheduledStartAt;
  }
}
