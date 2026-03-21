package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.controllers.auth.AuthController;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.CourseJoin;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QCourseJoin;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses/{courseId}")
public class CourseSessionController extends Controller {

  @PostMapping(value = "/session", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> createSession(
      @PathVariable("courseId") String courseIdStr,
      @CookieValue(value = "STUDENT_SESSION_ID", required = false) String studentSessionId,
      HttpServletResponse response) {
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

    if (course.getStatus() != Course.Status.LIVE) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not live"));
    }

    boolean hasExistingSession = studentSessionId != null && !studentSessionId.isBlank();
    String sessionId = hasExistingSession ? studentSessionId : AuthController.generateNewToken();
    if (!hasExistingSession) {
      Cookie cookie = new Cookie("STUDENT_SESSION_ID", sessionId);
      cookie.setHttpOnly(true);
      cookie.setPath("/");
      cookie.setMaxAge(60 * 60 * 24 * 7);
      response.addCookie(cookie);
    }

    CourseJoin existingJoin =
        new QCourseJoin().course.eq(course).sessionToken.eq(sessionId).findOne();
    if (existingJoin != null) {
      existingJoin.setActive(true);
      existingJoin.setLastSeenAt(Instant.now());
      existingJoin.save();
      return ResponseEntity.ok(Map.of("status", "ok", "sessionId", sessionId));
    }

    CourseJoin join = new CourseJoin(course, sessionId);
    join.setUuid(UUID.randomUUID());
    join.setLastSeenAt(Instant.now());
    join.save();

    return ResponseEntity.status(HttpStatus.CREATED)
        .body(Map.of("status", "ok", "sessionId", sessionId));
  }
}
