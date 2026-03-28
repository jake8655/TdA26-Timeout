package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Account;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.services.CourseVersionService;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses")
public class CoursePutController extends Controller {

  private final CourseVersionService courseVersionService;

  public CoursePutController(CourseVersionService courseVersionService) {
    this.courseVersionService = courseVersionService;
  }

  @PutMapping(
      value = "/{UUID}",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> update(
      @PathVariable("UUID") String uuidStr,
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody Map<String, String> body) {
    String name = body.get("name");
    String description = body.get("description");

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

    var session = getValidSession(sessionId);
    if (session == null || !isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "unauthorized"));
    }

    if (!canAccessCourse(session, course)) {
      return ResponseEntity.status(HttpStatus.FORBIDDEN)
          .body(Map.of("status", "bad", "message", "forbidden"));
    }

    if (course.getStatus() != Course.Status.DRAFT) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "course not editable"));
    }

    if (name != null && !name.isBlank()) {
      course.setName(name);
    }

    course.setDescription(description);
    course.save();

    Account actor = resolveAccount(session);
    if (actor != null) {
      courseVersionService.createSnapshot(course, actor, "Course updated");
    }

    return ResponseEntity.status(HttpStatus.OK).body(course);
  }
}
