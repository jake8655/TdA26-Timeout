package eu.hypnomacka.timeout.server.controllers.course;

import eu.hypnomacka.timeout.server.controllers.Controller;
import eu.hypnomacka.timeout.server.core.Course;
import eu.hypnomacka.timeout.server.core.Lecturer;
import eu.hypnomacka.timeout.server.core.Session;
import eu.hypnomacka.timeout.server.core.query.QCourse;
import eu.hypnomacka.timeout.server.core.query.QLecturer;
import eu.hypnomacka.timeout.server.core.query.QSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/courses")
public class CourseDeleteController extends Controller {

    @DeleteMapping(value = "/{UUID}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> delete(@PathVariable("UUID") String uuidStr, @CookieValue(value = "SESSION_ID", required = false) String sessionId) {
        /*if (sessionId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("status", "bad", "message", "no session found")
            );
        }

        Session session = new QSession().token.eq(sessionId).findOne();
        if (session == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("status", "bad", "message", "session not found in database")
            );
        }

        Lecturer lecturer = new QLecturer().id.eq(session.getLecturer().getId()).findOne();
        if (lecturer == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                Map.of("status", "bad", "message", "session not linked to an account")
            );
        }*/

        UUID uuid;
        try {
            uuid = UUID.fromString(uuidStr);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("status", "bad", "message", "Invalid UUID format")
            );
        }

        Course course = new QCourse().uuid.eq(uuid).findOne();
        if(course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("The requested resource was not found.");
        }

        /*if (!lecturer.getId().equals(course.getLecturer().getId())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("not allowed to change course");
        }*/

        if(course.delete()) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("status", "error", "message", "Failed to delete course")
        );
    }

}
