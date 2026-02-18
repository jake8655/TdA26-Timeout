package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Course.Status;
import eu.hypnomacka.timeout.server.core.CourseJoin;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QCourseJoin;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}")
public class CourseJoinController extends Controller {

  @PostMapping(value = "/join", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> joinCourse(
      @PathVariable("courseId") String courseIdStr,
      @CookieValue(value = "STUDENT_SESSION_ID", required = false) String sessionId) {
    Course course = findCourse(courseIdStr);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    if (course.getStatus() != Status.LIVE) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not live"));
    }

    String resolvedToken = resolveSessionToken(sessionId);
    if (resolvedToken == null || resolvedToken.isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "session required"));
    }
    CourseJoin existing =
        new QCourseJoin().course.eq(course).sessionToken.eq(resolvedToken).findOne();
    if (existing != null) {
      existing.setActive(true);
      existing.setLastSeenAt(Instant.now());
      existing.save();
      return ResponseEntity.ok(Map.of("status", "ok", "joinedAt", existing.getJoinedAt()));
    }

    CourseJoin join = new CourseJoin(course, resolvedToken);
    join.setUuid(UUID.randomUUID());
    join.save();

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(Map.of("status", "ok", "joinedAt", join.getJoinedAt()));
  }

  @PostMapping(value = "/leave", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> leaveCourse(
      @PathVariable("courseId") String courseIdStr,
      @CookieValue(value = "STUDENT_SESSION_ID", required = false) String sessionId) {
    Course course = findCourse(courseIdStr);
    if (course == null) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("status", "bad", "message", "course not found"));
    }

    String resolvedToken = resolveSessionToken(sessionId);
    if (resolvedToken == null || resolvedToken.isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "session required"));
    }
    CourseJoin existing =
        new QCourseJoin().course.eq(course).sessionToken.eq(resolvedToken).findOne();
    if (existing == null) {
      return ResponseEntity.ok(Map.of("status", "ok", "message", "not joined"));
    }

    existing.setActive(false);
    existing.setLastSeenAt(Instant.now());
    existing.save();

    return ResponseEntity.ok(Map.of("status", "ok"));
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

}
