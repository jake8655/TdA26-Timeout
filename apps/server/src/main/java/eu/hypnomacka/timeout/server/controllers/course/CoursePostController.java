package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.core.query.QSession;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/courses")
public class CoursePostController extends Controller {

  @PostMapping(
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<?> create(
      @CookieValue(value = "SESSION_ID", required = false) String sessionId,
      @RequestBody Map<String, String> body) {
    /*if (sessionId == null) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
            Map.of("status", "bad", "message", "no session found")
        );
    }*/

    String name = body.get("name");
    String description = body.get("description");

    /*if (Objects.equals(name, Objects.requireNonNull(new QCourse().name.eq(name).findOne()).getName())) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
            Map.of("status", "bad", "message", "name already in use")
        );
    }*/

    if (name == null || name.isBlank()) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("status", "bad", "message", "invalid name"));
    }

    if (!isLecturerSession(sessionId)) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "session not linked to an account"));
    }

    Session session = new QSession().token.eq(sessionId).findOne();
    if (session == null || session.getLecturer() == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("status", "bad", "message", "session not linked to an account"));
    }

    Lecturer lecturer = session.getLecturer();
    Course course = new Course(lecturer, name, description);
    course.setStatus(Course.Status.DRAFT);
    course.save();

    return ResponseEntity.status(HttpStatus.CREATED).body(course);
  }
}
