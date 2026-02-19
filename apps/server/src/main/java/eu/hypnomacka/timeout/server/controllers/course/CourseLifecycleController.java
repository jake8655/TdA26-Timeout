package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Course.Status;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.services.CourseLifecycleService;
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

  public CourseLifecycleController(CourseLifecycleService lifecycleService) {
    this.lifecycleService = lifecycleService;
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

    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
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
        if (request.getScheduledStartAt() == null || request.getScheduledEndAt() == null) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
              .body(Map.of("status", "bad", "message", "schedule requires start and end"));
        }
        lifecycleService.transitionToScheduled(
            course,
            Instant.parse(request.getScheduledStartAt()),
            Instant.parse(request.getScheduledEndAt()),
            "Course scheduled");
      }
      case LIVE -> {
        if (request.getScheduledEndAt() == null && course.getScheduledEndAt() == null) {
          return ResponseEntity.status(HttpStatus.BAD_REQUEST)
              .body(Map.of("status", "bad", "message", "live requires end time"));
        }
        if (request.getScheduledEndAt() != null) {
          course.setScheduledEndAt(Instant.parse(request.getScheduledEndAt()));
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

    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    if (request.getScheduledEndAt() == null) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "end time required"));
    }

    course.setScheduledEndAt(Instant.parse(request.getScheduledEndAt()));
    lifecycleService.transitionToLive(course, "Course started by lecturer");

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

    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    lifecycleService.transitionToPaused(course, "Course paused by lecturer");
    lifecycleService.kickCourseParticipants(course, "Course paused by lecturer", Status.PAUSED);
    if (request.getScheduledStartAt() != null) {
      course.setScheduledStartAt(Instant.parse(request.getScheduledStartAt()));
      course.save();
    }
    if (request.getScheduledEndAt() != null) {
      course.setScheduledEndAt(Instant.parse(request.getScheduledEndAt()));
      course.save();
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

    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    lifecycleService.transitionToArchived(course, "Course archived by lecturer");
    lifecycleService.deactivateJoinsAndKick(course, "Course archived by lecturer", Status.ARCHIVED);

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

  @Data
  public static class StatusRequest {
    private String status;
    private String scheduledStartAt;
    private String scheduledEndAt;
  }

  @Data
  public static class StartRequest {
    private String scheduledEndAt;
  }

  @Data
  public static class PauseRequest {
    private String scheduledStartAt;
    private String scheduledEndAt;
  }
}
