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
public class CoursePutController extends Controller {

    @PutMapping(value = "/{UUID}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> update(@PathVariable("UUID") String uuidStr, @CookieValue(value = "SESSION_ID", required = false) String sessionId, @RequestBody Map<String, String> body) {
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

        if (name == null || description == null || name.isBlank() || description.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                Map.of("status", "bad", "message", "invalid values")
            );
        }

        /*Session session = new QSession().token.eq(sessionId).findOne();
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

        Course course = new QCourse().id.eq(UUID.fromString(uuidStr)).findOne();
        if(course == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("course not found");
        }

        /*if (!lecturer.getId().equals(course.getLecturer().getId())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("not allowed to change course");
        }*/

        course.setName(name);
        course.setDescription(description);
        course.save();

        return ResponseEntity.status(HttpStatus.OK).body(course);
    }

}
